import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  Building2,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  Flame,
  Layers,
  MapPin,
  Megaphone,
  Radio,
  Send,
  ShieldAlert,
  Sparkles,
  Truck,
  UserCheck,
  Users,
  Wrench,
  XCircle
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { ActionItemRecommendation, DynamicResponsePlan, OperationalResourceItem } from '../../types/civic';
import { IncidentLifecycleStepper } from './IncidentLifecycleStepper';
import { ResolutionVerificationPanel } from '../Verification/ResolutionVerificationPanel';

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
  const [approvalNotes, setApprovalNotes] = useState('');

  // Editable Plan Form State (for [Modify])
  const [editDept, setEditDept] = useState('');
  const [editEta, setEditEta] = useState<number>(20);
  const [editAdvisory, setEditAdvisory] = useState('');
  const [newActionText, setNewActionText] = useState('');

  const activeIncidents = incidents;
  const currentIncident = activeIncidents.find(i => i.id === selectedPlanId) || activeIncidents.find(i => i.actionPlan) || activeIncidents[0];
  const plan = currentIncident?.actionPlan;

  // Initialize edit fields when plan selection changes
  const handleSelectIncident = (incId: string) => {
    setSelectedPlanId(incId);
    const inc = incidents.find(i => i.id === incId);
    if (inc?.actionPlan) {
      setEditDept(inc.actionPlan.responsibleDepartment || inc.actionPlan.primaryDepartment || '');
      setEditEta(inc.actionPlan.estimatedResponseTimeMinutes || inc.actionPlan.etaMinutes || 20);
      setEditAdvisory(inc.actionPlan.publicCommunication?.citizenAdvisory || '');
    }
  };

  const handleOpenModifyModal = () => {
    if (!plan) return;
    setEditDept(plan.responsibleDepartment || plan.primaryDepartment);
    setEditEta(plan.estimatedResponseTimeMinutes || plan.etaMinutes);
    setEditAdvisory(plan.publicCommunication?.citizenAdvisory || '');
    setIsModifyModalOpen(true);
  };

  const handleSaveModification = () => {
    if (!currentIncident || !plan) return;

    const updatedActions = [...plan.recommendedActions];
    if (newActionText.trim()) {
      updatedActions.push({
        id: `act-custom-${Date.now()}`,
        actionText: newActionText.trim(),
        department: editDept,
        rationale: 'Human Commander manual override action addition.',
        isSopRule: false,
        isAiRecommendation: false
      });
    }

    modifyDispatch(currentIncident.id, {
      responsibleDepartment: editDept,
      primaryDepartment: editDept,
      estimatedResponseTimeMinutes: editEta,
      etaMinutes: editEta,
      recommendedActions: updatedActions,
      actions: updatedActions.map(a => a.actionText),
      publicCommunication: {
        ...plan.publicCommunication,
        citizenAdvisory: editAdvisory
      }
    });

    setNewActionText('');
    setIsModifyModalOpen(false);
  };

  const handleConfirmReject = () => {
    if (!currentIncident) return;
    rejectDispatch(currentIncident.id, rejectReason || 'Commander requested manual reassessment.');
    setRejectReason('');
    setIsRejectModalOpen(false);
  };

  return (
    <div style={{ padding: '1.5rem', height: '100%', overflowY: 'auto', background: 'var(--bg-canvas)' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid var(--border-accent)' }}>
              <Send size={22} color="var(--cyan-400)" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
                AI Response Planner & SOP Execution Engine
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Auditable, evidence-backed action plans combining deterministic government SOP rules with Gemini AI evidence adaptation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Left Queue, Right 4-Stage Response Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left Column: Active Incidents Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Active Incidents Queue ({activeIncidents.length})</span>
            <span style={{ color: 'var(--cyan-400)' }}>1-Click Approval</span>
          </div>

          {activeIncidents.map(inc => {
            const isSelected = inc.id === (currentIncident?.id || activeIncidents[0]?.id);
            const isApproved = inc.actionPlan?.status === 'approved';
            const isRejected = inc.actionPlan?.status === 'rejected';
            const isModified = inc.actionPlan?.status === 'modified';
            const isP1 = inc.priority.overallScore >= 80;

            return (
              <div
                key={inc.id}
                onClick={() => handleSelectIncident(inc.id)}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(30, 41, 59, 0.95) 100%)'
                    : 'var(--bg-surface)',
                  border: isSelected ? '1.5px solid var(--cyan-400)' : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 8px 20px rgba(6, 182, 212, 0.25)' : 'none'
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
                    {isApproved ? 'DISPATCHED' : isRejected ? 'REJECTED' : isModified ? 'MODIFIED' : inc.priority.level.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#fff', marginLeft: 'auto' }}>
                    PRIORITY {inc.priority.overallScore}/100
                  </span>
                </div>

                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem', lineHeight: 1.3 }}>
                  {inc.title}
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={12} color="var(--cyan-400)" />
                  {inc.ward}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: 4-Stage Response Pipeline View */}
        {currentIncident && plan ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Top Action Header Bar */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--cyan-400)', letterSpacing: '0.05em' }}>
                      AUDITABLE RESPONSE PLAN #{plan.id}
                    </span>
                    <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>
                      STATUS: {currentIncident.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                    {currentIncident.title}
                  </h3>
                </div>

                {/* View on Map Button */}
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

            {/* 9-State Lifecycle Stepper & Governance Control */}
            <IncidentLifecycleStepper incidentId={currentIncident.id} />

            {/* Resolution Verification Panel (shown when resolving, resolved, or verified) */}
            {['resolving', 'resolved', 'verified'].includes(currentIncident.status) && (
              <ResolutionVerificationPanel incident={currentIncident} />
            )}

            {/* PIPELINE CONTAINER STAGES: EVIDENCE ↓ SITUATION ASSESSMENT ↓ RECOMMENDED ACTION ↓ EXPECTED IMPACT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* STAGE 1: EVIDENCE */}
              <div className="card" style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>1</span>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#38bdf8' }}>
                    EVIDENCE & TELEMETRY INPUTS
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', fontSize: '0.78rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Corroborating Signals</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                      {currentIncident.auditableInsight.observedData.signalIds.length} Signals
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--cyan-400)', marginTop: '2px' }}>
                      +{currentIncident.velocitySurgePercent}% Velocity Surge
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Nearest Critical Assets</div>
                    <div style={{ color: '#f8fafc', fontWeight: 600, marginTop: '2px' }}>
                      🏫 {currentIncident.auditableInsight.calculatedMetrics.nearestSchoolName || 'St. Jude School'} ({currentIncident.auditableInsight.calculatedMetrics.nearestSchoolDistanceMeters || 120}m)
                    </div>
                    <div style={{ color: '#f8fafc', fontWeight: 600, marginTop: '2px' }}>
                      🏥 {currentIncident.auditableInsight.calculatedMetrics.nearestHospitalName || 'Sanjivani Hospital'} ({currentIncident.auditableInsight.calculatedMetrics.nearestHospitalDistanceMeters || 250}m)
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Observed Excerpts</div>
                    <div style={{ fontStyle: 'italic', color: '#cbd5e1', fontSize: '0.72rem', marginTop: '2px', lineHeight: 1.3 }}>
                      "{currentIncident.auditableInsight.observedData.rawExcerpts[0]?.original || 'Knee-deep water trapped school bus under subway'}"
                    </div>
                  </div>
                </div>
              </div>

              {/* PIPELINE DOWN ARROW */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.3rem 0' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', border: '1px solid var(--cyan-400)', color: 'var(--cyan-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowDown size={16} />
                </div>
              </div>

              {/* STAGE 2: SITUATION ASSESSMENT */}
              <div className="card" style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>2</span>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c084fc' }}>
                    SITUATION ASSESSMENT & ESCALATION CONDITION
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      AI Situation Summary
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#fff', lineHeight: 1.4, background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                      {plan.situationAssessment?.summary || currentIncident.auditableInsight.modelInference.summary}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Priority & Target SLA
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
                      <div>Priority Level: <strong style={{ color: plan.priorityLevel === 'P1_CRITICAL' ? '#f87171' : '#fbbf24' }}>{plan.priority || plan.priorityLevel}</strong></div>
                      <div>SLA Target: <strong style={{ color: '#38bdf8' }}>{plan.sla || `${plan.slaHours} Hours`}</strong></div>
                      <div>Estimated Response Time: <strong style={{ color: '#34d399' }}>~{plan.estimatedResponseTimeMinutes || plan.etaMinutes} Minutes</strong></div>
                    </div>
                  </div>
                </div>

                {/* Escalation Condition Card */}
                <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem 1rem', borderRadius: '8px', color: '#fca5a5', fontSize: '0.78rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ color: '#fff', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>Automated Escalation Trigger Condition:</strong>
                    <div style={{ marginTop: '0.2rem', lineHeight: 1.4 }}>
                      {plan.escalationCondition || 'If water depth exceeds 3.5 feet or un-drained within 45 minutes of pump deployment, escalate immediately to District Disaster Management Authority (DDMA).'}
                    </div>
                  </div>
                </div>
              </div>

              {/* PIPELINE DOWN ARROW */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.3rem 0' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid #c084fc', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowDown size={16} />
                </div>
              </div>

              {/* STAGE 3: RECOMMENDED ACTION */}
              <div className="card" style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--cyan-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>3</span>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--cyan-400)' }}>
                      RECOMMENDED ACTION & DEPLOYMENT ROSTER
                    </h4>
                  </div>
                </div>

                {/* Responsible & Supporting Departments */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Building2 size={13} color="#38bdf8" />
                      Lead Responding Agency
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
                      {plan.responsibleDepartment || plan.primaryDepartment}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Users size={13} color="#c084fc" />
                      Coordinated Supporting Agencies
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginTop: '0.2rem' }}>
                      {Array.isArray(plan.supportingDepartments) ? plan.supportingDepartments.join(' • ') : (plan.secondaryDepartment || 'Traffic Police & Civil Defence')}
                    </div>
                  </div>
                </div>

                {/* SOP Action Items Checklist with SOP vs AI Recommendation Badges & Evidence Rationale */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--cyan-400)', marginBottom: '0.6rem' }}>
                    Actions Checklist (Why Each Action is Recommended)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {(plan.recommendedActions && plan.recommendedActions.length > 0
                      ? plan.recommendedActions
                      : plan.actions.map((act, idx) => ({
                          id: `act-${idx}`,
                          actionText: act,
                          department: plan.primaryDepartment,
                          rationale: 'Standard deterministic SOP operational rule.',
                          isSopRule: true,
                          isAiRecommendation: false
                        }))
                    ).map((actionItem: ActionItemRecommendation, i) => (
                      <div
                        key={actionItem.id || i}
                        style={{
                          padding: '0.75rem 0.9rem',
                          background: actionItem.isAiRecommendation ? 'rgba(139, 92, 246, 0.12)' : 'rgba(7, 10, 19, 0.5)',
                          borderRadius: '8px',
                          border: actionItem.isAiRecommendation ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.3rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: 18, height: 18, borderRadius: '50%', background: actionItem.isAiRecommendation ? 'rgba(139, 92, 246, 0.3)' : 'rgba(6, 182, 212, 0.3)', color: actionItem.isAiRecommendation ? '#c084fc' : 'var(--cyan-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>
                              {i + 1}
                            </span>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
                              {actionItem.actionText}
                            </span>
                          </div>

                          <span style={{
                            fontSize: '0.64rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: actionItem.isAiRecommendation ? 'rgba(139, 92, 246, 0.25)' : 'rgba(6, 182, 212, 0.25)',
                            color: actionItem.isAiRecommendation ? '#c084fc' : 'var(--cyan-400)',
                            flexShrink: 0
                          }}>
                            {actionItem.isAiRecommendation ? '⚡ AI RECOMMENDATION' : '📜 OFFICIAL SOP RULE'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.73rem', color: '#94a3b8', paddingLeft: '1.6rem', fontFamily: 'var(--font-mono)' }}>
                          Rationale: {actionItem.rationale}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operational Required Resources Table */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--cyan-400)', marginBottom: '0.5rem' }}>
                    Required Equipment & Heavy Machinery Roster
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.4rem 0.6rem' }}>Resource Item</th>
                        <th style={{ padding: '0.4rem 0.6rem' }}>Quantity</th>
                        <th style={{ padding: '0.4rem 0.6rem' }}>Assigned Unit</th>
                        <th style={{ padding: '0.4rem 0.6rem' }}>Type Tag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(plan.requiredResources && plan.requiredResources.length > 0
                        ? plan.requiredResources
                        : plan.equipment.map((eq, idx) => ({
                            item: eq.name,
                            quantity: `${eq.count} Unit`,
                            assignedUnit: eq.assignedUnit,
                            status: eq.status || 'ready',
                            isSopResource: true,
                            isAiRecommendation: false
                          }))
                      ).map((res: OperationalResourceItem, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '0.55rem 0.6rem', fontWeight: 600, color: '#fff' }}>{res.item}</td>
                          <td style={{ padding: '0.55rem 0.6rem', fontFamily: 'var(--font-mono)' }}>{res.quantity}</td>
                          <td style={{ padding: '0.55rem 0.6rem', color: 'var(--text-secondary)' }}>{res.assignedUnit}</td>
                          <td style={{ padding: '0.55rem 0.6rem' }}>
                            <span style={{
                              fontSize: '0.64rem',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: res.isAiRecommendation ? 'rgba(139, 92, 246, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                              color: res.isAiRecommendation ? '#c084fc' : '#38bdf8'
                            }}>
                              {res.isAiRecommendation ? 'AI RECOMMENDATION' : 'SOP INVENTORY'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Citizen-Facing Public Communication Card */}
                {plan.publicCommunication && (
                  <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--cyan-400)', marginBottom: '0.3rem' }}>
                      <Megaphone size={14} />
                      Citizen-Facing Public Communication Broadcast
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#fff', fontStyle: 'italic', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                      "{plan.publicCommunication.citizenAdvisory}"
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                      <span>Broadcast Channels: {plan.publicCommunication.targetChannels.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* PIPELINE DOWN ARROW */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.3rem 0' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(52, 211, 153, 0.2)', border: '1px solid #34d399', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowDown size={16} />
                </div>
              </div>

              {/* STAGE 4: EXPECTED IMPACT */}
              <div className="card" style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>4</span>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#34d399' }}>
                    EXPECTED IMPACT & AUDITABLE OUTCOMES
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', fontSize: '0.78rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>Hazard Reduction</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                      {plan.expectedImpact?.hazardReductionPercent || 85}% Reduction
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Within 45 mins of pumping</div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>Protected Assets</div>
                    <div style={{ fontSize: '0.75rem', color: '#fff', marginTop: '2px', lineHeight: 1.3 }}>
                      {plan.expectedImpact?.protectedAssets ? plan.expectedImpact.protectedAssets.join(' • ') : 'St. Jude School, Sanjivani Hospital'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>SLA Compliance</div>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '2px', lineHeight: 1.3 }}>
                      {plan.expectedImpact?.slaImpactDescription || `Maintains ward SLA target (~${plan.slaHours}h).`}
                    </div>
                  </div>
                </div>
              </div>

              {/* THREE DECISION ACTION BUTTONS: [Approve] [Modify] [Reject] */}
              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-accent)' }}>
                {plan.status === 'approved' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'rgba(16, 185, 129, 0.15)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <CheckCircle2 size={26} color="#34d399" />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                          ACTION PLAN AUTHORIZED & FIELD DISPATCH ACTIVE
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>
                          Authorized By: {plan.approvedBy || 'Municipal Operations Commander'} • Dispatched At: {plan.dispatchedAt || 'Active'}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: '#34d399', fontWeight: 700 }}>
                      Target Arrival: ~{plan.estimatedResponseTimeMinutes || plan.etaMinutes} mins
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                      Human-in-the-Loop Decision Panel (Every action is recorded in audit log)
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.85rem' }}>
                      {/* [Approve] Button */}
                      <button
                        onClick={() => approveDispatch(currentIncident.id, approvalNotes)}
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
                        <span>[APPROVE DISPATCH]</span>
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
                        <span>[MODIFY PLAN]</span>
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
                        <span>[REJECT PLAN]</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* AUDIT TRAIL LOG FOR THIS ACTION PLAN */}
              {plan.auditTrail && plan.auditTrail.length > 0 && (
                <div className="card" style={{ padding: '1rem', background: 'rgba(7, 10, 19, 0.5)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Plan Audit Log Trail ({plan.auditTrail.length} Events Recorded)
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
            Select an incident from the queue to generate dynamic response plan.
          </div>
        )}
      </div>

      {/* MODAL: [MODIFY PLAN] INTERACTIVE EDITOR */}
      {isModifyModalOpen && currentIncident && plan && (
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Edit3 size={18} color="var(--cyan-400)" />
                Modify Dynamic Response Plan #{plan.id}
              </h3>
              <button onClick={() => setIsModifyModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Lead Responding Department:</label>
                <input
                  type="text"
                  value={editDept}
                  onChange={e => setEditDept(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-accent)', color: '#fff', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Target Response ETA (Minutes):</label>
                <input
                  type="number"
                  value={editEta}
                  onChange={e => setEditEta(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-accent)', color: '#fff', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Add Custom Commander Action:</label>
                <input
                  type="text"
                  placeholder="e.g. Deploy 100 extra sandbags along subway entrance..."
                  value={newActionText}
                  onChange={e => setNewActionText(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-accent)', color: '#fff', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Public Citizen Advisory Text:</label>
                <textarea
                  rows={3}
                  value={editAdvisory}
                  onChange={e => setEditAdvisory(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-accent)', color: '#fff', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button onClick={() => setIsModifyModalOpen(false)} className="sim-btn" style={{ fontSize: '0.8rem' }}>Cancel</button>
                <button onClick={handleSaveModification} style={{ padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem' }}>
                  Save & Apply Plan Modifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: [REJECT PLAN] PROMPT */}
      {isRejectModalOpen && currentIncident && plan && (
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <XCircle size={18} />
              Reject Response Plan #{plan.id}?
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Rejecting this action plan will flag it for manual re-assessment and notify the operations control desk.
            </p>

            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontSize: '0.78rem', fontWeight: 600 }}>Rejection Reason / Override Note:</label>
            <textarea
              rows={3}
              placeholder="e.g. Duplicate action plan, resource already deployed by PWD..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-accent)', color: '#fff', fontSize: '0.82rem', marginBottom: '1rem' }}
            />

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsRejectModalOpen(false)} className="sim-btn" style={{ fontSize: '0.8rem' }}>Cancel</button>
              <button onClick={handleConfirmReject} style={{ padding: '0.6rem 1.2rem', background: '#ef4444', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem' }}>
                Confirm Rejection & Log Audit Event
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
