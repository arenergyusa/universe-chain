'use client';

import { useState, useEffect } from 'react';
import { Wallet, ShieldCheck, Loader2, ArrowUpRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { withdrawSchema } from '@/lib/validators';
import * as z from 'zod';

interface WithdrawFormProps {
  balance: number;
  feePercentage: number;
  walletAddress: string;
}

export default function WithdrawForm({ balance, feePercentage, walletAddress }: WithdrawFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  type WithdrawFormValues = z.infer<typeof withdrawSchema>;
  
  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      address: walletAddress || '',
      amount: 0,
    },
  });

  useEffect(() => {
    if (walletAddress) {
      form.setValue('address', walletAddress);
    }
  }, [walletAddress, form]);

  const { formState: { errors } } = form;
  // eslint-disable-next-line react-hooks/incompatible-library
  const amt = form.watch('amount') || 0;
  const feeAmount = (amt * feePercentage) / 100;
  const netAmount = amt - feeAmount;

  const onSubmit = async (values: WithdrawFormValues) => {
    if (!walletAddress) {
      toast.error('Wallet address not found in session.');
      return;
    }

    if (values.amount > balance) {
      toast.error('Insufficient balance in your internal vault.');
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
          address: walletAddress, // Enforced securely
          amount: values.amount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to process withdrawal.');
      }

      toast.success(`Successfully initiated withdrawal of ${values.amount.toFixed(2)} USDT! Your transaction is processing.`);
      form.reset({ address: walletAddress || '', amount: 0 });
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred.');
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

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Destination Address (Enforced via Wagmi) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Destination Wallet (Saved)
            </label>
          </div>
          <div className="flex items-center space-x-3 w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 font-mono">
            {walletAddress ? (
              <>
                <Wallet className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                <span className="truncate">{walletAddress}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4.5 h-4.5 text-amber-500" />
                <span className="text-slate-500">Wallet address not found.</span>
              </>
            )}
          </div>
          {errors.address && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.address.message}</p>}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="amount" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Amount (USDT)
            </label>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <span>Min: 10 USDT</span>
              <span className="text-slate-200">|</span>
              <span>Available: {balance.toFixed(2)} USDT</span>
            </div>
          </div>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="0.00"
              disabled={loading}
              className={`w-full pl-4 pr-16 py-6 bg-slate-50 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 font-mono focus-visible:ring-sky-500/20 ${errors.amount ? 'border-rose-300 ring-rose-200' : ''}`}
              {...form.register('amount', { valueAsNumber: true })}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => form.setValue('amount', balance, { shouldValidate: true })}
              disabled={loading || balance <= 0}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold h-7 px-2.5 rounded-md uppercase tracking-wider"
            >
              Max
            </Button>
          </div>
          {errors.amount && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.amount.message}</p>}
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

        {/* Security Warning */}
        <div className="flex items-start space-x-2.5 p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl text-[11px] text-slate-400 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p>
            Withdrawals are processed automatically and directly to your connected wallet. The network gas fees are entirely covered by the platform.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || balance <= 0}
          className="w-full py-6 rounded-xl font-bold shadow-md transition-all duration-150"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing secure withdrawal...
            </>
          ) : (
            <>
              <ArrowUpRight className="w-4.5 h-4.5 mr-2" />
              Request Withdrawal
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
