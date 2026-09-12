import React from 'react';
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Globe,
  Layers,
  MapPin,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { calculateDevelopmentImpact } from '../../engine/developmentImpactEngine';
import { generateDevelopmentProjectRecommendation } from '../../engine/developmentRecommendationEngine';
import { ClusteredIncident } from '../../types/civic';
import { DevelopmentImpact } from '../../types/development';

interface Props {
  incident?: ClusteredIncident | null;
}

export const ResolutionVerificationPanel: React.FC<Props> = ({ incident: propIncident }) => {
  const { selectedIncident, signals, addCustomSignal } = useCivic();

  const inc = propIncident || selectedIncident;
  if (!inc) return null;

  // Resolve or generate project recommendation and development impact model
  const project = inc.projectRecommendation || generateDevelopmentProjectRecommendation({
    hotspotId: inc.id,
    category: inc.category,
    geography: {
      country: 'India',
      state: 'Delhi NCR',
      district: inc.ward,
      subDistrict: inc.ward,
      wardOrDistrict: inc.ward,
      locationName: inc.locationName || inc.ward
    },
    priorityScoreVal: inc.priority.overallScore,
    developmentGap: inc.developmentGap || {
      overallGapIndex: inc.priority.overallScore,
      demandGapScore: Math.round(inc.priority.overallScore * 0.3),
      infrastructureDeficitScore: Math.round(inc.priority.overallScore * 0.25),
      demographicVulnerabilityScore: Math.round(inc.priority.overallScore * 0.2),
      investmentDeficitScore: Math.round(inc.priority.overallScore * 0.15),
      environmentalRiskScore: Math.round(inc.priority.overallScore * 0.1),
      explanationBullets: ['Elevated demand pressure', 'Infrastructure access gap']
    },
    demographics: inc.demographics || {
      population: 148000,
      populationDensity: 12000,
      populationGrowth: 2.1,
      urbanizationRate: 92,
      vulnerablePopulation: 35000,
      youthPopulation: 25000,
      elderlyPopulation: 10000,
      wardName: inc.ward
    },
    infrastructure: inc.infrastructure || {
      healthcareIndex: 38,
      educationIndex: 42,
      waterIndex: 35,
      sanitationIndex: 38,
      transportIndex: 42,
      electricityIndex: 50,
      digitalConnectivityIndex: 60,
      nearestFacilityDistanceMeters: 28000
    },
    investment: inc.investment || {
      existingInvestment: 200,
      plannedInvestment: 500,
      activeProjects: 2,
      plannedProjects: 1,
      investmentByCategory: {},
      investmentGapLakhs: 300,
      unaddressedRequestsCount: inc.signalIds?.length || 15
    },
    evidence: inc.evidence || [],
    sourceMode: 'SIMULATION'
  });

  const impact: DevelopmentImpact = calculateDevelopmentImpact({
    project,
    hotspot: inc as any,
    context: (inc as any).context,
    mode: 'REPLAY'
  });

  const handleSimulatePostSignal = () => {
    addCustomSignal(
      `[Post-Intervention Verification] Citizen feedback confirms new facility operational in ${inc.ward}. Demand pressure reduced.`,
      'citizen_app',
      inc.centroid
    );
  };

  return (
    <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-accent)', borderRadius: '12px' }}>
      
      {/* Header Banner: Development Impact Measurement Feedback Loop */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem', background: 'rgba(6, 182, 212, 0.1)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--cyan-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            NagarBodh Development Impact Measurement Engine
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            Measurable Feedback Loop for Digital Public Infrastructure
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
            MEASUREMENT MODE: REPLAY / SIMULATION
          </span>
          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
            IMPACT SCORE: {impact.impactScore}/100
          </span>
        </div>
      </div>

      {/* Project Title & Target Geography */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={18} color="var(--cyan-400)" />
          <span>{project.title}</span>
        </h3>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
          <MapPin size={12} color="var(--cyan-400)" />
          <span>{project.targetLocation} • Measured Feedback Evaluation Window</span>
        </div>
      </div>

      {/* BEFORE → PROJECT → AFTER → MEASURED IMPACT PIPELINE GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        
        {/* BEFORE CARD */}
        <div style={{ background: 'var(--bg-canvas)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#f87171', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>🚨 BEFORE (Baseline)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Infrastructure Access Index:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                {impact.baselineMetrics.infrastructureIndex} / 100
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Average Travel Distance:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                {impact.baselineMetrics.averageTravelDistanceKm} km
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Demand Pressure:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                {impact.baselineMetrics.demandScore} / 100
              </div>
            </div>
          </div>
        </div>

        {/* AFTER CARD */}
        <div style={{ background: 'var(--bg-canvas)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#34d399', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>✅ AFTER (Post-Intervention)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Infrastructure Access Index:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {impact.postInterventionMetrics.infrastructureIndex} / 100
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Average Travel Distance:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {impact.postInterventionMetrics.averageTravelDistanceKm} km
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Demand Pressure:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {impact.postInterventionMetrics.demandScore} / 100
              </div>
            </div>
          </div>
        </div>

        {/* MEASURED IMPACT SUMMARY CARDS */}
        <div style={{ background: 'var(--bg-canvas)', padding: '0.9rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--cyan-400)', marginBottom: '0.5rem' }}>
            MEASURED IMPACT METRICS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Infrastructure Improvement:</span>
              <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                +{impact.change.infrastructureIndexImprovement}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Average Travel Reduction:</span>
              <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                {impact.change.averageTravelDistanceReductionPercent}%
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Demand Pressure Reduction:</span>
              <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                {impact.change.demandPressureReductionPercent}%
              </strong>
            </div>
          </div>
        </div>

      </div>

      {/* GEMINI FACTUALLY BOUNDED SUMMARY NARRATIVE */}
      <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
          <Sparkles size={14} />
          Gemini AI Impact Evaluation Summary
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.45 }}>
          "{impact.aiSummary}"
        </div>
      </div>

      {/* MEASURABLE FEEDBACK NOTICE BANNER */}
      <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', color: '#fde68a' }}>
        <ShieldAlert size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
        <div>
          <strong>Measurable Feedback Loop Notice:</strong> Impact figures are computed from multi-channel citizen demand pressure drops and deterministic infrastructure indices.
        </div>
      </div>

      {/* Interactive Simulation Trigger */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.85rem' }}>
        <button
          onClick={handleSimulatePostSignal}
          style={{
            padding: '0.5rem 0.9rem',
            borderRadius: '6px',
            background: 'var(--bg-canvas)',
            border: '1px solid var(--cyan-400)',
            color: 'var(--cyan-400)',
            fontWeight: 700,
            fontSize: '0.74rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <span>📡 Ingest Post-Intervention Verification Signal</span>
        </button>
      </div>

    </div>
  );
};
