import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Eye,
  Filter,
  Globe,
  Info,
  Layers,
  Link as LinkIcon,
  MapPin,
  Search,
  Shield,
  Tag
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { ClusteredIncident, EvidenceItem } from '../../types/civic';
import { generateIncidentEvidenceChain } from '../../engine/evidenceProvenanceEngine';

// Reusable Presentation Components
export const ProvenanceBadge: React.FC<{
  label: string;
  type?: 'source' | 'type' | 'observed' | 'calculated' | 'inference' | 'recommended' | 'live' | 'replay' | 'simulation';
}> = ({ label, type = 'source' }) => {
  const getStyle = () => {
    switch (type) {
      case 'observed':
        return { bg: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' };
      case 'calculated':
        return { bg: '#d1fae5', color: '#059669', border: '1px solid #a7f3d0' };
      case 'inference':
        return { bg: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' };
      case 'recommended':
        return { bg: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' };
      case 'live':
        return { bg: '#d1fae5', color: '#047857', border: '1px solid #6ee7b7' };
      case 'replay':
        return { bg: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' };
      case 'simulation':
        return { bg: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' };
      case 'type':
        return { bg: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' };
      default:
        return { bg: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' };
    }
  };
  const style = getStyle();
  return (
    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.12rem 0.45rem', borderRadius: '4px', background: style.bg, color: style.color, border: style.border, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
      {label}
    </span>
  );
};

export const ObservedFact: React.FC<{ title: string; subtitle?: string; source?: string; time?: string }> = ({ title, subtitle: _subtitle, source, time }) => (
  <div style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-surface-elevated)', borderRadius: '8px', border: '1px solid var(--border-subtle)', borderLeft: '3px solid #2563eb', marginBottom: '0.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
      <ProvenanceBadge label="[OBSERVED]" type="observed" />
      {time && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{time}</span>}
    </div>
    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>"{title}"</div>
    {source && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{source}</div>}
  </div>
);

export const CalculatedMetric: React.FC<{ label: string; value: string | number; change?: string }> = ({ label, value, change }) => (
  <div style={{ padding: '0.6rem 0.75rem', background: 'var(--bg-surface-elevated)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</div>
    {change && <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>{change}</div>}
  </div>
);

export const EvidenceCard: React.FC<{ item: EvidenceItem }> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const classification = item.classification || 'OBSERVED';
  const badgeType = classification === 'INFERRED' ? 'inference' : classification.toLowerCase() as any;

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '0.5rem', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: '0.65rem 0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <ProvenanceBadge label={item.source} type="source" />
            <ProvenanceBadge label={item.type} type="type" />
            <ProvenanceBadge label={`[${classification}]`} type={badgeType} />
            {item.evidenceMode && (
              <ProvenanceBadge label={`[${item.evidenceMode}]`} type={item.evidenceMode.toLowerCase() as any} />
            )}
          </div>
          {item.snippet && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.35, wordBreak: 'break-word' }}>
              "{item.snippet}"
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {item.timestamp}
          </span>
          {expanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0.75rem 0.85rem', background: 'var(--bg-surface-elevated)', borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem' }} className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.62rem', textTransform: 'uppercase' }}>Location</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.location}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.62rem', textTransform: 'uppercase' }}>Freshness</span>
              <span style={{ color: 'var(--cyan-400)', fontWeight: 600 }}>{item.dataFreshness}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.62rem', textTransform: 'uppercase' }}>Used For</span>
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>{item.usedFor}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface Props {
  incident?: ClusteredIncident | null;
  customEvidenceItems?: EvidenceItem[];
  title?: string;
  defaultExpanded?: boolean;
}

export const ExpandableEvidenceUI: React.FC<Props> = ({
  incident: propIncident,
  customEvidenceItems,
  title = 'Where did this information come from?',
  defaultExpanded = true
}) => {
  const { selectedIncident, signals, currentWeather } = useCivic();

  const inc = propIncident || selectedIncident;
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const [filter, setFilter] = useState('all');

  if (!inc && !customEvidenceItems) return null;

  const evidenceItems: EvidenceItem[] =
    customEvidenceItems ||
    (inc?.evidenceChain && inc.evidenceChain.length > 0
      ? inc.evidenceChain
      : inc
      ? generateIncidentEvidenceChain(inc, signals, currentWeather)
      : []);

  const filtered = evidenceItems.filter(item => {
    if (filter === 'all') return true;
    return item.usedFor.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-surface-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isOpen ? '1px solid var(--border-subtle)' : 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          <Eye size={14} color="#2563eb" />
          <span>{title} ({evidenceItems.length} sources)</span>
        </div>
        {isOpen ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
      </div>

      {isOpen && (
        <div style={{ padding: '0.75rem 0.85rem' }} className="animate-fade-in">
          <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.65rem', overflowX: 'auto' }}>
            {['all', 'detection', 'risk', 'vulnerability', 'recurrence'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="sim-btn"
                style={{
                  fontSize: '0.66rem',
                  padding: '0.2rem 0.45rem',
                  textTransform: 'capitalize',
                  background: filter === f ? 'var(--civic-blue-50)' : 'var(--bg-surface)',
                  borderColor: filter === f ? 'var(--civic-blue-500)' : 'var(--border-subtle)',
                  color: filter === f ? 'var(--civic-blue-600)' : 'var(--text-secondary)'
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div>
            {filtered.slice(0, 5).map(item => (
              <EvidenceCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
