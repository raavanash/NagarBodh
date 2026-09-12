import React, { useState } from 'react';
import {
  ArrowDown,
  Building2,
  CheckCircle2,
  Edit3,
  ExternalLink,
  MapPin,
  ShieldAlert,
  XCircle
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { DevelopmentProjectRecommendation } from '../../types/development';
import { generateDevelopmentProjectRecommendation } from '../../engine/developmentRecommendationEngine';
import { IncidentLifecycleStepper } from './IncidentLifecycleStepper';
import { ResolutionVerificationPanel } from '../Verification/ResolutionVerificationPanel';
import { ExpandableEvidenceUI } from '../Evidence/ExpandableEvidenceUI';

export const ResponsePlannerView: React.FC = () => {
  const {
    incidents,
    approveDispatch,
    modifyDispatch,
    rejectDispatch,
    setSelectedIncidentId,
    setActiveTab
  } = useCivic();

  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Editable Recommendation Form State (for [Modify])
  const [editTitle, setEditTitle] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editCost, setEditCost] = useState<number>(350);
  const [editIntervention, setEditIntervention] = useState('');
  const [newActionText, setNewActionText] = useState('');

  const activeIncidents = incidents;
  const currentIncident = activeIncidents.find(i => i.id === selectedPlanId) || activeIncidents[0];

  // Resolve or generate structured DevelopmentProjectRecommendation for selected item
  const rec: DevelopmentProjectRecommendation | null = currentIncident
    ? (currentIncident.projectRecommendation || generateDevelopmentProjectRecommendation({
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
          population: 85000,
          populationDensity: 12000,
          populationGrowth: 2.1,
          urbanizationRate: 92,
          vulnerablePopulation: 35000,
          youthPopulation: 25000,
          elderlyPopulation: 10000,
          wardName: currentIncident.ward
        },
        infrastructure: currentIncident.infrastructure || {
          healthcareIndex: 40,
          educationIndex: 45,
          waterIndex: 35,
          sanitationIndex: 38,
          transportIndex: 42,
          electricityIndex: 50,
          digitalConnectivityIndex: 60
        },
        investment: currentIncident.investment || {
          existingInvestment: 200,
          plannedInvestment: 500,
          activeProjects: 2,
          plannedProjects: 1,
          investmentByCategory: {},
          investmentGapLakhs: 300,
          unaddressedRequestsCount: currentIncident.signalIds?.length || 15
        },
        evidence: currentIncident.evidence || [],
        sourceMode: 'SIMULATION'
      }))
    : null;

  const plan = currentIncident?.actionPlan;

  // Initialize edit fields when selection changes
  const handleSelectIncident = (incId: string) => {
    setSelectedPlanId(incId);
    const inc = incidents.find(i => i.id === incId);
    if (inc) {
      const itemRec = inc.projectRecommendation || rec;
      setEditTitle(itemRec?.title || inc.title);
      setEditDept(itemRec?.primaryDepartment || inc.actionPlan?.primaryDepartment || '');
      setEditCost(itemRec?.estimatedCostLakhs || 350);
      setEditIntervention(itemRec?.recommendedIntervention || '');
    }
  };

  const handleOpenModifyModal = () => {
    if (!rec) return;
    setEditTitle(rec.title);
    setEditDept(rec.primaryDepartment || '');
    setEditCost(rec.estimatedCostLakhs || 350);
    setEditIntervention(rec.recommendedIntervention);
    setIsModifyModalOpen(true);
  };

  const handleSaveModification = () => {
    if (!currentIncident || !rec) return;

    const updatedActions = [...(rec.recommendedActions || [])];
    if (newActionText.trim()) {
      updatedActions.push({
        id: `act-custom-${Date.now()}`,
        actionText: newActionText.trim(),
        department: editDept,
        rationale: 'Policymaker manual override action addition.',
        isSopRule: false,
        isAiRecommendation: false
      });
    }

    modifyDispatch(currentIncident.id, {
      responsibleDepartment: editDept,
      primaryDepartment: editDept,
      recommendedActions: updatedActions,
      actions: updatedActions.map(a => a.actionText)
    });

    setNewActionText('');
    setIsModifyModalOpen(false);
  };

  const handleConfirmReject = () => {
    if (!currentIncident) return;
    rejectDispatch(currentIncident.id, rejectReason || 'Policymaker requested manual project reassessment.');
    setRejectReason('');
    setIsRejectModalOpen(false);
  };

  return (
    <div className="planner-view-container" style={{ padding: '1.5rem', height: '100%', overflowY: 'auto', background: 'var(--bg-canvas)' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid var(--border-accent)' }}>
              <Building2 size={22} color="var(--cyan-400)" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Project Priorities
              </h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.88rem', color: '#0284c7', fontWeight: 600 }}>
                "What should policymakers consider?"
              </p>
            </div>
          </div>
        </div>

        {/* Policymaker Human Review Disclaimer Notice */}
        <div style={{
          marginTop: '0.85rem',
          padding: '0.65rem 0.95rem',
          borderRadius: '8px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.78rem',
          color: '#93c5fd'
        }}>
          <ShieldAlert size={16} color="#60a5fa" style={{ flexShrink: 0 }} />
          <div>
            <strong>Policymaker Governance Disclaimer:</strong> AI synthesizes evidence-backed candidate projects based on structured data. Final public investment approval and budget allocation remain exclusively under human policymaker authority.
          </div>
        </div>
      </div>

      {/* Grid Layout: Left Candidate Projects Queue, Right Detailed Recommendation View */}
      <div className="response-planner-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* Left Column: Candidate Projects Queue */}
        <div className="planner-queue-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Candidate Projects ({activeIncidents.length})</span>
            <span style={{ color: 'var(--cyan-400)' }}>Policy Review</span>
          </div>

          {activeIncidents.map(inc => {
            const isSelected = inc.id === (currentIncident?.id || activeIncidents[0]?.id);
            const isApproved = inc.actionPlan?.status === 'approved' || inc.projectRecommendation?.status === 'approved';
            const isRejected = inc.actionPlan?.status === 'rejected' || inc.projectRecommendation?.status === 'rejected';
            const isModified = inc.actionPlan?.status === 'modified' || inc.projectRecommendation?.status === 'modified';
            const isP1 = inc.priority.overallScore >= 80;

            const itemRecTitle = inc.projectRecommendation?.title || inc.title;

            return (
              <div
                key={inc.id}
                onClick={() => handleSelectIncident(inc.id)}
                style={{
                  background: isSelected ? 'var(--civic-blue-50)' : 'var(--bg-surface)',
                  border: isSelected ? '1.5px solid var(--civic-blue-600)' : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isApproved
                        ? 'rgba(52, 211, 153, 0.2)'
                        : isRejected
                        ? 'rgba(239, 68, 68, 0.2)'
                        : isModified
                        ? 'rgba(56, 189, 248, 0.2)'
                        : isP1
                        ? 'rgba(239, 68, 68, 0.25)'
                        : 'rgba(245, 158, 11, 0.2)',
                      color: isApproved ? '#34d399' : isRejected ? '#f87171' : isModified ? '#38bdf8' : isP1 ? '#f87171' : 'var(--amber-400)'
                    }}
                  >
                    {isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : isModified ? 'MODIFIED' : isP1 ? 'P1 PRIORITY' : 'P2 PRIORITY'}
                  </span>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                    PRIORITY {inc.priority.overallScore}/100
                  </span>
                </div>

                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem', lineHeight: 1.3 }}>
                  {itemRecTitle}
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={12} color="var(--cyan-400)" />
                  {inc.ward} ({inc.category})
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Project Recommendation Detailed 7-Section Card */}
        {currentIncident && rec ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Top Action Header Bar */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--cyan-400)', letterSpacing: '0.05em' }}>
                      CANDIDATE DEVELOPMENT PROJECT #{rec.id}
                    </span>
                    <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', background: 'var(--bg-surface-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                      STATUS: {(rec.status || 'pending_policy_review').toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {rec.title}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setSelectedIncidentId(currentIncident.id);
                    setActiveTab('live_map');
                  }}
                  className="sim-btn"
                  style={{ fontSize: '0.75rem' }}
                >
                  <span>View Location on Map</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>

            {/* Lifecycle Stepper */}
            <IncidentLifecycleStepper incidentId={currentIncident.id} />

            {/* Resolution Verification Panel (if in verifying state) */}
            {['resolving', 'resolved', 'verified'].includes(currentIncident.status) && (
              <ResolutionVerificationPanel incident={currentIncident} />
            )}

            {/* 7 STRUCTURED SECTIONS */}
            <div className="planner-pipeline-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* 1. PROBLEM STATEMENT */}
              <div className="card planner-stage-problem" style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>1</span>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f87171' }}>
                    PROBLEM STATEMENT & DEMAND CONTEXT
                  </h4>
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.45, background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '0.75rem' }}>
                  {rec.problemStatement}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.78rem' }}>
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.65rem', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>SECTOR CATEGORY:</span>
                    <div style={{ fontWeight: 700, color: 'var(--cyan-400)' }}>{(rec.category || 'OTHER').toString().toUpperCase()}</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.65rem', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>TARGET GEOGRAPHY:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{(rec.geography as any)?.district || (rec.geography as any)?.wardOrDistrict || currentIncident.ward}</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.65rem', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>LEAD AGENCY:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{rec.primaryDepartment || 'Ministry / State PWD'}</div>
                  </div>
                </div>
              </div>

              {/* PIPELINE DOWN ARROW */}
              <div className="pipeline-arrow" style={{ display: 'flex', justifyContent: 'center', margin: '-0.3rem 0' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowDown size={14} />
                </div>
              </div>

              {/* 2. SUPPORTING EVIDENCE */}
              <div className="card planner-stage-evidence" style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>2</span>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#38bdf8' }}>
                    SUPPORTING EVIDENCE & PROVENANCE
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', fontSize: '0.78rem', marginBottom: '1rem' }}>
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Citizen Demand Volume</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {currentIncident.signalIds.length} Corroborating Signals
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--cyan-400)', marginTop: '2px' }}>
                      +{currentIncident.velocitySurgePercent}% Demand Velocity
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Data Provenance</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                      Mode: <span style={{ color: 'var(--cyan-400)' }}>{rec.sourceMode || 'SIMULATION'}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '2px' }}>
                      Deterministic Baseline Verification
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Observed Citizen Excerpt</div>
                    <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '2px', lineHeight: 1.3 }}>
                      "{currentIncident.auditableInsight.observedData.rawExcerpts[0]?.original || 'Citizen requests urgent infrastructure intervention.'}"
                    </div>
                  </div>
                </div>

                <ExpandableEvidenceUI incident={currentIncident} />
              </div>

              {/* PIPELINE DOWN ARROW */}
              <div className="pipeline-arrow" style={{ display: 'flex', justifyContent: 'center', margin: '-0.3rem 0' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid #c084fc', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowDown size={14} />
                </div>
              </div>

              {/* 3. PRIORITY & DEVELOPMENT GAP */}
              <div className="card planner-stage-gap" style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>3</span>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c084fc' }}>
                    DEVELOPMENT GAP INDEX & PRIORITY SCORE
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Priority Level</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: rec.priorityScore >= 80 ? '#f87171' : '#fbbf24', marginTop: '2px' }}>
                      {rec.priorityScore}/100 — {rec.priorityLevel || 'P1 HIGH PRIORITY'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {rec.rationale}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Development Gap Breakdown</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '4px' }}>
                      <div>Overall Gap Index: <strong>{currentIncident.developmentGap?.overallGapIndex || rec.priorityScore}/100</strong></div>
                      <div>Demand Gap Score: <strong>{currentIncident.developmentGap?.demandGapScore || Math.round(rec.priorityScore * 0.3)}/30</strong></div>
                      <div>Infrastructure Deficit: <strong>{currentIncident.developmentGap?.infrastructureDeficitScore || Math.round(rec.priorityScore * 0.25)}/25</strong></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PIPELINE DOWN ARROW */}
              <div className="pipeline-arrow" style={{ display: 'flex', justifyContent: 'center', margin: '-0.3rem 0' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', border: '1px solid var(--cyan-400)', color: 'var(--cyan-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowDown size={14} />
                </div>
              </div>

              {/* 4. RECOMMENDED INTERVENTION */}
              <div className="card planner-stage-recommendation" style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--cyan-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>4</span>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--cyan-400)' }}>
                      RECOMMENDED INTERVENTION & ACTION ROSTER
                    </h4>
                  </div>
                </div>

                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                  💡 {rec.recommendedIntervention}
                </div>

                {/* Responsible & Supporting Departments */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Primary Nodal Agency</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {rec.primaryDepartment || 'State PWD / Municipal Authority'}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Estimated Outlay</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#34d399', marginTop: '0.2rem' }}>
                      ₹{rec.estimatedCostLakhs || 350} Lakhs
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Estimated Completion</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.2rem' }}>
                      {rec.estimatedCompletionMonths || 12} Months
                    </div>
                  </div>
                </div>

                {/* Action Items Checklist */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--cyan-400)', marginBottom: '0.6rem' }}>
                    Action Items Checklist (SOP vs AI Synthesis)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {(rec.recommendedActions || []).map((act, i) => (
                      <div
                        key={act.id || i}
                        style={{
                          padding: '0.75rem 0.9rem',
                          background: act.isAiRecommendation ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-surface-elevated)',
                          borderRadius: '8px',
                          border: act.isAiRecommendation ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.3rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: 18, height: 18, borderRadius: '50%', background: act.isAiRecommendation ? 'rgba(139, 92, 246, 0.3)' : 'rgba(6, 182, 212, 0.3)', color: act.isAiRecommendation ? '#c084fc' : 'var(--cyan-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>
                              {i + 1}
                            </span>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {act.actionText}
                            </span>
                          </div>

                          <span style={{
                            fontSize: '0.64rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: act.isAiRecommendation ? 'rgba(139, 92, 246, 0.25)' : 'rgba(6, 182, 212, 0.25)',
                            color: act.isAiRecommendation ? '#c084fc' : 'var(--cyan-400)',
                            flexShrink: 0
                          }}>
                            {act.isAiRecommendation ? '⚡ AI RECOMMENDATION' : '📜 OFFICIAL SOP RULE'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.73rem', color: '#94a3b8', paddingLeft: '1.6rem', fontFamily: 'var(--font-mono)' }}>
                          Rationale: {act.rationale}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* PIPELINE DOWN ARROW */}
              <div className="pipeline-arrow" style={{ display: 'flex', justifyContent: 'center', margin: '-0.3rem 0' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(52, 211, 153, 0.2)', border: '1px solid #34d399', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowDown size={14} />
                </div>
              </div>

              {/* 5. EXPECTED IMPACT */}
              <div className="card planner-stage-impact" style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>5</span>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#34d399' }}>
                    EXPECTED IMPACT & AUDITABLE OUTCOMES
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', fontSize: '0.78rem', marginBottom: '0.85rem' }}>
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>Expected Beneficiaries</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                      {rec.expectedBeneficiaries.toLocaleString()} Citizens
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>Infrastructure Deficit Reduction</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                      {rec.estimatedImpact.infrastructureIndexImprovement || rec.estimatedImpact.deficitReductionPercent || 65}%
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>Protected Critical Assets</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1.3 }}>
                      {rec.estimatedImpact.protectedAssets ? rec.estimatedImpact.protectedAssets.join(' • ') : 'Local Infrastructure'}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)', background: 'var(--bg-surface-elevated)', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                  "{rec.estimatedImpact.narrative}"
                </div>
              </div>

              {/* 6. IMPLEMENTATION CONSIDERATIONS */}
              <div className="card planner-stage-considerations" style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--amber-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>6</span>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--amber-400)' }}>
                    KEY IMPLEMENTATION CONSIDERATIONS
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                  {(rec.implementationConsiderations || []).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--amber-400)', fontWeight: 800 }}>•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. HUMAN REVIEW & POLICYMAKER DECISION PANEL */}
              <div className="card planner-decision-panel" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-accent)' }}>
                {rec.status === 'approved' || plan?.status === 'approved' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'rgba(16, 185, 129, 0.15)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <CheckCircle2 size={26} color="#34d399" />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          PROJECT APPROVED BY POLICYMAKER & STAGED FOR ALLOCATION
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>
                          Approved By: {rec.approvedBy || plan?.approvedBy || 'State Policymaker / Nodal Officer'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                      Human Policymaker Review Panel (Every decision is logged in immutable audit trail)
                    </div>

                    <div className="decision-buttons-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.85rem' }}>
                      {/* [Approve] Button */}
                      <button
                        onClick={() => approveDispatch(currentIncident.id, 'Candidate project approved by policymaker.')}
                        style={{
                          padding: '0.85rem 1.25rem',
                          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                        }}
                      >
                        <CheckCircle2 size={18} />
                        <span>[APPROVE PROJECT]</span>
                      </button>

                      {/* [Modify] Button */}
                      <button
                        onClick={handleOpenModifyModal}
                        style={{
                          padding: '0.85rem 1.25rem',
                          background: 'rgba(6, 182, 212, 0.15)',
                          border: '1.5px solid var(--cyan-400)',
                          borderRadius: '8px',
                          color: 'var(--cyan-400)',
                          fontWeight: 800,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Edit3 size={16} />
                        <span>[MODIFY PROJECT]</span>
                      </button>

                      {/* [Reject] Button */}
                      <button
                        onClick={() => setIsRejectModalOpen(true)}
                        style={{
                          padding: '0.85rem 1.25rem',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1.5px solid #ef4444',
                          borderRadius: '8px',
                          color: '#f87171',
                          fontWeight: 800,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <XCircle size={16} />
                        <span>[REJECT PROJECT]</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* AUDIT TRAIL LOG */}
              {plan?.auditTrail && plan.auditTrail.length > 0 && (
                <div className="card" style={{ padding: '1rem', background: 'rgba(7, 10, 19, 0.5)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Recommendation Audit Log Trail ({plan.auditTrail.length} Events Logged)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>
                    {plan.auditTrail.map((ev, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.6rem', color: '#cbd5e1' }}>
                        <span style={{ color: 'var(--cyan-400)' }}>[{new Date(ev.timestamp).toLocaleTimeString()}]</span>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{ev.actor}:</span>
                        <span>{ev.details}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a candidate project from the queue to review recommendation details.
          </div>
        )}
      </div>

      {/* MODAL: [MODIFY PROJECT] INTERACTIVE EDITOR */}
      {isModifyModalOpen && currentIncident && rec && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '650px', padding: '1.5rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--cyan-400)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Edit3 size={18} color="var(--cyan-400)" />
                Modify Development Project Recommendation #{rec.id}
              </h3>
              <button onClick={() => setIsModifyModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Project Title:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Primary Responding Department:</label>
                <input
                  type="text"
                  value={editDept}
                  onChange={e => setEditDept(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Estimated Cost Outlay (₹ Lakhs):</label>
                <input
                  type="number"
                  value={editCost}
                  onChange={e => setEditCost(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Add Custom Policymaker Action:</label>
                <input
                  type="text"
                  placeholder="e.g. Include additional mobile health van unit..."
                  value={newActionText}
                  onChange={e => setNewActionText(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setIsModifyModalOpen(false)}
                  style={{ padding: '0.6rem 1rem', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveModification}
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', background: 'var(--cyan-500)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Modifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: [REJECT PROJECT] */}
      {isRejectModalOpen && currentIncident && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem', background: 'var(--bg-surface-elevated)', border: '1px solid #ef4444' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171', marginBottom: '0.75rem' }}>
              Reject Candidate Development Project
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Please state the policymaker rationale for rejecting this candidate recommendation:
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Project overlapping with existing Smart City Masterplan phase 2..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              style={{ width: '100%', padding: '0.69rem', borderRadius: '6px', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.82rem', marginBottom: '1rem' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                style={{ padding: '0.6rem 1rem', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', background: '#ef4444', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
