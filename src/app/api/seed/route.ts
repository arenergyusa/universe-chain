import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const configs = [
      { key: 'WITHDRAWAL_FEE_PERCENTAGE', value: '10', description: 'Global withdrawal fee percentage' },
      { key: 'SLOT_OPEN_AMOUNT', value: '100', description: 'Amount required to open a new slot (USDT)' },
      { key: 'RETOP_AMOUNT', value: '100', description: 'Amount required to retop a completed slot (USDT)' },
      { key: 'DIRECT_REWARD_AMOUNT', value: '10', description: 'Reward amount for every 2 direct referrals (USDT)' },
      { key: 'SLOT_COMPLETE_REWARD_AMOUNT', value: '50', description: 'Reward amount for every completed slot (USDT)' },
      { key: 'LEVEL_1_PCT', value: '20', description: 'Level 1 commission percentage' },
      { key: 'LEVEL_2_PCT', value: '25', description: 'Level 2 commission percentage' },
      { key: 'LEVEL_3_PCT', value: '10', description: 'Level 3 commission percentage' },
    ];

    for (const config of configs) {
      await db.systemConfig.upsert({
        where: { key: config.key },
        update: { value: config.value },
        create: config,
      });
    }

    return NextResponse.json({ success: true, message: 'Configs seeded' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
