import React from 'react';
import { useCivic } from '../../context/CivicContext';

export type JudgingStep = 'INVEST' | 'EVIDENCE' | 'EXPLAIN' | 'DECIDE' | 'APPROVE' | 'MEASURE';

export interface InterventionContextData {
  projectTitle?: string;
  locationName?: string;
  approvedCapitalLakhs?: number;
  priorityScore?: number;
  priorityLevel?: string;
  status?: string;
  dataMode?: string;
}

interface Props {
  currentStep: JudgingStep;
  compact?: boolean;
  intervention?: InterventionContextData | null;
  className?: string;
}

const STEPS: Array<{ key: JudgingStep; label: string; num: number; targetTab: string }> = [
  { key: 'INVEST', label: '1. INVEST', num: 1, targetTab: 'investment_gaps' },
  { key: 'EVIDENCE', label: '2. EVIDENCE', num: 2, targetTab: 'development_map' },
  { key: 'EXPLAIN', label: '3. EXPLAIN', num: 3, targetTab: 'demand_intelligence' },
  { key: 'DECIDE', label: '4. DECIDE', num: 4, targetTab: 'project_priorities' },
  { key: 'APPROVE', label: '5. APPROVE', num: 5, targetTab: 'project_priorities' },
  { key: 'MEASURE', label: '6. MEASURE', num: 6, targetTab: 'impact' }
];

export const JudgingJourneyStepper: React.FC<Props> = ({
  currentStep,
  compact = false,
  intervention,
  className = ''
}) => {
  const { setActiveTab } = useCivic();
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <div
      className={`judging-journey-stepper ${className}`}
      style={{
        background: 'var(--bg-canvas)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: compact ? '0.5rem 0.85rem' : '0.75rem 1.15rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}
    >
      {/* Persistent Intervention Context Strip */}
      {intervention && intervention.projectTitle && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            paddingBottom: '0.45rem',
            borderBottom: '1px dashed var(--border-subtle)',
            fontSize: '0.74rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              ACTIVE INTERVENTION:
            </span>
            <span style={{ color: 'var(--cyan-400)', fontWeight: 700 }}>
              {intervention.projectTitle}
            </span>
            {intervention.locationName && (
              <span style={{ color: 'var(--text-muted)' }}>
                ({intervention.locationName})
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {intervention.approvedCapitalLakhs !== undefined && (
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{intervention.approvedCapitalLakhs} Lakhs
              </span>
            )}
            {intervention.status && (
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  fontFamily: 'var(--font-mono)',
                  background:
                    intervention.status === 'APPROVED' ||
                    intervention.status === 'INTERVENTION_RECORDED' ||
                    intervention.status === 'IMPACT_MEASURED'
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(37, 99, 235, 0.15)',
                  color:
                    intervention.status === 'APPROVED' ||
                    intervention.status === 'INTERVENTION_RECORDED' ||
                    intervention.status === 'IMPACT_MEASURED'
                      ? '#34d399'
                      : '#60a5fa',
                  border: `1px solid ${
                    intervention.status === 'APPROVED' ||
                    intervention.status === 'INTERVENTION_RECORDED' ||
                    intervention.status === 'IMPACT_MEASURED'
                      ? '#10b981'
                      : '#3b82f6'
                  }`
                }}
              >
                {intervention.status}
              </span>
            )}
            <span
              style={{
                fontSize: '0.62rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px'
              }}
            >
              [{intervention.dataMode || 'SIMULATION'}]
            </span>
          </div>
        </div>
      )}

      {/* 6-Stage Linear Interactive Stepper */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.35rem',
          fontSize: compact ? '0.7rem' : '0.74rem'
        }}
      >
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <React.Fragment key={step.key}>
              <button
                onClick={() => setActiveTab(step.targetTab as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontWeight: isActive ? 800 : isCompleted ? 700 : 500,
                  color: isActive
                    ? 'var(--cyan-400)'
                    : isCompleted
                    ? '#10b981'
                    : 'var(--text-muted)',
                  background: isActive
                    ? 'rgba(6, 182, 212, 0.12)'
                    : 'transparent',
                  padding: isActive ? '0.2rem 0.55rem' : '0.15rem 0.25rem',
                  borderRadius: '6px',
                  border: isActive
                    ? '1px solid rgba(6, 182, 212, 0.35)'
                    : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease-in-out'
                }}
                title={`Navigate to Stage ${step.num}: ${step.label}`}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: isActive
                      ? '#0284c7'
                      : isCompleted
                      ? '#10b981'
                      : 'var(--bg-surface-elevated)',
                    color: isActive || isCompleted ? '#ffffff' : 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.62rem',
                    fontWeight: 800
                  }}
                >
                  {step.num}
                </span>
                <span>{step.label}</span>
              </button>

              {idx < STEPS.length - 1 && (
                <span style={{ color: 'var(--border-medium)', fontSize: '0.7rem' }}>
                  →
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
