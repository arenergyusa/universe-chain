import { NextResponse } from 'next/server';
import { generateNonce } from 'siwe';
import { cookies } from 'next/headers';

export async function GET() {
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
