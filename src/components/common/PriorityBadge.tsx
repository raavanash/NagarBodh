import React from 'react';

interface PriorityBadgeProps {
  score: number;
  level?: 'P1' | 'P2' | 'P3' | string;
  showScore?: boolean;
  compact?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  score,
  level,
  showScore = true,
  compact = false
}) => {
  const isP1 = score >= 80 || level === 'P1' || level?.includes('P1');
  const isP2 = (score >= 60 && score < 80) || level === 'P2' || level?.includes('P2');

  const bg = isP1
    ? 'rgba(239, 68, 68, 0.18)'
    : isP2
    ? 'rgba(217, 119, 6, 0.18)'
    : 'rgba(2, 132, 199, 0.18)';

  const color = isP1 ? '#dc2626' : isP2 ? '#d97706' : '#0284c7';
  const border = isP1 ? '1px solid #fca5a5' : isP2 ? '1px solid #fcd34d' : '1px solid #93c5fd';
  const labelText = isP1 ? 'P1 CRITICAL' : isP2 ? 'P2 HIGH' : 'P3 STANDARD';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontSize: compact ? '0.65rem' : '0.72rem',
        fontWeight: 800,
        fontFamily: 'var(--font-mono)',
        padding: compact ? '0.1rem 0.35rem' : '0.2rem 0.55rem',
        borderRadius: '4px',
        background: bg,
        color: color,
        border: border,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: color
        }}
      />
      <span>{labelText}</span>
      {showScore && <span>({Math.round(score)}/100)</span>}
    </span>
  );
};
