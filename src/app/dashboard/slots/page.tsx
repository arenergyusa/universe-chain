import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import { getConfig } from '@/lib/config-cache';
import SlotsManager from '@/components/dashboard/SlotsManager';

export const metadata = {
  title: 'Vault Slots - Universe Chain',
};

export default async function SlotsPage() {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      slots: {
        orderBy: { createdAt: 'asc' },
        include: {
          members: {
            include: {
              user: {
                select: {
                  walletAddress: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  const userBalance = user.internalBalance.toNumber();

  // Map ALL slots (active, completed, retoped) to the structure expected by SlotsManager
  const mappedSlots = user.slots.map((slot) => ({
    id: slot.id,
    slotNumber: slot.slotNumber,
    status: slot.status,
    members: slot.members.map((member) => ({
      id: member.id,
      position: member.position,
      level: member.level,
      parentMemberId: member.parentMemberId,
      user: {
        walletAddress: member.user.walletAddress,
      },
    })),
  }));

  // Determine activation state
  const isActivated = user.status === 'active' && user.slots.length > 0;
  const hasCompletedSlot = user.slots.some(s => s.status === 'completed');

  // Fetch costs from config cache
  const activationCost = parseFloat(await getConfig('SLOT_OPEN_AMOUNT', 100));
  const retopCost = parseFloat(await getConfig('RETOP_AMOUNT', 100));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Slots
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {isActivated
            ? 'View your active matrix boards and track downline positions.'
            : 'Activate your ID to start building your community matrix.'}
        </p>
      </div>

      <SlotsManager
        userBalance={userBalance}
        allSlots={mappedSlots}
        isActivated={isActivated}
        hasCompletedSlot={hasCompletedSlot}
        activationCost={activationCost}
        retopCost={retopCost}
      />
    </div>
  );
}
