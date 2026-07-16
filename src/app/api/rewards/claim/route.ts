import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import { getConfig } from '@/lib/config-cache';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized session.' } }, { status: 401 });
    }

    const { type } = await req.json(); // 'referral' or 'slot'

    if (type !== 'referral' && type !== 'slot') {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid reward type.' } }, { status: 400 });
    }

    // Fetch config for reward amounts
    const directRewardAmt = parseFloat(await getConfig('DIRECT_REWARD_AMOUNT', 20));
    const slotRewardAmt = parseFloat(await getConfig('SLOT_COMPLETE_REWARD_AMOUNT', 20));

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: session.userId },
        include: { slots: true }
      });

      if (!user) throw new Error('User not found.');

      let amountToCredit = 0;
      let claimsMade = 0;

      if (type === 'referral') {
        const eligibleClaims = Math.floor(user.directReferralCount / 2);
        const availableClaims = eligibleClaims - user.referralRewardsClaimed;

        if (availableClaims <= 0) {
          throw new Error('No referral rewards available to claim.');
        }

        claimsMade = availableClaims;
        amountToCredit = claimsMade * directRewardAmt;

        // Update user
        await tx.user.update({
          where: { id: user.id },
          data: {
            referralRewardsClaimed: { increment: claimsMade },
            internalBalance: { increment: amountToCredit },
            totalEarned: { increment: amountToCredit }
          }
        });
      } else if (type === 'slot') {
        const completedSlotsCount = user.slots.filter(s => s.status === 'completed' || s.status === 'retoped').length;
        const availableClaims = completedSlotsCount - user.slotRewardsClaimed;

        if (availableClaims <= 0) {
          throw new Error('No slot rewards available to claim.');
        }

        claimsMade = availableClaims;
        amountToCredit = claimsMade * slotRewardAmt;

        // Update user
        await tx.user.update({
          where: { id: user.id },
          data: {
            slotRewardsClaimed: { increment: claimsMade },
            internalBalance: { increment: amountToCredit },
            totalEarned: { increment: amountToCredit }
          }
        });
      }

      // Log transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: amountToCredit,
          type: type === 'referral' ? 'invite_reward' : 'slot_bonus',
          status: 'completed',
          txHash: `reward_claim_${type}_${Date.now()}`
        }
      });

      return { amount: amountToCredit, claims: claimsMade };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    });

    return NextResponse.json({
      success: true,
      data: { message: `Successfully claimed ${result.amount} USDT!`, amount: result.amount }
    });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Malformed JSON payload' } }, { status: 400 });
    }
    if (error instanceof Error) {
      if (error.message.includes('No referral rewards available to claim.') || error.message.includes('No slot rewards available to claim.')) {
        return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: error.message } }, { status: 400 });
      }
      if (error.message.includes('User not found.')) {
        return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
      }
    }
    console.error('Reward claim error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error.' } }, { status: 500 });
  }
}
