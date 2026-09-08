import React, { useState } from 'react';
import {
  Activity,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Layers,
  MapPin,
  Send,
  Shield,
  TrendingUp,
  Truck
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { ClusteredIncident } from '../../types/civic';
import { IncidentLifecycleStepper } from '../Planner/IncidentLifecycleStepper';
import { ResolutionVerificationPanel } from '../Verification/ResolutionVerificationPanel';
import { ExpandableEvidenceUI, ObservedFact } from '../Evidence/ExpandableEvidenceUI';

interface Props {
  incident?: ClusteredIncident | null;
  standalone?: boolean;
}

export const IncidentDossier: React.FC<Props> = ({ incident: propIncident, standalone = false }) => {
  const { selectedIncident, approveDispatch, signals, currentStep } = useCivic();
  const [showDetailedAudit, setShowDetailedAudit] = useState(false);

  const incident = propIncident || selectedIncident;

  if (!incident) {
    return (
      <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Shield size={36} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Active Incident Selected</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Select an incident cluster on the map or left pulse list to inspect incident intelligence.
        </p>
      </div>
    );
  }

  const { priority, actionPlan } = incident;
  const score = Math.round(priority.overallScore);
  const isP1 = score >= 80;
  const isP2 = score >= 60 && score < 80;
  const isApproved = actionPlan?.status === 'approved';

  const badgeColor = isP1 ? '#ef4444' : isP2 ? '#f59e0b' : '#3b82f6';
  const badgeBg = isP1 ? 'rgba(239, 68, 68, 0.2)' : isP2 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)';
  const badgeLabel = isP1 ? 'P1 · EMERGING' : isP2 ? 'P2 · HIGH PRIORITY' : 'P3 · MEDIUM PRIORITY';

  // Extract factor values for visual bars
  const factors = priority.factors;
  const severityPct = Math.min(100, Math.round((factors.severityScore / 25) * 100));
  const velocityPct = Math.min(100, Math.round((factors.velocityScore / 25) * 100));
  const assetPct = Math.min(100, Math.round((factors.criticalAssetExposureScore / 20) * 100));
  const weatherPct = Math.min(100, Math.round((factors.environmentalRiskScore / 15) * 100));
  const recurrencePct = Math.min(100, Math.round((factors.slaRecurrenceScore / 15) * 100));

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: standalone ? 'var(--bg-canvas)' : 'var(--bg-surface)',
        overflowY: 'auto'
      }}
    >
      {/* Top Header Hierarchy */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.55rem', borderRadius: '4px', background: badgeBg, color: badgeColor, border: `1px solid ${badgeColor}`, textTransform: 'uppercase' }}>
            {badgeLabel}
          </span>
          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Active since {incident.firstSignalTime ? incident.firstSignalTime.slice(11, 16) : '08:05'}
          </span>
        </div>

        <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: '0.2rem 0 0.3rem' }}>
          {incident.category.toUpperCase()}
        </h2>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <MapPin size={13} color="var(--cyan-400)" />
          <span>{(incident.location as any)?.name || incident.locationName || incident.title} · {incident.ward}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Signals & Velocity</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
              {incident.signalIds.length} signals <span style={{ color: '#38bdf8', fontSize: '0.8rem' }}>↑{incident.velocitySurgePercent}%</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Priority</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: badgeColor, fontFamily: 'var(--font-mono)' }}>
              {score} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel Content */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>

        {/* Section 1: WHY THIS PRIORITY? (Visual Compact Bars) */}
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--cyan-400)', letterSpacing: '0.04em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calculator size={14} />
            <span>Why This Priority? ({score}/100)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {/* Severity */}
            <div style={{ marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                <span>Severity Score</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{factors.severityScore} pts</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${severityPct}%`, height: '100%', background: '#ef4444', borderRadius: '3px' }} />
              </div>
            </div>

            {/* Velocity */}
            <div style={{ marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                <span>Signal Velocity Surge</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{factors.velocityScore} pts</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${velocityPct}%`, height: '100%', background: '#38bdf8', borderRadius: '3px' }} />
              </div>
            </div>

            {/* Critical Assets */}
            <div style={{ marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                <span>Critical Asset Exposure</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{factors.criticalAssetExposureScore} pts</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${assetPct}%`, height: '100%', background: '#fbbf24', borderRadius: '3px' }} />
              </div>
            </div>

            {/* Weather */}
            <div style={{ marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                <span>Weather & Environmental Risk</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{factors.environmentalRiskScore} pts</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${weatherPct}%`, height: '100%', background: '#c084fc', borderRadius: '3px' }} />
              </div>
            </div>

            {/* Historical Recurrence */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                <span>Historical Recurrence</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{factors.slaRecurrenceScore} pts</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${recurrencePct}%`, height: '100%', background: '#34d399', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: EVIDENCE */}
        <div style={{ marginBottom: '1.25rem' }}>
          <ExpandableEvidenceUI incident={incident} defaultExpanded={true} title="Source Evidence" />
        </div>

        {/* Section 3: RECOMMENDED RESPONSE */}
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: 'rgba(12, 192, 188, 0.08)', borderRadius: '8px', border: '1px solid var(--border-accent)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--cyan-300)', letterSpacing: '0.04em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Truck size={14} />
            <span>Recommended Response</span>
          </div>

          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem' }}>
            SOP-WL-04: Mobile Dewatering & Traffic Diversion
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.62rem' }}>Department</span>
              <strong style={{ color: '#fff' }}>Municipal Drainage Division</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.62rem' }}>Target Response Time</span>
              <strong style={{ color: 'var(--cyan-400)' }}>15 mins</strong>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.62rem' }}>Allocated Resources</span>
              <span style={{ color: '#fff' }}>2x High-Capacity Dewatering Pumps + Emergency Traffic Patrol</span>
            </div>
          </div>

          {isApproved ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.8rem', fontWeight: 700, padding: '0.4rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '6px' }}>
              <CheckCircle2 size={16} />
              <span>Response Approved & Dispatched</span>
            </div>
          ) : (
            <button
              onClick={() => approveDispatch(actionPlan?.id || 'plan-1', 'Municipal Commander')}
              className="sim-btn sim-btn-play"
              style={{ width: '100%', justifyContent: 'center', padding: '0.55rem', fontSize: '0.82rem', fontWeight: 800 }}
            >
              <Send size={14} />
              <span>APPROVE & DISPATCH</span>
            </button>
          )}
        </div>

        {/* Secondary Details Drawer / Expander */}
        <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.75rem' }}>
          <button
            onClick={() => setShowDetailedAudit(!showDetailedAudit)}
            className="sim-btn"
            style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.72rem' }}
          >
            <span>Audit & Lifecycle State Details</span>
            {showDetailedAudit ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showDetailedAudit && (
            <div style={{ marginTop: '0.75rem' }} className="animate-fade-in">
              <IncidentLifecycleStepper incidentId={incident.id} compact={true} />
              {['resolving', 'resolved', 'verified'].includes(incident.status) && (
                <div style={{ marginTop: '0.75rem' }}>
                  <ResolutionVerificationPanel incident={incident} />
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
