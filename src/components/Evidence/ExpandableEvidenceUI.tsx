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
export const ProvenanceBadge: React.FC<{ label: string; type?: 'source' | 'type' | 'observed' | 'calculated' | 'inference' }> = ({ label, type = 'source' }) => {
  const getStyle = () => {
    switch (type) {
      case 'observed':
        return { bg: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)' };
      case 'calculated':
        return { bg: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)' };
      case 'inference':
        return { bg: 'rgba(192, 132, 252, 0.2)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.4)' };
      case 'type':
        return { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' };
      default:
        return { bg: 'rgba(12, 192, 188, 0.15)', color: 'var(--cyan-300)', border: '1px solid var(--border-accent)' };
    }
  };
  const style = getStyle();
  return (
    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.12rem 0.45rem', borderRadius: '4px', background: style.bg, color: style.color, border: style.border, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
      {label}
    </span>
  );
};

export const ObservedFact: React.FC<{ title: string; subtitle?: string; source?: string; time?: string }> = ({ title, subtitle, source, time }) => (
  <div style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-surface-elevated)', borderRadius: '8px', borderLeft: '3px solid #38bdf8', marginBottom: '0.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
      <ProvenanceBadge label="[OBSERVED]" type="observed" />
      {time && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{time}</span>}
    </div>
    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', lineHeight: 1.35 }}>"{title}"</div>
    {source && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{source}</div>}
  </div>
);

export const CalculatedMetric: React.FC<{ label: string; value: string | number; change?: string }> = ({ label, value, change }) => (
  <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>{value}</div>
    {change && <div style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 700 }}>{change}</div>}
  </div>
);

export const EvidenceCard: React.FC<{ item: EvidenceItem }> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '0.5rem', overflow: 'hidden' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: '0.65rem 0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <ProvenanceBadge label={item.source} type="source" />
            <ProvenanceBadge label={item.type} type="type" />
            <ProvenanceBadge label="[OBSERVED]" type="observed" />
          </div>
          {item.snippet && (
            <div style={{ fontSize: '0.78rem', color: '#fff', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
        <div style={{ padding: '0.75rem 0.85rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem' }} className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.62rem', textTransform: 'uppercase' }}>Location</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{item.location}</span>
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
    <div style={{ background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden', marginBottom: '1rem' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-surface-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', fontWeight: 700, color: '#fff' }}>
          <Eye size={14} color="var(--cyan-400)" />
          <span>{title} ({evidenceItems.length} sources)</span>
        </div>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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
                  background: filter === f ? 'rgba(12, 192, 188, 0.2)' : 'transparent',
                  borderColor: filter === f ? 'var(--cyan-400)' : 'var(--border-subtle)',
                  color: filter === f ? 'var(--cyan-300)' : 'var(--text-secondary)'
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
