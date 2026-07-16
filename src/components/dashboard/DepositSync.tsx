/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Send } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useBalance, useReadContract, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { parseUnits, formatUnits } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface DepositSyncProps {
  adminAddress: string;
  userAddress: string;
}

const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const usdtAbi = [
  {
    constant: false,
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export default function DepositSync({ adminAddress, userAddress }: DepositSyncProps) {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<string>('100');

  const { data: bnbBalance } = useBalance({
    address: address,
  });

  const { data: usdtBalance } = useReadContract({
    address: USDT_CONTRACT_ADDRESS as `0x${string}`,
    abi: [{
      constant: true,
      inputs: [{ name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    }],
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Wagmi hooks for smart contract interaction
  const { data: hash, isPending: isWritePending, writeContractAsync } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });


  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [router]);




  const handleDirectDeposit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    if (!isConnected) {
      await open();
      return; // Stop execution; user will click again after connection or modal close
    }

    if (address && address.toLowerCase() !== userAddress.toLowerCase()) {
      toast.error('The connected wallet does not match your registered account. Disconnecting...');
      disconnect();
      return;
    }

    // Pre-flight checks
    if (bnbBalance && Number(formatUnits(bnbBalance.value, bnbBalance.decimals)) < 0.0005) {
      toast.error('Insufficient BNB for gas fees. Please add a small amount of BNB to process this transaction.');
      return;
    }

    if (usdtBalance !== undefined) {
      const usdtAmtStr = formatUnits(usdtBalance as bigint, 18);
      if (Number(amount) > Number(usdtAmtStr)) {
        toast.error('Insufficient USDT balance in your connected wallet.');
        return;
      }
    }

    if (!adminAddress || adminAddress === '0x0000000000000000000000000000000000000000' || adminAddress.length !== 42) {
      toast.error('System configuration error: Invalid admin deposit address.');
      return;
    }

    toast.info('Please confirm the transaction in your wallet...');

    try {
      await writeContractAsync({
        address: USDT_CONTRACT_ADDRESS,
        abi: usdtAbi,
        functionName: 'transfer',
        args: [adminAddress as `0x${string}`, parseUnits(amount, 18)],
      });
    } catch (err: any) {
      const errorMsg = err.message || '';

      // Check if user rejected
      if (errorMsg.includes('User rejected') || errorMsg.includes('rejected')) {
        toast.error('Transaction was rejected by your wallet.');
      }
      // Check for insufficient balance
      else if (errorMsg.includes('exceeds balance') || errorMsg.includes('insufficient funds')) {
        toast.error('Insufficient USDT balance in your wallet.');
      }
      else {
        toast.error('Failed to initiate transaction. Check your balance or network.');
      }
    }
  };

  const handleVerify = async () => {
    if (loading) return;
    setLoading(true);
    toast.info('Scanning BSC blockchain for new USDT deposits...');

    try {
      const res = await fetch('/api/deposit/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: hash }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to verify deposit.');
      }

      const creditedAmount = data.data?.credited || 0;

      if (creditedAmount > 0) {
        toast.success(`Success! Credited ${parseFloat(creditedAmount).toFixed(2)} USDT to your internal balance!`);
        setAmount('');
        router.refresh();
      } else {
        toast.info('No new deposits found. If you just sent the funds, please wait a minute for BSC block confirmations and try again.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Verification failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Listen for successful on-chain transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => {
        toast.success('Transaction confirmed on BSC! Verifying internal balance...');
      }, 0);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleVerify(); // Automatically trigger backend verification once confirmed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed]);

  // Auto-disconnect if wallet changes to a wrong one
  useEffect(() => {
    if (isConnected && address && address.toLowerCase() !== userAddress.toLowerCase()) {
      toast.error('Wallet mismatch detected! Please connect with your registered wallet.');
      disconnect();
    }
  }, [isConnected, address, userAddress, disconnect]);

  return (
    <div className="space-y-6">

      {/* Direct Wallet Deposit Section */}
      <div className="p-6 bg-white border border-emerald-200/60 shadow-sm rounded-3xl space-y-5 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Send className="w-32 h-32 text-emerald-500" />
        </div>

        <div className="relative z-10">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Deposit
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Send USDT directly from your connected wallet. Fast, secure, and automatic.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          <div className="relative flex-1">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (USDT)"
              className="w-full bg-slate-50 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-6 focus-visible:ring-emerald-500/50 transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              USDT
            </div>
          </div>

          <Button
            onClick={handleDirectDeposit}
            disabled={isWritePending || isConfirming}
            className="sm:w-auto w-full inline-flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold py-6 px-6 rounded-xl transition-all duration-200 shadow-sm shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isWritePending || isConfirming ? (
              <RefreshCw className="w-4.5 h-4.5 animate-spin mr-2" />
            ) : (
              <Send className="w-4.5 h-4.5 mr-2" />
            )}
            <span>
              {isWritePending ? 'Confirm in Wallet...' :
                isConfirming ? 'Confirming Block...' :
                  !isConnected ? 'Connect to Deposit' : 'Send USDT'}
            </span>
          </Button>
        </div>
      </div>


    </div>
  );
}
