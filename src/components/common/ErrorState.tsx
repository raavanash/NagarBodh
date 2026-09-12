import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Telemetry Stream Disturbed',
  message = 'An error occurred while loading regional development context. Please retry or check network connectivity.',
  onRetry
}) => {
  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        borderRadius: '8px',
        background: 'rgba(220, 38, 38, 0.08)',
        border: '1px solid rgba(220, 38, 38, 0.3)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem'
      }}
    >
      <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#dc2626', margin: '0 0 0.2rem 0' }}>
          {title}
        </h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: '0 0 0.6rem 0', lineHeight: 1.4 }}>
          {message}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: '#dc2626',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={12} />
            <span>Retry Operation</span>
          </button>
        )}
      </div>
    </div>
  );
};
