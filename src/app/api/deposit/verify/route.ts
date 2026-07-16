import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import { ethers } from 'ethers';
import { depositVerifySchema } from '@/lib/validators';

const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS || '0x55d398326f99059fF775485246999027B3197955';
const BSC_PROVIDER_URL = process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/';
const ADMIN_DEPOSIT_ADDRESS = process.env.ADMIN_DEPOSIT_ADDRESS || '0x0000000000000000000000000000000000000000';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized session.' } }, { status: 401 });
    }

    const body = await req.json();
    const result = depositVerifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: { code: 'VALIDATION_ERROR', message: result.error.issues[0].message } 
      }, { status: 400 });
    }

    const { txHash } = result.data;

    // 1. Check if this txHash was already processed
    const existingTx = await db.transaction.findUnique({
      where: { txHash },
    });

    if (existingTx) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Transaction already processed.' } }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } }, { status: 404 });
    }

    // 2. Fetch transaction receipt from BSC
    const provider = new ethers.JsonRpcProvider(BSC_PROVIDER_URL);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Transaction not found on-chain.' } }, { status: 400 });
    }

    if (receipt.status !== 1) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Transaction failed on-chain.' } }, { status: 400 });
    }

    // 3. Parse logs to find the USDT Transfer event
    // ERC20 Transfer event signature: Transfer(address indexed from, address indexed to, uint256 value)
    const transferEventSignature = ethers.id('Transfer(address,address,uint256)');
    
    let transferAmount = 0;
    let isValidTransfer = false;

    for (const log of receipt.logs) {
      // Check if the log belongs to the USDT contract and is a Transfer event
      if (log.address.toLowerCase() === USDT_CONTRACT_ADDRESS.toLowerCase() && log.topics[0] === transferEventSignature) {
        
        // topics[1] is 'from', topics[2] is 'to'
        const fromAddress = ethers.AbiCoder.defaultAbiCoder().decode(['address'], log.topics[1])[0];
        const toAddress = ethers.AbiCoder.defaultAbiCoder().decode(['address'], log.topics[2])[0];

        if (
          toAddress.toLowerCase() === ADMIN_DEPOSIT_ADDRESS.toLowerCase() &&
          fromAddress.toLowerCase() === user.walletAddress.toLowerCase()
        ) {
          // Decode the amount from log.data
          const amountBigInt = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], log.data)[0];
          transferAmount = parseFloat(ethers.formatUnits(amountBigInt, 18));
          isValidTransfer = true;
          break;
        }
      }
    }

    if (!isValidTransfer || transferAmount <= 0) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Valid USDT transfer to admin not found in this transaction.' } }, { status: 400 });
    }

    // 4. Credit the user atomically
    const txResult = await db.$transaction(async (tx) => {
      // Check again to avoid race conditions
      const doubleCheck = await tx.transaction.findUnique({ where: { txHash } });
      if (doubleCheck) throw new Error('Transaction already processed.');

      // Create deposit transaction record
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'deposit',
          amount: transferAmount,
          status: 'confirmed',
          txHash,
          metadata: {
            from: user.walletAddress,
            to: ADMIN_DEPOSIT_ADDRESS,
          },
        },
      });

      // Increment user balance
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          internalBalance: { increment: transferAmount },
        },
      });

      return { credited: transferAmount, newBalance: updatedUser.internalBalance.toNumber() };
    });

    return NextResponse.json({
      success: true,
      data: {
        credited: txResult.credited,
        newBalance: txResult.newBalance,
      }
    });

  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Malformed JSON payload' } }, { status: 400 });
    }
    console.error('Verify deposit error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error.' } }, { status: 500 });
  }
}

