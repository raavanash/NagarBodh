import React, { useState } from 'react';
import {
  Activity,
  Calculator,
  CheckCircle2,
  Clock,
  Eye,
  Languages,
  MapPin,
  School,
  Send,
  Shield,
  Sparkles,
  Truck,
  Wrench
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { ClusteredIncident } from '../../types/civic';
import { ContextEvidencePanel } from './ContextEvidencePanel';
import { IncidentLifecycleStepper } from '../Planner/IncidentLifecycleStepper';
import { ResolutionVerificationPanel } from '../Verification/ResolutionVerificationPanel';

interface IncidentDossierProps {
  incident?: ClusteredIncident | null;
  standalone?: boolean;
}

export const IncidentDossier: React.FC<IncidentDossierProps> = ({ incident: propIncident, standalone = false }) => {
  const { selectedIncident, approveDispatch, fieldVerify, signals, currentStep, civicContextDataLayer } = useCivic();
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [dispatchNotes, setDispatchNotes] = useState('');

  const incident = propIncident || selectedIncident;

  if (!incident) {
    return (
      <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Shield size={36} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
        <h3>No Incident Selected</h3>
        <p style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>
          Select an emerging incident cluster from the map or list to inspect full intelligence dossier.
        </p>
      </div>
    );
  }

  const { auditableInsight, priority, actionPlan } = incident;
  const isP1 = priority.overallScore >= 80;
  const isApproved = actionPlan?.status === 'approved';
  const isResolved = incident.status === 'resolved' || incident.status === 'resolving';
  const isVerified = incident.status === 'verified';

  // Get matching signals for this incident
  const incidentSignals = signals.filter(s => incident.signalIds.includes(s.id));
  const signalsWithPhotos = incidentSignals.filter(s => s.imageUrl);

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
      {/* Dossier Header */}
      <div className="dossier-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: isP1 ? '#f87171' : 'var(--cyan-400)'
            }}
          >
            NagarBodh Intelligence Dossier • {incident.category.toUpperCase()}
          </span>

          <span
            style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              background: isApproved ? 'rgba(16, 185, 129, 0.2)' : isP1 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(6, 182, 212, 0.2)',
              color: isApproved ? '#34d399' : isP1 ? '#fca5a5' : '#cffafe',
              border: isApproved ? '1px solid rgba(16, 185, 129, 0.4)' : isP1 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(6, 182, 212, 0.3)'
            }}
          >
            {isApproved ? 'DISPATCH EXECUTED' : incident.status.toUpperCase()}
          </span>
        </div>

        <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff', lineHeight: 1.25, marginBottom: '0.4rem' }}>
          {incident.title}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MapPin size={13} color="var(--cyan-400)" />
            <span>{incident.ward}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-mono)' }}>
            <Clock size={13} />
            <span>Active: {incident.latestSignalTime.slice(11, 16)}</span>
          </div>
        </div>
      </div>

      {/* 9-State Lifecycle Stepper Component */}
      <div style={{ padding: '0.75rem 1rem' }}>
        <IncidentLifecycleStepper incidentId={incident.id} compact={true} />
      </div>

      {/* Resolution Verification Panel (shown when resolving, resolved, or verified) */}
      {['resolving', 'resolved', 'verified'].includes(incident.status) && (
        <div style={{ padding: '0.5rem 1rem' }}>
          <ResolutionVerificationPanel incident={incident} />
        </div>
      )}

      {/* 4-Way Fact Separation Principle Banner */}
      <div
        style={{
          padding: '0.5rem 1.25rem',
          background: 'rgba(7, 10, 19, 0.7)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.7rem'
        }}
      >
        <span style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Fact Separation Architecture
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
          <span style={{ color: '#38bdf8' }}>1. Observed</span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{ color: '#34d399' }}>2. Calculated</span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{ color: '#c084fc' }}>3. Inference</span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{ color: '#fbbf24' }}>4. Action</span>
        </div>
      </div>

      {/* 1. OBSERVED DATA SECTION */}
      <div className="fact-section">
        <div className="fact-section-title">
          <Eye size={15} className="fact-badge-observed" />
          <span className="fact-badge-observed">1. Observed Data (Citizen & Sensor Facts)</span>
        </div>

        <div className="metric-grid" style={{ marginBottom: '0.85rem' }}>
          <div className="metric-box">
            <div className="metric-box-label">Ingested Signals</div>
            <div className="metric-box-value">{incident.signalIds.length} Reports</div>
            <div className="metric-box-sub">Multi-channel cross-verified</div>
          </div>

          <div className="metric-box">
            <div className="metric-box-label">Verified Coordinates</div>
            <div className="metric-box-value" style={{ fontSize: '0.88rem' }}>
              {incident.centroid.lat.toFixed(4)}°N, {incident.centroid.lng.toFixed(4)}°E
            </div>
            <div className="metric-box-sub">Radius: ~{incident.radiusMeters}m</div>
          </div>
        </div>

        {/* Source Channels Distribution */}
        <div style={{ marginBottom: '0.85rem' }}>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.4rem' }}>
            Channel Ingestion Distribution
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {Object.entries(auditableInsight.observedData.sourceDistribution).map(([channel, count]) => {
              if (count === 0) return null;
              return (
                <div
                  key={channel}
                  style={{
                    padding: '0.25rem 0.55rem',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.72rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span style={{ color: 'var(--cyan-400)', fontWeight: 700 }}>{count}</span>
                  <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    {channel.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Multilingual Raw Excerpts */}
        <div style={{ marginBottom: '0.85rem' }}>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Languages size={13} />
            <span>Sample Multilingual Citizen Signals</span>
          </div>

          {auditableInsight.observedData.rawExcerpts.map((excerpt, i) => (
            <div key={i} className="multilingual-quote">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '3px',
                  background: excerpt.language === 'hi' ? 'rgba(245, 158, 11, 0.25)' : excerpt.language === 'hinglish' ? 'rgba(139, 92, 246, 0.25)' : 'rgba(6, 182, 212, 0.25)',
                  color: excerpt.language === 'hi' ? '#fbbf24' : excerpt.language === 'hinglish' ? '#c084fc' : '#38bdf8'
                }}>
                  {excerpt.language} • {excerpt.channel.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {excerpt.time}
                </span>
              </div>
              <div className="multilingual-original">"{excerpt.original}"</div>
            </div>
          ))}
        </div>

        {/* Evidence Photos Gallery */}
        {signalsWithPhotos.length > 0 && (
          <div>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.4rem' }}>
              Citizen Photographic Evidence ({signalsWithPhotos.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {signalsWithPhotos.slice(0, 2).map((sig, idx) => (
                <div key={idx} className="evidence-photo-card">
                  <img src={sig.imageUrl} alt="Submerged road evidence" />
                  <div className="evidence-photo-caption">
                    📷 {sig.locationName} ({sig.simulatedTimeLabel})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. CALCULATED METRICS SECTION */}
      <div className="fact-section">
        <div className="fact-section-title">
          <Calculator size={15} className="fact-badge-calculated" />
          <span className="fact-badge-calculated">2. Calculated Metrics (Deterministic Math)</span>
        </div>

        {/* Priority Score Master Card */}
        <div
          style={{
            background: isP1
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.3) 100%)'
              : 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(30, 41, 59, 0.8) 100%)',
            border: isP1 ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border-accent)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: isP1 ? '#fca5a5' : 'var(--cyan-400)', letterSpacing: '0.04em' }}>
              Priority: {priority.overallScore}/100
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: isP1 ? '#f87171' : 'var(--cyan-400)'
            }}>
              {priority.overallScore} / 100
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.75rem', fontWeight: 600 }}>
            Level: <strong style={{ color: isP1 ? '#f87171' : 'var(--cyan-400)', textTransform: 'uppercase' }}>{priority.level}</strong> • Deterministic Math Engine
          </div>

          {/* 6 Exact Factor Sub-Score Breakdown */}
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Breakdown:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.72rem', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#e2e8f0' }}>Severity</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>{priority.factors.severityScore} / 25</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#e2e8f0' }}>Velocity</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#f87171' }}>{priority.factors.velocityScore} / 25 (+{incident.velocitySurgePercent}%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#e2e8f0' }}>Population impact</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{priority.factors.populationImpactScore} / 20</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#e2e8f0' }}>Critical asset exposure</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#c084fc' }}>{priority.factors.criticalAssetExposureScore} / 15</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#e2e8f0' }}>Environmental risk</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>{priority.factors.environmentalRiskScore} / 10</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#e2e8f0' }}>SLA/recurrence</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#34d399' }}>{priority.factors.slaRecurrenceScore} / 10</strong>
            </div>
          </div>

          {/* Why This Incident Is Prioritized with Evidence Links */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem', marginBottom: '0.65rem' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--cyan-400)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={13} /> Why this incident is prioritized:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {priority.whyPrioritizedBullets?.map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '0.5rem 0.65rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: '0.73rem', color: '#cbd5e1', margin: '0 0 0.3rem 0', lineHeight: 1.35 }}>
                    • {item.reasonText}
                  </p>
                  {item.evidenceLink && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span
                        style={{
                          fontSize: '0.64rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: 'rgba(6, 182, 212, 0.2)',
                          color: '#38bdf8',
                          border: '1px solid rgba(6, 182, 212, 0.35)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        🔗 Evidence: {item.evidenceLink.label}
                      </span>
                      {item.evidenceLink.snippet && (
                        <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                          {item.evidenceLink.snippet}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowFormulaModal(true)}
            style={{
              width: '100%',
              padding: '0.4rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <Calculator size={14} color="var(--cyan-400)" />
            <span>Inspect Priority Math Formula →</span>
          </button>
        </div>

        {/* Spatial Asset Proximity Calculation */}
        {auditableInsight.calculatedMetrics.nearestSchoolName && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <School size={16} color="#c084fc" />
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>
                  {auditableInsight.calculatedMetrics.nearestSchoolName}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#c084fc' }}>
                  Primary dismissal zone • High student vulnerability
                </div>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', fontWeight: 800, color: '#c084fc' }}>
              {auditableInsight.calculatedMetrics.nearestSchoolDistanceMeters}m
            </div>
          </div>
        )}

        {auditableInsight.calculatedMetrics.nearestHospitalName && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={16} color="#f87171" />
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>
                  {auditableInsight.calculatedMetrics.nearestHospitalName}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#f87171' }}>
                  Trauma center ambulance corridor
                </div>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', fontWeight: 800, color: '#f87171' }}>
              {auditableInsight.calculatedMetrics.nearestHospitalDistanceMeters}m
            </div>
          </div>
        )}
      </div>

      {/* 3. MODEL INFERENCE SECTION */}
      <div className="fact-section">
        <div className="fact-section-title">
          <Sparkles size={15} className="fact-badge-inference" />
          <span className="fact-badge-inference">3. Model Inference (AI Synthesized Intelligence)</span>
        </div>

        <div style={{ background: 'rgba(7, 10, 19, 0.5)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '0.65rem' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.3rem' }}>
            Root Cause Assessment
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
            {auditableInsight.modelInference.assessedRootCause}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
          <span>AI Synthesis Confidence:</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)', fontWeight: 700 }}>
            {(auditableInsight.modelInference.confidenceScore * 100).toFixed(0)}% (Cross-channel corroboration & topology verified)
          </span>
        </div>

        {/* Explainable Incident Intelligence Rationale */}
        {auditableInsight.explanation && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.85) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderLeft: '4px solid var(--cyan-400)',
              borderRadius: '8px',
              padding: '0.85rem'
            }}
          >
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={14} color="var(--cyan-400)" />
              <span>Incident Intelligence Clustering Rationale</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600, marginBottom: '0.35rem' }}>
              {auditableInsight.explanation.summaryText}
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {auditableInsight.explanation.explanationBullets.map((bullet, idx) => (
                <li key={idx} style={{ color: '#cbd5e1' }}>{bullet}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 4. RECOMMENDED ACTION PLAN SECTION */}
      <div className="fact-section" style={{ background: 'var(--bg-surface-elevated)' }}>
        <div className="fact-section-title">
          <Wrench size={15} className="fact-badge-recommendation" />
          <span className="fact-badge-recommendation">4. Recommended Response (SOP-Aligned Dispatch)</span>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            Primary Responding Division:
          </div>
          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>
            {actionPlan?.primaryDepartment}
          </div>
        </div>

        {/* Action Items List */}
        <div style={{ marginBottom: '0.85rem' }}>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.4rem' }}>
            Recommended Field Actions
          </div>
          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', color: '#e2e8f0' }}>
            {actionPlan?.actions.map((act, i) => (
              <li key={i}>{act}</li>
            ))}
          </ul>
        </div>

        {/* Required Resources / Equipment */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Truck size={13} />
            <span>Assigned Heavy Equipment & Crew</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {actionPlan?.equipment.map((eq, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  background: 'rgba(7, 10, 19, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.74rem'
                }}
              >
                <span>{eq.name} (x{eq.count})</span>
                <span style={{
                  fontSize: '0.66rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  background: isApproved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: isApproved ? '#34d399' : '#fbbf24'
                }}>
                  {isApproved ? 'DEPLOYED' : 'READY TO DISPATCH'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Human-in-the-Loop Dispatch Action Trigger */}
        {isApproved ? (
          <>
            <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                <CheckCircle2 size={18} />
                <span>DISPATCH ORDER EXECUTED</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#a7f3d0' }}>
                Approved by: {actionPlan.approvedBy || 'Municipal Incident Commander'} • ETA: ~{actionPlan.etaMinutes} mins
              </div>
            </div>

            {/* Field Verify button — visible once incident is resolved/resolving */}
            {(isResolved || isVerified) && (
              <div style={{ marginTop: '0.85rem' }}>
                {isVerified ? (
                  <div style={{ padding: '0.7rem', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)', textAlign: 'center', color: 'var(--cyan-400)', fontSize: '0.8rem', fontWeight: 700 }}>
                    <Eye size={15} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
                    FIELD VERIFIED — {incident.verifiedAt ? new Date(incident.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    {incident.verifiedBy && <div style={{ fontSize: '0.7rem', color: 'rgba(6,182,212,0.7)', fontWeight: 400, marginTop: '0.2rem' }}>by {incident.verifiedBy}</div>}
                  </div>
                ) : (
                  <button
                    className="dispatch-action-btn"
                    style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.05) 100%)', borderColor: 'rgba(6, 182, 212, 0.5)', color: 'var(--cyan-400)' }}
                    onClick={() => fieldVerify(incident.id)}
                  >
                    <Eye size={16} />
                    <span>CONFIRM FIELD VERIFICATION &amp; CLOSE INCIDENT</span>
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div>
            <textarea
              value={dispatchNotes}
              onChange={e => setDispatchNotes(e.target.value)}
              placeholder="Optional: Add dispatch notes, special instructions, or resource constraints..."
              rows={2}
              style={{
                width: '100%',
                background: 'rgba(7, 10, 19, 0.5)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: '#e2e8f0',
                fontSize: '0.74rem',
                padding: '0.5rem 0.65rem',
                resize: 'vertical',
                marginBottom: '0.65rem',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
            <button
              className="dispatch-action-btn"
              onClick={() => approveDispatch(incident.id, dispatchNotes)}
            >
              <Send size={16} />
              <span>APPROVE & DISPATCH FIELD UNITS NOW (ETA {actionPlan?.etaMinutes || 18}m)</span>
            </button>
            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              1-Click Human-in-the-Loop Operational Execution • Timestamped in Official Audit Log
            </div>
          </div>
        )}

        {/* Civic Context Data Layer Evidence Panel */}
        <ContextEvidencePanel incident={incident} dataLayer={civicContextDataLayer} />
      </div>

      {/* Priority Formula Explanation Modal Overlay */}
      {showFormulaModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setShowFormulaModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-accent)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              color: '#f8fafc'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator size={18} color="var(--cyan-400)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                  Deterministic Priority Formula Engine
                </h3>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', lineHeight: 1.5, color: '#cbd5e1', marginBottom: '1rem' }}>
              Priority is calculated using an auditable 6-factor deterministic scoring formula. Zero black-box LLM guessing:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem', marginBottom: '1.2rem', fontFamily: 'var(--font-mono)' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <strong>1. Severity (0-25):</strong> Evaluates reported severity levels, verbatim hazard clues & confidence.
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <strong>2. Velocity (0-25):</strong> Evaluates signal arrival velocity, surge acceleration % & source diversity.
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <strong>3. Population impact (0-20):</strong> Evaluates ward population density & estimated affected commuters/students.
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <strong>4. Critical asset exposure (0-15):</strong> Haversine distance to active schools, hospitals & transit corridors.
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <strong>5. Environmental risk (0-10):</strong> Live precipitation telemetry ({currentStep.weatherCondition.rainfallMmPerHour} mm/hr) & low-lying terrain risk.
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <strong>6. SLA/recurrence (0-10):</strong> 30-day historical recurrence count, unresolved duration & SLA breach risk.
              </div>
            </div>

            <button
              onClick={() => setShowFormulaModal(false)}
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Close Formula Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
