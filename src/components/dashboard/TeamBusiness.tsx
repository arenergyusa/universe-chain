'use client';

import { useState } from 'react';
import {
  Layers, Users, TrendingUp, DollarSign, RefreshCw, ChevronDown,
  ChevronRight, User, ShieldCheck, Zap, BarChart3, ArrowUpDown,
  Minus,
} from 'lucide-react';

// ─── Types ───
interface MemberData {
  id: string;
  position: string;
  level: number;
  parentMemberId: string | null;
  createdAt: string;
  user: { walletAddress: string; status: string };
}

interface SlotData {
  id: string;
  slotNumber: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
  members: MemberData[];
}


interface Summary {
  totalSlots: number;
  activeSlots: number;
  completedSlots: number;
  totalTeamMembers: number;
  totalEarned: number;
  totalInvested: number;
  netPnL: number;
  activationAmount: number;
  activationDate: string | null;
  retopCount: number;
  totalRetopAmount: number;
}

interface Props {
  slots: SlotData[];
  summary: Summary;
}

export default function TeamBusiness({ slots, summary }: Props) {
  // Group slots by slotNumber (latest active first, then completed, then retoped)
  const slotGroups = new Map<number, SlotData[]>();
  slots.forEach(s => {
    const arr = slotGroups.get(s.slotNumber) || [];
    arr.push(s);
    slotGroups.set(s.slotNumber, arr);
  });

  // For each slotNumber, show the most relevant (active > completed > retoped)
  const displaySlots: SlotData[] = [];
  slotGroups.forEach((group) => {
    const active = [...group].reverse().find(s => s.status === 'active');
    const completed = [...group].reverse().find(s => s.status === 'completed');
    if (active) displaySlots.push(active);
    else if (completed) displaySlots.push(completed);
    else displaySlots.push(group[group.length - 1]); // latest retoped
  });
  displaySlots.sort((a, b) => a.slotNumber - b.slotNumber);

  const [expandedSlot, setExpandedSlot] = useState<string | null>(
    displaySlots.find(s => s.status === 'active')?.id || displaySlots[0]?.id || null
  );

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Build level-wise member tables for a slot
  const getLevelMembers = (slot: SlotData, level: number): { position: string; label: string; member: MemberData | null }[] => {
    const members = slot.members.filter(m => m.level === level);

    if (level === 1) {
      return [
        { position: 'left', label: 'Left', member: members.find(m => m.position === 'left') || null },
        { position: 'right', label: 'Right', member: members.find(m => m.position === 'right') || null },
      ];
    }

    // For L2 and L3, build based on parent positions

    const positions: { position: string; label: string; member: MemberData | null }[] = [];



    if (level === 2) {
      const l1Left = slot.members.find(m => m.level === 1 && m.position === 'left');
      const l1Right = slot.members.find(m => m.level === 1 && m.position === 'right');

      // Under Left L1
      positions.push({
        position: 'L-Left',
        label: 'L → Left',
        member: l1Left ? members.find(m => m.parentMemberId === l1Left.id && m.position === 'left') || null : null,
      });
      positions.push({
        position: 'L-Right',
        label: 'L → Right',
        member: l1Left ? members.find(m => m.parentMemberId === l1Left.id && m.position === 'right') || null : null,
      });
      // Under Right L1
      positions.push({
        position: 'R-Left',
        label: 'R → Left',
        member: l1Right ? members.find(m => m.parentMemberId === l1Right.id && m.position === 'left') || null : null,
      });
      positions.push({
        position: 'R-Right',
        label: 'R → Right',
        member: l1Right ? members.find(m => m.parentMemberId === l1Right.id && m.position === 'right') || null : null,
      });
    }

    if (level === 3) {
      const l1Left = slot.members.find(m => m.level === 1 && m.position === 'left');
      const l1Right = slot.members.find(m => m.level === 1 && m.position === 'right');
      const l2Members = slot.members.filter(m => m.level === 2);

      // L1-Left children at L2
      const ll = l1Left ? l2Members.find(m => m.parentMemberId === l1Left.id && m.position === 'left') : null;
      const lr = l1Left ? l2Members.find(m => m.parentMemberId === l1Left.id && m.position === 'right') : null;
      // L1-Right children at L2
      const rl = l1Right ? l2Members.find(m => m.parentMemberId === l1Right.id && m.position === 'left') : null;
      const rr = l1Right ? l2Members.find(m => m.parentMemberId === l1Right.id && m.position === 'right') : null;

      const l2Parents = [
        { parent: ll, prefix: 'LL' },
        { parent: lr, prefix: 'LR' },
        { parent: rl, prefix: 'RL' },
        { parent: rr, prefix: 'RR' },
      ];

      l2Parents.forEach(({ parent, prefix }) => {
        positions.push({
          position: `${prefix}-Left`,
          label: `${prefix} → L`,
          member: parent ? members.find(m => m.parentMemberId === parent.id && m.position === 'left') || null : null,
        });
        positions.push({
          position: `${prefix}-Right`,
          label: `${prefix} → R`,
          member: parent ? members.find(m => m.parentMemberId === parent.id && m.position === 'right') || null : null,
        });
      });
    }

    return positions;
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Completed
          </span>
        );
      case 'retoped':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Retoped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-500 border border-rose-100">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> {status}
          </span>
        );
    }
  };

  // ─── RENDER ───
  return (
    <div className="space-y-8">

      {/* ── Section 1: Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Slots', value: summary.totalSlots, icon: <Layers className="w-4 h-4" />, wrapperClass: 'bg-sky-50 border-sky-100 text-sky-600' },
          { label: 'Active Slots', value: summary.activeSlots, icon: <ShieldCheck className="w-4 h-4" />, wrapperClass: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
          { label: 'Team Members', value: summary.totalTeamMembers, icon: <Users className="w-4 h-4" />, wrapperClass: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
          { label: 'Total Earned', value: `${summary.totalEarned.toFixed(2)}`, icon: <TrendingUp className="w-4 h-4" />, wrapperClass: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
          { label: 'Total Invested', value: `${summary.totalInvested.toFixed(2)}`, icon: <DollarSign className="w-4 h-4" />, wrapperClass: 'bg-amber-50 border-amber-100 text-amber-600' },
          { label: 'Net P&L', value: `${summary.netPnL >= 0 ? '+' : ''}${summary.netPnL.toFixed(2)}`, icon: <BarChart3 className="w-4 h-4" />, wrapperClass: summary.netPnL >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600' },
        ].map((stat, i) => (
          <div key={i} className="glass-card bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${stat.wrapperClass}`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 leading-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ── Activation & Retop Quick Info ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID Activation</div>
            <div className="text-sm font-bold text-slate-800">
              {summary.activationDate
                ? <>{summary.activationAmount} USDT <span className="text-slate-400 font-medium">· {formatDate(summary.activationDate)}</span></>
                : <span className="text-slate-400">Not activated</span>
              }
            </div>
          </div>
        </div>
        <div className="glass-card bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Retops Done</div>
            <div className="text-sm font-bold text-slate-800">
              {summary.retopCount > 0
                ? <>{summary.retopCount} times <span className="text-slate-400 font-medium">· {summary.totalRetopAmount.toFixed(2)} USDT total</span></>
                : <span className="text-slate-400">No retops yet</span>
              }
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Slot-by-Slot Breakdown ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5 text-slate-400" />
          Slot-by-Slot Breakdown
        </h2>

        {displaySlots.length === 0 ? (
          <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm text-center py-16 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <p className="text-sm font-extrabold text-slate-800">No Slots Yet</p>
            <p className="text-xs text-slate-400">Activate your ID to start building your matrix.</p>
          </div>
        ) : (
          displaySlots.map((slot) => {
            const isExpanded = expandedSlot === slot.id;
            const cycleCount = slotGroups.get(slot.slotNumber)?.length || 1;
            const memberCount = slot.members.length;

            return (
              <div key={slot.id} className="glass-card bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedSlot(isExpanded ? null : slot.id)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 ${
                      slot.status === 'active' ? 'bg-emerald-500' :
                      slot.status === 'completed' ? 'bg-amber-500' : 'bg-slate-400'
                    }`}>
                      {slot.slotNumber}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-extrabold text-slate-900">Slot {slot.slotNumber}</span>
                        {cycleCount > 1 && (
                          <span className="text-[10px] bg-sky-50 text-sky-600 font-bold px-2 py-0.5 rounded-full border border-sky-100">Cycle {cycleCount}</span>
                        )}
                        {statusBadge(slot.status)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {memberCount}/14 members · Created {formatDate(slot.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Progress circle */}
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${slot.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          style={{ width: `${Math.min(100, (memberCount / 14) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{Math.round((memberCount / 14) * 100)}%</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                  </div>
                </button>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 sm:p-6 space-y-6">
                    {[1, 2, 3].map((level) => {
                      const maxPositions = level === 1 ? 2 : level === 2 ? 4 : 8;
                      const levelMembers = getLevelMembers(slot, level);
                      const filledCount = levelMembers.filter(p => p.member !== null).length;
                      const pctLabel = level === 1 ? '20%' : level === 2 ? '25%' : '10%';

                      return (
                        <div key={level}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                              Level {level}
                              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">{pctLabel} commission</span>
                            </h4>
                            <span className="text-[10px] font-bold text-slate-400">{filledCount}/{maxPositions} filled</span>
                          </div>

                          {/* Desktop Table */}
                          <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-slate-100">
                                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2 pr-4">Position</th>
                                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2 pr-4">User</th>
                                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2 pr-4">Status</th>
                                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2">Joined</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {levelMembers.map((pos, idx) => (
                                  <tr key={idx} className="group">
                                    <td className="py-2.5 pr-4">
                                      <span className="text-xs font-bold text-slate-600">{pos.label}</span>
                                    </td>
                                    <td className="py-2.5 pr-4">
                                      {pos.member ? (
                                        <span className="text-xs font-bold text-slate-800 font-mono">{formatAddress(pos.member.user.walletAddress)}</span>
                                      ) : (
                                        <span className="text-xs text-slate-300 flex items-center gap-1"><Minus className="w-3 h-3" /> Empty</span>
                                      )}
                                    </td>
                                    <td className="py-2.5 pr-4">
                                      {pos.member ? statusBadge(pos.member.user.status) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-50 text-slate-300 border border-slate-100">
                                          <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span> Available
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2.5">
                                      {pos.member ? (
                                        <span className="text-[10px] text-slate-400 font-semibold">{formatDate(pos.member.createdAt)}</span>
                                      ) : (
                                        <span className="text-[10px] text-slate-200">—</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Cards */}
                          <div className="sm:hidden space-y-2">
                            {levelMembers.map((pos, idx) => (
                              <div key={idx} className={`rounded-xl border p-3 flex items-center justify-between ${
                                pos.member ? 'bg-white border-slate-200/60' : 'bg-slate-50/50 border-slate-100 border-dashed'
                              }`}>
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                                    pos.member ? 'bg-sky-50 text-sky-600 border border-sky-100' : 'bg-slate-50 text-slate-300 border border-slate-100'
                                  }`}>
                                    {pos.member ? <User className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-700">
                                      {pos.label} {pos.member && <span className="font-mono text-slate-500">· {formatAddress(pos.member.user.walletAddress)}</span>}
                                    </div>
                                    {pos.member && (
                                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{formatDate(pos.member.createdAt)}</div>
                                    )}
                                  </div>
                                </div>
                                {pos.member ? statusBadge(pos.member.user.status) : (
                                  <span className="text-[9px] text-slate-300 font-bold uppercase">Empty</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
