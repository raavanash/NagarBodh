import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Flame,
  Globe,
  Layers,
  MapPin,
  MessageSquare,
  Radio,
  Search,
  Sliders,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { WARDS_DATA } from '../../data/wardsData';

export const MapSidebarLeft: React.FC = () => {
  const {
    incidents,
    signals,
    selectedIncidentId,
    setSelectedIncidentId,
    setActiveTab,
    mapMode,
    setMapMode,
    categoryFilter,
    setCategoryFilter,
    sourceFilter,
    setSourceFilter,
    severityFilter,
    setSeverityFilter,
    wardFilter,
    setWardFilter,
    timeRangeFilter,
    setTimeRangeFilter,
    searchQuery,
    setSearchQuery,
    minPriorityFilter,
    setMinPriorityFilter
  } = useCivic();

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'waterlogging', label: 'Waterlogging' },
    { id: 'drainage', label: 'Drainage' },
    { id: 'road_hazard', label: 'Road Hazards' },
    { id: 'traffic', label: 'Traffic' },
    { id: 'garbage', label: 'Sanitation' },
    { id: 'electricity', label: 'Electricity' }
  ];

  const sources = [
    { id: 'all', label: 'All Channels' },
    { id: 'citizen_app', label: 'Citizen App' },
    { id: 'social_bluesky', label: 'Social (Bluesky Live)' },
    { id: 'social_x', label: 'Social (X / Twitter - Optional)' },
    { id: 'grievance_portal', label: 'Grievance Portal' },
    { id: 'helpline_311', label: '155304 / 112 Civic Helpline' }
  ];

  const severities = [
    { id: 'all', label: 'All Severities' },
    { id: 'critical', label: 'Critical P1' },
    { id: 'high', label: 'High P2' },
    { id: 'medium', label: 'Medium P3' }
  ];

  const filteredIncidents = incidents.filter(inc => {
    if (categoryFilter !== 'all' && inc.category !== categoryFilter) return false;
    if (sourceFilter !== 'all') {
      const incSignals = signals.filter(s => inc.signalIds.includes(s.id));
      const hasChannel = incSignals.some(s => s.channel === sourceFilter);
      if (!hasChannel) return false;
    }
    if (severityFilter !== 'all') {
      const isCrit = inc.priority.overallScore >= 80;
      const isHigh = inc.priority.overallScore >= 60 && inc.priority.overallScore < 80;
      if (severityFilter === 'critical' && !isCrit) return false;
      if (severityFilter === 'high' && !isHigh) return false;
      if (severityFilter === 'medium' && (isCrit || isHigh)) return false;
    }
    if (wardFilter !== 'all' && inc.ward !== wardFilter) return false;
    if (inc.priority.overallScore < minPriorityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = inc.title.toLowerCase().includes(q);
      const matchWard = inc.ward.toLowerCase().includes(q);
      const matchCat = inc.category.toLowerCase().includes(q);
      return matchTitle || matchWard || matchCat;
    }
    return true;
  });

  return (
    <aside className="map-sidebar-left">
      {/* Concise Sidebar Header */}
      <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            <Activity size={16} color="#2563eb" />
            <span>CivicPulse</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#2563eb', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {filteredIncidents.length} Clusters
          </span>
        </div>

        {/* View Mode Toggle Switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', marginBottom: '0.6rem', background: 'var(--bg-surface-elevated)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setMapMode('ai_priority')}
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.35rem 0.4rem',
              borderRadius: '6px',
              border: mapMode === 'ai_priority' ? '1px solid var(--civic-blue-500)' : 'none',
              cursor: 'pointer',
              background: mapMode === 'ai_priority' ? 'var(--civic-blue-50)' : 'transparent',
              color: mapMode === 'ai_priority' ? 'var(--civic-blue-600)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            ⚡ AI Priority
          </button>
          <button
            onClick={() => setMapMode('civic_signals')}
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.35rem 0.4rem',
              borderRadius: '6px',
              border: mapMode === 'civic_signals' ? '1px solid var(--purple-400)' : 'none',
              cursor: 'pointer',
              background: mapMode === 'civic_signals' ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
              color: mapMode === 'civic_signals' ? 'var(--purple-400)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            📡 Citizen Signals
          </button>
        </div>

        {/* Compact Search & Filter Toggle Bar */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={13} style={{ position: 'absolute', left: '9px', top: '9px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-control"
              style={{ paddingLeft: '1.8rem', fontSize: '0.75rem', height: '31px' }}
              placeholder="Search incident, location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className="sim-btn"
            style={{
              height: '31px',
              padding: '0 0.5rem',
              fontSize: '0.72rem',
              background: isFilterDrawerOpen ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-surface)',
              borderColor: isFilterDrawerOpen ? 'var(--cyan-400)' : 'var(--border-subtle)'
            }}
            title="Toggle Filter Controls"
          >
            <Sliders size={13} />
            {isFilterDrawerOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        {/* Two Compact Primary Filters Visible by Default */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.5rem' }}>
          <select
            className="input-control"
            style={{ fontSize: '0.7rem', height: '28px', padding: '0 0.4rem' }}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          <select
            className="input-control"
            style={{ fontSize: '0.7rem', height: '28px', padding: '0 0.4rem' }}
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
          >
            {severities.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Collapsible Advanced Filter Drawer */}
        {isFilterDrawerOpen && (
          <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px dashed var(--border-subtle)' }} className="animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>Channel</label>
                <select
                  className="input-control"
                  style={{ fontSize: '0.7rem', height: '28px', padding: '0 0.4rem' }}
                  value={sourceFilter}
                  onChange={e => setSourceFilter(e.target.value)}
                >
                  {sources.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>Ward</label>
                <select
                  className="input-control"
                  style={{ fontSize: '0.7rem', height: '28px', padding: '0 0.4rem' }}
                  value={wardFilter}
                  onChange={e => setWardFilter(e.target.value)}
                >
                  <option value="all">All Wards</option>
                  {WARDS_DATA.map(w => (
                    <option key={w.wardId} value={w.wardName}>{w.wardName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Incident List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
        {filteredIncidents.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No incident clusters match your filter criteria.
          </div>
        ) : (
          filteredIncidents.map(inc => {
            const isSelected = inc.id === selectedIncidentId;
            const score = inc.priority.overallScore;
            const isP1 = score >= 80;
            const isP2 = score >= 60 && score < 80;

            const badgeClass = isP1 ? 'badge-p1' : isP2 ? 'badge-p2' : 'badge-p3';
            const badgeLabel = isP1 ? `P1 ${score}` : isP2 ? `P2 ${score}` : `P3 ${score}`;

            return (
              <div
                key={inc.id}
                onClick={() => {
                  setSelectedIncidentId(inc.id);
                  if (typeof window !== 'undefined' && window.innerWidth <= 900) {
                    setActiveTab('dossier');
                  }
                }}
                className={`civic-incident-card ${isSelected ? 'selected' : ''}`}
                style={{
                  marginBottom: '0.45rem',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '8px',
                  boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.15)' : 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span className={`badge ${badgeClass}`} style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                    {badgeLabel}
                  </span>

                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <TrendingUp size={11} color="#2563eb" />
                    <span>+{inc.velocitySurgePercent}%</span>
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '0.25rem' }}>
                  {inc.title}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={11} color="var(--text-muted)" />
                    {inc.ward.split('-')[0].trim()}
                  </span>

                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {inc.signalIds.length} signals
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
