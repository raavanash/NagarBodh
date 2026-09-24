import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  Layers,
  MapPin,
  Maximize2,
  Shield,
  ShieldAlert,
  Sparkles,
  Users,
  Wrench
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { DevelopmentProjectRecommendation, InterventionRecord } from '../../types/development';
import { generateDevelopmentProjectRecommendation, buildCanonicalInterventionRecord } from '../../engine/developmentRecommendationEngine';
import { buildInvestmentExplanationDossier } from '../../engine/developmentGapEngine';
import { ExplainableInvestmentDossierDrawer } from '../Gaps/ExplainableInvestmentDossierDrawer';
import { ResolutionVerificationPanel } from '../Verification/ResolutionVerificationPanel';
import { ExpandableEvidenceUI } from '../Evidence/ExpandableEvidenceUI';
import { JudgingJourneyStepper } from '../common/JudgingJourneyStepper';

export const ResponsePlannerView: React.FC = () => {
  const {
    incidents,
    signals,
    selectedIncidentId,
    activeIntervention,
    openApprovalModal,
    setSelectedIncidentId,
    setActiveTab,
    ingestionMode
  } = useCivic();

  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Guarantee Sector 15 / active incident continuity
  const effectiveIncidentId =
    selectedPlanId ||
    selectedIncidentId ||
    incidents.find(i => i.id.includes('sector-15') || i.id.includes('ward-15') || i.category === 'waterlogging')?.id ||
    incidents[0]?.id;

  const currentIncident = incidents.find(i => i.id === effectiveIncidentId) || incidents[0];

  if (!currentIncident) {
    return (
      <main className="main-content flex-1 p-6 overflow-y-auto planner-container">
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mb-3 animate-pulse" />
          <h3 className="text-lg font-semibold text-slate-200 mb-1">No Active Incidents in {ingestionMode} Mode</h3>
          <p className="text-sm max-w-md text-slate-400">
            There are currently no active civic signals or clustered incidents detected in {ingestionMode} mode.
            Switch modes or wait for live ingestion to populate signals.
          </p>
        </div>
      </main>
    );
  }

  const currentDossier = buildInvestmentExplanationDossier(currentIncident.category, incidents, signals);

  // Resolve or generate structured DevelopmentProjectRecommendation for selected item
  const rec: DevelopmentProjectRecommendation = currentIncident?.projectRecommendation || generateDevelopmentProjectRecommendation({
    hotspotId: currentIncident.id,
    category: currentIncident.category,
    geography: {
      country: 'India',
      state: 'Delhi NCR',
      district: currentIncident.ward,
      subDistrict: currentIncident.ward,
      wardOrDistrict: currentIncident.ward,
      locationName: currentIncident.locationName || currentIncident.ward
    },
    priorityScoreVal: currentIncident.priority.overallScore,
    developmentGap: currentIncident.developmentGap || {
      overallGapIndex: currentIncident.priority.overallScore,
      demandGapScore: Math.round(currentIncident.priority.overallScore * 0.3),
      infrastructureDeficitScore: Math.round(currentIncident.priority.overallScore * 0.25),
      demographicVulnerabilityScore: Math.round(currentIncident.priority.overallScore * 0.2),
      investmentDeficitScore: Math.round(currentIncident.priority.overallScore * 0.15),
      environmentalRiskScore: Math.round(currentIncident.priority.overallScore * 0.1),
      explanationBullets: ['Elevated citizen demand intensity', 'Infrastructure capacity deficit']
    },
    demographics: currentIncident.demographics || {
      population: 184000,
      populationDensity: 18400,
      populationGrowth: 1.6,
      urbanizationRate: 98,
      vulnerablePopulation: 45000,
      youthPopulation: 64000,
      elderlyPopulation: 22000,
      wardName: currentIncident.ward
    },
    infrastructure: currentIncident.infrastructure || {
      healthcareIndex: 70,
      educationIndex: 80,
      waterIndex: 35,
      sanitationIndex: 45,
      transportIndex: 75,
      electricityIndex: 80,
      digitalConnectivityIndex: 90
    },
    investment: currentIncident.investment || {
      existingInvestment: 200,
      plannedInvestment: 550,
      activeProjects: 1,
      plannedProjects: 1,
      investmentByCategory: {},
      investmentGapLakhs: 350,
      unaddressedRequestsCount: currentIncident.signalIds?.length || 18
    },
    evidence: currentIncident.evidence || [],
    sourceMode: 'SIMULATION'
  });

  const interventionRecord: InterventionRecord =
    activeIntervention && activeIntervention.incidentId === currentIncident?.id
      ? activeIntervention
      : buildCanonicalInterventionRecord({ incident: currentIncident, recommendation: rec });

  const isApproved =
    interventionRecord.status === 'APPROVED' ||
    interventionRecord.status === 'INTERVENTION_RECORDED' ||
    interventionRecord.status === 'IMPACT_MEASURED' ||
    currentIncident?.status === 'approved' ||
    currentIncident?.status === 'dispatched' ||
    currentIncident?.status === 'on_site' ||
    currentIncident?.status === 'resolving' ||
    currentIncident?.status === 'resolved' ||
    currentIncident?.status === 'verified';

  const isSector15 = Boolean(
    currentIncident?.id.includes('ward-15') ||
    currentIncident?.id.includes('sector-15') ||
    currentIncident?.category === 'waterlogging'
  );

  const fundingScheme = isSector15
    ? 'Urban Flood CapEx'
    : currentIncident?.category === 'sanitation' || currentIncident?.category === 'garbage'
    ? 'Municipal Sanitation CapEx'
    : currentIncident?.category === 'transport' || currentIncident?.category === 'roads' || currentIncident?.category === 'traffic'
    ? 'Urban Mobility CapEx'
    : currentIncident?.category === 'healthcare'
    ? 'Public Health CapEx'
    : 'Urban Infrastructure CapEx';

  const deliveryHorizon = isSector15
    ? { days: '120 Days', badge: 'Monsoon Preparedness SLA' }
    : { days: '90 Days', badge: 'Municipal Target SLA' };

  const totalCapEx = interventionRecord.approvedCapitalLakhs;
  const phasedDeliverables = isSector15
    ? [
        {
          num: '01',
          title: 'Sub-surface Pre-Cast Box Drain Alignment',
          timeline: 'Days 1–45 • ₹210L',
          description: 'Excavation and installation of twin reinforced concrete box culverts parallel to arterial feeder to relieve hydraulic choking.'
        },
        {
          num: '02',
          title: 'Automated Dewatering Pumping Substation',
          timeline: 'Days 45–90 • ₹95L',
          description: 'Dual 500 HP automated stormwater pumping array with dual-grid backup power to drain low-lying roadway depression.'
        },
        {
          num: '03',
          title: 'Hydrostatic Telemetry & Outfall Gate Automation',
          timeline: 'Days 90–120 • ₹45L',
          description: 'Continuous ultrasonic water level sensors integrated with supervisory control systems to regulate discharge rate.'
        }
      ]
    : [
        {
          num: '01',
          title: rec.implementationConsiderations?.[0] || 'Preliminary Civil & Engineering Alignment',
          timeline: `Days 1–30 • ₹${Math.round(totalCapEx * 0.6)}L`,
          description: 'Survey, technical DPR sanction, and preliminary civil works deployment along priority corridor.'
        },
        {
          num: '02',
          title: rec.implementationConsiderations?.[1] || 'Core Facility Upgrade & Equipment Commissioning',
          timeline: `Days 30–60 • ₹${Math.round(totalCapEx * 0.28)}L`,
          description: 'Procurement of specialized equipment, structural installation, and utility grid integration.'
        },
        {
          num: '03',
          title: rec.implementationConsiderations?.[2] || 'Operational Telemetry & Municipal Handover',
          timeline: `Days 60–90 • ₹${totalCapEx - Math.round(totalCapEx * 0.6) - Math.round(totalCapEx * 0.28)}L`,
          description: 'Operational validation, IoT telemetry activation, and handover to zonal municipal division.'
        }
      ];

  return (
    <div className="planner-container" style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '1.25rem', background: 'var(--bg-canvas)' }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* 1. Unified 6-Stage Journey Stepper */}
        <JudgingJourneyStepper
          currentStep={isApproved ? 'APPROVE' : 'DECIDE'}
          compact={true}
          intervention={{
            projectTitle: interventionRecord.projectTitle,
            locationName: interventionRecord.locationName,
            approvedCapitalLakhs: interventionRecord.approvedCapitalLakhs
          }}
        />

        {/* 2. Top Governance Authority Ribbon */}
        <div
          style={{
            background: isApproved ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: isApproved ? '1px solid #10b981' : '1px solid #fcd34d',
            borderRadius: '10px',
            padding: '0.65rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                background: isApproved ? '#dcfce7' : '#fee2e2',
                color: isApproved ? '#166534' : '#dc2626',
                border: `1px solid ${isApproved ? '#86efac' : '#fca5a5'}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isApproved ? '#166534' : '#dc2626' }} />
              {isApproved
                ? 'STATUS: AUTHORIZED & RECORDED IN OPERATIONAL REGISTRY'
                : 'STATUS: PENDING HUMAN GOVERNANCE AUTHORIZATION'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              EARMARKED CAPITAL POOL // SECTOR: {currentIncident.category.toUpperCase()} (₹{interventionRecord.approvedCapitalLakhs}L)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            <span>MODE: {ingestionMode}</span>
            <span>•</span>
            <span>GOVERNANCE: HUMAN REVIEW MANDATE</span>
          </div>
        </div>

        {/* 3. Title & Strategic Question Banner */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                CENTRAL GOVERNANCE WORKSPACE
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                REF: #{interventionRecord.recommendationId || 'NB-DEC-2025'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              What intervention are we authorizing?
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Review the proposed civic intervention and empirical evidence before committing public capital.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={() => setIsDossierOpen(true)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '0.55rem 0.95rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <FileText size={14} color="#1e3a8a" />
              <span>Evidence Dossier</span>
            </button>

            <button
              onClick={() => {
                setSelectedIncidentId(currentIncident.id);
                setActiveTab('development_map');
              }}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '0.55rem 0.95rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <MapPin size={14} color="#0284c7" />
              <span>View Map Lens</span>
            </button>
          </div>
        </div>

        {/* 4. Master 60/40 Split Workbench Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '1.25rem', alignItems: 'start' }}>

          {/* LEFT COLUMN (60% equivalent: 7 cols) */}
          <div style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="lg-decide-left">
            <style>{`
              @media (min-width: 1024px) {
                .lg-decide-left { grid-column: span 7 !important; }
                .lg-decide-right { grid-column: span 5 !important; }
              }
            `}</style>

            {/* Selected Intervention Specification Card */}
            <article
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Municipal Capital Intervention Specification
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      background: currentIncident.priority.overallScore >= 80 ? '#fee2e2' : '#fef3c7',
                      color: currentIncident.priority.overallScore >= 80 ? '#dc2626' : '#b45309',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px'
                    }}
                  >
                    SYSTEM PRIORITY RANK: #01 (SEVERITY {currentIncident.priority.overallScore}/100)
                  </span>
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {rec.title}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="#2563eb" />
                    <strong>{currentIncident.ward}</strong> ({currentIncident.locationName || 'Critical Corridor'})
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Building2 size={14} color="#2563eb" />
                    <span>{rec.primaryDepartment || 'Municipal Engineering & Drainage Wing'}</span>
                  </span>
                </div>
              </div>

              {/* Financial Allocation Matrix */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '0.85rem',
                  background: 'var(--bg-surface-elevated)',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Authorized CapEx
                  </span>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1e3a8a', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                    ₹{interventionRecord.approvedCapitalLakhs} Lakhs
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 700 }}>
                    100% Encumbered [PROJECTED]
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Funding Scheme
                  </span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                    {fundingScheme}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Infrastructure Pool [BASELINE]
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Delivery Horizon
                  </span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                    {deliveryHorizon.days}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: deliveryHorizon.badge.includes('Monsoon') ? '#dc2626' : '#2563eb', fontWeight: 700 }}>
                    {deliveryHorizon.badge}
                  </span>
                </div>
              </div>

              {/* Implementation Scope & Key Authorised Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
                    Implementation Scope & Key Authorised Actions
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    3 PHASED DELIVERABLES
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {phasedDeliverables.map((item) => (
                    <div
                      key={item.num}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '0.85rem',
                        background: 'var(--bg-surface-elevated)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '6px',
                          background: '#1e3a8a',
                          color: '#fff',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {item.num}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                            {item.title}
                          </strong>
                          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            {item.timeline}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supporting Evidence Lineage */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Underlying Corroborating Evidence
                </span>
                <ExpandableEvidenceUI incident={currentIncident} />
              </div>
            </article>

            {/* Resolution Verification Panel (Available after approval & resolution) */}
            {isApproved && (
              <ResolutionVerificationPanel incident={currentIncident} />
            )}

          </div>

          {/* RIGHT COLUMN (40% equivalent: 5 cols) */}
          <div style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="lg-decide-right">

            {/* Grounded Gemini Civic Intelligence Brief */}
            <article
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1e3a8a', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <Sparkles size={13} />
                    <span>Grounded Civic Intelligence Brief</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.2rem 0 0 0', color: 'var(--text-primary)' }}>
                    Algorithmic Rationale & Proof
                  </h3>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#dbeafe', color: '#1e40af', padding: '0.15rem 0.5rem', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                  AI EXPLAINS • HUMAN DECIDES
                </span>
              </div>

              {/* Synthetic Metrics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem',
                  background: 'var(--bg-surface-elevated)',
                  padding: '0.85rem',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Protected Residents
                  </span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
                    {(rec.expectedBeneficiaries || Math.round((currentIncident.demographics?.population || 184000) * 0.65)).toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                    Projected Beneficiaries [PROJECTED]
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Deficit Reduction
                  </span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
                    {rec.estimatedImpact.deficitReductionPercent || 65}%
                  </div>
                  <span style={{ fontSize: '0.62rem', color: '#059669', fontWeight: 700 }}>
                    Projected Deficit Remediated
                  </span>
                </div>
              </div>

              {/* Rationale Narrative */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <p style={{ margin: '0 0 0.5rem 0' }}>
                  This intervention addresses <strong>{currentIncident.signalIds.length} corroborating citizen grievance logs</strong> intersecting high-density municipal corridors.
                </p>
                <p style={{ margin: 0 }}>
                  {rec.rationale}
                </p>
              </div>

              {/* Stat Trace */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>MODEL: GEMINI PUBLIC SECTOR GROUNDED</span>
                <span>LINEAGE: CIVIC SIGNAL SYNTHESIS</span>
              </div>
            </article>

            {/* Governance Review Criteria Box */}
            <article
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Shield size={15} color="#1e3a8a" />
                  <span>Governance Review Criteria</span>
                </h4>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#166534', background: '#dcfce7', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  3 CRITERIA EVALUATED
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.55rem', background: 'var(--bg-surface-elevated)', borderRadius: '6px' }}>
                  <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Budget Allocation Evaluated</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Earmarked capital allocation of ₹{interventionRecord.approvedCapitalLakhs} Lakhs evaluated against municipal infrastructure deficit.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.55rem', background: 'var(--bg-surface-elevated)', borderRadius: '6px' }}>
                  <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Infrastructure Deficit Assessed</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Targeted {currentIncident.category.toUpperCase()} deficit score evaluated against baseline standard.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.55rem', background: 'var(--bg-surface-elevated)', borderRadius: '6px' }}>
                  <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Demographic Vulnerability Factored</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Demographic equity weighted for {(currentIncident.demographics?.vulnerablePopulation || 45000).toLocaleString()} vulnerable residents.
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Single Primary Authoritative CTA Authorization Console */}
            <article
              style={{
                background: isApproved ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.06) 100%)' : 'var(--bg-surface)',
                border: isApproved ? '1.5px solid #10b981' : '1.5px solid #1e3a8a',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isApproved ? '#059669' : '#1e3a8a', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  <Shield size={14} />
                  <span>{isApproved ? 'Human Governance Approval Confirmed' : 'Human Governance Approval Required'}</span>
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.2rem 0 0.25rem 0', color: 'var(--text-primary)' }}>
                  {isApproved ? 'Intervention Approved & Recorded' : 'Authorize Capital Intervention'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {isApproved
                    ? `Capital allocation of ₹${interventionRecord.approvedCapitalLakhs} Lakhs approved by human officer. Record is committed to the NagarBodh operational audit trail.`
                    : 'By approving this intervention, you confirm human authorization and commit the project to the NagarBodh operational registry under Human-in-the-Loop governance.'}
                </p>
              </div>

              {/* Primary Action Button */}
              {isApproved ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid #10b981',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#065f46',
                      fontSize: '0.82rem',
                      fontWeight: 700
                    }}
                  >
                    <CheckCircle2 size={18} color="#059669" />
                    <span>Approved by: {interventionRecord.approvedBy || 'Duty Governance Officer [SIMULATION]'}</span>
                  </div>

                  <button
                    onClick={() => setActiveTab('impact')}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1.25rem',
                      background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 14px rgba(30, 58, 138, 0.3)'
                    }}
                  >
                    <span>Proceed to Impact Verification</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => openApprovalModal(currentIncident.id)}
                    style={{
                      width: '100%',
                      padding: '0.9rem 1.25rem',
                      background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 14px rgba(30, 58, 138, 0.35)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Shield size={17} />
                    <span>Review & Approve Intervention</span>
                  </button>

                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.35 }}>
                    Requires human officer review. No autonomous AI execution. Decision is recorded in the platform governance log.
                  </p>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>AUDIT TRAIL: {isApproved ? 'RECORDED' : 'PENDING'}</span>
                <span>STATUS: {isApproved ? 'APPROVED' : 'UNDER REVIEW'}</span>
              </div>
            </article>

          </div>

        </div>

        {/* Explainable Investment Dossier Slide-Over Drawer */}
        <ExplainableInvestmentDossierDrawer
          dossier={currentDossier}
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
        />

      </div>
    </div>
  );
};
