import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import { History, Clock, ArrowDownLeft, ArrowUpRight, Award, Layers, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Transaction History - Universe Chain',
};

export default async function HistoryPage() {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) return null;

  const transactions = user.transactions;

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return (
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100/60 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-5.5 h-5.5" />
          </div>
        );
      case 'withdrawal':
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100/60 text-amber-600 flex items-center justify-center">
            <ArrowUpRight className="w-5.5 h-5.5" />
          </div>
        );
      case 'commission':
        return (
          <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100/60 text-purple-600 flex items-center justify-center">
            <Award className="w-5.5 h-5.5" />
          </div>
        );
      case 'activation':
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100/60 text-sky-600 flex items-center justify-center">
            <Layers className="w-5.5 h-5.5" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Transaction History
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review all your account activities, deposit credits, withdrawals, and cycle rewards.
        </p>
      </div>

      <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-100">
          <History className="w-5.5 h-5.5 text-slate-400" />
          <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">All Logs</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-400 mt-2.5 font-medium">No transactions logged yet</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const isPositive = tx.type === 'deposit' || tx.type === 'commission';
              const isCompleted = tx.status === 'completed';
              const isPending = tx.status === 'pending';

              return (
                <div key={tx.id} className="py-5 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-4 min-w-0">
                    {getTxIcon(tx.type)}
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-800 capitalize">
                        {tx.type}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider flex items-center gap-2">
                        <span>{tx.status}</span>
                        {tx.txHash && !tx.txHash.startsWith('awaiting') && !tx.txHash.startsWith('failed') && (
                          <>
                            <span>•</span>
                            <a
                              href={`https://bscscan.com/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-600 hover:text-sky-700 inline-flex items-center gap-0.5"
                            >
                              <span>BscScan</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </>
                        )}
                      </div>

                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm sm:text-base font-black ${isPositive ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {isPositive ? '+' : '-'}{parseFloat(tx.amount.toString()).toFixed(2)} USDT
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
