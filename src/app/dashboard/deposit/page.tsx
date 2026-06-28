import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import { Send, Clock } from 'lucide-react';
import DepositSync from '@/components/dashboard/DepositSync';

export const metadata = {
  title: 'Deposit USDT - Universe Chain',
};

export default async function DepositPage() {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      transactions: {
        where: { type: 'deposit' },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!user) return null;

  const adminDepositAddress = process.env.ADMIN_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000';
  const recentDeposits = user.transactions;

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Web3 Deposit
        </h1>
        <p className="text-slate-500 text-sm">
          Seamlessly fund your account by signing a transaction directly from your connected wallet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Web3 Deposit Interactive Component */}
        <div className="md:col-span-7 space-y-6">
          <DepositSync adminAddress={adminDepositAddress} />
        </div>

        {/* Info & History */}
        <div className="md:col-span-5 space-y-6">
          <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">Recent Deposits</h3>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
              </div>
            </div>

            <div className="space-y-3.5">
              {recentDeposits.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200/80 rounded-2xl">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 mt-2 font-medium">No recent deposits found</p>
                </div>
              ) : (
                recentDeposits.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="min-w-0 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <Send className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-700">
                          +{parseFloat(tx.amount.toString()).toFixed(2)} USDT
                        </div>
                        <div className="text-[10px] text-emerald-600 mt-0.5 font-bold uppercase">
                          {tx.status}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
