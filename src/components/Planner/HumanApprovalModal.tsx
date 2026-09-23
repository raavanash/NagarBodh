import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { ActionItemRecommendation, ClusteredIncident, DispatchActionPlan, OperationalResourceItem } from '../../types/civic';
import { CheckCircle2, Shield, X, FileText, AlertTriangle, Building2, MapPin } from 'lucide-react';
import { buildCanonicalInterventionRecord } from '../../engine/developmentRecommendationEngine';

interface HumanApprovalModalContentProps {
  incident: ClusteredIncident;
  closeApprovalModal: () => void;
  approveDispatch: (incidentId: string, notes?: string, customPlan?: Partial<DispatchActionPlan>) => void;
  rejectDispatch: (incidentId: string, reason: string) => void;
  dispatchUnits: (incidentId: string, actor?: string, notes?: string) => void;
  modifyDispatch: (incidentId: string, updates: Partial<DispatchActionPlan>) => void;
  approveIntervention: (incidentId: string, approvedBy?: string, notes?: string) => void;
}

const HumanApprovalModalContent: React.FC<HumanApprovalModalContentProps> = ({
  incident: inc,
  closeApprovalModal,
  approveDispatch,
  rejectDispatch,
  dispatchUnits,
  modifyDispatch,
  approveIntervention
}) => {
  const plan = inc.actionPlan;
  const insight = inc.auditableInsight;

  const rec = inc.projectRecommendation;
  const interventionRecord = buildCanonicalInterventionRecord({ incident: inc, recommendation: rec });

  // Officer notes field
  const [officerNotes, setOfficerNotes] = useState<string>(
    'Reviewed empirical citizen distress signals, hydraulic deficit metrics, and demographic vulnerability. Capital intervention authorized for operational execution.'
  );

  const confidencePercent = Math.round((insight?.modelInference?.confidenceScore || 0.94) * 100);

  const handleApprove = () => {
    // 1. Approve intervention in canonical intervention lifecycle
    approveIntervention(inc.id, 'Municipal Governance Authority', officerNotes);

    // 2. Approve operational dispatch plan
    approveDispatch(inc.id, officerNotes, {
      primaryDepartment: plan?.primaryDepartment || rec?.primaryDepartment || 'Municipal Engineering & Drainage Wing',
      notes: officerNotes
    });

    closeApprovalModal();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2500,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.15s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeApprovalModal();
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: '580px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'zoomIn 0.2s ease-out'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                background: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Shield size={22} color="#1e3a8a" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#1e40af',
                    background: '#eff6ff',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  Statutory Authorization Order
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  • #{interventionRecord.recommendationId || 'NB-GOV-2025'}
                </span>
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Human Governance Sanction
              </h2>
            </div>
          </div>

          <button
            onClick={closeApprovalModal}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px'
            }}
            title="Cancel & Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Affirmation of Public Need & Intervention Card */}
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#1e3a8a' }}>
                Intervention Specification
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: inc.priority.overallScore >= 80 ? '#dc2626' : '#b45309',
                  background: inc.priority.overallScore >= 80 ? '#fee2e2' : '#fef3c7',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px'
                }}
              >
                PRIORITY SCORE: {inc.priority.overallScore}/100
              </span>
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {interventionRecord.projectTitle}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <MapPin size={13} color="#2563eb" />
              <span>{inc.ward}</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <Building2 size={13} color="#2563eb" />
              <span>{rec?.primaryDepartment || 'Municipal Engineering & Drainage Wing'}</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Committed Capital
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e3a8a', fontFamily: 'var(--font-mono)' }}>
                  ₹{interventionRecord.approvedCapitalLakhs} Lakhs
                </div>
                <span style={{ fontSize: '0.62rem', color: '#059669', fontWeight: 700 }}>
                  [PROJECTED ALLOCATION]
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Target Beneficiaries
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {(rec?.expectedBeneficiaries || 42300).toLocaleString()}
                </div>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Citizens Exposed [BASELINE]
                </span>
              </div>
            </div>
          </div>

          {/* Explicit Human-in-the-Loop Governance Mandate Notice */}
          <div
            style={{
              background: '#eff6ff',
              borderLeft: '4px solid #1e3a8a',
              borderRadius: '0 8px 8px 0',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1e3a8a', fontWeight: 800, fontSize: '0.74rem', textTransform: 'uppercase' }}>
              <Shield size={13} />
              <span>Human Authorization Mandate</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.76rem', color: '#1e40af', lineHeight: 1.4 }}>
              In accordance with NagarBodh Human-in-the-Loop governance principles, automated models calculate deficit rankings and propose evidence dossiers, but <strong>only an authorized human official can commit public funds and sanction operational intervention</strong>.
            </p>
          </div>

          {/* Officer Review Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Duty Officer Review & Sanction Notes:
            </label>
            <textarea
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.4,
                resize: 'none'
              }}
            />
          </div>

          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', justifyContent: 'space-between' }}>
            <span>AUTHORIZATION TIER: EXECUTIVE GOVERNANCE</span>
            <span>AUDIT INTEGRITY: SHA-256 SEALED</span>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: 'var(--bg-surface-elevated)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}
        >
          <button
            onClick={closeApprovalModal}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Cancel & Re-inspect
          </button>

          <button
            onClick={handleApprove}
            style={{
              padding: '0.6rem 1.35rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
            }}
          >
            <CheckCircle2 size={16} />
            <span>Confirm & Approve</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export const HumanApprovalModal: React.FC = () => {
  const {
    isApprovalModalOpen,
    closeApprovalModal,
    selectedIncident,
    selectedIncidentId,
    incidents,
    approveDispatch,
    rejectDispatch,
    dispatchUnits,
    modifyDispatch,
    approveIntervention
  } = useCivic();

  const effectiveIncident = selectedIncident || incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  if (!isApprovalModalOpen || !effectiveIncident) return null;

  return (
    <HumanApprovalModalContent
      incident={effectiveIncident}
      closeApprovalModal={closeApprovalModal}
      approveDispatch={approveDispatch}
      rejectDispatch={rejectDispatch}
      dispatchUnits={dispatchUnits}
      modifyDispatch={modifyDispatch}
      approveIntervention={approveIntervention}
    />
  );
};
