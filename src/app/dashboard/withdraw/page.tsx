import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import WithdrawForm from '@/components/dashboard/WithdrawForm';
import { ArrowUpRight, History, Clock, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Withdraw USDT - Universe Chain',
};

export default async function WithdrawPage() {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      transactions: {
        where: { type: 'withdrawal' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  const feeConfig = await db.systemConfig.findUnique({
    where: { key: 'WITHDRAWAL_FEE_PERCENTAGE' }
  });
  // Default to 10% if not set in DB
  const withdrawalFee = feeConfig ? parseFloat(feeConfig.value) : 10;

  if (!user) return null;

  const balance = user.internalBalance.toNumber();
  const recentWithdrawals = user.transactions;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Withdraw Funds
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Securely transfer USDT from your Universe Chain account to your wallet.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form panel */}
        <div className="lg:col-span-7">
          <WithdrawForm balance={balance} feePercentage={withdrawalFee} />
        </div>

        {/* Recent History Panel */}
        <div className="lg:col-span-5">
          <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">Recent Withdrawals</h3>
              <History className="w-4.5 h-4.5 text-slate-400" />
            </div>

            <div className="space-y-3.5">
              {recentWithdrawals.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200/80 rounded-2xl">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 mt-2 font-medium">No recent withdrawals found</p>
                </div>
              ) : (
                recentWithdrawals.map((tx) => {
                  const isCompleted = tx.status === 'completed';
                  const isPending = tx.status === 'pending';
                  const isFailed = tx.status === 'failed';

                  return (
                    <div key={tx.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-700">
                          {parseFloat(tx.amount.toString()).toFixed(2)} USDT
                        </div>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${isCompleted
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : isPending
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                          {tx.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                        <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                        {isCompleted && tx.txHash && !tx.txHash.startsWith('awaiting') && !tx.txHash.startsWith('failed') && (
                          <a
                            href={`https://bscscan.com/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 hover:text-sky-700 inline-flex items-center gap-0.5 transition-colors"
                          >
                            <span>BscScan</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
