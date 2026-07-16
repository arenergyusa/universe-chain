import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import { getConfig } from '@/lib/config-cache';
import TeamBusiness from '@/components/dashboard/TeamBusiness';

export const metadata = {
  title: 'Team Business - Universe Chain',
};

export default async function TeamPage() {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      slots: {
        orderBy: [{ slotNumber: 'asc' }, { createdAt: 'asc' }],
        include: {
          members: {
            orderBy: [{ level: 'asc' }, { position: 'asc' }],
            include: {
              user: {
                select: {
                  walletAddress: true,
                  status: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      },
      transactions: {
        where: {
          type: { in: ['activation', 'retop', 'commission'] },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) return null;

  // Map slots
  const slotsData = user.slots.map((slot) => ({
    id: slot.id,
    slotNumber: slot.slotNumber,
    status: slot.status,
    createdAt: slot.createdAt.toISOString(),
    completedAt: slot.completedAt?.toISOString() || null,
    members: slot.members.map((m) => ({
      id: m.id,
      position: m.position,
      level: m.level,
      parentMemberId: m.parentMemberId,
      createdAt: m.createdAt.toISOString(),
      user: {
        walletAddress: m.user.walletAddress,
        status: m.user.status,
      },
    })),
  }));

  // Map transactions
  const txData = user.transactions.map((tx) => ({
    id: tx.id,
    type: tx.type,
    amount: parseFloat(tx.amount.toString()),
    status: tx.status,
    txHash: tx.txHash,
    createdAt: tx.createdAt.toISOString(),
  }));

  // Calculate summary stats
  const totalEarned = parseFloat(user.totalEarned.toString());
  const finalizedTxData = txData.filter(t => t.status === 'completed');
  const activationTx = finalizedTxData.find(t => t.type === 'activation');
  const retopTxs = finalizedTxData.filter(t => t.type === 'retop');

  const totalInvested = (activationTx?.amount || 0) + retopTxs.reduce((s, t) => s + t.amount, 0);

  const summary = {
    totalSlots: new Set(slotsData.map(s => s.slotNumber)).size,
    activeSlots: slotsData.filter(s => s.status === 'active').length,
    completedSlots: slotsData.filter(s => s.status === 'completed').length,
    totalTeamMembers: slotsData.reduce((sum, s) => sum + s.members.length, 0),
    totalEarned,
    totalInvested,
    netPnL: totalEarned - totalInvested,
    activationAmount: activationTx?.amount || 0,
    activationDate: activationTx?.createdAt || null,
    retopCount: retopTxs.length,
    totalRetopAmount: retopTxs.reduce((s, t) => s + t.amount, 0),
  };

  const parsePct = (val: unknown, fallback: number) => {
    const num = Number(val);
    return isNaN(num) || num < 0 || num > 100 ? fallback : num;
  };

  const commissions = {
    level1: parsePct(await getConfig('LEVEL_1_PCT', 50), 50),
    level2: parsePct(await getConfig('LEVEL_2_PCT', 25), 25),
    level3: parsePct(await getConfig('LEVEL_3_PCT', 20), 20),
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Team Business
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Full breakdown of your slots, downline positions, and payment history.
        </p>
      </div>

      <TeamBusiness
        slots={slotsData}
        summary={summary}
        commissions={commissions}
      />
    </div>
  );
}
