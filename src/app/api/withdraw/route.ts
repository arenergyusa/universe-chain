import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import { getConfig } from '@/lib/config-cache';
import { checkRateLimit } from '@/lib/rate-limit';
import { ethers } from 'ethers';

const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS || '0x55d398326f99059fF775485246999027B3197955';
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || '';
const NEXT_PUBLIC_ALCHEMY_RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 'https://bnb-mainnet.g.alchemy.com/v2/Be-ZMfSzCVwtZaaFUF9hm';
const NEXT_PUBLIC_BSC_RPC_URL = process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/';
const WITHDRAWAL_MODE = process.env.WITHDRAWAL_MODE || 'auto';

export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = checkRateLimit(req, 5, 60000); // Max 5 withdrawals per minute
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
    }

    const { address: targetAddress, amount } = await req.json();
    const withdrawAmount = parseFloat(amount);

    if (!targetAddress || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json({ error: 'Invalid address or amount.' }, { status: 400 });
    }

    // 1. Verify user balance and status in DB
    const user = await db.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (user.internalBalance.toNumber() < withdrawAmount) {
      return NextResponse.json({ error: 'Insufficient balance.' }, { status: 400 });
    }

    if (withdrawAmount < 10) {
      return NextResponse.json({ error: 'Minimum withdrawal is 10 USDT.' }, { status: 400 });
    }

    // Fetch dynamic withdrawal fee from SystemConfig (e.g., "10" for 10%)
    const feePercentageStr = await getConfig('WITHDRAWAL_FEE_PERCENTAGE', 10);
    const feePercentage = parseFloat(feePercentageStr as string);
    const feeAmount = (withdrawAmount * feePercentage) / 100;
    const netAmount = withdrawAmount - feeAmount;

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
          txHash: 'awaiting_onchain',
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
          message: 'Withdrawal completed on-chain.',
          hash: txHash,
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
          error: 'On-chain transaction failed. Your balance has been restored.',
          details: errorDetails,
        }, { status: 500 });
      }
    } else {
      // Manual mode: leave in pending state for admin approval
      return NextResponse.json({
        success: true,
        message: 'Withdrawal request queued for admin review.',
        transactionId: dbTransaction.newTx.id,
      });
    }
  } catch (error: unknown) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error.' }, { status: 500 });
  }
}
