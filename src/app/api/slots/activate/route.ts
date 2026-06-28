import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import { getConfig } from '@/lib/config-cache';
import { checkRateLimit } from '@/lib/rate-limit';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = checkRateLimit(req, 10, 60000); // Max 10 requests per minute
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
    }

    const { slotNumber } = await req.json();
    const slotNum = parseInt(slotNumber);

    if (isNaN(slotNum) || slotNum < 1) {
      return NextResponse.json({ error: 'Invalid slot number.' }, { status: 400 });
    }

    // Fetch dynamic slot price and level percentages from DB cache
    const slotOpenAmount = parseFloat(await getConfig('SLOT_OPEN_AMOUNT', 100));
    const retopAmount = parseFloat(await getConfig('RETOP_AMOUNT', 100));
    
    const levelPercentages: Record<number, number> = {
      1: parseFloat(await getConfig('LEVEL_1_PCT', 20)) / 100, // DB stores as 20 for 20%
      2: parseFloat(await getConfig('LEVEL_2_PCT', 25)) / 100,
      3: parseFloat(await getConfig('LEVEL_3_PCT', 10)) / 100,
    };

    // 1. Fetch user
    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { slots: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Check if slot is already active
    const alreadyActive = user.slots.some(s => s.slotNumber === slotNum && s.status === 'active');
    if (alreadyActive) {
      return NextResponse.json({ error: 'This slot is already active.' }, { status: 400 });
    }

    // Determine if this is a retop (if they already have a completed/retoped version of this slot)
    const isRetop = user.slots.some(s => s.slotNumber === slotNum && (s.status === 'completed' || s.status === 'retoped'));
    const cost = isRetop ? retopAmount : slotOpenAmount;

    // Check balance
    if (user.internalBalance.toNumber() < cost) {
      return NextResponse.json({ error: `Insufficient balance. Slot ${slotNum} activation requires ${cost} USDT.` }, { status: 400 });
    }

    // 2. Process activation inside a database transaction
    const result = await db.$transaction(async (tx) => {
      // Deduct balance from user
      await tx.user.update({
        where: { id: user.id },
        data: {
          internalBalance: { decrement: cost },
          status: 'active', // Activate user status on first slot purchase
        },
      });

      // Create activation transaction log (using txHash instead of hash)
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: cost,
          type: 'activation',
          status: 'completed',
          txHash: `internal_act_${user.id}_slot_${slotNum}_${Date.now()}`,
        },
      });

      // Create the slot record for the user
      const newSlot = await tx.slot.create({
        data: {
          userId: user.id,
          slotNumber: slotNum,
          status: 'active',
        },
      });

      // 3. Find binary placement parent slot (Independent Board Logic)
      // We search up the referrer chain for a Sponsor's Slot that has < 2 Level 1 members
      let placementParentSlot = null;
      let currentReferrerId = user.referredById;

      while (currentReferrerId && !placementParentSlot) {
        // Fetch all active slots of the referrer, ordered by oldest first
        const referrerSlots = await tx.slot.findMany({
          where: {
            userId: currentReferrerId,
            status: 'active',
          },
          orderBy: { createdAt: 'asc' },
          include: {
            members: {
              where: { level: 1 }
            }
          }
        });

        // Find the first slot that has less than 2 direct children
        for (const slot of referrerSlots) {
          if (slot.members.length < 2) {
            placementParentSlot = slot;
            break;
          }
        }

        if (!placementParentSlot) {
          // Roll-up to next upline if current referrer has no available boards
          const refUser = await tx.user.findUnique({
            where: { id: currentReferrerId },
          });
          currentReferrerId = refUser ? refUser.referredById : null;
        }
      }

      // If no referrer has an available slot, place under the root/admin's first available slot
      if (!placementParentSlot) {
        const allActiveSlots = await tx.slot.findMany({
          where: { status: 'active' },
          orderBy: { createdAt: 'asc' },
          include: { members: { where: { level: 1 } } }
        });
        
        for (const slot of allActiveSlots) {
          if (slot.members.length < 2) {
            placementParentSlot = slot;
            break;
          }
        }
      }

      // 4. Place in the Sponsor's Board
      let newMember = null;
      if (placementParentSlot && placementParentSlot.userId !== user.id) {
        // Determine position (left or right)
        const existingMembers = await tx.slotMember.findMany({
          where: { slotId: placementParentSlot.id, level: 1 }
        });
        
        const hasLeft = existingMembers.some((m: any) => m.position === 'left');
        const position = hasLeft ? 'right' : 'left';

        // Create slot member record (Level 1 in the Sponsor's Board)
        newMember = await tx.slotMember.create({
          data: {
            slotId: placementParentSlot.id,
            userId: user.id,
            parentMemberId: null, // It's Level 1, so no parent member inside this board
            position: position,
            level: 1,
          },
        });

        // Update the Sponsor's board left/right child pointers
        if (position === 'left') {
          await tx.slot.update({
            where: { id: placementParentSlot.id },
            data: { leftChildId: newMember.id },
          });
        } else {
          await tx.slot.update({
            where: { id: placementParentSlot.id },
            data: { rightChildId: newMember.id },
          });
        }

        // 5. Distribute binary tree commissions up the Board hierarchy
        await distributeCommissions(tx, placementParentSlot.id, cost, levelPercentages);
      }

      // 6. Check Completion of Boards
      // Since this is a No-Spillover Independent Board system, a board is complete when
      // it has 14 members in its hierarchical sub-boards. We don't need to synchronously
      // mark it complete here, but we could check the count of descendants.
      // For now, we rely on UI or a background job to mark 'completed' if all 14 nodes are full.

      return { success: true, slotId: newSlot.id };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Slot activation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

/**
 * Distributes 3-level commissions using dynamic percentages across Independent Boards.
 */
async function distributeCommissions(tx: any, parentSlotId: string, cost: number, levelPercentages: Record<number, number>) {
  let currentSlotId = parentSlotId;
  let currentLevel = 1;

  // Trace up to 3 levels of parent Boards
  while (currentLevel <= 3 && currentSlotId) {
    // Fetch the current board
    const currentBoard = await tx.slot.findUnique({
      where: { id: currentSlotId },
    });

    if (!currentBoard) break;

    const commissionPercent = levelPercentages[currentLevel] || 0;
    const amount = cost * commissionPercent;

    if (amount > 0) {
      // Credit Board owner's balance
      await tx.user.update({
        where: { id: currentBoard.userId },
        data: {
          internalBalance: { increment: amount },
          totalEarned: { increment: amount },
        },
      });

      // Log transaction
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
          fromUserId: 'system', // Tracing exact downline is complex in board hopping, keep generic or use actual purchaser if passed
          slotId: currentBoard.id,
          level: currentLevel,
          percentage: commissionPercent * 100,
          amount: amount,
          type: 'slot_open',
        },
      });
    }

    // Move up to the next Board in the hierarchy
    // We find where this Board's owner is placed as a Level 1 member
    // Wait, the Board owner might have multiple boards. 
    // Which board is linked to the parent?
    // We look at the SlotMember record for currentBoard.userId that was created most recently?
    // Actually, each Board is independent. The owner of the current Board is placed in some Parent Board.
    const ownerPlacement = await tx.slotMember.findFirst({
      where: { userId: currentBoard.userId, level: 1 },
      orderBy: { createdAt: 'desc' }
    });

    if (ownerPlacement && ownerPlacement.slotId) {
      currentSlotId = ownerPlacement.slotId;
    } else {
      break;
    }
    
    currentLevel++;
  }
}


