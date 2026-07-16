/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import { getConfig } from '@/lib/config-cache';
import { checkRateLimit } from '@/lib/rate-limit';
import Decimal from 'decimal.js';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(req, 10, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized session.' } }, { status: 401 });
    }

    const { type } = await req.json(); // 'activate' or 'retop'

    if (type !== 'activate' && type !== 'retop') {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid action type.' } }, { status: 400 });
    }

    const slotOpenAmount = parseFloat(await getConfig('SLOT_OPEN_AMOUNT', 100));
    const retopAmount = parseFloat(await getConfig('RETOP_AMOUNT', 100));

    const levelPercentages: Record<number, number> = {
      1: parseFloat(await getConfig('LEVEL_1_PCT', 50)) / 100,
      2: parseFloat(await getConfig('LEVEL_2_PCT', 25)) / 100,
      3: parseFloat(await getConfig('LEVEL_3_PCT', 20)) / 100,
    };

    const user = await db.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } }, { status: 404 });
    }

    // ─── ID ACTIVATION (one-time) ───
    if (type === 'activate') {
      const result = await db.$transaction(async (tx) => {
        const txUser = await tx.user.findUnique({
          where: { id: user.id },
          include: { slots: { orderBy: { createdAt: 'asc' } } },
        });

        if (!txUser) throw new Error('VALIDATION:User not found.');
        if (txUser.slots.length > 0) {
          throw new Error('VALIDATION:Your ID is already activated.');
        }
        if (txUser.internalBalance.toNumber() < slotOpenAmount) {
          throw new Error(`VALIDATION:Insufficient balance. ID activation requires ${slotOpenAmount} USDT.`);
        }

        // Deduct balance & activate user status
        await tx.user.update({
          where: { id: txUser.id },
          data: {
            internalBalance: { decrement: slotOpenAmount },
            status: 'active',
          },
        });

        // Log activation transaction
        await tx.transaction.create({
          data: {
            userId: txUser.id,
            amount: slotOpenAmount,
            type: 'activation',
            status: 'completed',
            txHash: `internal_activate_${txUser.id}_${Date.now()}`,
          },
        });

        // Create Slot 1 for the user (their own board)
        const newSlot = await tx.slot.create({
          data: { userId: txUser.id, slotNumber: 1, status: 'active' },
        });

        // Place user in sponsor's board (auto-creates sponsor slot if needed)
        await placeInSponsorBoard(tx, txUser.id, txUser.referredById, slotOpenAmount, levelPercentages);

        return { success: true, slotId: newSlot.id };
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 15000,
      });

      return NextResponse.json({ success: true, data: result });
    }

    // ─── ID RETOP (per slot completion) ───
    if (type === 'retop') {
      const result = await db.$transaction(async (tx) => {
        const txUser = await tx.user.findUnique({
          where: { id: user.id },
          include: { slots: { orderBy: { createdAt: 'asc' } } },
        });

        if (!txUser) throw new Error('VALIDATION:User not found.');

        const completedSlot = txUser.slots.find(s => s.status === 'completed');
        if (!completedSlot) {
          throw new Error('VALIDATION:No completed slot available for retop.');
        }

        if (txUser.internalBalance.toNumber() < retopAmount) {
          throw new Error(`VALIDATION:Insufficient balance. ID retop requires ${retopAmount} USDT.`);
        }

        // Deduct balance
        await tx.user.update({
          where: { id: txUser.id },
          data: { internalBalance: { decrement: retopAmount } },
        });

        // Mark completed slot as retoped
        await tx.slot.update({
          where: { id: completedSlot.id },
          data: { status: 'retoped' },
        });

        // Create new active slot with the same slotNumber (new cycle)
        const newSlot = await tx.slot.create({
          data: { userId: txUser.id, slotNumber: completedSlot.slotNumber, status: 'active' },
        });

        // Log retop transaction
        await tx.transaction.create({
          data: {
            userId: txUser.id,
            amount: retopAmount,
            type: 'retop',
            status: 'completed',
            txHash: `internal_retop_${txUser.id}_slot_${completedSlot.slotNumber}_${Date.now()}`,
          },
        });

        // Distribute retop commissions (trace from where this user is placed)
        const userPlacement = await tx.slotMember.findFirst({
          where: { userId: txUser.id, level: 1 },
          orderBy: { createdAt: 'asc' },
        });

        if (userPlacement) {
          await distributeCommissions(tx, userPlacement.slotId, txUser.id, retopAmount, levelPercentages, 'retop');
        }

        return { success: true, slotId: newSlot.id, retopedSlotNumber: completedSlot.slotNumber };
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 15000,
      });

      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid request.' } }, { status: 400 });
  } catch (error: unknown) {
    console.error('Slot activation error:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body.' } }, { status: 400 });
    }
    if (error instanceof Error && error.message?.startsWith('VALIDATION:')) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.message.replace('VALIDATION:', '') } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred processing your request.' } }, { status: 500 });
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
    // Find sponsor's active slots with member counts
    const sponsorSlots = await tx.slot.findMany({
      where: { userId: sponsorId, status: 'active' },
      orderBy: { slotNumber: 'asc' },
      select: { id: true, userId: true, _count: { select: { members: true } } },
    });

    // Find first slot with < 14 members
    for (const slot of sponsorSlots) {
      if (slot._count.members < 14) {
        placementSlot = await tx.slot.findUnique({
          where: { id: slot.id },
          include: { members: true },
        });
        break;
      }
    }
  }

  // Fallback: if no sponsor or sponsor slot is full, find any available slot globally
  if (!placementSlot) {
    const allActiveSlots = await tx.slot.findMany({
      where: { status: 'active', userId: { not: userId } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, userId: true, _count: { select: { members: true } } },
    });

    for (const slot of allActiveSlots) {
      if (slot._count.members < 14) {
        placementSlot = await tx.slot.findUnique({
          where: { id: slot.id },
          include: { members: true },
        });
        break;
      }
    }
  }

  // Place in the board if a slot was found
  if (placementSlot && placementSlot.userId !== userId) {
    const members = placementSlot.members;
    let targetParentMemberId: string | null = null;

    let targetPosition = 'left';

    const l1 = members.filter((m: any) => m.level === 1);
    const l2 = members.filter((m: any) => m.level === 2);
    const l3 = members.filter((m: any) => m.level === 3);

    const getChildren = (level: number, parentId: string | null) => {
      if (level === 1) return l1;
      if (level === 2) return l2.filter((m: any) => m.parentMemberId === parentId);
      if (level === 3) return l3.filter((m: any) => m.parentMemberId === parentId);
      return [];
    };

    if (l1.length < 2) {
      targetParentMemberId = null;

      targetPosition = l1.some((m: any) => m.position === 'left') ? 'right' : 'left';
    } else {
      const l1Left = l1.find((m: any) => m.position === 'left');
      const l1Right = l1.find((m: any) => m.position === 'right');

      const parentsToCheck = [];
      if (l1Left) parentsToCheck.push({ member: l1Left, nextLevel: 2 });
      if (l1Right) parentsToCheck.push({ member: l1Right, nextLevel: 2 });
      if (l1Left) {
        parentsToCheck.push({ member: l2.find((m: any) => m.parentMemberId === l1Left.id && m.position === 'left'), nextLevel: 3 });
        parentsToCheck.push({ member: l2.find((m: any) => m.parentMemberId === l1Left.id && m.position === 'right'), nextLevel: 3 });
      }
      if (l1Right) {
        parentsToCheck.push({ member: l2.find((m: any) => m.parentMemberId === l1Right.id && m.position === 'left'), nextLevel: 3 });
        parentsToCheck.push({ member: l2.find((m: any) => m.parentMemberId === l1Right.id && m.position === 'right'), nextLevel: 3 });
      }

      for (const p of parentsToCheck) {
        if (!p.member) continue;
        const children = getChildren(p.nextLevel, p.member.id);
        if (children.length < 2) {
          targetParentMemberId = p.member.id;

          targetPosition = children.some((m: any) => m.position === 'left') ? 'right' : 'left';
          break;
        }
      }
    }

    let uplineSlots: any[] = [];
    let currParentId = targetParentMemberId;
    while (currParentId) {
      const m = members.find((x: any) => x.id === currParentId);
      if (m) {
        const mSlot = await tx.slot.findFirst({
          where: { userId: m.userId, status: 'active' },
          orderBy: { createdAt: 'asc' },
          include: { members: true },
        });
        if (mSlot && mSlot.status === 'active' && mSlot.members.length < 14) {
          uplineSlots.push(mSlot);
        } else {
          throw new Error('VALIDATION:Required parent slot is missing, inactive, or full.');
        }
        currParentId = m.parentMemberId;
      } else {
        break;
      }
    }
    uplineSlots.push(placementSlot);

    let currentOwnerId = placementSlot.userId;
    while (uplineSlots.length < 3) {
      const ownerL1 = await tx.slotMember.findFirst({
        where: { userId: currentOwnerId, level: 1 },
        orderBy: { createdAt: 'desc' },
      });
      if (ownerL1) {
        const parentSlot = await tx.slot.findUnique({
          where: { id: ownerL1.slotId },
          include: { members: true },
        });
        if (parentSlot && parentSlot.status === 'active' && parentSlot.members.length < 14) {
          uplineSlots.push(parentSlot);
          currentOwnerId = parentSlot.userId;
        } else break;
      } else break;
    }

    uplineSlots = uplineSlots.slice(0, 3);

    let p1SlotId = null;

    for (let i = 0; i < uplineSlots.length; i++) {
      const slot = uplineSlots[i];
      const level = i + 1;
      const parent_user_id = i > 0 && uplineSlots.length > 0 ? uplineSlots[0].userId : null;

      if (!slot) {
        throw new Error('VALIDATION:Required parent slot is missing.');
      }

      if (level === 1) p1SlotId = slot.id;

      let pMemberId = null;
      if (parent_user_id) {
        const pMember = await tx.slotMember.findFirst({
          where: { slotId: slot.id, userId: parent_user_id },
          orderBy: { createdAt: 'desc' }
        });
        if (pMember) {
          pMemberId = pMember.id;
        } else if (level > 1) {
          throw new Error('VALIDATION:Required parent member is missing.');
        }
      } else if (level > 1) {
        throw new Error('VALIDATION:Parent user ID is missing.');
      }

      await validatePlacement(tx, pMemberId);

      const newMember = await tx.slotMember.create({
        data: {
          slotId: slot.id,
          userId: userId,
          parentMemberId: pMemberId,
          position: targetPosition,
          level: level,
        }
      });

      if (level === 1) {
        await tx.slot.update({
          where: { id: slot.id },
          data: targetPosition === 'left' ? { leftChildId: newMember.id } : { rightChildId: newMember.id }
        });
      }

      const memberCount = await tx.slotMember.count({ where: { slotId: slot.id } });
      if (memberCount >= 14) {
        await tx.slot.update({
          where: { id: slot.id },
          data: { status: 'completed', completedAt: new Date() }
        });
      }
    }

    if (p1SlotId) {
      await distributeCommissions(tx, p1SlotId, userId, cost, levelPercentages, 'slot_open');
    } else {
      await distributeCommissions(tx, placementSlot.id, userId, cost, levelPercentages, 'slot_open');
    }
  }
}

