import React from 'react';
import { ShieldAlert, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  message = 'No development intelligence data matches your filter criteria.',
  icon: Icon = ShieldAlert,
  actionLabel,
  onAction
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}
    >
      <Icon size={36} color="var(--text-muted)" style={{ marginBottom: '0.85rem', opacity: 0.5 }} />
      <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 0 1rem 0', lineHeight: 1.4 }}>
        {message}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="sim-btn"
          style={{ fontSize: '0.78rem', fontWeight: 700 }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
