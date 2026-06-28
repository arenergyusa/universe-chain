import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import Link from 'next/link';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Layers,
  Users,
  Copy,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Calendar,
  UserPlus,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import DepositSync from '@/components/dashboard/DepositSync';
import CopyButton from '@/components/dashboard/CopyButton';
import { Share2, Link as LinkIcon, Gift } from 'lucide-react';
export const metadata = {
  title: 'Dashboard Overview - Universe Chain',
};

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
      },
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!user) return null;

  const activeSlotsCount = user.slots.length;
  const adminDepositAddress = process.env.ADMIN_DEPOSIT_ADDRESS || '0xAdminAddressNotConfigured';
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const referralLink = `${baseUrl}/login?ref=${user.referralCode}`;

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="space-y-8">
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
        <div className="flex items-center space-x-3 bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm w-fit">
          <div className={`w-3 h-3 rounded-full ${user.status === 'active' ? 'bg-emerald-500 animate-pulse-slow' : 'bg-amber-500'}`} />
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Account Status</div>
            <div className="text-xs font-bold text-slate-800">
              {user.status === 'active' ? 'Fully Active' : 'Inactive (Awaiting Slot)'}
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
              <h3 className="text-base font-bold text-slate-800">Activate Your Account</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
                Your account is currently inactive. To start building your community and receiving rewards, you need to open your first slot for 100 USDT.
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
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Internal Balance</span>
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
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Earned</span>
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
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Slots</span>
            <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {activeSlotsCount}
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-1">Active Cycles</div>
          </div>
        </div>

        {/* Community Members Card */}
        <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Invites</span>
            <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 text-purple-600">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {user.directReferralCount}
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-1">Directly connected users</div>
          </div>
        </div>
      </div>

      {/* Referral Link & Add Funds Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Referral Link Section */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black rounded-3xl p-6 sm:p-8 shadow-lg shadow-indigo-900/20 text-white space-y-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 p-8 opacity-10">
            <Share2 className="w-48 h-48" />
          </div>
          
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border border-indigo-500/20">
              <Gift className="w-3.5 h-3.5" /> Affiliate Program
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">Invite & Earn</h3>
            <p className="text-indigo-200 text-xs leading-relaxed max-w-sm">
              Share your unique referral link to build your binary matrix. Earn up to 25% commissions instantly, PLUS claim bonus rewards for direct referrals and board completions!
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

        {/* Direct Deposit Integration */}
        <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Quick Add Funds</h3>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-sm">
              Deposit USDT directly from your connected Web3 wallet. Funds are credited instantly to your internal balance.
            </p>
          </div>
          
          <DepositSync adminAddress={adminDepositAddress} />
        </div>
      </div>

      {/* Invites List (Team Data) */}
      <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <Users className="w-5.5 h-5.5 text-slate-400" />
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">Direct Connections</h3>
          </div>
          <div className="flex gap-3">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Active: {user.referrals.filter(r => r.status === 'active').length}
            </span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
              Pending: {user.referrals.filter(r => r.status !== 'active').length}
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {user.referrals.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <UserPlus className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-slate-800">No connections yet</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Share your unique invitation link to start growing your secure Web3 community.
                </p>
              </div>
            </div>
          ) : (
            user.referrals.map((ref) => (
              <div key={ref.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold font-mono text-sm border border-slate-200/60 flex-shrink-0">
                    {ref.referralCode.substring(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-800 font-mono truncate">
                      {formatAddress(ref.walletAddress)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Code: {ref.referralCode}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Joined {new Date(ref.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                    ref.status === 'active'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>
                    {ref.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity (Transactions) */}
      <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <ArrowRightLeft className="w-5.5 h-5.5 text-slate-400" />
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">Recent Activity</h3>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-full transition-colors flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {user.transactions.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Clock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-slate-800">No activity yet</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Your transactions, deposits, and rewards will appear here once you start using the platform.
                </p>
              </div>
            </div>
          ) : (
            user.transactions.map((tx) => (
              <div key={tx.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center border ${
                    tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    tx.type === 'withdrawal' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    tx.type === 'referral_income' || tx.type === 'slot_reward' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {tx.type === 'deposit' ? <ArrowDownCircle className="w-5 h-5" /> :
                     tx.type === 'withdrawal' ? <ArrowUpCircle className="w-5 h-5" /> :
                     tx.type === 'referral_income' ? <Gift className="w-5 h-5" /> :
                     <Layers className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 capitalize">
                      {tx.type.replace('_', ' ')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                  <div className="flex flex-col items-start sm:items-end">
                    <span className={`text-sm font-black ${
                      ['deposit', 'referral_income', 'slot_reward', 'pair_bonus'].includes(tx.type) ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {['deposit', 'referral_income', 'slot_reward', 'pair_bonus'].includes(tx.type) ? '+' : '-'}
                      {parseFloat(tx.amount.toString()).toFixed(2)} USDT
                    </span>
                    {parseFloat(tx.fee.toString()) > 0 && (
                      <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Fee: {parseFloat(tx.fee.toString()).toFixed(2)} USDT
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    {tx.status === 'confirmed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : tx.status === 'pending' ? (
                      <Clock className="w-5 h-5 text-amber-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
