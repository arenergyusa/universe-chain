import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import DepositSync from '@/components/dashboard/DepositSync';

export const metadata = {
  title: 'Deposit USDT - Universe Chain',
};

export default async function DepositPage() {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) return null;

  const adminDepositAddress = process.env.ADMIN_DEPOSIT_ADDRESS;

  if (!adminDepositAddress || !/^0x[a-fA-F0-9]{40}$/.test(adminDepositAddress)) {
    return (
      <div className="space-y-8 animate-fade-in p-6">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
          <h2 className="text-lg font-bold mb-2">Configuration Error</h2>
          <p className="text-sm">The deposit system is currently unavailable due to a missing or invalid address configuration. Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Deposit
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Seamlessly fund your account by signing a transaction directly from your connected wallet.
        </p>
      </div>

      <div className="w-full">
        {/* Web3 Deposit Interactive Component */}
        <div className="space-y-6">
          <DepositSync adminAddress={adminDepositAddress} userAddress={user.walletAddress} />
        </div>
      </div>
    </div>
  );
}
