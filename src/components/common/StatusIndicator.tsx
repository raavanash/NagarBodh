import React from 'react';

interface StatusIndicatorProps {
  status: 'live' | 'simulation' | 'replay' | 'warning' | 'error';
  label: string;
  sublabel?: string;
  pulse?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  sublabel,
  pulse = true
}) => {
  let color = '#059669';
  let bg = '#d1fae5';
  let border = '#6ee7b7';

  if (status === 'simulation' || status === 'replay') {
    color = '#2563eb';
    bg = '#eff6ff';
    border = '#bfdbfe';
  } else if (status === 'warning') {
    color = '#b45309';
    bg = '#fef3c7';
    border = '#fcd34d';
  } else if (status === 'error') {
    color = '#dc2626';
    bg = '#fee2e2';
    border = '#fca5a5';
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.2rem 0.55rem',
        borderRadius: '16px',
        background: bg,
        border: `1px solid ${border}`,
        color: color,
        fontSize: '0.68rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: color,
          animation: pulse ? 'pulseRing 2s infinite' : 'none'
        }}
      />
      <span>{label}</span>
      {sublabel && <span style={{ opacity: 0.75 }}>• {sublabel}</span>}
    </div>
  );
};
