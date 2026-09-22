import React from 'react';

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

const STEPS: Array<{ key: JudgingStep; label: string; num: number }> = [
  { key: 'INVEST', label: '1. INVEST', num: 1 },
  { key: 'EVIDENCE', label: '2. EVIDENCE', num: 2 },
  { key: 'EXPLAIN', label: '3. EXPLAIN', num: 3 },
  { key: 'DECIDE', label: '4. DECIDE', num: 4 },
  { key: 'APPROVE', label: '5. APPROVE', num: 5 },
  { key: 'MEASURE', label: '6. MEASURE', num: 6 }
];

export const JudgingJourneyStepper: React.FC<Props> = ({
  currentStep,
  compact = false,
  intervention,
  className = ''
}) => {
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
      {/* Optional Persistent Context Strip */}
      {intervention && intervention.projectTitle && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            paddingBottom: '0.45rem',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.74rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                background: 'rgba(37, 99, 235, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                padding: '0.1rem 0.45rem',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              ACTIVE INTERVENTION
            </span>
            <strong style={{ color: 'var(--text-primary)' }}>{intervention.projectTitle}</strong>
            {intervention.locationName && (
              <span style={{ color: 'var(--text-muted)' }}>• {intervention.locationName}</span>
            )}
            {intervention.approvedCapitalLakhs !== undefined && (
              <span style={{ color: '#10b981', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                • ₹{intervention.approvedCapitalLakhs}L
              </span>
            )}
            {intervention.priorityScore !== undefined && (
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                • Priority {intervention.priorityScore}/100
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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

      {/* 6-Stage Linear Stepper */}
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
              <div
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
                  transition: 'all 0.2s ease'
                }}
              >
                <span>
                  {isCompleted ? '✓ ' : isActive ? '● ' : '○ '}
                  {step.label}
                  {isActive ? ' [ACTIVE]' : ''}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', opacity: 0.6 }}>➔</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
