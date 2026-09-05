import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { IncidentStatus } from '../../types/civic';

interface Props {
  incidentId?: string;
  compact?: boolean;
}

const STAGES: Array<{ status: IncidentStatus; label: string; icon: string; description: string }> = [
  { status: 'emerging', label: '1. Emerging', icon: '📡', description: 'Raw signal cluster formed' },
  { status: 'triaged', label: '2. Triaged', icon: '📋', description: 'Signal velocity verified' },
  { status: 'dispatch_pending', label: '3. Dispatch Pending', icon: '⚡', description: 'AI plan staged' },
  { status: 'approved', label: '4. Approved', icon: '✅', description: 'Human officer authorized' },
  { status: 'dispatched', label: '5. Dispatched', icon: '🚨', description: 'Units en route to centroid' },
  { status: 'on_site', label: '6. On-Site', icon: '📍', description: 'Perimeter established' },
  { status: 'resolving', label: '7. Resolving', icon: '⚙️', description: 'Mitigation active' },
  { status: 'resolved', label: '8. Resolved', icon: '🏁', description: 'Field work finished' },
  { status: 'verified', label: '9. Verified', icon: '🔍', description: 'AI/Citizen verified' }
];

export const IncidentLifecycleStepper: React.FC<Props> = ({ incidentId, compact = false }) => {
  const {
    selectedIncident,
    incidents,
    triageIncident,
    stageDispatchPlan,
    openApprovalModal,
    dispatchUnits,
    markOnSite,
    markResolving,
    resolveIncident,
    aiVerifyIncident
  } = useCivic();

  const inc = incidentId
    ? incidents.find(i => i.id === incidentId)
    : selectedIncident;

  const [notesInput, setNotesInput] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(false);

  if (!inc) return null;

  const currentStatusIndex = STAGES.findIndex(s => s.status === inc.status);

  // Transition Button Handlers
  const handleTriage = () => {
    triageIncident(inc.id, 'Municipal Triaging Desk', notesInput || 'Verified report authenticity and signal velocity.');
    setNotesInput('');
  };

  const handleStagePlan = () => {
    stageDispatchPlan(inc.id, 'NagarBodh Response Engine AI', notesInput || 'Dynamic SOP plan staged for officer authorization.');
    setNotesInput('');
  };

  const handleOpenReviewModal = () => {
    openApprovalModal(inc.id);
  };

  const handleDispatch = () => {
    dispatchUnits(inc.id, 'Control Room Dispatcher', notesInput || 'Mobilized emergency dewatering crews.');
    setNotesInput('');
  };

  const handleMarkOnSite = () => {
    markOnSite(inc.id, 'Field Crew Lead (Unit-D4)', notesInput || 'Crew arrived on site; equipment operational.');
    setNotesInput('');
  };

  const handleStartResolving = () => {
    markResolving(inc.id, 'Operations Field Team', notesInput || 'Dewatering pumps active; clearing drain choked points.');
    setNotesInput('');
  };

  const handleResolve = () => {
    resolveIncident(inc.id, 'Field Supervisor', notesInput || 'Floodwaters receded; road reopened.');
    setNotesInput('');
  };

  const handleAiVerify = () => {
    aiVerifyIncident(inc.id, 'NagarBodh Verification Engine', notesInput || 'Corroboration signals confirm normal traffic & water levels.');
    setNotesInput('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Incident Lifecycle & Governance Pipeline
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
              {inc.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Every lifecycle transition is timestamped, actor-bound, and recorded in audit logs.
          </p>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs text-slate-400 hover:text-slate-200 underline font-mono"
        >
          {showHistory ? 'Hide Transition Audit History' : `View Transition History (${inc.statusHistory?.length || 0})`}
        </button>
      </div>

      {/* 9-State Stepper Bar */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center min-w-[760px] justify-between relative">
          {/* Connector Line behind steps */}
          <div className="absolute left-6 right-6 top-4 h-1 bg-slate-800 -z-0 rounded" />
          <div
            className="absolute left-6 top-4 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-400 -z-0 rounded transition-all duration-500"
            style={{ width: `${Math.max(0, (currentStatusIndex / (STAGES.length - 1)) * 95)}%` }}
          />

          {STAGES.map((s, idx) => {
            const isCurrent = idx === currentStatusIndex;
            const isCompleted = idx < currentStatusIndex;

            return (
              <div key={s.status} className="flex flex-col items-center text-center z-10 w-20">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-500/30 scale-110 shadow-lg'
                      : isCompleted
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-900 text-slate-500 border-slate-700'
                  }`}
                >
                  {isCompleted ? '✓' : s.icon}
                </div>
                <div className={`text-[11px] font-semibold mt-1.5 leading-tight ${isCurrent ? 'text-blue-300 font-bold' : isCompleted ? 'text-emerald-300' : 'text-slate-500'}`}>
                  {s.label}
                </div>
                {!compact && (
                  <div className="text-[9px] text-slate-400 mt-0.5 leading-none hidden md:block">
                    {s.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Controls Box */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Current Stage Action Controls ({inc.status.toUpperCase()})
          </span>
          <span className="text-xs text-amber-400 font-mono">
            {inc.status === 'dispatch_pending' ? '⚠️ Human Officer Approval Mandatory' : 'Officer/Field Action Available'}
          </span>
        </div>

        {/* Transition Input Note */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <input
            type="text"
            value={notesInput}
            onChange={e => setNotesInput(e.target.value)}
            placeholder="Enter actor transition notes / details before executing stage action..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />

          {/* Action Button based on status */}
          <div className="shrink-0 flex items-center gap-2">
            {inc.status === 'emerging' && (
              <button
                onClick={handleTriage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow transition"
              >
                📋 Triage Incident
              </button>
            )}

            {inc.status === 'triaged' && (
              <button
                onClick={handleStagePlan}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow transition"
              >
                ⚡ Stage Response Plan
              </button>
            )}

            {inc.status === 'dispatch_pending' && (
              <button
                onClick={handleOpenReviewModal}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-amber-950/60 flex items-center gap-2 transition animate-pulse"
              >
                <span>🛡️ Review & Approve Plan (Human Review)</span>
              </button>
            )}

            {inc.status === 'approved' && (
              <button
                onClick={handleDispatch}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition"
              >
                <span>🚨 Dispatch Field Crews</span>
              </button>
            )}

            {inc.status === 'dispatched' && (
              <button
                onClick={handleMarkOnSite}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow transition"
              >
                📍 Mark Crew On-Site
              </button>
            )}

            {inc.status === 'on_site' && (
              <button
                onClick={handleStartResolving}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow transition"
              >
                ⚙️ Start Resolution Work
              </button>
            )}

            {inc.status === 'resolving' && (
              <button
                onClick={handleResolve}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow transition"
              >
                🏁 Mark Field Resolved
              </button>
            )}

            {inc.status === 'resolved' && (
              <button
                onClick={handleAiVerify}
                className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow transition"
              >
                🔍 Trigger AI Verification
              </button>
            )}

            {inc.status === 'verified' && (
              <div className="px-4 py-2 bg-emerald-950 border border-emerald-600 text-emerald-300 rounded-lg text-xs font-bold font-mono">
                ✓ Verified & SLA Closed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transition Audit Log History List */}
      {showHistory && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 animate-in fade-in duration-150">
          <h4 className="text-xs font-bold text-slate-300 uppercase font-mono mb-2">
            Audit Trail History ({inc.statusHistory?.length || 0} Transitions Recorded)
          </h4>

          {inc.statusHistory && inc.statusHistory.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 font-mono text-xs">
              {inc.statusHistory.map(rec => (
                <div key={rec.id} className="p-2.5 rounded bg-slate-900 border border-slate-850 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-400">{rec.previousState.toUpperCase()} → {rec.newState.toUpperCase()}</span>
                      <span className="text-slate-400">by {rec.actor}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] font-sans mt-0.5">{rec.notes}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">{rec.simulatedTimeLabel}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No previous manual transitions recorded for this incident cluster.</p>
          )}
        </div>
      )}
    </div>
  );
};
