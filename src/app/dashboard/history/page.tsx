import { getSession } from '@/lib/jwt';
import HistoryList from '@/components/dashboard/HistoryList';

export const metadata = {
  title: 'Transaction History - Universe Chain',
};

export default async function HistoryPage() {
  const session = await getSession();
  if (!session) return null;

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

      <HistoryList />
    </div>
  );
}