/**
 * Distributes 3-level commissions using dynamic percentages across Independent Boards.
 */
async function distributeCommissions(
  tx: any, parentSlotId: string, activatingUserId: string,
  cost: number, levelPercentages: Record<number, number>,
  incomeType: string = 'slot_open'
) {
  let currentSlotId = parentSlotId;
  let currentLevel = 1;

  while (currentLevel <= 3 && currentSlotId) {
    const currentBoard = await tx.slot.findUnique({ where: { id: currentSlotId } });
    if (!currentBoard) break;

    const commissionPercent = levelPercentages[currentLevel] || 0;
    const costDec = new Decimal(cost);
    const percentDec = new Decimal(commissionPercent);
    const amount = costDec.mul(percentDec).toNumber();

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

      // Log referral reward
      await tx.referralIncome.create({
        data: {
          userId: currentBoard.userId,
          fromUserId: activatingUserId,
          slotId: currentBoard.id,
          level: currentLevel,
          percentage: commissionPercent * 100,
          amount: amount,
          type: incomeType,
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

/**
 * Validates placement to reject self-parenting and cyclic ancestry.
 */
async function validatePlacement(tx: any, parentMemberId: string | null) {
  if (!parentMemberId) return;
  let currentId: string | null = parentMemberId;
  const visited = new Set<string>();
  while (currentId) {
    if (visited.has(currentId)) {
      throw new Error('VALIDATION:Cyclic ancestry detected.');
    }
    visited.add(currentId);
    const ancestor: { id: string; parentMemberId: string | null } | null = await tx.slotMember.findUnique({
      where: { id: currentId },
      select: { id: true, parentMemberId: true }
    });
    if (ancestor) {
      if (ancestor.parentMemberId === ancestor.id) {
        throw new Error('VALIDATION:Self-parenting detected.');
      }
      currentId = ancestor.parentMemberId;
    } else {
      break;
    }
  }
}
