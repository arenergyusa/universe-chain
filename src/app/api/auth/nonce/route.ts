import { NextRequest, NextResponse } from 'next/server';
import { generateNonce } from 'siwe';
import { cookies } from 'next/headers';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  // Rate limit: max 10 nonce requests per minute per IP
  const rateLimitResponse = checkRateLimit(req, 10, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  const nonce = generateNonce();
  
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'universechain_nonce',
    value: nonce,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 5, // 5 minutes
  });

  return NextResponse.json({ nonce });
}
