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
import { generateDevelopmentProjectRecommendation, buildCanonicalInterventionRecord } from '../../engine/developmentRecommendationEngine';
import { ClusteredIncident } from '../../types/civic';
import { DevelopmentImpact, InterventionRecord } from '../../types/development';
import { ExpandableEvidenceUI } from '../Evidence/ExpandableEvidenceUI';
import { JudgingJourneyStepper } from '../common/JudgingJourneyStepper';

interface Props {
  incident?: ClusteredIncident | null;
}

export type ImpactDataMode = 'REAL' | 'REPLAY' | 'SIMULATION' | 'PROJECTED';

export const ResolutionVerificationPanel: React.FC<Props> = ({ incident: propIncident }) => {
  const {
    selectedIncident,
    incidents,
    activeIntervention,
    addCustomSignal,
    setActiveTab,
    triggerEmergencyDemo
  } = useCivic();
  const [dataMode, setDataMode] = useState<ImpactDataMode>('SIMULATION');

  // Determine the effective incident and whether an intervention exists
  const hasExplicitIntervention = Boolean(activeIntervention || propIncident);
  const inc = propIncident || (activeIntervention ? incidents.find(i => i.id === activeIntervention.incidentId) : null) || selectedIncident;

  // STATE B: No intervention selected yet
  if (!hasExplicitIntervention && !inc) {
    return (
      <div
        className="card no-intervention-card"
        style={{
          padding: '2.5rem 1.5rem',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-accent)',
          borderRadius: '12px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: 'rgba(37, 99, 235, 0.12)',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <BarChart2 size={28} />
        </div>

        <div style={{ maxWidth: '560px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0', fontFamily: 'var(--font-heading)' }}>
            No Intervention Selected Yet
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Select an investment recommendation from the <strong>Civic Investment Board</strong> and approve an intervention to view its projected before-and-after impact outcome.
          </p>
        </div>

        {/* 6-Step Inactive Lifecycle Stepper */}
        <div style={{ maxWidth: '660px', width: '100%' }}>
          <JudgingJourneyStepper
            currentStep="INVEST"
            compact={true}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => setActiveTab('investment_gaps')}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.65rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span>Go to Investment Board</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={() => {
              triggerEmergencyDemo();
              setActiveTab('investment_gaps');
            }}
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              padding: '0.65rem 1rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Sparkles size={14} color="#f59e0b" />
            <span>Load Canonical Sector 15 Scenario</span>
          </button>
        </div>
      </div>
    );
  }

  // Resolve project recommendation
  const effectiveInc = inc || incidents[0];
  if (!effectiveInc) {
    return (
      <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-surface-elevated)', borderRadius: '12px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No incident data available in the current session.</p>
        <button onClick={() => setActiveTab('investment_gaps')} className="sim-btn" style={{ marginTop: '0.5rem' }}>
          Go to Investment Board
        </button>
      </div>
    );
  }

  const project = effectiveInc.projectRecommendation || generateDevelopmentProjectRecommendation({
    hotspotId: effectiveInc.id,
    category: effectiveInc.category,
    geography: {
      country: 'India',
      state: 'Delhi NCR',
      district: effectiveInc.ward,
      subDistrict: effectiveInc.ward,
      wardOrDistrict: effectiveInc.ward,
      locationName: effectiveInc.locationName || effectiveInc.ward
    },
    priorityScoreVal: effectiveInc.priority.overallScore,
    developmentGap: effectiveInc.developmentGap || {
      overallGapIndex: effectiveInc.priority.overallScore,
      demandGapScore: Math.round(effectiveInc.priority.overallScore * 0.3),
      infrastructureDeficitScore: Math.round(effectiveInc.priority.overallScore * 0.25),
      demographicVulnerabilityScore: Math.round(effectiveInc.priority.overallScore * 0.2),
      investmentDeficitScore: Math.round(effectiveInc.priority.overallScore * 0.15),
      environmentalRiskScore: Math.round(effectiveInc.priority.overallScore * 0.1),
      explanationBullets: ['Elevated demand pressure', 'Infrastructure access gap']
    },
    demographics: effectiveInc.demographics || {
      population: 148000,
      populationDensity: 12000,
      populationGrowth: 2.1,
      urbanizationRate: 92,
      vulnerablePopulation: 35000,
      youthPopulation: 25000,
      elderlyPopulation: 10000,
      wardName: effectiveInc.ward
    },
    infrastructure: effectiveInc.infrastructure || {
      healthcareIndex: 38,
      educationIndex: 42,
      waterIndex: 35,
      sanitationIndex: 38,
      transportIndex: 42,
      electricityIndex: 50,
      digitalConnectivityIndex: 60,
      nearestFacilityDistanceMeters: 28000
    },
    investment: effectiveInc.investment || {
      existingInvestment: 200,
      plannedInvestment: 500,
      activeProjects: 2,
      plannedProjects: 1,
      investmentByCategory: {},
      investmentGapLakhs: 300,
      unaddressedRequestsCount: effectiveInc.signalIds?.length || 15
    },
    evidence: effectiveInc.evidence || [],
    sourceMode: dataMode === 'REAL' ? 'LIVE' : dataMode === 'REPLAY' ? 'REPLAY' : 'SIMULATION'
  });

  const engineMode = dataMode === 'REAL' ? 'LIVE' : dataMode === 'REPLAY' ? 'REPLAY' : 'SIMULATION';

  let impact: DevelopmentImpact;
  try {
    impact = calculateDevelopmentImpact({
      project,
      hotspot: effectiveInc as any,
      context: (effectiveInc as any).context,
      mode: engineMode
    });
  } catch (err) {
    return (
      <div className="card" style={{ padding: '2rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-accent)', borderRadius: '12px', textAlign: 'center' }}>
        <ShieldAlert size={28} color="#ef4444" style={{ margin: '0 auto 0.5rem auto' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
          Impact Model Unavailable for this Intervention
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1rem auto' }}>
          Unable to produce deterministic impact projection due to missing baseline metrics for {effectiveInc.ward}.
        </p>
        <button onClick={() => setActiveTab('investment_gaps')} style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
          Return to Investment Board
        </button>
      </div>
    );
  }

  const handleSimulatePostSignal = () => {
    addCustomSignal(
      `[Post-Intervention Simulation] Modeled signal reduction in ${effectiveInc.ward}. Projected demand pressure change: ${impact.change.demandPressureReductionPercent} pts.`,
      'citizen_app',
      effectiveInc.centroid
    );
  };

  const intervention: InterventionRecord =
    activeIntervention && activeIntervention.incidentId === effectiveInc.id
      ? activeIntervention
      : buildCanonicalInterventionRecord({ incident: effectiveInc, recommendation: project });

  return (
    <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-accent)', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
      
      {/* 6-STEP CLOSED-LOOP LIFECYCLE HEADER & PERSISTENT CONTEXT */}
      <div style={{ marginBottom: '1.25rem' }}>
        <JudgingJourneyStepper
          currentStep="MEASURE"
          compact={false}
          intervention={{
            projectTitle: intervention.projectTitle,
            locationName: `${intervention.locationName} (${intervention.district})`,
            approvedCapitalLakhs: intervention.approvedCapitalLakhs,
            priorityScore: intervention.priorityScore,
            priorityLevel: intervention.priorityLevel,
            status: intervention.status || 'IMPACT_MEASURED',
            dataMode: intervention.dataMode || 'SIMULATION'
          }}
        />
      </div>

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
              title="Live field signal streams & sensor inputs (where active)"
            >
              🟢 LIVE STREAM
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
              STAGE 2: INTERVENTION RECORD
            </span>
            <span style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.15)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
              SIMULATION
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>INTERVENTION:</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {intervention.projectTitle}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>LOCATION:</span>
              <div style={{ fontSize: '0.82rem', color: 'var(--cyan-400)', fontWeight: 700 }}>
                {intervention.locationName}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>APPROVED CAPITAL:</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                ₹{intervention.approvedCapitalLakhs} Lakhs
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>STATUS:</span>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '3px 8px', borderRadius: '4px', marginTop: '3px', display: 'inline-block' }}>
                INTERVENTION RECORDED
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
                {impact.postInterventionMetrics.demandScore} / 100 ({impact.change.demandPressureReductionPercent} pts)
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

      {/* CIVIC INTELLIGENCE FEEDBACK LOOP (PART 8) */}
      <div style={{ background: 'var(--bg-canvas)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.4)', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 800, color: '#c084fc' }}>
            <Activity size={16} />
            <span>Civic Intelligence Feedback Loop — Planning Cycle Closed</span>
          </div>
          <span style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
            FEEDBACK EVIDENCE
          </span>
        </div>

        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0', lineHeight: 1.45 }}>
          The intervention outcome feeds directly back into the civic intelligence knowledge base as prospective planning evidence. The original historical recommendation and baseline metrics remain intact as recorded at decision time—ensuring complete auditability.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.78rem' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 800, color: '#f87171', fontSize: '0.7rem' }}>PRE-INTERVENTION BASELINE</span>
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>[BASELINE CONTEXT]</span>
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.84rem', marginBottom: '0.25rem' }}>
              High Recurring Demand Pressure
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
              • Demand score: <strong>{impact.baselineMetrics.demandScore} / 100</strong><br />
              • Infrastructure gap index: <strong>{impact.baselineMetrics.infrastructureIndex} / 100</strong><br />
              • Status: <em>Active Civic Deficit</em>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 800, color: '#34d399', fontSize: '0.7rem' }}>POST-INTERVENTION PROJECTED</span>
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: '#34d399' }}>[PROJECTED DELTA]</span>
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.84rem', marginBottom: '0.25rem' }}>
              Reduced Demand & Fortified Drainage
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
              • Projected demand score: <strong>{impact.postInterventionMetrics.demandScore} / 100</strong> ({impact.change.demandPressureReductionPercent} pts)<br />
              • Infrastructure score: <strong>{impact.postInterventionMetrics.infrastructureIndex} / 100</strong> (+{impact.change.infrastructureIndexImprovement} pts)<br />
              • Status: <em>Mitigated in Forward Planning Cycle</em>
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

      {/* DIRECTIONAL NEXT ACTIONS (PART 5) */}
      <div style={{
        marginTop: '1.25rem',
        padding: '1rem 1.25rem',
        background: 'var(--bg-canvas)',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Decision Loop Completed
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Signals ➔ Intelligence ➔ Investment ➔ Human Approval ➔ Intervention ➔ Projected Impact
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={() => setActiveTab('project_priorities')}
            style={{
              padding: '0.5rem 0.95rem',
              borderRadius: '6px',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Review Pipeline
          </button>
          <button
            onClick={() => setActiveTab('investment_gaps')}
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span>Return to Investment Board</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

    </div>
  );
};
