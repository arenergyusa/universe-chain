'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Gift, Users, Box, CheckCircle } from 'lucide-react';

export default function RewardsPage() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [claiming, setClaiming] = useState<string | null>(null);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
    enabled: isConnected,
    staleTime: 60000, // Cache for 1 minute
  });

  const stats = {
    directReferrals: data?.user?.directReferralCount || 0,
    referralRewardsClaimed: data?.user?.referralRewardsClaimed || 0,
    completedSlots: data?.user?.slots?.filter((s: { status: string }) => s.status === 'completed' || s.status === 'retoped').length || 0,
    slotRewardsClaimed: data?.user?.slotRewardsClaimed || 0,
  };

  const configs = {
    directReward: data?.configs?.directReward || 0,
    slotReward: data?.configs?.slotReward || 0,
  };

  const claimReward = async (type: 'referral' | 'slot') => {
    setClaiming(type);
    try {
      const res = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim reward');
      }

      alert(data.message);
      queryClient.invalidateQueries({ queryKey: ['auth-me'] }); // refresh stats
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setClaiming(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Gift className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Connect Wallet</h2>
        <p className="text-slate-500 text-center max-w-md">Please connect your wallet to view and claim your rewards.</p>
      </div>
    );
  }

  const eligibleReferralClaims = Math.floor(stats.directReferrals / 2) - stats.referralRewardsClaimed;
  const eligibleSlotClaims = stats.completedSlots - stats.slotRewardsClaimed;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Gift className="w-7 h-7 text-sky-600" />
            Rewards & Invites
          </h1>
          <p className="text-sm text-slate-500 mt-1">Claim bonuses for your team building efforts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Referral Rewards Card */}
        <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Users className="w-8 h-8" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reward Rate</div>
              <div className="text-xl font-black text-slate-900">{configs.directReward} USDT</div>
              <div className="text-xs text-slate-500">per 2 referrals</div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">Referral Bonus</h3>
          <p className="text-sm text-slate-500 mb-6 flex-grow">
            For every 2 active direct referrals you bring into the Universe Chain, you earn a special bonus of {configs.directReward} USDT!
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600">Total Referrals</span>
              <span className="font-bold text-slate-900">{stats.directReferrals}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600">Rewards Claimed</span>
              <span className="font-bold text-slate-900">{stats.referralRewardsClaimed} times</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-sm font-medium text-slate-600">Available to Claim</span>
              <span className="font-bold text-emerald-600">{eligibleReferralClaims > 0 ? eligibleReferralClaims : 0} rewards</span>
            </div>
          </div>

          <button
            onClick={() => claimReward('referral')}
            disabled={eligibleReferralClaims <= 0 || claiming !== null}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${eligibleReferralClaims > 0 && claiming === null
              ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
          >
            {claiming === 'referral' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : eligibleReferralClaims > 0 ? (
              <>Claim {eligibleReferralClaims * configs.directReward} USDT</>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                No Rewards Available
              </>
            )}
          </button>
        </div>

        {/* Slot Completion Rewards Card */}
        <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Box className="w-8 h-8" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reward Rate</div>
              <div className="text-xl font-black text-slate-900">{configs.slotReward} USDT</div>
              <div className="text-xs text-slate-500">per full slot</div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">Slot Bonus</h3>
          <p className="text-sm text-slate-500 mb-6 flex-grow">
            When your 14-member working slot is completely filled, you earn an extra bonus of {configs.slotReward} USDT as a reward for your leadership!
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600">Slots Completed</span>
              <span className="font-bold text-slate-900">{stats.completedSlots}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600">Rewards Claimed</span>
              <span className="font-bold text-slate-900">{stats.slotRewardsClaimed} times</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-sm font-medium text-slate-600">Available to Claim</span>
              <span className="font-bold text-emerald-600">{eligibleSlotClaims > 0 ? eligibleSlotClaims : 0} rewards</span>
            </div>
          </div>

          <button
            onClick={() => claimReward('slot')}
            disabled={eligibleSlotClaims <= 0 || claiming !== null}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${eligibleSlotClaims > 0 && claiming === null
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
          >
            {claiming === 'slot' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : eligibleSlotClaims > 0 ? (
              <>Claim {eligibleSlotClaims * configs.slotReward} USDT</>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                No Rewards Available
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
