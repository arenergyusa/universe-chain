'use client';

import { useState } from 'react';
import { Layers, ShieldCheck, HelpCircle, Loader2, Award, User, MoveHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SlotMemberData {
  id: string;
  position: string;
  level: number;
  parentMemberId: string | null;
  user: {
    walletAddress: string;
  };
}

interface SlotData {
  id: string;
  slotNumber: number;
  status: string;
  members: SlotMemberData[];
}

interface SlotsManagerProps {
  userBalance: number;
  activeSlots: SlotData[];
  slotDetails: { number: number; cost: number; label: string }[];
}

export default function SlotsManager({ userBalance, activeSlots, slotDetails }: SlotsManagerProps) {
  const router = useRouter();
  const [selectedSlotNum, setSelectedSlotNum] = useState<number>(1);
  const [loading, setLoading] = useState<number | null>(null);

  // activeSlotMap only holds currently 'active' slots that can be viewed/filled
  const activeSlotMap = new Map(activeSlots.filter(s => s.status === 'active').map(s => [s.slotNumber, s]));

  // unlockedLevelsMap holds any slot that was ever activated (active, completed, retoped) to allow unlocking the next level
  const unlockedLevelsMap = new Map(activeSlots.map(s => [s.slotNumber, true]));

  const currentSlot = activeSlotMap.get(selectedSlotNum);
  const isSelectedActive = !!currentSlot;

  // Check if this slot requires a Retop (i.e. it has a completed history but no active matrix)
  const isSelectedRetop = !isSelectedActive && activeSlots.some(s => s.slotNumber === selectedSlotNum && (s.status === 'completed' || s.status === 'retoped'));

  const handleActivate = async (slotNum: number, cost: number) => {
    if (userBalance < cost) {
      toast.error(`Insufficient balance. Activation requires ${cost} USDT.`);
      return;
    }

    try {
      setLoading(slotNum);

      const res = await fetch('/api/slots/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotNumber: slotNum }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to activate slot.');
      }

      toast.success(`Vault Slot ${slotNum} activated successfully! Your position has been placed in the matrix.`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(null);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
  };

  // Helper to build the visual binary tree representation
  const renderBinaryTree = () => {
    if (!currentSlot) return null;

    const members = currentSlot.members;
    const level1 = members.filter(m => m.level === 1);
    const level2 = members.filter(m => m.level === 2);
    const level3 = members.filter(m => m.level === 3);

    // Node builders for various levels
    const getNode = (levelMembers: SlotMemberData[], parentId: string | null, position: 'left' | 'right', compact: boolean = false) => {
      const node = levelMembers.find(m => m.parentMemberId === parentId && m.position === position);
      const widthClass = compact ? 'w-[84px]' : 'w-24';
      const textClass = compact ? 'text-[8px]' : 'text-[9px]';
      const paddingClass = compact ? 'p-1.5' : 'p-2';

      return node ? (
        <div className={`flex flex-col items-center ${paddingClass} bg-sky-500/10 border border-sky-500/30 text-sky-755 rounded-xl ${widthClass} shadow-2xs`}>
          <User className="w-3.5 h-3.5 mb-0.5 text-sky-600" />
          <span className={`${textClass} font-bold font-mono truncate w-full text-center`}>
            {formatAddress(node.user.walletAddress)}
          </span>
        </div>
      ) : (
        <div className={`flex flex-col items-center ${paddingClass} bg-slate-50 border border-slate-200 border-dashed text-slate-400 rounded-xl ${widthClass}`}>
          <HelpCircle className="w-3.5 h-3.5 mb-0.5 text-slate-300" />
          <span className={`${textClass} font-bold uppercase tracking-wider`}>Available</span>
        </div>
      );
    };

    const leftL1 = level1.find(m => m.position === 'left');
    const rightL1 = level1.find(m => m.position === 'right');

    const leftLeftL2 = leftL1 ? level2.find(m => m.parentMemberId === leftL1.id && m.position === 'left') : null;
    const leftRightL2 = leftL1 ? level2.find(m => m.parentMemberId === leftL1.id && m.position === 'right') : null;
    const rightLeftL2 = rightL1 ? level2.find(m => m.parentMemberId === rightL1.id && m.position === 'left') : null;
    const rightRightL2 = rightL1 ? level2.find(m => m.parentMemberId === rightL1.id && m.position === 'right') : null;

    return (
      <div className="w-full relative">
        <div className="sm:hidden absolute top-0 right-0 flex items-center gap-1 text-[10px] text-slate-400 font-bold bg-white/80 px-2 py-1 rounded-full z-10 animate-pulse">
          Swipe <MoveHorizontal className="w-3 h-3" />
        </div>
        <div className="w-full overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="space-y-8 py-4 min-w-[750px] flex flex-col items-center mx-auto">
          {/* Root Level (You) */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center p-3 bg-slate-900 border border-slate-800 text-white rounded-2xl w-28 shadow-md">
              <Award className="w-5 h-5 mb-1 text-sky-400" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Your Position</span>
            </div>
            <div className="h-6 w-0.5 bg-slate-300"></div>
          </div>

          {/* Level 1 (2 nodes) */}
          <div className="w-full flex justify-around relative">
            <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-300"></div>
            {/* Level 1 Left */}
            <div className="flex flex-col items-center w-1/2">
              <div className="h-6 w-0.5 bg-slate-300"></div>
              {leftL1 ? (
                <div className="flex flex-col items-center p-2.5 bg-sky-500/10 border border-sky-500/30 text-sky-700 rounded-xl w-24 shadow-2xs">
                  <User className="w-4 h-4 mb-1 text-sky-600" />
                  <span className="text-[9px] font-bold font-mono truncate w-full text-center">
                    {formatAddress(leftL1.user.walletAddress)}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center p-2.5 bg-slate-50 border border-slate-200 border-dashed text-slate-400 rounded-xl w-24">
                  <HelpCircle className="w-4 h-4 mb-1 text-slate-300" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Available</span>
                </div>
              )}
              <div className="h-6 w-0.5 bg-slate-300"></div>
            </div>

            {/* Level 1 Right */}
            <div className="flex flex-col items-center w-1/2">
              <div className="h-6 w-0.5 bg-slate-300"></div>
              {rightL1 ? (
                <div className="flex flex-col items-center p-2.5 bg-sky-500/10 border border-sky-500/30 text-sky-700 rounded-xl w-24 shadow-2xs">
                  <User className="w-4 h-4 mb-1 text-sky-600" />
                  <span className="text-[9px] font-bold font-mono truncate w-full text-center">
                    {formatAddress(rightL1.user.walletAddress)}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center p-2.5 bg-slate-50 border border-slate-200 border-dashed text-slate-400 rounded-xl w-24">
                  <HelpCircle className="w-4 h-4 mb-1 text-slate-300" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Available</span>
                </div>
              )}
              <div className="h-6 w-0.5 bg-slate-300"></div>
            </div>
          </div>

          {/* Level 2 (4 nodes) */}
          <div className="w-full flex justify-around relative">
            {/* Children under L1 Left */}
            <div className="w-1/2 flex justify-around relative">
              <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-300"></div>
              <div className="flex flex-col items-center w-1/2">
                <div className="h-6 w-0.5 bg-slate-300"></div>
                {leftL1 ? getNode(level2, leftL1.id, 'left') : (
                  <div className="w-24 p-2 bg-slate-50/50 border border-slate-100 rounded-xl text-center text-[8px] text-slate-300 uppercase">Locked</div>
                )}
                {leftLeftL2 && <div className="h-6 w-0.5 bg-slate-300"></div>}
              </div>
              <div className="flex flex-col items-center w-1/2">
                <div className="h-6 w-0.5 bg-slate-300"></div>
                {leftL1 ? getNode(level2, leftL1.id, 'right') : (
                  <div className="w-24 p-2 bg-slate-50/50 border border-slate-100 rounded-xl text-center text-[8px] text-slate-300 uppercase">Locked</div>
                )}
                {leftRightL2 && <div className="h-6 w-0.5 bg-slate-300"></div>}
              </div>
            </div>

            {/* Children under L1 Right */}
            <div className="w-1/2 flex justify-around relative">
              <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-300"></div>
              <div className="flex flex-col items-center w-1/2">
                <div className="h-6 w-0.5 bg-slate-300"></div>
                {rightL1 ? getNode(level2, rightL1.id, 'left') : (
                  <div className="w-24 p-2 bg-slate-50/50 border border-slate-100 rounded-xl text-center text-[8px] text-slate-300 uppercase">Locked</div>
                )}
                {rightLeftL2 && <div className="h-6 w-0.5 bg-slate-300"></div>}
              </div>
              <div className="flex flex-col items-center w-1/2">
                <div className="h-6 w-0.5 bg-slate-300"></div>
                {rightL1 ? getNode(level2, rightL1.id, 'right') : (
                  <div className="w-24 p-2 bg-slate-50/50 border border-slate-100 rounded-xl text-center text-[8px] text-slate-300 uppercase">Locked</div>
                )}
                {rightRightL2 && <div className="h-6 w-0.5 bg-slate-300"></div>}
              </div>
            </div>
          </div>

          {/* Level 3 (8 nodes) */}
          <div className="w-full flex justify-around relative">
            {/* Group 1: under leftLeftL2 */}
            <div className="w-1/4 flex justify-around relative">
              {leftLeftL2 && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-300"></div>}
              <div className="flex flex-col items-center w-1/2">
                {leftLeftL2 && <div className="h-6 w-0.5 bg-slate-300"></div>}
                {leftLeftL2 ? getNode(level3, leftLeftL2.id, 'left', true) : (
                  <div className="w-[84px] h-[36px] flex items-center justify-center border border-slate-100 rounded-xl text-center text-[7px] text-slate-300 uppercase">Locked</div>
                )}
              </div>
              <div className="flex flex-col items-center w-1/2">
                {leftLeftL2 && <div className="h-6 w-0.5 bg-slate-300"></div>}
                {leftLeftL2 ? getNode(level3, leftLeftL2.id, 'right', true) : (
                  <div className="w-[84px] h-[36px] flex items-center justify-center border border-slate-100 rounded-xl text-center text-[7px] text-slate-300 uppercase">Locked</div>
                )}
              </div>
            </div>

            {/* Group 2: under leftRightL2 */}
            <div className="w-1/4 flex justify-around relative">
              {leftRightL2 && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-300"></div>}
              <div className="flex flex-col items-center w-1/2">
                {leftRightL2 && <div className="h-6 w-0.5 bg-slate-300"></div>}
                {leftRightL2 ? getNode(level3, leftRightL2.id, 'left', true) : (
                  <div className="w-[84px] h-[36px] flex items-center justify-center border border-slate-100 rounded-xl text-center text-[7px] text-slate-300 uppercase">Locked</div>
                )}
              </div>
              <div className="flex flex-col items-center w-1/2">
                {leftRightL2 && <div className="h-6 w-0.5 bg-slate-300"></div>}
                {leftRightL2 ? getNode(level3, leftRightL2.id, 'right', true) : (
                  <div className="w-[84px] h-[36px] flex items-center justify-center border border-slate-100 rounded-xl text-center text-[7px] text-slate-300 uppercase">Locked</div>
                )}
              </div>
            </div>

            {/* Group 3: under rightLeftL2 */}
            <div className="w-1/4 flex justify-around relative">
              {rightLeftL2 && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-300"></div>}
              <div className="flex flex-col items-center w-1/2">
                {rightLeftL2 && <div className="h-6 w-0.5 bg-slate-300"></div>}
                {rightLeftL2 ? getNode(level3, rightLeftL2.id, 'left', true) : (
                  <div className="w-[84px] h-[36px] flex items-center justify-center border border-slate-100 rounded-xl text-center text-[7px] text-slate-300 uppercase">Locked</div>
                )}
              </div>
              <div className="flex flex-col items-center w-1/2">
                {rightLeftL2 && <div className="h-6 w-0.5 bg-slate-300"></div>}
                {rightLeftL2 ? getNode(level3, rightLeftL2.id, 'right', true) : (
                  <div className="w-[84px] h-[36px] flex items-center justify-center border border-slate-100 rounded-xl text-center text-[7px] text-slate-300 uppercase">Locked</div>
                )}
              </div>
            </div>

            {/* Group 4: under rightRightL2 */}
            <div className="w-1/4 flex justify-around relative">
              {rightRightL2 && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-300"></div>}
              <div className="flex flex-col items-center w-1/2">
                {rightRightL2 && <div className="h-6 w-0.5 bg-slate-300"></div>}
                {rightRightL2 ? getNode(level3, rightRightL2.id, 'left', true) : (
                  <div className="w-[84px] h-[36px] flex items-center justify-center border border-slate-100 rounded-xl text-center text-[7px] text-slate-300 uppercase">Locked</div>
                )}
              </div>
              <div className="flex flex-col items-center w-1/2">
                {rightRightL2 && <div className="h-6 w-0.5 bg-slate-300"></div>}
                {rightRightL2 ? getNode(level3, rightRightL2.id, 'right', true) : (
                  <div className="w-[84px] h-[36px] flex items-center justify-center border border-slate-100 rounded-xl text-center text-[7px] text-slate-300 uppercase">Locked</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Slots List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {slotDetails.map((slot) => {
          const isActive = activeSlotMap.has(slot.number);
          const isSelected = selectedSlotNum === slot.number;
          const isUnlocked = slot.number === 1 || unlockedLevelsMap.has(slot.number - 1);
          const isRetop = !isActive && unlockedLevelsMap.has(slot.number);

          if (!isUnlocked) {
            return (
              <div key={slot.number} className="glass-card bg-slate-50 border border-slate-200/50 rounded-3xl p-6 shadow-none flex flex-col items-center justify-center space-y-3 opacity-60">
                <ShieldCheck className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Locked</p>
                <p className="text-[10px] text-slate-400 text-center">Activate Slot {slot.number - 1} first</p>
              </div>
            );
          }

          return (
            <div
              key={slot.number}
              onClick={() => setSelectedSlotNum(slot.number)}
              className={`glass-card bg-white border rounded-3xl p-6 shadow-sm space-y-6 cursor-pointer transition-all duration-200 relative overflow-hidden ${isSelected
                  ? 'border-sky-500 ring-2 ring-sky-500/15'
                  : 'border-slate-200/60 hover:border-slate-300'
                }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  Active
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{slot.label}</div>
                  {isUnlocked && activeSlots.filter(s => s.slotNumber === slot.number).length > 0 && (
                    <div className="text-[10px] bg-sky-50 text-sky-600 font-bold px-2 py-0.5 rounded-full border border-sky-100">
                      Cycle {activeSlots.filter(s => s.slotNumber === slot.number).length}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Slot {slot.number}</h3>
              </div>

              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-3xl font-black text-slate-900">{slot.cost}</span>
                <span className="text-xs font-bold text-slate-400">USDT</span>
              </div>

              {!isActive ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActivate(slot.number, slot.cost);
                  }}
                  disabled={loading !== null}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl transition-colors"
                >
                  {loading === slot.number ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{isRetop ? 'Retop Vault Slot' : 'Activate Vault Slot'}</span>
                  )}
                </button>
              ) : (
                <div className="w-full flex items-center justify-center space-x-1.5 py-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Fully Operational</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Visual Tree / Details section */}
      <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="pb-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              Tree (Slot {selectedSlotNum})
              {activeSlots.filter(s => s.slotNumber === selectedSlotNum).length > 0 && (
                <span className="text-xs font-bold text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full">
                  Cycle {activeSlots.filter(s => s.slotNumber === selectedSlotNum).length}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Analyze the binary distribution tree and track downline slot placements.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-full w-fit">
            <Layers className="w-3.5 h-3.5" /> 3-Level
          </span>
        </div>

        {isSelectedActive ? (
          <div className="pt-6">
            {renderBinaryTree()}
            <div className="text-center text-xs text-slate-400 mt-8 leading-relaxed max-w-sm mx-auto">
              Each active slot supports up to 14 placements across 3 binary levels. When your tree is complete, the cycle finishes.
            </div>
          </div>
        ) : (
          <div className="text-center py-16 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-slate-800">{isSelectedRetop ? 'Retop Required' : 'Slot Inactive'}</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                You must {isSelectedRetop ? 'retop' : 'activate'} Vault Slot {selectedSlotNum} for {slotDetails.find(s => s.number === selectedSlotNum)?.cost} USDT to participate in its matrix and view placement tree.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
