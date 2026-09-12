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
  const { selectedIncident, addCustomSignal } = useCivic();

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

  const projectStatusLabel =
    project.status === 'approved' || inc.status === 'approved'
      ? 'APPROVED BY POLICY BOARD'
      : project.status === 'allocated'
      ? 'BUDGET ALLOCATED'
      : 'UNDER POLICY REVIEW';

  return (
    <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-accent)', borderRadius: '12px' }}>
      
      {/* Header Banner: Data Honesty Badge & Flow Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem', background: 'rgba(6, 182, 212, 0.1)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--cyan-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Development Impact Measurement
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            Measurable Feedback Loop for Digital Public Infrastructure
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Explicit Data Honesty Badge */}
          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
            SIMULATED IMPACT
          </span>
          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
            IMPACT SCORE: {impact.impactScore}/100
          </span>
        </div>
      </div>

      {/* Visual Flow Indicator: BEFORE -> INTERVENTION -> AFTER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', background: 'var(--bg-canvas)', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 800 }}>
        <span style={{ color: '#f87171' }}>BEFORE (Baseline)</span>
        <ArrowRight size={14} color="var(--text-muted)" />
        <span style={{ color: 'var(--cyan-400)' }}>INTERVENTION (Project)</span>
        <ArrowRight size={14} color="var(--text-muted)" />
        <span style={{ color: '#34d399' }}>AFTER (Post-Intervention)</span>
      </div>

      {/* 3-COLUMN BEFORE -> INTERVENTION -> AFTER GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        
        {/* COLUMN 1: BEFORE */}
        <div style={{ background: 'var(--bg-canvas)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#f87171', marginBottom: '0.6rem' }}>
            BEFORE
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Demand Pressure:</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                {impact.baselineMetrics.demandScore} / 100
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Infrastructure Index:</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                {impact.baselineMetrics.infrastructureIndex} / 100
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Service Access:</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                {impact.baselineMetrics.serviceAccessScore} / 100
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Affected Population:</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {impact.baselineMetrics.affectedPopulation.toLocaleString()} citizens
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: INTERVENTION / PROJECT */}
        <div style={{ background: 'var(--bg-canvas)', padding: '0.9rem', borderRadius: '10px', border: '1px solid var(--cyan-500)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--cyan-400)', marginBottom: '0.6rem' }}>
            PROJECT INTERVENTION
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Recommended Intervention:</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {project.recommendedIntervention || project.title}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Policy Approval Status:</span>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--amber-400)', background: 'rgba(245, 158, 11, 0.15)', padding: '3px 8px', borderRadius: '4px', marginTop: '3px', display: 'inline-block' }}>
                {projectStatusLabel}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Target Geography:</span>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {project.targetLocation || (project.geography as any)?.district || 'Local Sector'}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: AFTER */}
        <div style={{ background: 'var(--bg-canvas)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#34d399', marginBottom: '0.6rem' }}>
            AFTER (Post-Intervention)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Demand Pressure:</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {impact.postInterventionMetrics.demandScore} / 100
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Infrastructure Index:</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {impact.postInterventionMetrics.infrastructureIndex} / 100
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Service Access:</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {impact.postInterventionMetrics.serviceAccessScore} / 100
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MEASURED IMPACT SECTION */}
      <div style={{ background: 'var(--bg-canvas)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-accent)', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <TrendingUp size={16} color="#34d399" />
          <span>Measured Impact</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.78rem' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>Infrastructure Improvement:</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              +{impact.change.infrastructureIndexImprovement} pts
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>Demand Reduction:</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              {impact.change.demandPressureReductionPercent}% pts
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>Service Access Improvement:</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              +{impact.change.serviceAccessImprovement} pts
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>Affected Population Served:</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {impact.baselineMetrics.affectedPopulation.toLocaleString()} citizens
            </div>
          </div>
        </div>
      </div>

      {/* GEMINI NARRATIVE EVALUATION */}
      <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
          <Sparkles size={14} />
          Gemini AI Impact Evaluation Summary
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.45 }}>
          "{impact.aiSummary}"
        </div>
        <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Note: Gemini provides narrative interpretation based strictly on deterministic impact calculations. Numerical impact figures are generated by developmentImpactEngine.
        </div>
      </div>

      {/* DATA HONESTY NOTICE BANNER */}
      <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', color: '#fde68a' }}>
        <ShieldAlert size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
        <div>
          <strong>SIMULATED IMPACT NOTICE:</strong> Figures are calculated deterministically by developmentImpactEngine from baseline datasets and simulate a completed project. This does not imply an actual live government infrastructure deployment.
        </div>
      </div>

    </div>
  );
};

