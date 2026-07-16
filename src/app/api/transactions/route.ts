import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/jwt';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    
    const page = pageParam !== null ? Number(pageParam) : 1;
    const limit = limitParam !== null ? Number(limitParam) : 20;

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    const type = searchParams.get('type') || 'all';
    const skip = (page - 1) * limit;

    const whereClause: Prisma.TransactionWhereInput = {
      userId: session.userId,
    };

    if (type !== 'all') {
      whereClause.type = type;
    }

    const transactions = await db.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const totalCount = await db.transaction.count({
      where: whereClause,
    });

    return NextResponse.json({
      transactions,
      hasMore: skip + transactions.length < totalCount,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
