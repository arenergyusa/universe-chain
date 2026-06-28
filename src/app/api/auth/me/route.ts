import { NextResponse } from 'next/server';
import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import { getConfig } from '@/lib/config-cache';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { slots: true }
    });

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const directReward = await getConfig('DIRECT_REWARD_AMOUNT', 10);
    const slotReward = await getConfig('SLOT_COMPLETE_REWARD_AMOUNT', 50);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        referralCode: user.referralCode,
        status: user.status,
        internalBalance: user.internalBalance.toString(),
        totalEarned: user.totalEarned.toString(),
        directReferralCount: user.directReferralCount,
        referralRewardsClaimed: user.referralRewardsClaimed,
        slotRewardsClaimed: user.slotRewardsClaimed,
        slots: user.slots,
      },
      configs: {
        directReward: parseFloat(directReward),
        slotReward: parseFloat(slotReward),
      }
    });
  } catch (error) {
    console.error('Error fetching authenticated user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
