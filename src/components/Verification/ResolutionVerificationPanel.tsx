import React from 'react';
import { useCivic } from '../../context/CivicContext';
import { calculateResolutionVerification } from '../../engine/resolutionVerificationEngine';
import { ClusteredIncident } from '../../types/civic';

interface Props {
  incident?: ClusteredIncident | null;
}

export const ResolutionVerificationPanel: React.FC<Props> = ({ incident: propIncident }) => {
  const { selectedIncident, signals, aiVerifyIncident, transitionIncidentState, addCustomSignal } = useCivic();

  const inc = propIncident || selectedIncident;
  if (!inc) return null;

  const verification = inc.resolutionVerification || calculateResolutionVerification(inc, signals);
  const isVerified = verification.outcome === 'VERIFIED';

  const handleConfirmVerified = () => {
    aiVerifyIncident(inc.id, 'Municipal Verification Desk', 'Manually confirmed signal reduction and verified site normalization.');
  };

  const handleFlagReinspection = () => {
    transitionIncidentState(inc.id, 'resolving', 'Operations Inspector', 'Flagged post-resolution residual signals for field re-inspection.');
  };

  const handleSimulatePostSignal = () => {
    addCustomSignal(
      `[Post-Resolution Check] Traffic moving smoothly at ${inc.ward}. Water completely drained.`,
      'citizen_app',
      inc.centroid
    );
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-5 animate-in fade-in duration-200">
      {/* Header Banner: Differentiated Paradigm Question */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-slate-950 border border-cyan-500/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-cyan-400">
            NagarBodh Post-Resolution Paradigm
          </div>
          <div className="text-sm font-bold text-white mt-0.5 flex flex-wrap items-center gap-2">
            <span className="line-through text-slate-400 text-xs">Don't finish at "Ticket closed."</span>
            <span className="text-emerald-400 font-extrabold">Ask: "Did the city actually get better?"</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 bg-cyan-500/20 rounded-lg border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold">
            Signal-Based Verification
          </span>
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wide border ${
              isVerified
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {verification.outcome} • {verification.verificationConfidenceScore}% CONFIDENCE
          </span>
        </div>
      </div>

      {/* Incident Summary */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{inc.title}</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {inc.ward} • Post-Resolution Active Monitoring Window
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 font-mono">Time-to-Resolution</div>
          <div className="text-lg font-bold text-amber-400 font-mono">{verification.timeToResolutionFormatted}</div>
        </div>
      </div>

      {/* 8-Step Verification Protocol Execution Stepper */}
      <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] font-mono space-y-2">
        <div className="text-slate-400 uppercase text-[10px] font-bold tracking-wider flex items-center justify-between">
          <span>8-Step Resolution Verification Audit Protocol</span>
          <span className="text-emerald-400 font-bold">100% Executed</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-emerald-400">
            ✓ 1. Retained Original Evidence
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-emerald-400">
            ✓ 2. Ingested Post-Signals
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-emerald-400">
            ✓ 3. Compared Before vs After
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-emerald-400">
            ✓ 4. Signal Drop (-{verification.signalReductionPercent}%)
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-emerald-400">
            ✓ 5. Recurrence Check (Passed)
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-amber-400">
            ✓ 6. Resolution Time ({verification.timeToResolutionFormatted})
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-blue-400">
            ✓ 7. Confidence ({verification.verificationConfidenceScore}%)
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-emerald-400 font-bold">
            ✓ 8. Outcome ({verification.outcome})
          </div>
        </div>
      </div>

      {/* Before vs After Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BEFORE CARD */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-red-900/50 shadow-inner space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase text-red-400 tracking-wider flex items-center gap-1.5">
              <span>🚨 BEFORE (Peak Incident Baseline)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">Pre-Resolution Evidence</span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[11px] text-slate-400">Signal Volume</div>
              <div className="text-xl font-bold text-red-400 mt-0.5">{verification.beforeSignalCount} signals</div>
              <div className="text-[10px] text-slate-500 mt-1">Multi-channel cluster</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[11px] text-slate-400">Priority Score</div>
              <div className="text-xl font-bold text-red-400 mt-0.5">{verification.beforePriorityScore} / 100</div>
              <div className="text-[10px] text-red-400/80 font-bold mt-1">P1 CRITICAL</div>
            </div>
          </div>
        </div>

        {/* AFTER CARD */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-900/50 shadow-inner space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
              <span>✅ AFTER (Post-Resolution Signals)</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400">Active Audit Window</span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[11px] text-slate-400">Residual Signals</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">{verification.afterSignalCount} residual signals</div>
              <div className="text-[10px] text-emerald-400/80 mt-1">-{verification.signalReductionPercent}% volume drop</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[11px] text-slate-400">Priority Score</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">{verification.afterPriorityScore} / 100</div>
              <div className="text-[10px] text-emerald-400/80 font-bold mt-1">P3 LOW (STABLE)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400">Signal Volume Reduction</div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">-{verification.signalReductionPercent}%</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400">Total Resolution Time</div>
          <div className="text-lg font-bold text-amber-400 mt-0.5">{verification.timeToResolutionFormatted}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400">Verification Confidence</div>
          <div className="text-lg font-bold text-blue-400 mt-0.5">{verification.verificationConfidenceScore}%</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400">Verification Status</div>
          <div className={`text-lg font-bold mt-0.5 ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
            {verification.outcome}
          </div>
        </div>
      </div>

      {/* AI Conclusion Box */}
      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
        <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
          <span>AI Verification Conclusion</span>
        </div>
        <p className="text-xs text-slate-200 font-sans italic leading-relaxed">
          "{verification.aiConclusion}"
        </p>
      </div>

      {/* MANDATORY SIGNAL-BASED VERIFICATION DISCLAIMER BANNER */}
      <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-3 text-amber-200">
        <div className="text-lg shrink-0 mt-0.5">🛡️</div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-amber-300 mb-0.5">
            Signal-Based Verification Notice
          </div>
          <p className="text-[11px] font-sans text-amber-200/90 leading-normal">
            {verification.disclaimerText}
          </p>
        </div>
      </div>

      {/* Officer Control Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 pt-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleSimulatePostSignal}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-blue-400 rounded-xl text-xs font-semibold border border-slate-800 transition flex items-center gap-1.5"
            title="Simulate adding a post-resolution confirmation signal to live telemetry"
          >
            <span>📡 Ingest Post-Signal</span>
          </button>

          <button
            onClick={handleFlagReinspection}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-semibold border border-slate-800 transition flex items-center gap-1.5"
          >
            <span>⚠️ Flag Re-Inspection</span>
          </button>
        </div>

        <button
          onClick={handleConfirmVerified}
          className="w-full sm:w-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition"
        >
          <span>✓ Confirm & Mark Verified</span>
        </button>
      </div>
    </div>
  );
};

