import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Optimal configuration for Serverless PostgreSQL (like Neon)
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20, // Limit max connections per instance
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 30000, // Give Neon 30s to cold start
  ssl: {
    rejectUnauthorized: true,
  },
  keepAlive: true, // Enable TCP Keep-Alives to prevent NAT timeouts
};

let prisma: PrismaClient;
let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool(poolConfig);
  pool.on('error', (err) => {
    console.error('Prisma Pool: Unexpected error on idle client', err);
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool(poolConfig);
    globalForPrisma.pool.on('error', (err) => {
      console.error('Prisma Pool: Unexpected error on idle client', err);
    });
  }
  pool = globalForPrisma.pool;

  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export const db = prisma;
export { pool };
