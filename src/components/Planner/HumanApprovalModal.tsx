import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { ActionItemRecommendation, ClusteredIncident, DispatchActionPlan, OperationalResourceItem } from '../../types/civic';

interface HumanApprovalModalContentProps {
  incident: ClusteredIncident;
  closeApprovalModal: () => void;
  approveDispatch: (incidentId: string, notes?: string, customPlan?: Partial<DispatchActionPlan>) => void;
  rejectDispatch: (incidentId: string, reason: string) => void;
  dispatchUnits: (incidentId: string, actor?: string, notes?: string) => void;
  modifyDispatch: (incidentId: string, updates: Partial<DispatchActionPlan>) => void;
}

const HumanApprovalModalContent: React.FC<HumanApprovalModalContentProps> = ({
  incident: inc,
  closeApprovalModal,
  approveDispatch,
  rejectDispatch,
  dispatchUnits,
  modifyDispatch
}) => {
  const plan = inc.actionPlan;
  const insight = inc.auditableInsight;

  // Editable local state for plan modification before approval
  const [primaryDept, setPrimaryDept] = useState(plan?.primaryDepartment || insight?.recommendation?.primaryDepartment || 'MCD Dewatering Wing');
  const [actions, setActions] = useState<ActionItemRecommendation[]>(
    plan?.recommendedActions || [
      {
        id: 'act-1',
        actionText: 'Deploy 2 high-capacity mobile dewatering pumps to Sector 15 underpass.',
        department: 'MCD Dewatering Wing',
        rationale: 'Mitigate 45cm inundation at critical transit junction',
        isSopRule: true,
        isAiRecommendation: false
      },
      {
        id: 'act-2',
        actionText: 'Set up traffic diversions at NH-48 feeder junction.',
        department: 'Traffic Police',
        rationale: 'Prevent vehicle submergence & severe congestion',
        isSopRule: true,
        isAiRecommendation: false
      },
      {
        id: 'act-3',
        actionText: 'Issue localized citizen flash alert via 155304 Civic app and SMS.',
        department: 'Public Information Cell',
        rationale: 'Warn commuters approaching Sector 15 underpass',
        isSopRule: false,
        isAiRecommendation: true
      }
    ]
  );

  const [resources, setResources] = useState<OperationalResourceItem[]>(
    plan?.requiredResources || [
      { item: 'High-Capacity Dewatering Pump (500 HP)', quantity: '2 Units', assignedUnit: 'Unit-D4', status: 'ready', isSopResource: true, isAiRecommendation: false },
      { item: 'Emergency Traffic Control Barrier', quantity: '6 Sets', assignedUnit: 'Traffic Division North', status: 'ready', isSopResource: true, isAiRecommendation: false },
      { item: 'Civil Defence Rescue Team', quantity: '1 Squad (8 personnel)', assignedUnit: 'Squad Alpha', status: 'ready', isSopResource: false, isAiRecommendation: true }
    ]
  );

  const [slaHours, setSlaHours] = useState<number>(plan?.slaHours || 1.5);
  const [etaMinutes, setEtaMinutes] = useState<number>(plan?.etaMinutes || 25);
  const [officerNotes, setOfficerNotes] = useState<string>('Reviewed emergency signals, weather telemetry, and critical asset proximity. Plan authorized for immediate mobilization.');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [autoDispatch, setAutoDispatch] = useState<boolean>(true);

  const confidencePercent = Math.round((insight?.modelInference?.confidenceScore || 0.92) * 100);

  const handleActionChange = (id: string, text: string) => {
    setActions(prev => prev.map(a => (a.id === id ? { ...a, actionText: text } : a)));
  };

  const handleAddAction = () => {
    const newId = `act-custom-${Date.now()}`;
    setActions(prev => [
      ...prev,
      {
        id: newId,
        actionText: 'Additional custom response action mandated by Duty Officer.',
        department: primaryDept,
        rationale: 'Officer custom instruction',
        isSopRule: false,
        isAiRecommendation: false
      }
    ]);
  };

  const handleRemoveAction = (id: string) => {
    setActions(prev => prev.filter(a => a.id !== id));
  };

  const handleResourceQuantityChange = (index: number, qty: string) => {
    setResources(prev => prev.map((r, i) => (i === index ? { ...r, quantity: qty } : r)));
  };

  const handleSaveModifications = () => {
    modifyDispatch(inc.id, {
      primaryDepartment: primaryDept,
      recommendedActions: actions,
      requiredResources: resources,
      slaHours,
      etaMinutes,
      notes: officerNotes
    });
    alert('Response Plan modifications saved to incident file.');
  };

  const handleApprove = () => {
    // 1. Approve state transition DISPATCH_PENDING -> APPROVED
    approveDispatch(inc.id, officerNotes, {
      primaryDepartment: primaryDept,
      recommendedActions: actions,
      requiredResources: resources,
      slaHours,
      etaMinutes
    });

    // 2. If autoDispatch checked, trigger immediate transition APPROVED -> DISPATCHED
    if (autoDispatch) {
      setTimeout(() => {
        dispatchUnits(inc.id, 'Duty Operations Commander', `Auto-mobilization triggered following officer approval. Units en route to ${inc.ward}.`);
      }, 300);
    }

    closeApprovalModal();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason for audit records.');
      return;
    }
    rejectDispatch(inc.id, rejectionReason);
    closeApprovalModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 tracking-wide uppercase">
                Human-in-the-Loop Authorization Required
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-900/40 text-blue-300 border border-blue-700/40">
                Status: {inc.status.toUpperCase()}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>{inc.title}</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {inc.ward} • Centroid Coordinates: [{inc.centroid.lat.toFixed(4)}, {inc.centroid.lng.toFixed(4)}]
            </p>
          </div>

          <button
            onClick={closeApprovalModal}
            className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">

          {/* AI Confidence & Governance Notice */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 font-bold text-lg font-mono">
                {confidencePercent}%
              </div>
              <div>
                <div className="text-xs text-indigo-300 uppercase font-semibold">AI Confidence Score</div>
                <div className="text-sm text-slate-200 font-medium">Multi-Source Corroborated</div>
                <div className="text-[11px] text-slate-400">High spatial & temporal density</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-3">
              <div className="text-2xl">⚖️</div>
              <div>
                <div className="text-xs text-amber-300 uppercase font-semibold">Governance Requirement</div>
                <div className="text-sm text-slate-200 font-medium font-mono">Explicit Approval Required</div>
                <div className="text-[11px] text-slate-400">AI cannot auto-dispatch or auto-resolve</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3">
              <div className="text-2xl">⏱️</div>
              <div>
                <div className="text-xs text-emerald-300 uppercase font-semibold">Target SLA Benchmark</div>
                <div className="text-sm text-emerald-200 font-bold font-mono">{slaHours} Hours SLA Target</div>
                <div className="text-[11px] text-slate-400">Est. Response ETA: {etaMinutes} Mins</div>
              </div>
            </div>
          </div>

          {/* Priority Score Breakdown */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span>Priority Evaluation:</span>
                <span className="text-red-400 font-mono font-bold text-base">{inc.priority.overallScore}/100</span>
                <span className="text-xs text-red-300 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded">P1 CRITICAL</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Deterministic Formula Engine</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Severity</div>
                <div className="text-slate-100 font-bold text-sm mt-0.5">{inc.priority.factors.severityScore}/25</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Signal Velocity</div>
                <div className="text-slate-100 font-bold text-sm mt-0.5">{inc.priority.factors.velocityScore}/25</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Population Impact</div>
                <div className="text-slate-100 font-bold text-sm mt-0.5">{inc.priority.factors.populationImpactScore}/20</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Critical Asset Exp.</div>
                <div className="text-slate-100 font-bold text-sm mt-0.5">{inc.priority.factors.criticalAssetExposureScore}/15</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Environmental Risk</div>
                <div className="text-slate-100 font-bold text-sm mt-0.5">{inc.priority.factors.environmentalRiskScore}/10</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">SLA & Recurrence</div>
                <div className="text-slate-100 font-bold text-sm mt-0.5">{inc.priority.factors.slaRecurrenceScore}/10</div>
              </div>
            </div>
          </div>

          {/* Evidence Corroboration */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Underlying Evidence Signals ({inc.signalIds.length} Signals)</span>
              <span className="text-xs text-blue-400 font-mono">Cross-Channel Corroborated</span>
            </h3>

            {insight?.explanation?.explanationBullets && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                {insight.explanation.explanationBullets.map((b, idx) => (
                  <div key={idx} className="text-xs text-slate-300 bg-slate-900/70 p-2 rounded border border-slate-800/80 flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}

            {insight?.observedData?.rawExcerpts && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {insight.observedData.rawExcerpts.map((ex, i) => (
                  <div key={i} className="text-xs bg-slate-900 p-2 rounded border border-slate-850 flex items-center justify-between gap-3">
                    <span className="text-slate-300 italic">"{ex.original}"</span>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] shrink-0">
                      <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded uppercase">{ex.channel}</span>
                      <span className="text-slate-400">{ex.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Response Plan Modification Controls */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Operational Response Plan & Resources
                </h3>
                <p className="text-xs text-slate-400">The officer may modify actions, departments, resources, or SLA targets prior to approval.</p>
              </div>
              <button
                onClick={handleSaveModifications}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition"
              >
                Save Modifications
              </button>
            </div>

            {/* Department & SLA Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Responsible Dept</label>
                <input
                  type="text"
                  value={primaryDept}
                  onChange={e => setPrimaryDept(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target SLA (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={slaHours}
                  onChange={e => setSlaHours(parseFloat(e.target.value) || 1.5)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Response ETA (Minutes)</label>
                <input
                  type="number"
                  value={etaMinutes}
                  onChange={e => setEtaMinutes(parseInt(e.target.value) || 25)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Actions List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase">Recommended Actions</label>
                <button
                  onClick={handleAddAction}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  + Add Action Item
                </button>
              </div>
              <div className="space-y-2">
                {actions.map((act) => (
                  <div key={act.id} className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300 shrink-0">
                      {act.isSopRule ? 'SOP RULE' : act.isAiRecommendation ? 'AI RECOMMENDATION' : 'OFFICER ADDED'}
                    </span>
                    <input
                      type="text"
                      value={act.actionText}
                      onChange={e => handleActionChange(act.id, e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleRemoveAction(act.id)}
                      className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded bg-red-950/40 border border-red-900/50"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources List */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Required Equipment & Field Resources</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {resources.map((res, idx) => (
                  <div key={idx} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="text-slate-200 font-bold">{res.item}</div>
                      <div className="text-slate-400 text-[11px]">{res.assignedUnit} • Status: {res.status}</div>
                    </div>
                    <input
                      type="text"
                      value={res.quantity}
                      onChange={e => handleResourceQuantityChange(idx, e.target.value)}
                      className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-400 font-bold text-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Officer Authorization Notes */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Officer Audit Trail & Rationale Entry
            </h3>

            {!isRejecting ? (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Mandatory Officer Approval Notes</label>
                <textarea
                  rows={2}
                  value={officerNotes}
                  onChange={e => setOfficerNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-sans focus:outline-none focus:border-emerald-500"
                  placeholder="Enter officer notes or authorization justification..."
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="autoDispatchCheck"
                    checked={autoDispatch}
                    onChange={e => setAutoDispatch(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="autoDispatchCheck" className="text-xs text-slate-300 font-medium">
                    Trigger immediate field crew dispatch (APPROVED → DISPATCHED) upon authorization
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-red-400 mb-1">Rejection Rationale (Required for Audit Log)</label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full bg-slate-900 border border-red-800 rounded-lg p-2.5 text-xs text-slate-100 font-sans focus:outline-none focus:border-red-500"
                  placeholder="Provide explicit reason for rejecting this response plan..."
                />
              </div>
            )}
          </div>

        </div>

        {/* Footer Action Buttons */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setIsRejecting(!isRejecting)}
            className="text-xs text-slate-400 hover:text-slate-200 underline font-mono py-2"
          >
            {isRejecting ? '← Back to Approval View' : 'Switch to Reject Mode'}
          </button>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={closeApprovalModal}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition min-h-[44px]"
            >
              Cancel
            </button>

            {isRejecting ? (
              <button
                onClick={handleReject}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/50 transition min-h-[44px]"
              >
                Reject Response Plan
              </button>
            ) : (
              <button
                onClick={handleApprove}
                className="px-5 sm:px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition min-h-[44px]"
              >
                <span>✅ Grant Approval & Dispatch</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export const HumanApprovalModal: React.FC = () => {
  const {
    isApprovalModalOpen,
    closeApprovalModal,
    selectedIncident,
    approveDispatch,
    rejectDispatch,
    dispatchUnits,
    modifyDispatch
  } = useCivic();

  if (!isApprovalModalOpen || !selectedIncident) return null;

  return (
    <HumanApprovalModalContent
      incident={selectedIncident}
      closeApprovalModal={closeApprovalModal}
      approveDispatch={approveDispatch}
      rejectDispatch={rejectDispatch}
      dispatchUnits={dispatchUnits}
      modifyDispatch={modifyDispatch}
    />
  );
};
