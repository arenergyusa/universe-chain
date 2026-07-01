'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, Send } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits } from 'viem';

interface DepositSyncProps {
  adminAddress: string;
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

export default function DepositSync({ adminAddress }: DepositSyncProps) {
  const router = useRouter();
  const { isConnected } = useAccount();

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<string>('100');
  const [status, setStatus] = useState<{
    type: 'idle' | 'success' | 'info' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  // Wagmi hooks for smart contract interaction
  const { data: hash, isPending: isWritePending, writeContractAsync } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Listen for successful on-chain transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      setStatus({ type: 'success', message: 'Transaction confirmed on BSC! Verifying internal balance...' });
      handleVerify(); // Automatically trigger backend verification once confirmed
    }
  }, [isConfirmed]);

  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [router]);


  const handleCopy = () => {
    navigator.clipboard.writeText(adminAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectDeposit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid amount.' });
      return;
    }

    setStatus({ type: 'info', message: 'Please confirm the transaction in your wallet...' });

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
        setStatus({ type: 'error', message: 'Transaction was rejected by your wallet.' });
      }
      // Check for insufficient balance
      else if (errorMsg.includes('exceeds balance') || errorMsg.includes('insufficient funds')) {
        setStatus({ type: 'error', message: 'Insufficient USDT balance in your wallet.' });
      }
      else {
        setStatus({ type: 'error', message: 'Failed to initiate transaction. Check your balance or network.' });
      }
    }
  };

  const handleVerify = async () => {
    if (loading) return;
    setLoading(true);
    setStatus({ type: 'info', message: 'Scanning BSC blockchain for new USDT deposits...' });

    try {
      const res = await fetch('/api/deposit/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: hash }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify deposit.');
      }

      if (data.credited > 0) {
        setStatus({
          type: 'success',
          message: `Success! Credited ${parseFloat(data.credited).toFixed(2)} USDT to your internal balance!`,
        });
        setAmount('');
        router.refresh();
      } else {
        setStatus({
          type: 'info',
          message: 'No new deposits found. If you just sent the funds, please wait a minute for BSC block confirmations and try again.',
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatus({
        type: 'error',
        message: err.message || 'Verification failed. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

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
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (USDT)"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              USDT
            </div>
          </div>

          <button
            onClick={handleDirectDeposit}
            disabled={isWritePending || isConfirming || !isConnected}
            className="sm:w-auto w-full inline-flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-sm shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isWritePending || isConfirming ? (
              <RefreshCw className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <Send className="w-4.5 h-4.5" />
            )}
            <span>
              {isWritePending ? 'Confirm in Wallet...' :
                isConfirming ? 'Confirming Block...' :
                  !isConnected ? 'Wallet Disconnected' : 'Send USDT'}
            </span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {status.type !== 'idle' && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold border animate-fade-in ${status.type === 'success'
              ? 'bg-emerald-50 border-emerald-150 text-emerald-800'
              : status.type === 'error'
                ? 'bg-rose-50 border-rose-150 text-rose-800'
                : 'bg-sky-50 border-sky-150 text-sky-800'
            }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : status.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          ) : (
            <RefreshCw className="w-5 h-5 text-sky-600 flex-shrink-0 animate-spin mt-0.5" />
          )}
          <div className="leading-relaxed">{status.message}</div>
        </div>
      )}
    </div>
  );
}
