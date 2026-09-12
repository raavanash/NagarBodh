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
  const { selectedIncident, approveDispatch, signals, currentStep, currentWeather, ingestionMode } = useCivic();
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
      {/* Screen Question Header Banner */}
      <div style={{ padding: '0.85rem 1.15rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <span style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            DEMAND INTELLIGENCE DOSSIER
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• BRICS Development Intelligence</span>
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.15rem 0', color: 'var(--text-primary)' }}>
          Demand Intelligence
        </h3>
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#0284c7', fontWeight: 600 }}>
          "What development need is emerging?"
        </p>
      </div>

      {/* Top Header Hierarchy (Ordered: Title -> Priority -> Status -> Location) */}
      <div style={{ padding: '1rem 1.15rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        {/* 1. Incident Title */}
        <h2 style={{
          fontSize: '1.25rem',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1.25,
          margin: '0 0 0.6rem 0'
        }}>
          {incident.title}
        </h2>

        {/* 2 & 3. Priority & Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            background: badgeBg,
            color: badgeColor,
            border: `1px solid ${badgeColor}`,
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)'
          }}>
            {badgeLabel} ({score}/100)
          </span>

          <span style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.2rem 0.55rem',
            borderRadius: '4px',
            background: 'var(--bg-surface-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)'
          }}>
            STATUS: {incident.status.toUpperCase()}
          </span>

          <span style={{
            fontSize: '0.7rem',
            color: 'var(--text-secondary)',
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600
          }}>
            {incident.signalIds.length} signals • ↑{incident.velocitySurgePercent}% surge
          </span>
        </div>

        {/* 4. Location */}
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'var(--bg-surface-elevated)',
          padding: '0.45rem 0.75rem',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)'
        }}>
          <MapPin size={14} color="#2563eb" style={{ flexShrink: 0 }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {(incident.location as any)?.name || incident.locationName || incident.title}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>• {incident.ward}</span>
        </div>
      </div>

      {/* Main Panel Content */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>

        {/* Development Context & Deficit Summary Cards */}
        <div style={{
          marginBottom: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.5rem'
        }}>
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Citizen Demand</span>
            <strong style={{ fontSize: '1rem', color: '#2563eb', fontFamily: 'var(--font-mono)' }}>{incident.signalIds.length} Signals</strong>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block' }}>↑{incident.velocitySurgePercent}% / hr</span>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Development Need</span>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', textTransform: 'uppercase' }}>{incident.category}</strong>
            <span style={{ fontSize: '0.62rem', color: badgeColor, fontWeight: 700 }}>P{isP1 ? '1' : isP2 ? '2' : '3'} Priority</span>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Affected Pop.</span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {((incident as any).affectedPopulation || (incident as any).demographics?.population || 148000).toLocaleString()}
            </strong>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block' }}>Residents</span>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Infra. Index</span>
            <strong style={{ fontSize: '0.95rem', color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
              {(incident as any).infrastructure?.waterIndex || (incident as any).infrastructure?.infrastructureDeficitIndex || 38}/100
            </strong>
            <span style={{ fontSize: '0.62rem', color: '#dc2626', fontWeight: 700, display: 'block' }}>Capacity Deficit</span>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Investment Gap</span>
            <strong style={{ fontSize: '0.95rem', color: '#b45309', fontFamily: 'var(--font-mono)' }}>
              ₹{(incident as any).investment?.investmentGapLakhs || 350} L
            </strong>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block' }}>Unfunded Deficit</span>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Development Gap</span>
            <strong style={{ fontSize: '0.95rem', color: '#7c3aed', fontFamily: 'var(--font-mono)' }}>
              {(incident as any).developmentGap?.overallGapIndex || score}/100
            </strong>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block' }}>Composite Gap</span>
          </div>
        </div>

        {/* 5. WHY THIS MATTERS: Explainable Priority Factors */}
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.04em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calculator size={14} />
            <span>Why It Matters: Explainable Risk Factors ({score}/100)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {/* Severity */}
            <div style={{ marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                <span>Severity Score</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{factors.severityScore} pts</span>
              </div>
              <div style={{ height: '5px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${severityPct}%`, height: '100%', background: '#ef4444', borderRadius: '3px' }} />
              </div>
            </div>

            {/* Velocity */}
            <div style={{ marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                <span>Signal Velocity Surge</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{factors.velocityScore} pts</span>
              </div>
              <div style={{ height: '5px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${velocityPct}%`, height: '100%', background: '#0284c7', borderRadius: '3px' }} />
              </div>
            </div>

            {/* Critical Assets */}
            <div style={{ marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                <span>Critical Asset Exposure</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{factors.criticalAssetExposureScore} pts</span>
              </div>
              <div style={{ height: '5px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${assetPct}%`, height: '100%', background: '#f59e0b', borderRadius: '3px' }} />
              </div>
            </div>

            {/* Weather */}
            <div style={{ marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                <span>Weather & Environmental Risk</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{factors.environmentalRiskScore} pts</span>
              </div>
              <div style={{ height: '5px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${weatherPct}%`, height: '100%', background: '#7c3aed', borderRadius: '3px' }} />
              </div>
            </div>

            {/* Historical Recurrence */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                <span>Historical Recurrence</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{factors.slaRecurrenceScore} pts</span>
              </div>
              <div style={{ height: '5px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${recurrencePct}%`, height: '100%', background: '#059669', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 6. CURRENT WEATHER (CONTEXTUAL EVIDENCE) */}
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: 'var(--bg-surface-elevated)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Activity size={14} color="#0284c7" />
              <span>CURRENT WEATHER (CONTEXTUAL EVIDENCE)</span>
            </div>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '0.1rem 0.4rem',
              borderRadius: '12px',
              background: ingestionMode === 'LIVE' ? '#d1fae5' : '#eff6ff',
              color: ingestionMode === 'LIVE' ? '#047857' : '#2563eb',
              border: `1px solid ${ingestionMode === 'LIVE' ? '#6ee7b7' : '#bfdbfe'}`
            }}>
              MODE: {ingestionMode === 'LIVE' ? 'LIVE' : 'SIMULATION'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>Temperature</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {currentWeather?.temperatureCelsius ?? 28}°C
              </strong>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>Condition</span>
              <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                {currentWeather?.condition || 'Monsoon Showers'}
              </strong>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>Precipitation</span>
              <strong style={{ fontSize: '0.95rem', color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                {currentWeather?.rainfallMmPerHour ?? 25} mm/hr
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.4rem' }}>
            <span>Location: <strong>{incident.ward || 'Central Delhi'}</strong></span>
            <span>Source: <strong>{ingestionMode === 'LIVE' ? 'Google Weather API (Hyperlocal Grid)' : 'Google Weather Deterministic Engine'}</strong></span>
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.25rem' }}>
            * Contextual Evidence Only — Weather does not independently determine project priority score.
          </div>
        </div>

        {/* 7. KEY EVIDENCE */}
        <div style={{ marginBottom: '1.25rem' }}>
          <ExpandableEvidenceUI incident={incident} defaultExpanded={true} title="Key Evidence" />
        </div>

        {/* 7. RECOMMENDED ACTION */}
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: 'var(--civic-blue-50)', borderRadius: '8px', border: '1px solid var(--border-medium)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.04em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Truck size={14} />
            <span>Recommended Action</span>
          </div>

          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
            SOP-WL-04: Mobile Dewatering & Traffic Diversion
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.62rem' }}>Department</span>
              <strong style={{ color: 'var(--text-primary)' }}>Municipal Drainage Division</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.62rem' }}>Target Response Time</span>
              <strong style={{ color: '#2563eb' }}>15 mins</strong>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.62rem' }}>Allocated Resources</span>
              <span style={{ color: 'var(--text-primary)' }}>2x High-Capacity Dewatering Pumps + Emergency Traffic Patrol</span>
            </div>
          </div>

          {isApproved ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#047857', fontSize: '0.8rem', fontWeight: 700, padding: '0.6rem', minHeight: '44px', background: '#d1fae5', borderRadius: '6px', border: '1px solid #6ee7b7' }}>
              <CheckCircle2 size={16} />
              <span>Response Approved & Dispatched</span>
            </div>
          ) : (
            <button
              onClick={() => approveDispatch(actionPlan?.id || 'plan-1', 'Municipal Commander')}
              className="sim-btn"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.65rem',
                minHeight: '44px',
                fontSize: '0.85rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
              }}
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
