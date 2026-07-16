'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Gift, Users, Box, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function RewardsPage() {
  const queryClient = useQueryClient();
  const [claiming, setClaiming] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
    staleTime: 60000, // Cache for 1 minute
  });

  const stats = {
    directReferrals: data?.data?.user?.directReferralCount || 0,
    referralRewardsClaimed: data?.data?.user?.referralRewardsClaimed || 0,
    completedSlots: data?.data?.user?.slots?.filter((s: { status: string }) => s.status === 'completed' || s.status === 'retoped').length || 0,
    slotRewardsClaimed: data?.data?.user?.slotRewardsClaimed || 0,
  };

  const configs = {
    directReward: data?.data?.configs?.directReward || 0,
    slotReward: data?.data?.configs?.slotReward || 0,
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
        throw new Error(data.error?.message || 'Failed to claim reward');
      }

      toast.success(data.data.message || data.message);
      queryClient.invalidateQueries({ queryKey: ['auth-me'] }); // refresh stats
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setClaiming(null);
    }
  };



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
            For every 2 active direct referrals you bring into the Universe Chain, you receive a special reward of {configs.directReward} USDT!
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

          <Button
            onClick={() => claimReward('referral')}
            disabled={eligibleReferralClaims <= 0 || claiming !== null}
            className={`w-full py-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${eligibleReferralClaims > 0 && claiming === null
              ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
              : 'bg-slate-100 text-slate-400'
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
                <CheckCircle className="w-5 h-5 mr-1" />
                No Rewards Available
              </>
            )}
          </Button>
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
            When your 14-member working slot is completely filled, you receive an extra reward of {configs.slotReward} USDT for your community leadership!
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

          <Button
            onClick={() => claimReward('slot')}
            disabled={eligibleSlotClaims <= 0 || claiming !== null}
            className={`w-full py-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${eligibleSlotClaims > 0 && claiming === null
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
              : 'bg-slate-100 text-slate-400'
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
                <CheckCircle className="w-5 h-5 mr-1" />
                No Rewards Available
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
