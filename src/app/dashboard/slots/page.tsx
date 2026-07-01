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

  // Map slots to the structure expected by SlotsManager
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

  // Fetch dynamic slot open & retop amounts from cache
  const slotOpenAmount = parseFloat(await getConfig('SLOT_OPEN_AMOUNT', 100));
  const retopAmount = parseFloat(await getConfig('RETOP_AMOUNT', 100));

  // Generate dynamic unlimited slots up to the next available one
  const activeSlotNumbers = mappedSlots.map(s => s.slotNumber);
  const maxActiveSlot = activeSlotNumbers.length > 0 ? Math.max(...activeSlotNumbers) : 0;
  const nextSlotNumber = maxActiveSlot + 1;

  const slotDetails = [];
  for (let i = 1; i <= nextSlotNumber; i++) {
    // Check if user has a completed slot for this number
    const isRetop = mappedSlots.some(s => s.slotNumber === i && (s.status === 'completed' || s.status === 'retoped'));
    const cost = isRetop ? retopAmount : slotOpenAmount;
    slotDetails.push({ number: i, cost: cost, label: `Vault Matrix ${i}` });
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Slots
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Activate and manage your secure account cycles, and track downline positions.
        </p>
      </div>

      <SlotsManager userBalance={userBalance} activeSlots={mappedSlots} slotDetails={slotDetails} />
    </div>
  );
}
