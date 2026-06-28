import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding system configurations...');

  const configs = [
    {
      key: 'slot_open_amount',
      value: '100',
      description: 'USDT deposit required to open a new slot',
    },
    {
      key: 'retop_amount',
      value: '100',
      description: 'USDT required to retop an expired or completed slot',
    },
    {
      key: 'referral_level_1_pct',
      value: '20',
      description: 'Direct referral commission percentage (Level 1)',
    },
    {
      key: 'referral_level_2_pct',
      value: '25',
      description: 'Indirect referral commission percentage (Level 2)',
    },
    {
      key: 'referral_level_3_pct',
      value: '10',
      description: 'Indirect referral commission percentage (Level 3)',
    },
    {
      key: 'slot_complete_reward',
      value: '10',
      description: 'USDT bonus reward for completing a slot (14 members)',
    },
    {
      key: 'pair_bonus_amount',
      value: '10',
      description: 'USDT reward when binary pairs are matched',
    },
    {
      key: 'min_withdrawal',
      value: '10',
      description: 'Minimum USDT allowed for withdrawal',
    },
    {
      key: 'withdrawal_fee_pct',
      value: '10',
      description: 'Percentage fee deducted on withdrawal processing',
    },
    {
      key: 'retop_deadline_hours',
      value: '48',
      description: 'Time limit in hours to retop a completed slot before expiry',
    },
    {
      key: 'inactive_deadline_days',
      value: '30',
      description: 'Days of inactivity allowed before user is flagged',
    },
    {
      key: 'bsc_confirmations',
      value: '12',
      description: 'Required BSC confirmations for deposits',
    },
    {
      key: 'withdrawal_mode',
      value: 'auto',
      description: 'Withdrawal processing mode (auto / manual)',
    },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {
        value: config.value,
        description: config.description,
      },
      create: {
        key: config.key,
        value: config.value,
        description: config.description,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
