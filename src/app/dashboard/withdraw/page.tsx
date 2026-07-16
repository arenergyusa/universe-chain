import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import WithdrawForm from '@/components/dashboard/WithdrawForm';

export const metadata = {
  title: 'Withdraw USDT - Universe Chain',
};

export default async function WithdrawPage() {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
  });

  const feeConfig = await db.systemConfig.findUnique({
    where: { key: 'WITHDRAWAL_FEE_PERCENTAGE' }
  });
  // Default to 10% if not set in DB
  const withdrawalFee = feeConfig ? parseFloat(feeConfig.value) : 10;

  if (!user) return null;

  const balance = user.internalBalance.toNumber();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Withdraw Funds
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Securely transfer USDT from your Universe Chain account to your wallet.
        </p>
      </div>

      <div className="w-full">
        {/* Form panel */}
        <div>
          <WithdrawForm balance={balance} feePercentage={withdrawalFee} walletAddress={user.walletAddress} />
        </div>
      </div>
    </div>
  );
}
