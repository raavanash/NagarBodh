import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: string;
  trendPositive?: boolean;
  borderLeftColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor = '#2563eb',
  trend,
  trendPositive = true,
  borderLeftColor
}) => {
  return (
    <div
      className="card metric-card"
      style={{
        padding: '0.85rem 1rem',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderLeft: borderLeftColor ? `4px solid ${borderLeftColor}` : '1px solid var(--border-subtle)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
        transition: 'all 0.15s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && <Icon size={16} color={iconColor} />}
      </div>

      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
        {value}
      </div>

      {(subtext || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
          {subtext && <span>{subtext}</span>}
          {trend && (
            <span style={{ color: trendPositive ? '#059669' : '#dc2626', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
