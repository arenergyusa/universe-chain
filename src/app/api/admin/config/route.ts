import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rate-limit';
import { configUpdateSchema } from '@/lib/validators';

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
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    const configs = await db.systemConfig.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ success: true, data: { configs } });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unknown error' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Simple rate limit for admin (optional but good practice)
  const rateLimitResponse = await checkRateLimit(req, 20, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = configUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: { code: 'VALIDATION_ERROR', message: result.error.issues[0].message } 
      }, { status: 400 });
    }

    const { key, value, description } = result.data;

    const updatedConfig = await db.systemConfig.upsert({
      where: { key },
      update: { value, ...(description !== undefined ? { description } : {}) },
      create: { key, value, description: description || 'Created via admin panel' },
    });

    return NextResponse.json({ success: true, data: { config: updatedConfig } });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unknown error' } }, { status: 500 });
  }
}
