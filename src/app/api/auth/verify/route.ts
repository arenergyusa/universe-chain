import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { setSession } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rate-limit';
import { authVerifySchema } from '@/lib/validators';


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
    // Rate limit: max 5 verification attempts per minute per IP
    const rateLimitResponse = await checkRateLimit(req, 5, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const result = authVerifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: { code: 'VALIDATION_ERROR', message: result.error.issues[0].message } 
      }, { status: 400 });
    }

    const { message, signature, referrerCode } = result.data;

    // Parse SIWE message
    const siweMessage = new SiweMessage(message);
    
    // Retrieve nonce from secure cookie
    const cookieStore = await cookies();
    const nonce = cookieStore.get('universechain_nonce')?.value;

    if (!nonce) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Session expired. Please try again.' } }, { status: 401 });
    }

    // Verify SIWE signature
    const verification = await siweMessage.verify({
      signature,
      nonce,
    });

    if (!verification.success) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Signature verification failed.' } }, { status: 401 });
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
      if (!referrerCode) {
        return NextResponse.json({ 
          success: false, 
          error: { code: 'BAD_REQUEST', message: 'A valid referral code is required to register.' } 
        }, { status: 400 });
      }

      referredBy = await db.user.findUnique({
        where: { referralCode: referrerCode },
        include: { slots: true }
      });

      if (!referredBy) {
        return NextResponse.json({ 
          success: false, 
          error: { code: 'BAD_REQUEST', message: 'Invalid referral code.' } 
        }, { status: 400 });
      }

      if (referredBy.status !== 'active') {
        return NextResponse.json({ 
          success: false, 
          error: { code: 'BAD_REQUEST', message: 'Referrer is not an active user. You can only join through an active user.' } 
        }, { status: 400 });
      }

      // Calculate max directs allowed based on unique slot numbers (Boards)
      // 1 Slot = 2 directs, 2 Slots = 4 directs, etc.
      const uniqueSlotsCount = new Set(referredBy.slots.map(s => s.slotNumber)).size;
      const maxDirects = uniqueSlotsCount * 2;



      // 2. Generate unique referral code
      const userReferralCode = await generateUniqueReferralCode();

      // 3. Create user
      try {
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

        // If referred, increment referrer's direct referral count atomically
        if (referredBy) {
          const updateResult = await tx.user.updateMany({
            where: { 
              id: referredBy.id,
              directReferralCount: { lt: maxDirects }
            },
            data: {
              directReferralCount: { increment: 1 },
            },
          });

          if (updateResult.count === 0) {
            throw new Error('REFERRER_LIMIT_REACHED');
          }
        }

        return tx.user.findUniqueOrThrow({
          where: { id: newUser.id }
        });
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'REFERRER_LIMIT_REACHED') {
        return NextResponse.json({ 
          success: false, 
          error: { code: 'BAD_REQUEST', message: 'Referrer has reached their direct invite limit. They must open a new slot to invite more members.' } 
        }, { status: 400 });
      }
      throw error;
    }
  }

    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'User creation failed.' } }, { status: 500 });
    }

    // Set session cookie
    await setSession({
      userId: user.id,
      walletAddress: user.walletAddress,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          referralCode: user.referralCode,
          status: user.status,
          internalBalance: user.internalBalance.toString(),
          totalEarned: user.totalEarned.toString()
        }
      }
    });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Malformed JSON payload' } }, { status: 400 });
    }
    console.error('SIWE Verification error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An error occurred during verification.' } }, { status: 500 });
  }
}
