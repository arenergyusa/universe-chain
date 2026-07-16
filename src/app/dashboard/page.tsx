import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import Link from 'next/link';
import {
  Wallet,
  ArrowDownCircle,
  Layers,
  Users,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Share2,
  Link as LinkIcon,
  Gift
} from 'lucide-react';
import CopyButton from '@/components/dashboard/CopyButton';

export default async function DashboardOverview() {
  const session = await getSession();

  // If session is missing, layout already handles rendering the sign-in prompt.
  // But just in case, we fetch the user safely here.
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      slots: {
        where: { status: 'active' },
        orderBy: { slotNumber: 'asc' },
      },
      referrals: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!user) return null;

  const activeSlotsCount = user.slots.length;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const referralLink = `${baseUrl}/login?ref=${user.referralCode}`;



  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Account Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Account Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your wallet, view your active cycles, and monitor your community growth.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="hidden md:flex items-center space-x-3 bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm w-fit">
          <div className={`w-3 h-3 rounded-full ${user.status === 'active' ? 'bg-emerald-500 animate-pulse-slow' : 'bg-amber-500'}`} />
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Account Status</div>
            <div className="text-xs font-bold text-slate-800">
              {user.status === 'active' ? 'Fully Active' : 'Inactive (Awaiting Activation)'}
            </div>
          </div>
        </div>
      </div>

      {/* Inactive Alert Banner */}
      {user.status !== 'active' && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-200/50 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20 flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">Activate Your ID</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
                Your account is currently inactive. Activate your ID with a one-time payment to start building your community and receiving rewards.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/dashboard/deposit"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-3.5 rounded-xl transition-colors"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Deposit USDT</span>
            </Link>
            <Link
              href="/dashboard/slots"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-5 py-3.5 rounded-xl transition-colors"
            >
              <span>View Slots</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Internal Balance Card */}
        <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Balance</span>
            <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-sky-50 flex items-center justify-center border border-sky-100 text-sky-600">
              <Wallet className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {parseFloat(user.internalBalance.toString()).toFixed(2)}
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-1">USDT (BEP20) Available</div>
          </div>
        </div>

        {/* Total Earned Card */}
        <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Earned</span>
            <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {parseFloat(user.totalEarned.toString()).toFixed(2)}
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-1">USDT (BEP20) Lifetime</div>
          </div>
        </div>

        {/* Active Slots Card */}
        <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slots</span>
            <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {activeSlotsCount}
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-1">Active Slots</div>
          </div>
        </div>

        {/* Community Members / Capacity Card */}
        <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invites</span>
            <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 text-purple-600">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {user.directReferralCount}
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-1">Direct Connections</div>
          </div>
          {/* Slots auto-create as referrals fill up */}
          {activeSlotsCount > 0 && (
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <div className="text-[10px] font-bold text-emerald-500">Slots auto-expand as you grow</div>
            </div>
          )}
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black rounded-3xl p-6 sm:p-8 shadow-lg shadow-indigo-900/20 text-white space-y-6 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -top-12 -right-12 p-8 opacity-10">
          <Share2 className="w-48 h-48" />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border border-indigo-500/20">
            <Gift className="w-3.5 h-3.5" /> Affiliate Program
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">Grow & Benefit</h3>
          <p className="text-indigo-200 text-xs leading-relaxed max-w-sm">
            Share your unique referral link to build your Web3 community. Earn rewards as your network grows, and manually claim your ecosystem benefits for direct invites and slot completions!
          </p>
        </div>

        <div className="relative z-10 bg-black/40 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 min-w-0 bg-black/40 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
              <LinkIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <code className="text-xs text-indigo-100 font-mono truncate">{referralLink}</code>
            </div>
            <CopyButton text={referralLink} label="Copy Link" />
          </div>
        </div>
      </div>


    </div>
  );
}
