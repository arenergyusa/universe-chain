import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { setSession } from '@/lib/jwt';


// Helper to generate a unique referral code
async function generateUniqueReferralCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check uniqueness in database
    const existing = await db.user.findUnique({
      where: { referralCode: code },
    });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { message, signature, referrerCode } = await req.json();

    if (!message || !signature) {
      return NextResponse.json({ error: 'Message and signature are required.' }, { status: 400 });
    }

    // Parse SIWE message
    const siweMessage = new SiweMessage(message);
    
    // Retrieve nonce from secure cookie
    const cookieStore = await cookies();
    const nonce = cookieStore.get('universechain_nonce')?.value;

    if (!nonce) {
      return NextResponse.json({ error: 'Session expired. Please try again.' }, { status: 400 });
    }

    // Verify SIWE signature
    const verification = await siweMessage.verify({
      signature,
      nonce,
    });

    if (!verification.success) {
      return NextResponse.json({ error: 'Signature verification failed.' }, { status: 400 });
    }

    const walletAddress = verification.data.address;

    // Clear the nonce cookie
    cookieStore.delete('universechain_nonce');

    // Find or create user
    let user = await db.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      // Register new user
      // 1. Process referrer if provided
      let referredBy = null;
      if (referrerCode) {
        referredBy = await db.user.findUnique({
          where: { referralCode: referrerCode },
          include: { slots: true }
        });

        if (referredBy) {
          // Calculate max directs allowed based on unique slot numbers (Boards)
          // 1 Slot = 2 directs, 2 Slots = 4 directs, etc.
          const uniqueSlotsCount = new Set(referredBy.slots.map(s => s.slotNumber)).size;
          const maxDirects = uniqueSlotsCount * 2;

          if (referredBy.directReferralCount >= maxDirects) {
            return NextResponse.json({ 
              error: 'Referrer has reached their direct invite limit. They must open a new slot to invite more members.' 
            }, { status: 400 });
          }
        }
      }

      // 2. Generate unique referral code
      const userReferralCode = await generateUniqueReferralCode();

      // 3. Create user
      user = await db.$transaction(async (tx) => {
        // Create the user
        const newUser = await tx.user.create({
          data: {
            walletAddress,
            referralCode: userReferralCode,
            referredById: referredBy ? referredBy.id : null,
            status: 'inactive', // inactive until they open their first slot
          },
        });

        // If referred, increment referrer's direct referral count
        if (referredBy) {
          await tx.user.update({
            where: { id: referredBy.id },
            data: {
              directReferralCount: { increment: 1 },
            },
          });
        }

        return tx.user.findUniqueOrThrow({
          where: { id: newUser.id }
        });
      });
    }

    // Set session cookie
    await setSession({
      userId: user.id,
      walletAddress: user.walletAddress,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        referralCode: user.referralCode,
        status: user.status,
        internalBalance: user.internalBalance.toString(),
        totalEarned: user.totalEarned.toString()
      },
    });
  } catch (error: any) {
    console.error('SIWE Verification error:', error);
    return NextResponse.json({ error: 'An error occurred during verification.' }, { status: 500 });
  }
}
