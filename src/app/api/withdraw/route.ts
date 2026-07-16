/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import { getConfig } from '@/lib/config-cache';
import { checkRateLimit } from '@/lib/rate-limit';
import { ethers } from 'ethers';
import { withdrawSchema } from '@/lib/validators';
import Decimal from 'decimal.js';

const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS || '0x55d398326f99059fF775485246999027B3197955';
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || '';
const NEXT_PUBLIC_ALCHEMY_RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 'https://bnb.publicnode.com';
const NEXT_PUBLIC_BSC_RPC_URL = process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/';
const WITHDRAWAL_MODE = process.env.WITHDRAWAL_MODE || 'auto';

export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(req, 5, 60000); // Max 5 withdrawals per minute
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized session.' } }, { status: 401 });
    }

    const body = await req.json();
    const result = withdrawSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: { code: 'VALIDATION_ERROR', message: result.error.issues[0].message } 
      }, { status: 400 });
    }

    const { address: targetAddress, amount: withdrawAmount } = result.data;

    // 1. Verify user balance and status in DB
    const user = await db.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } }, { status: 404 });
    }

    if (user.internalBalance.toNumber() < withdrawAmount) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Insufficient balance.' } }, { status: 400 });
    }

    if (withdrawAmount < 10) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Minimum withdrawal is 10 USDT.' } }, { status: 400 });
    }

    // Fetch dynamic withdrawal fee from SystemConfig (e.g., "10" for 10%)
    const feePercentageStr = await getConfig('WITHDRAWAL_FEE_PERCENTAGE', 10);
    const feePercentage = new Decimal(feePercentageStr as string);
    const wAmount = new Decimal(withdrawAmount);
    const feeAmountDec = wAmount.mul(feePercentage).div(100);
    const netAmountDec = wAmount.minus(feeAmountDec);
    
    // Convert back to primitive numbers for Prisma if needed (or pass Decimal objects)
    const feeAmount = feeAmountDec.toNumber();
    const netAmount = netAmountDec.toNumber();

    // 2. Perform DB update inside a transaction to prevent double spending
    const dbTransaction = await db.$transaction(async (tx) => {
      // Deduct full gross balance
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          internalBalance: { decrement: withdrawAmount },
        },
      });

      // Double check that we didn't end up with negative balance
      if (updatedUser.internalBalance.toNumber() < 0) {
        throw new Error('Insufficient balance rollback.');
      }

      // Create transaction record in pending state
      const newTx = await tx.transaction.create({
        data: {
          userId: user.id,
          amount: withdrawAmount, // Gross amount
          fee: feeAmount,         // Deducted fee
          type: 'withdrawal',
          status: 'pending',
          txHash: null,
        },
      });

      return { updatedUser, newTx };
    });

    // 3. If mode is auto, trigger real on-chain transaction
    if (WITHDRAWAL_MODE === 'auto' && ADMIN_PRIVATE_KEY) {
      try {
        const alchemyProvider = new ethers.JsonRpcProvider(NEXT_PUBLIC_ALCHEMY_RPC_URL);
        const bscProvider = new ethers.JsonRpcProvider(NEXT_PUBLIC_BSC_RPC_URL);
        const provider = new ethers.FallbackProvider([alchemyProvider, bscProvider]);
        const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

        const usdtAbi = ['function transfer(address to, uint256 value) public returns (bool)'];
        const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, usdtAbi, adminWallet);

        // BSC BEP20 USDT has 18 decimals
        const parsedAmount = ethers.parseUnits(netAmount.toFixed(18), 18);

        // Trigger transfer on-chain of ONLY the net amount
        const txResponse = await usdtContract.transfer(targetAddress, parsedAmount);
        const txHash = txResponse.hash;

        // Update transaction in DB with on-chain hash
        await db.transaction.update({
          where: { id: dbTransaction.newTx.id },
          data: {
            status: 'completed',
            txHash: txHash,
          },
        });

        return NextResponse.json({
          success: true,
          data: {
            message: 'Withdrawal completed on-chain.',
            hash: txHash,
          }
        });
      } catch (onChainError: unknown) {
        const errorDetails = onChainError instanceof Error ? onChainError.message : String(onChainError);
        console.error('On-chain withdrawal transfer failed:', errorDetails);

        // If on-chain fails, we revert the user's balance in the DB and mark tx as failed
        await db.$transaction([
          db.user.update({
            where: { id: user.id },
            data: {
              internalBalance: { increment: withdrawAmount },
            },
          }),
          db.transaction.update({
            where: { id: dbTransaction.newTx.id },
            data: {
              status: 'failed',
              txHash: 'failed_' + ((onChainError as any).code || 'unknown'),
            },
          }),
        ]);


        return NextResponse.json({
          success: false, 
          error: { code: 'INTERNAL_ERROR', message: 'On-chain transaction failed. Your balance has been restored.' },
          meta: { details: errorDetails },
        }, { status: 500 });
      }
    } else {
      // Manual mode: leave in pending state for admin approval
      return NextResponse.json({
        success: true,
        data: {
          message: 'Withdrawal request queued for admin review.',
          transactionId: dbTransaction.newTx.id,
        }
      });
    }
  } catch (error: unknown) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error.' } }, { status: 500 });
  }
}
