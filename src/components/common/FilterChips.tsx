import React from 'react';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  selectedId,
  onSelect,
  compact = false
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        flexWrap: 'wrap'
      }}
    >
      {options.map(opt => {
        const isSelected = opt.id === selectedId;

        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            style={{
              padding: compact ? '0.25rem 0.55rem' : '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: compact ? '0.7rem' : '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: isSelected ? '1px solid var(--civic-blue-600)' : '1px solid var(--border-subtle)',
              background: isSelected ? 'var(--civic-blue-50)' : 'var(--bg-surface)',
              color: isSelected ? 'var(--civic-blue-600)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                style={{
                  fontSize: '0.64rem',
                  fontFamily: 'var(--font-mono)',
                  padding: '1px 5px',
                  borderRadius: '999px',
                  background: isSelected ? 'var(--civic-blue-600)' : 'var(--bg-surface-elevated)',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
