import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { IncidentStatus } from '../../types/civic';

interface Props {
  incidentId?: string;
  compact?: boolean;
}

const STAGES: Array<{ status: IncidentStatus; label: string; icon: string; description: string }> = [
  { status: 'emerging', label: '1. Signal Cluster', icon: '📡', description: 'Raw demand signals formed' },
  { status: 'triaged', label: '2. Triaged Gap', icon: '📋', description: 'Development gap verified' },
  { status: 'dispatch_pending', label: '3. Plan Staged', icon: '⚡', description: 'Candidate SOP project generated' },
  { status: 'approved', label: '4. Policy Approved', icon: '✅', description: 'Policymaker authorized' },
  { status: 'dispatched', label: '5. Budget Allocated', icon: '💰', description: 'Capital budget allocated' },
  { status: 'on_site', label: '6. Work Commenced', icon: '📍', description: 'Field work / construction active' },
  { status: 'resolving', label: '7. Infra Active', icon: '⚙️', description: 'Infrastructure operational' },
  { status: 'resolved', label: '8. Project Completed', icon: '🏁', description: 'Asset deployed to community' },
  { status: 'verified', label: '9. Impact Verified', icon: '🔍', description: 'Measurable gap reduction confirmed' }
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
    <div
      style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-xl)',
        color: 'var(--text-primary)'
      }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="flex items-center gap-2.5">
            <h3
              className="text-xs font-bold uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              Development Project & Policy Governance Pipeline
            </h3>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase"
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--cyan-300)',
                border: '1px solid rgba(6, 182, 212, 0.3)'
              }}
            >
              {inc.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
            Every lifecycle transition is timestamped, actor-bound, and recorded in civic governance audit logs.
          </p>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs underline font-mono transition-colors"
          style={{ color: 'var(--cyan-400)' }}
        >
          {showHistory ? 'Hide Governance Audit Trail' : `View Audit Trail (${inc.statusHistory?.length || 0})`}
        </button>
      </div>

      {/* 9-State Stepper Bar */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center min-w-[760px] justify-between relative py-2">
          {/* Connector Line behind steps */}
          <div
            className="absolute left-6 right-6 top-6 h-1 rounded -z-0"
            style={{ background: 'var(--border-subtle)' }}
          />
          <div
            className="absolute left-6 top-6 h-1 rounded -z-0 transition-all duration-500"
            style={{
              width: `${Math.max(0, (currentStatusIndex / (STAGES.length - 1)) * 95)}%`,
              background: 'linear-gradient(90deg, var(--cyan-500) 0%, var(--emerald-500) 50%, var(--indigo-500) 100%)'
            }}
          />

          {STAGES.map((s, idx) => {
            const isCurrent = idx === currentStatusIndex;
            const isCompleted = idx < currentStatusIndex;

            return (
              <div key={s.status} className="flex flex-col items-center text-center z-10 w-20">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={
                    isCurrent
                      ? {
                          background: 'var(--cyan-500)',
                          color: '#ffffff',
                          border: '2px solid var(--cyan-300)',
                          boxShadow: '0 0 12px rgba(6, 182, 212, 0.5)',
                          transform: 'scale(1.15)'
                        }
                      : isCompleted
                      ? {
                          background: 'var(--emerald-600)',
                          color: '#ffffff',
                          border: '1px solid var(--emerald-400)'
                        }
                      : {
                          background: 'var(--bg-surface)',
                          color: 'var(--text-tertiary)',
                          border: '1px solid var(--border-subtle)'
                        }
                  }
                >
                  {isCompleted ? '✓' : s.icon}
                </div>
                <div
                  className="text-[11px] font-semibold mt-2 leading-tight"
                  style={{
                    color: isCurrent
                      ? 'var(--cyan-300)'
                      : isCompleted
                      ? 'var(--emerald-400)'
                      : 'var(--text-secondary)',
                    fontWeight: isCurrent ? '700' : '500'
                  }}
                >
                  {s.label}
                </div>
                {!compact && (
                  <div
                    className="text-[9px] mt-0.5 leading-none hidden md:block"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {s.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Controls Box */}
      <div
        className="p-4 rounded-xl space-y-3"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Current Governance Action ({inc.status.toUpperCase()})
          </span>
          <span className="text-xs font-mono font-medium" style={{ color: 'var(--amber-400)' }}>
            {inc.status === 'dispatch_pending' ? '⚠️ Policymaker Approval Mandatory' : 'Governance / Field Action Available'}
          </span>
        </div>

        {/* Transition Input Note */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <input
            type="text"
            value={notesInput}
            onChange={e => setNotesInput(e.target.value)}
            placeholder="Enter governance notes / approval rationale before executing stage transition..."
            className="flex-1 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors"
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
          />

          {/* Action Button based on status */}
          <div className="shrink-0 flex items-center gap-2">
            {inc.status === 'emerging' && (
              <button
                onClick={handleTriage}
                className="px-4 py-2 text-white rounded-lg text-xs font-bold shadow transition hover:opacity-90"
                style={{ background: 'var(--cyan-600)' }}
              >
                📋 Triage Development Gap
              </button>
            )}

            {inc.status === 'triaged' && (
              <button
                onClick={handleStagePlan}
                className="px-4 py-2 text-white rounded-lg text-xs font-bold shadow transition hover:opacity-90"
                style={{ background: 'var(--amber-600)' }}
              >
                ⚡ Stage SOP Project
              </button>
            )}

            {inc.status === 'dispatch_pending' && (
              <button
                onClick={handleOpenReviewModal}
                className="px-5 py-2 text-white rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 transition animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                  boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
                }}
              >
                <span>🛡️ Review & Approve Project (Policy Review)</span>
              </button>
            )}

            {inc.status === 'approved' && (
              <button
                onClick={handleDispatch}
                className="px-5 py-2 text-white rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 transition hover:opacity-90"
                style={{ background: 'var(--emerald-600)' }}
              >
                <span>💰 Allocate Capital & Mobilize</span>
              </button>
            )}

            {inc.status === 'dispatched' && (
              <button
                onClick={handleMarkOnSite}
                className="px-4 py-2 text-white rounded-lg text-xs font-bold shadow transition hover:opacity-90"
                style={{ background: 'var(--indigo-600)' }}
              >
                📍 Mark Construction Active
              </button>
            )}

            {inc.status === 'on_site' && (
              <button
                onClick={handleStartResolving}
                className="px-4 py-2 text-white rounded-lg text-xs font-bold shadow transition hover:opacity-90"
                style={{ background: '#9333ea' }}
              >
                ⚙️ Activate Infrastructure
              </button>
            )}

            {inc.status === 'resolving' && (
              <button
                onClick={handleResolve}
                className="px-4 py-2 text-white rounded-lg text-xs font-bold shadow transition hover:opacity-90"
                style={{ background: '#0d9488' }}
              >
                🏁 Complete Project Deployment
              </button>
            )}

            {inc.status === 'resolved' && (
              <button
                onClick={handleAiVerify}
                className="px-5 py-2 text-white rounded-lg text-xs font-bold shadow transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, var(--cyan-600) 0%, var(--indigo-600) 100%)' }}
              >
                🔍 Trigger Impact Verification
              </button>
            )}

            {inc.status === 'verified' && (
              <div
                className="px-4 py-2 rounded-lg text-xs font-bold font-mono"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid var(--emerald-500)',
                  color: 'var(--emerald-300)'
                }}
              >
                ✓ Verified & Governance SLA Closed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transition Audit Log History List */}
      {showHistory && (
        <div
          className="p-4 rounded-xl space-y-2 animate-in fade-in duration-150"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <h4
            className="text-xs font-bold uppercase font-mono mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            Audit Trail History ({inc.statusHistory?.length || 0} Governance Transitions Recorded)
          </h4>

          {inc.statusHistory && inc.statusHistory.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 font-mono text-xs">
              {inc.statusHistory.map(rec => (
                <div
                  key={rec.id}
                  className="p-2.5 rounded flex items-start justify-between gap-3"
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: 'var(--cyan-400)' }}>
                        {rec.previousState.toUpperCase()} → {rec.newState.toUpperCase()}
                      </span>
                      <span style={{ color: 'var(--text-tertiary)' }}>by {rec.actor}</span>
                    </div>
                    <p className="text-[11px] font-sans mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {rec.notes}
                    </p>
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                    {rec.simulatedTimeLabel}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs italic" style={{ color: 'var(--text-tertiary)' }}>
              No previous governance transitions recorded for this development gap cluster.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

