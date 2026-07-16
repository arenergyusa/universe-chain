'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { History, Clock, ArrowDownLeft, ArrowUpRight, Award, Layers } from 'lucide-react';

import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: string;
  amount: string | number;
  status: string;
  txHash: string | null;
  createdAt: string;
}

export default function HistoryList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const fetchIdRef = useRef(0);
  const loadingRef = useRef(false);

  const fetchTransactions = useCallback(async (pageNum: number, type: string, append: boolean = true) => {
    const currentFetchId = ++fetchIdRef.current;

    try {
      setLoading(true);
      loadingRef.current = true;
      const res = await fetch(`/api/transactions?page=${pageNum}&limit=20&type=${type}`);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      
      if (currentFetchId !== fetchIdRef.current) return;
      
      if (append) {
        setTransactions(prev => [...prev, ...data.transactions]);
      } else {
        setTransactions(data.transactions);
      }
      setHasMore(data.hasMore);
    } catch (error: unknown) {
      if (currentFetchId !== fetchIdRef.current) return;
      console.error('Error fetching transactions:', error);
      const msg = error instanceof Error ? error.message : 'Failed to load transaction history.';
      toast.error(msg);
      setHasMore(false);
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setLoading(false);
        loadingRef.current = false;
      }
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions(page, filterType, page > 1);
  }, [page, filterType, fetchTransactions]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    const target = observerTarget.current;

    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    setPage(1);
  };

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
    <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <History className="w-5.5 h-5.5 text-slate-400" />
          <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">All Logs</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="tx-filter" className="text-xs font-bold text-slate-500">Filter:</label>
          <select 
            id="tx-filter"
            value={filterType}
            onChange={handleFilterChange}
            className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="commission">Commission</option>
            <option value="activation">Activation</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {transactions.length === 0 && !loading ? (
          <div className="text-center py-16">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-400 mt-2.5 font-medium">No transactions found</p>
          </div>
        ) : (
          transactions.map((tx) => {
            const isPositive = ['deposit', 'commission', 'invite_reward', 'slot_bonus', 'referral_income', 'pair_bonus', 'slot_reward'].includes(tx.type.toLowerCase());
            
            return (
              <div key={tx.id} className="py-5 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-4 min-w-0">
                  {getTxIcon(tx.type)}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-800 capitalize">
                      {tx.type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider flex items-center gap-2">
                      <span>{tx.status}</span>
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
        
        {/* Loading Indicator & Observer Target */}
        {loading && (
          <div className="py-8 text-center text-sm font-bold text-slate-400 flex justify-center items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin"></div>
            Loading...
          </div>
        )}
        <div ref={observerTarget} className="h-4" />
      </div>
    </div>
  );
}
