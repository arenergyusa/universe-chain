import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import { getConfig } from '@/lib/config-cache';
import { checkRateLimit } from '@/lib/rate-limit';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = checkRateLimit(req, 10, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
    }

    const { type } = await req.json(); // 'activate' or 'retop'

    if (type !== 'activate' && type !== 'retop') {
      return NextResponse.json({ error: 'Invalid action type.' }, { status: 400 });
    }

    const slotOpenAmount = parseFloat(await getConfig('SLOT_OPEN_AMOUNT', 100));
    const retopAmount = parseFloat(await getConfig('RETOP_AMOUNT', 100));

    const levelPercentages: Record<number, number> = {
      1: parseFloat(await getConfig('LEVEL_1_PCT', 20)) / 100,
      2: parseFloat(await getConfig('LEVEL_2_PCT', 25)) / 100,
      3: parseFloat(await getConfig('LEVEL_3_PCT', 10)) / 100,
    };

    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { slots: { orderBy: { createdAt: 'asc' } } },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // ─── ID ACTIVATION (one-time) ───
    if (type === 'activate') {
      const hasAnySlot = user.slots.length > 0;
      if (hasAnySlot) {
        return NextResponse.json({ error: 'Your ID is already activated.' }, { status: 400 });
      }

      if (user.internalBalance.toNumber() < slotOpenAmount) {
        return NextResponse.json({ error: `Insufficient balance. ID activation requires ${slotOpenAmount} USDT.` }, { status: 400 });
      }

      const result = await db.$transaction(async (tx) => {
        // Deduct balance & activate user status
        await tx.user.update({
          where: { id: user.id },
          data: {
            internalBalance: { decrement: slotOpenAmount },
            status: 'active',
          },
        });

        // Log activation transaction
        await tx.transaction.create({
          data: {
            userId: user.id,
            amount: slotOpenAmount,
            type: 'activation',
            status: 'completed',
            txHash: `internal_activate_${user.id}_${Date.now()}`,
          },
        });

        // Create Slot 1 for the user (their own board)
        const newSlot = await tx.slot.create({
          data: { userId: user.id, slotNumber: 1, status: 'active' },
        });

        // Place user in sponsor's board (auto-creates sponsor slot if needed)
        await placeInSponsorBoard(tx, user.id, user.referredById, slotOpenAmount, levelPercentages);

        return { success: true, slotId: newSlot.id };
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 15000,
      });

      return NextResponse.json(result);
    }

    // ─── ID RETOP (per slot completion) ───
    if (type === 'retop') {
      // Find oldest completed slot
      const completedSlot = user.slots.find(s => s.status === 'completed');
      if (!completedSlot) {
        return NextResponse.json({ error: 'No completed slot available for retop.' }, { status: 400 });
      }

      if (user.internalBalance.toNumber() < retopAmount) {
        return NextResponse.json({ error: `Insufficient balance. ID retop requires ${retopAmount} USDT.` }, { status: 400 });
      }

      const result = await db.$transaction(async (tx) => {
        // Deduct balance
        await tx.user.update({
          where: { id: user.id },
          data: { internalBalance: { decrement: retopAmount } },
        });

        // Mark completed slot as retoped
        await tx.slot.update({
          where: { id: completedSlot.id },
          data: { status: 'retoped' },
        });

        // Create new active slot with the same slotNumber (new cycle)
        const newSlot = await tx.slot.create({
          data: { userId: user.id, slotNumber: completedSlot.slotNumber, status: 'active' },
        });

        // Log retop transaction
        await tx.transaction.create({
          data: {
            userId: user.id,
            amount: retopAmount,
            type: 'retop',
            status: 'completed',
            txHash: `internal_retop_${user.id}_slot_${completedSlot.slotNumber}_${Date.now()}`,
          },
        });

        // Distribute retop commissions (trace from where this user is placed)
        const userPlacement = await tx.slotMember.findFirst({
          where: { userId: user.id, level: 1 },
          orderBy: { createdAt: 'asc' },
        });

        if (userPlacement) {
          await distributeCommissions(tx, userPlacement.slotId, user.id, retopAmount, levelPercentages);
        }

        return { success: true, slotId: newSlot.id, retopedSlotNumber: completedSlot.slotNumber };
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 15000,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  } catch (error: any) {
    console.error('Slot activation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

/**
 * Places a new user in their direct sponsor's board at Level 1.
 * Auto-creates a new slot for the sponsor if all existing slots have full L1 (2 members).
 */
async function placeInSponsorBoard(
  tx: any, userId: string, sponsorId: string | null,
  cost: number, levelPercentages: Record<number, number>
) {
  let placementSlot: any = null;

  if (sponsorId) {
    // Find sponsor's active slots with L1 member counts
    const sponsorSlots = await tx.slot.findMany({
      where: { userId: sponsorId, status: 'active' },
      orderBy: { slotNumber: 'asc' },
      include: { members: { where: { level: 1 } } },
    });

    // Find first slot with < 2 L1 members
    for (const slot of sponsorSlots) {
      if (slot.members.length < 2) {
        placementSlot = slot;
        break;
      }
    }

    // All L1 positions full → auto-create next slot for sponsor (FREE)
    if (!placementSlot) {
      const maxSlotNum = sponsorSlots.length > 0
        ? Math.max(...sponsorSlots.map((s: any) => s.slotNumber))
        : 0;

      placementSlot = await tx.slot.create({
        data: { userId: sponsorId, slotNumber: maxSlotNum + 1, status: 'active' },
      });
      placementSlot.members = []; // Fresh slot has no members
    }
  }

  // Fallback: if no sponsor, find any available slot globally
  if (!placementSlot) {
    const allActiveSlots = await tx.slot.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'asc' },
      include: { members: { where: { level: 1 } } },
    });

    for (const slot of allActiveSlots) {
      if (slot.members.length < 2 && slot.userId !== userId) {
        placementSlot = slot;
        break;
      }
    }
  }

  // Place in the board if a slot was found
  if (placementSlot && placementSlot.userId !== userId) {
    const existingMembers = await tx.slotMember.findMany({
      where: { slotId: placementSlot.id, level: 1 },
    });

    const hasLeft = existingMembers.some((m: any) => m.position === 'left');
    const position = hasLeft ? 'right' : 'left';

    const newMember = await tx.slotMember.create({
      data: {
        slotId: placementSlot.id,
        userId: userId,
        parentMemberId: null,
        position: position,
        level: 1,
      },
    });

    // Update slot's left/right child pointer
    await tx.slot.update({
      where: { id: placementSlot.id },
      data: position === 'left' ? { leftChildId: newMember.id } : { rightChildId: newMember.id },
    });

    // Distribute 3-level commissions up the board hierarchy
    await distributeCommissions(tx, placementSlot.id, userId, cost, levelPercentages);
  }
}

/**
 * Distributes 3-level commissions using dynamic percentages across Independent Boards.
 */
async function distributeCommissions(
  tx: any, parentSlotId: string, activatingUserId: string,
  cost: number, levelPercentages: Record<number, number>
) {
  let currentSlotId = parentSlotId;
  let currentLevel = 1;

  while (currentLevel <= 3 && currentSlotId) {
    const currentBoard = await tx.slot.findUnique({ where: { id: currentSlotId } });
    if (!currentBoard) break;

    const commissionPercent = levelPercentages[currentLevel] || 0;
    const amount = cost * commissionPercent;

    if (amount > 0) {
      // Credit board owner's balance
      await tx.user.update({
        where: { id: currentBoard.userId },
        data: {
          internalBalance: { increment: amount },
          totalEarned: { increment: amount },
        },
      });

      // Log commission transaction
      await tx.transaction.create({
        data: {
          userId: currentBoard.userId,
          amount: amount,
          type: 'commission',
          status: 'completed',
          txHash: `commission_board_${currentBoard.id}_level_${currentLevel}_${Date.now()}`,
        },
      });

      // Log referral income
      await tx.referralIncome.create({
        data: {
          userId: currentBoard.userId,
          fromUserId: activatingUserId,
          slotId: currentBoard.id,
          level: currentLevel,
          percentage: commissionPercent * 100,
          amount: amount,
          type: 'slot_open',
        },
      });
    }

    // Move up: find where this board's owner is placed as L1 member
    const ownerPlacement = await tx.slotMember.findFirst({
      where: { userId: currentBoard.userId, level: 1 },
      orderBy: { createdAt: 'desc' },
    });

    if (ownerPlacement?.slotId) {
      currentSlotId = ownerPlacement.slotId;
    } else {
      break;
    }

    currentLevel++;
  }
}
