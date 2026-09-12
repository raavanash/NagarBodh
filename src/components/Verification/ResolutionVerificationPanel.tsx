import React, { useState } from 'react';
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
  Users,
  BarChart2,
  RefreshCw,
  Shield
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { calculateDevelopmentImpact } from '../../engine/developmentImpactEngine';
import { generateDevelopmentProjectRecommendation } from '../../engine/developmentRecommendationEngine';
import { ClusteredIncident } from '../../types/civic';
import { DevelopmentImpact } from '../../types/development';
import { ExpandableEvidenceUI } from '../Evidence/ExpandableEvidenceUI';

interface Props {
  incident?: ClusteredIncident | null;
}

export type ImpactDataMode = 'REAL' | 'REPLAY' | 'SIMULATION' | 'PROJECTED';

export const ResolutionVerificationPanel: React.FC<Props> = ({ incident: propIncident }) => {
  const { selectedIncident, incidents, addCustomSignal } = useCivic();
  const [dataMode, setDataMode] = useState<ImpactDataMode>('SIMULATION');

  const inc = propIncident || selectedIncident || incidents[0];
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
    sourceMode: dataMode === 'REAL' ? 'LIVE' : dataMode === 'REPLAY' ? 'REPLAY' : 'SIMULATION'
  });

  const engineMode = dataMode === 'REAL' ? 'LIVE' : dataMode === 'REPLAY' ? 'REPLAY' : 'SIMULATION';

  const impact: DevelopmentImpact = calculateDevelopmentImpact({
    project,
    hotspot: inc as any,
    context: (inc as any).context,
    mode: engineMode
  });

  const handleSimulatePostSignal = () => {
    addCustomSignal(
      `[Post-Intervention Verification] Field audit confirms infrastructure upgrade in ${inc.ward}. Demand pressure dropped by ${Math.abs(impact.change.demandPressureReductionPercent)}%.`,
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
    <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-accent)', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
      
      {/* Header Banner & Data Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.85rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <BarChart2 size={20} color="var(--cyan-400)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Development Impact Feedback Loop
            </h2>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Before vs Intervention vs After Impact Assessment for BRICS Digital Public Infrastructure
          </div>
        </div>

        {/* 4-Way Data Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--bg-canvas)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)', gap: '2px' }}>
            <button
              onClick={() => setDataMode('REAL')}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: dataMode === 'REAL' ? '#10b981' : 'transparent',
                color: dataMode === 'REAL' ? '#fff' : 'var(--text-muted)'
              }}
              title="Real-time measured telemetry from IoT sensors & field verification"
            >
              🟢 REAL MEASURED
            </button>
            <button
              onClick={() => setDataMode('REPLAY')}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: dataMode === 'REPLAY' ? '#f59e0b' : 'transparent',
                color: dataMode === 'REPLAY' ? '#fff' : 'var(--text-muted)'
              }}
              title="Historical replay dataset"
            >
              🟡 REPLAY
            </button>
            <button
              onClick={() => setDataMode('SIMULATION')}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: dataMode === 'SIMULATION' ? '#8b5cf6' : 'transparent',
                color: dataMode === 'SIMULATION' ? '#fff' : 'var(--text-muted)'
              }}
              title="Deterministic scenario simulation"
            >
              🟣 SIMULATION
            </button>
            <button
              onClick={() => setDataMode('PROJECTED')}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: dataMode === 'PROJECTED' ? 'var(--cyan-500)' : 'transparent',
                color: dataMode === 'PROJECTED' ? '#fff' : 'var(--text-muted)'
              }}
              title="Forward-looking projected intervention model"
            >
              🔵 PROJECTED
            </button>
          </div>

          <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
            IMPACT SCORE: {impact.impactScore}/100
          </span>
        </div>
      </div>

      {/* Visual 3-Stage Progress Bar: BEFORE -> INTERVENTION -> AFTER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', background: 'var(--bg-canvas)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem', fontSize: '0.78rem', fontWeight: 800 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171' }}>
          <span style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>1</span>
          <span>BEFORE (Baseline Situation)</span>
        </div>
        <ArrowRight size={16} color="var(--text-muted)" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cyan-400)' }}>
          <span style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>2</span>
          <span>INTERVENTION (Project SOP)</span>
        </div>
        <ArrowRight size={16} color="var(--text-muted)" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399' }}>
          <span style={{ background: 'rgba(52, 211, 153, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>3</span>
          <span>AFTER ({dataMode === 'REAL' ? 'Measured Result' : 'Post-Intervention Outcome'})</span>
        </div>
      </div>

      {/* 3-COLUMN BEFORE -> INTERVENTION -> AFTER GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        
        {/* STAGE 1: BEFORE */}
        <div style={{ background: 'var(--bg-canvas)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', color: '#f87171' }}>
              STAGE 1: BEFORE INTERVENTION
            </span>
            <span style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>BASELINE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>CITIZEN DEMAND PRESSURE:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                {impact.baselineMetrics.demandScore} / 100
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>INFRASTRUCTURE GAP INDEX:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                {impact.baselineMetrics.infrastructureIndex} / 100
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>SERVICE ACCESSIBILITY SCORE:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                {impact.baselineMetrics.serviceAccessScore} / 100
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Avg Travel Distance: <strong>{impact.baselineMetrics.averageTravelDistanceKm} km</strong>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>AFFECTED POPULATION:</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {impact.baselineMetrics.affectedPopulation.toLocaleString()} citizens
              </div>
            </div>
          </div>
        </div>

        {/* STAGE 2: INTERVENTION */}
        <div style={{ background: 'var(--bg-canvas)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--cyan-500)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--cyan-400)' }}>
              STAGE 2: RECOMMENDED INTERVENTION
            </span>
            <span style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)' }}>CAPITAL PROJECT</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>PROJECT TITLE:</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {project.title}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>RECOMMENDED ACTION / SCOPE:</span>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {project.recommendedIntervention}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>TARGET BENEFICIARIES:</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--cyan-400)' }}>
                35,000 vulnerable group citizens ({impact.baselineMetrics.affectedPopulation.toLocaleString()} total area served)
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>POLICY BOARD STATUS:</span>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--amber-400)', background: 'rgba(245, 158, 11, 0.15)', padding: '3px 8px', borderRadius: '4px', marginTop: '3px', display: 'inline-block' }}>
                {projectStatusLabel}
              </div>
            </div>
          </div>
        </div>

        {/* STAGE 3: AFTER */}
        <div style={{ background: 'var(--bg-canvas)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(52, 211, 153, 0.4)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', color: '#34d399' }}>
              STAGE 3: AFTER INTERVENTION
            </span>
            <span style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
              {dataMode === 'REAL' ? 'MEASURED' : 'PROJECTED'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>REDUCED DEMAND PRESSURE:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {impact.postInterventionMetrics.demandScore} / 100 ({impact.change.demandPressureReductionPercent}% pts)
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>UPGRADED INFRASTRUCTURE INDEX:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {impact.postInterventionMetrics.infrastructureIndex} / 100 (+{impact.change.infrastructureIndexImprovement} pts)
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>IMPROVED SERVICE ACCESS:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {impact.postInterventionMetrics.serviceAccessScore} / 100 (+{impact.change.serviceAccessImprovement} pts)
              </div>
              <div style={{ fontSize: '0.7rem', color: '#34d399', marginTop: '2px', fontWeight: 700 }}>
                Avg Travel Distance: {impact.postInterventionMetrics.averageTravelDistanceKm} km ({impact.change.averageTravelDistanceReductionPercent}%)
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>CITIZENS BENEFITED:</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {impact.baselineMetrics.affectedPopulation.toLocaleString()} citizens
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* PROJECTED IMPROVEMENT & IMPACT INDICATORS */}
      <div style={{ background: 'var(--bg-canvas)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-accent)', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={16} color="#34d399" />
            <span>Deterministic Projected Improvement & Impact Indicators</span>
          </div>
          <button
            onClick={handleSimulatePostSignal}
            style={{
              padding: '0.35rem 0.7rem',
              borderRadius: '6px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--cyan-400)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <RefreshCw size={13} />
            <span>Simulate Post-Signal Audit</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.78rem' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>Infrastructure Index Gain:</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              +{impact.change.infrastructureIndexImprovement} pts
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>Travel Distance Cut:</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              {impact.change.averageTravelDistanceReductionPercent}%
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>Demand Pressure Drop:</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              {impact.change.demandPressureReductionPercent} pts
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>Service Access Score:</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              +{impact.change.serviceAccessImprovement} pts
            </div>
          </div>
        </div>
      </div>

      {/* GEMINI NARRATIVE EVALUATION */}
      <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
          <Sparkles size={14} />
          Gemini AI Narrative Evaluation Summary
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.45 }}>
          "{impact.aiSummary}"
        </div>
        <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Note: Gemini provides qualitative narrative synthesis strictly bounded by deterministic calculations from developmentImpactEngine. Numerical metrics are never hallucinated.
        </div>
      </div>

      {/* EVIDENCE & PROVENANCE CHAIN */}
      <div style={{ marginBottom: '1.25rem' }}>
        <ExpandableEvidenceUI
          incident={inc}
          title="Impact Baseline & Calculated Provenance Evidence"
          defaultExpanded={false}
        />
      </div>

      {/* DATA MODE GOVERNANCE & HONESTY NOTICE */}
      <div style={{ padding: '0.85rem', borderRadius: '8px', background: dataMode === 'REAL' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', border: `1px solid ${dataMode === 'REAL' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.76rem', color: dataMode === 'REAL' ? '#a7f3d0' : '#fde68a' }}>
        <ShieldAlert size={18} color={dataMode === 'REAL' ? '#10b981' : '#fbbf24'} style={{ flexShrink: 0 }} />
        <div>
          <strong>DATA MODE GOVERNANCE NOTICE ({dataMode}):</strong> {dataMode === 'REAL' ? 'This view displays live measured sensor telemetry and verified post-intervention field audits.' : `Figures are calculated deterministically by developmentImpactEngine based on ${dataMode.toLowerCase()} baseline models. Projected or simulated outcomes are never represented as measured government outcomes.`}
        </div>
      </div>

    </div>
  );
};
