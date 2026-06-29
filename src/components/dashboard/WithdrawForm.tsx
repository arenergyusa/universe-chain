'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Wallet, ShieldCheck, Loader2, ArrowUpRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WithdrawFormProps {
  balance: number;
  feePercentage: number;
}

export default function WithdrawForm({ balance, feePercentage }: WithdrawFormProps) {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const amt = parseFloat(amount) || 0;
  const feeAmount = (amt * feePercentage) / 100;
  const netAmount = amt - feeAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isConnected || !address) {
      setError('Please connect your Web3 wallet first.');
      return;
    }

    const amt = parseFloat(amount);

    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (amt > balance) {
      setError('Insufficient balance in your internal vault.');
      return;
    }

    if (amt < 10) {
      setError('Minimum withdrawal amount is 10 USDT.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address, // Enforced securely
          amount: amt,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process withdrawal.');
      }

      setSuccess(`Successfully initiated withdrawal of ${amt.toFixed(2)} USDT! Your transaction is processing.`);
      setAmount('');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
          <ArrowUpRight className="w-5.5 h-5.5" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Request Withdrawal</h3>
          <p className="text-slate-400 text-xs mt-0.5">Withdraw USDT directly to your connected Web3 wallet.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start space-x-2.5 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-xs">
          <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start space-x-2.5 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs">
          <CheckCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Destination Address (Enforced via Wagmi) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Destination Wallet (Connected)
            </label>
          </div>
          <div className="flex items-center space-x-3 w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 font-mono">
            {isConnected && address ? (
              <>
                <Wallet className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                <span className="truncate">{address}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4.5 h-4.5 text-amber-500" />
                <span className="text-slate-500">Wallet not connected. Please connect wallet.</span>
              </>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="amount" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Amount (USDT)
            </label>
            <span className="text-[10px] font-bold text-slate-400">
              Available: {balance.toFixed(2)} USDT
            </span>
          </div>
          <div className="relative">
            <input
              id="amount"
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading || !isConnected}
              className="w-full pl-4 pr-16 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-mono"
              required
            />
            <button
              type="button"
              onClick={() => setAmount(balance.toString())}
              disabled={loading || balance <= 0 || !isConnected}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-slate-200/60 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md transition-colors uppercase tracking-wider"
            >
              Max
            </button>
          </div>

          {/* Live Calculation Display */}
          {amt > 0 && (
            <div className="flex flex-col space-y-1.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Platform Withdrawal Fee ({feePercentage}%)</span>
                <span className="font-mono text-rose-500 font-bold">- {feeAmount.toFixed(2)} USDT</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 pt-1 border-t border-slate-200">
                <span>You will receive on-chain</span>
                <span className="font-mono text-emerald-600">{netAmount.toFixed(2)} USDT</span>
              </div>
            </div>
          )}
        </div>

        {/* Security Warning */}
        <div className="flex items-start space-x-2.5 p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl text-[11px] text-slate-400 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p>
            Withdrawals are processed automatically and directly to your connected wallet. The network gas fees are entirely covered by the platform.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || balance <= 0 || !isConnected}
          className="glow-btn w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-sm shadow-md transition-all duration-150"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing secure withdrawal...</span>
            </>
          ) : (
            <>
              <ArrowUpRight className="w-4.5 h-4.5" />
              <span>Request Withdrawal</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
