import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rate-limit';

// Middleware to check admin access
async function isAdmin() {
  const session = await getSession();
  if (!session) return false;
  const adminAddress = process.env.ADMIN_WALLET_ADDRESS?.toLowerCase();
  const userAddress = session.walletAddress.toLowerCase();
  return adminAddress === userAddress;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const configs = await db.systemConfig.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ configs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Simple rate limit for admin (optional but good practice)
  const rateLimitResponse = checkRateLimit(req, 20, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { key, value } = await req.json();

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    const updatedConfig = await db.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value, description: 'Created via admin panel' },
    });

    return NextResponse.json({ success: true, config: updatedConfig });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
