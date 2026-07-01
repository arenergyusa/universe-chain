'use client';

import { useState } from 'react';
import { Layers, ShieldCheck, HelpCircle, Loader2, Award, User, MoveHorizontal, RefreshCw, Zap, AlertTriangle } from 'lucide-react';
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
  allSlots: SlotData[];
  isActivated: boolean;
  hasCompletedSlot: boolean;
  activationCost: number;
  retopCost: number;
}

export default function SlotsManager({
  userBalance, allSlots, isActivated, hasCompletedSlot, activationCost, retopCost,
}: SlotsManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<'activate' | 'retop' | null>(null);
  const [selectedSlotNum, setSelectedSlotNum] = useState<number>(1);

  // Only active slots for viewing the tree
  const activeSlots = allSlots.filter(s => s.status === 'active');
  const activeSlotMap = new Map(activeSlots.map(s => [s.slotNumber, s]));

  // Group by slotNumber to show cycle count
  const slotCycles = new Map<number, number>();
  allSlots.forEach(s => {
    slotCycles.set(s.slotNumber, (slotCycles.get(s.slotNumber) || 0) + 1);
  });

  // All unique slot numbers that ever existed
  const allSlotNumbers = [...new Set(allSlots.map(s => s.slotNumber))].sort((a, b) => a - b);

  const currentSlot = activeSlotMap.get(selectedSlotNum);
  const isSelectedActive = !!currentSlot;
  const completedSlotForSelected = allSlots.find(s => s.slotNumber === selectedSlotNum && s.status === 'completed');

  // ─── Handlers ───
  const handleActivate = async () => {
    if (userBalance < activationCost) {
      toast.error(`Insufficient balance. ID activation requires ${activationCost} USDT.`);
      return;
    }
    try {
      setLoading('activate');
      const res = await fetch('/api/slots/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'activate' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Activation failed.');
      toast.success('ID activated successfully! Slot 1 is now live.');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(null);
    }
  };

  const handleRetop = async () => {
    if (userBalance < retopCost) {
      toast.error(`Insufficient balance. ID retop requires ${retopCost} USDT.`);
      return;
    }
    try {
      setLoading('retop');
      const res = await fetch('/api/slots/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'retop' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Retop failed.');
      toast.success(`Slot ${data.retopedSlotNumber} retoped successfully! New cycle started.`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(null);
    }
  };

  const formatAddress = (addr: string) => `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;

  // ─── Binary Tree Renderer ───
  const renderBinaryTree = () => {
    if (!currentSlot) return null;
    const members = currentSlot.members;
    const level1 = members.filter(m => m.level === 1);
    const level2 = members.filter(m => m.level === 2);
    const level3 = members.filter(m => m.level === 3);

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

          {/* Level 1 */}
          <div className="w-full flex justify-around relative">
            <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-300"></div>
            <div className="flex flex-col items-center w-1/2">
              <div className="h-6 w-0.5 bg-slate-300"></div>
              {leftL1 ? (
                <div className="flex flex-col items-center p-2.5 bg-sky-500/10 border border-sky-500/30 text-sky-700 rounded-xl w-24 shadow-2xs">
                  <User className="w-4 h-4 mb-1 text-sky-600" />
                  <span className="text-[9px] font-bold font-mono truncate w-full text-center">{formatAddress(leftL1.user.walletAddress)}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center p-2.5 bg-slate-50 border border-slate-200 border-dashed text-slate-400 rounded-xl w-24">
                  <HelpCircle className="w-4 h-4 mb-1 text-slate-300" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Available</span>
                </div>
              )}
              <div className="h-6 w-0.5 bg-slate-300"></div>
            </div>
            <div className="flex flex-col items-center w-1/2">
              <div className="h-6 w-0.5 bg-slate-300"></div>
              {rightL1 ? (
                <div className="flex flex-col items-center p-2.5 bg-sky-500/10 border border-sky-500/30 text-sky-700 rounded-xl w-24 shadow-2xs">
                  <User className="w-4 h-4 mb-1 text-sky-600" />
                  <span className="text-[9px] font-bold font-mono truncate w-full text-center">{formatAddress(rightL1.user.walletAddress)}</span>
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

          {/* Level 2 */}
          <div className="w-full flex justify-around relative">
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

          {/* Level 3 */}
          <div className="w-full flex justify-around relative">
            {[leftLeftL2, leftRightL2, rightLeftL2, rightRightL2].map((parentL2, idx) => (
              <div key={idx} className="w-1/4 flex justify-around relative">
                {parentL2 && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-300"></div>}
                <div className="flex flex-col items-center w-1/2">
                  {parentL2 && <div className="h-6 w-0.5 bg-slate-300"></div>}
                  {parentL2 ? getNode(level3, parentL2.id, 'left', true) : (
                    <div className="w-[84px] h-[36px] flex items-center justify-center border border-slate-100 rounded-xl text-center text-[7px] text-slate-300 uppercase">Locked</div>
                  )}
                </div>
                <div className="flex flex-col items-center w-1/2">
                  {parentL2 && <div className="h-6 w-0.5 bg-slate-300"></div>}
                  {parentL2 ? getNode(level3, parentL2.id, 'right', true) : (
                    <div className="w-[84px] h-[36px] flex items-center justify-center border border-slate-100 rounded-xl text-center text-[7px] text-slate-300 uppercase">Locked</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    );
  };

  // ─── RENDER ───
  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Global Action: Activate ID ── */}
      {!isActivated && (
        <div className="bg-gradient-to-r from-sky-500/10 via-sky-600/5 to-transparent border border-sky-200/50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-600 border border-sky-500/20 flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">Activate Your ID</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
                Pay a one-time fee of <span className="font-bold text-slate-700">{activationCost} USDT</span> to activate your ID. Your first slot will be created automatically and you can start inviting members.
              </p>
            </div>
          </div>
          <button
            onClick={handleActivate}
            disabled={loading !== null}
            className="w-full md:w-auto inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-8 py-3.5 rounded-xl transition-colors flex-shrink-0"
          >
            {loading === 'activate' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing...</span></>
            ) : (
              <><Zap className="w-4 h-4" /><span>Activate ID — {activationCost} USDT</span></>
            )}
          </button>
        </div>
      )}

      {/* ── Global Action: Retop ID ── */}
      {isActivated && hasCompletedSlot && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-200/50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20 flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">ID Retop Required</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
                One of your slots has completed its cycle. Pay <span className="font-bold text-slate-700">{retopCost} USDT</span> to reactivate it and start a fresh cycle.
              </p>
            </div>
          </div>
          <button
            onClick={handleRetop}
            disabled={loading !== null}
            className="w-full md:w-auto inline-flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold px-8 py-3.5 rounded-xl transition-colors flex-shrink-0"
          >
            {loading === 'retop' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing...</span></>
            ) : (
              <><RefreshCw className="w-4 h-4" /><span>Retop ID — {retopCost} USDT</span></>
            )}
          </button>
        </div>
      )}

      {/* ── Slots Grid (View Only) ── */}
      {isActivated && allSlotNumbers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allSlotNumbers.map((num) => {
            const activeSlot = activeSlotMap.get(num);
            const isActive = !!activeSlot;
            const isCompleted = allSlots.some(s => s.slotNumber === num && s.status === 'completed');
            const isSelected = selectedSlotNum === num;
            const cycleCount = slotCycles.get(num) || 1;
            const memberCount = activeSlot ? activeSlot.members.length : 0;

            return (
              <div
                key={num}
                onClick={() => setSelectedSlotNum(num)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedSlotNum(num);
                  }
                }}
                className={`glass-card bg-white border rounded-3xl p-6 shadow-sm space-y-4 cursor-pointer transition-all duration-200 relative overflow-hidden ${
                  isSelected
                    ? 'border-sky-500 ring-2 ring-sky-500/15'
                    : 'border-slate-200/60 hover:border-slate-300'
                }`}
              >
                {/* Status Badge */}
                {isActive && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                    Active
                  </div>
                )}
                {isCompleted && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                    Retop Needed
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vault Matrix {num}</div>
                    {cycleCount > 1 && (
                      <div className="text-[10px] bg-sky-50 text-sky-600 font-bold px-2 py-0.5 rounded-full border border-sky-100">
                        Cycle {cycleCount}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">Slot {num}</h3>
                </div>

                {/* Members Progress */}
                {isActive && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-400">Members</span>
                      <span className="text-slate-600">{memberCount} / 14</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${memberCount >= 14 ? 'bg-emerald-400' : 'bg-sky-400'}`}
                        style={{ width: `${Math.min(100, (memberCount / 14) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Status Indicator */}
                <div className={`w-full flex items-center justify-center space-x-1.5 py-3 rounded-xl text-xs font-bold ${
                  isActive
                    ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                    : isCompleted
                      ? 'bg-amber-50 border border-amber-100 text-amber-700'
                      : 'bg-slate-50 border border-slate-100 text-slate-400'
                }`}>
                  {isActive ? (
                    <><ShieldCheck className="w-4 h-4" /><span>Fully Operational</span></>
                  ) : isCompleted ? (
                    <><RefreshCw className="w-4 h-4" /><span>Awaiting Retop</span></>
                  ) : (
                    <><Layers className="w-4 h-4" /><span>Retoped (Cycle Closed)</span></>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Visual Tree / Details Section ── */}
      {isActivated && (
        <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="pb-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Tree (Slot {selectedSlotNum})
                {(slotCycles.get(selectedSlotNum) || 0) > 1 && (
                  <span className="text-xs font-bold text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full">
                    Cycle {slotCycles.get(selectedSlotNum)}
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
                <p className="text-sm font-extrabold text-slate-800">
                  {completedSlotForSelected ? 'Cycle Completed — Retop Required' : 'No Active Slot'}
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {completedSlotForSelected
                    ? 'This slot has completed its cycle. Use the Retop button above to reactivate it.'
                    : 'Select an active slot to view its binary tree.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Empty State for Non-Activated Users ── */}
      {!isActivated && (
        <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-center py-16 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-slate-800">No Active Slots</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Activate your ID above to create your first slot and start building your matrix.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
