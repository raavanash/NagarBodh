import React from 'react';
import {
  Activity,
  AlertTriangle,
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
import { CivicCategory, SignalChannel } from '../../types/civic';

export const MapSidebarLeft: React.FC = () => {
  const {
    incidents,
    signals,
    selectedIncidentId,
    setSelectedIncidentId,
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

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Categories' },
    { id: 'waterlogging', label: 'Waterlogging' },
    { id: 'drainage', label: 'Drainage' },
    { id: 'road_hazard', label: 'Road Hazards' },
    { id: 'traffic', label: 'Traffic' },
    { id: 'garbage', label: 'Sanitation' },
    { id: 'electricity', label: 'Electricity' }
  ];

  const sources: Array<{ id: string; label: string; icon: string }> = [
    { id: 'all', label: 'All Channels', icon: '🌐' },
    { id: 'citizen_app', label: 'Citizen App', icon: '📱' },
    { id: 'social_x', label: 'Social (X)', icon: '🐦' },
    { id: 'grievance_portal', label: 'Grievance Portal', icon: '🏛️' },
    { id: 'helpline_311', label: '311 Helpline', icon: '📞' }
  ];

  const severities: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Severities' },
    { id: 'critical', label: 'Critical P1' },
    { id: 'high', label: 'High P2' },
    { id: 'medium', label: 'Medium' },
    { id: 'low', label: 'Low' }
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
      {/* Sidebar Header & Map Mode Selector */}
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#fff' }}>
            <Filter size={15} color="var(--cyan-400)" />
            <span>CivicPulse Filters</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {filteredIncidents.length} Active Clusters
          </span>
        </div>

        {/* Map View Mode Switcher Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginBottom: '0.85rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setMapMode('ai_priority')}
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.35rem 0.4rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: mapMode === 'ai_priority' ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' : 'transparent',
              color: mapMode === 'ai_priority' ? '#fff' : 'var(--text-secondary)',
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
              border: 'none',
              cursor: 'pointer',
              background: mapMode === 'civic_signals' ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' : 'transparent',
              color: mapMode === 'civic_signals' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            📡 Citizen Signals
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '0.65rem' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-control"
            style={{ paddingLeft: '2rem', fontSize: '0.78rem' }}
            placeholder="Search incident, location, or school..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Selectors Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.65rem' }}>
          {/* Category Filter */}
          <div>
            <label style={{ fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              Category
            </label>
            <select
              className="input-control"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem' }}
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Source / Channel Filter */}
          <div>
            <label style={{ fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              Source Channel
            </label>
            <select
              className="input-control"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem' }}
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
            >
              {sources.map(s => (
                <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label style={{ fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              Severity Level
            </label>
            <select
              className="input-control"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem' }}
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
            >
              {severities.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Time Window Filter */}
          <div>
            <label style={{ fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              Time Range
            </label>
            <select
              className="input-control"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem' }}
              value={timeRangeFilter}
              onChange={e => setTimeRangeFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="1h">Last 1 Hour</option>
              <option value="3h">Last 3 Hours</option>
              <option value="6h">Last 6 Hours</option>
            </select>
          </div>
        </div>

        {/* Ward Selector Dropdown */}
        <div style={{ marginBottom: '0.65rem' }}>
          <label style={{ fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
            Municipal Ward
          </label>
          <select
            className="input-control"
            style={{ fontSize: '0.74rem', padding: '0.35rem 0.5rem' }}
            value={wardFilter}
            onChange={e => setWardFilter(e.target.value)}
          >
            <option value="all">All Wards (East, Central, North-West)</option>
            {WARDS_DATA.map(w => (
              <option key={w.wardId} value={w.wardName}>
                {w.wardName}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Threshold Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sliders size={12} /> Min Priority Score
            </span>
            <strong style={{ color: minPriorityFilter > 60 ? '#f87171' : 'var(--cyan-400)', fontFamily: 'var(--font-mono)' }}>
              &ge; {minPriorityFilter} / 100
            </strong>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            step="10"
            value={minPriorityFilter}
            onChange={e => setMinPriorityFilter(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--cyan-500)', height: '4px' }}
          />
        </div>
      </div>

      {/* Incident Cluster Cards List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Layers size={13} />
            <span>Clustered Incidents ({filteredIncidents.length})</span>
          </span>
          {mapMode === 'civic_signals' && (
            <span style={{ color: '#c084fc', fontSize: '0.66rem', fontFamily: 'var(--font-mono)' }}>
              {signals.length} Signals
            </span>
          )}
        </div>

        {filteredIncidents.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No active incidents match the current filters.
          </div>
        ) : (
          filteredIncidents.map(inc => {
            const isSelected = inc.id === selectedIncidentId;
            const isCritical = inc.priority.overallScore >= 80;
            const isHigh = inc.priority.overallScore >= 60;
            const isResolved = inc.status === 'resolved';

            // Accelerating signal velocity check for Emerging Now state
            const isEmergingNow = inc.velocitySurgePercent >= 150 || inc.velocityPerHour >= 10;

            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncidentId(inc.id)}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)'
                    : 'var(--bg-card)',
                  border: isSelected ? '1px solid var(--cyan-400)' : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  marginBottom: '0.65rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 0 14px rgba(6, 182, 212, 0.25)' : 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Emerging Now Acceleration Banner on Card */}
                {isEmergingNow && !isResolved && (
                  <div
                    style={{
                      background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 100%)',
                      color: '#fff',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      letterSpacing: '0.04em',
                      margin: '-0.85rem -0.85rem 0.5rem -0.85rem'
                    }}
                  >
                    <Flame size={12} className="animate-bounce" />
                    <span>EMERGING NOW • ACCELERATING SIGNAL VELOCITY</span>
                  </div>
                )}

                {/* Header Row: Category & Priority */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: isCritical ? '#f87171' : isHigh ? '#fbbf24' : isResolved ? '#34d399' : '#38bdf8'
                    }}
                  >
                    {inc.category}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: isCritical ? 'rgba(239, 68, 68, 0.25)' : isHigh ? 'rgba(245, 158, 11, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                      color: isCritical ? '#fca5a5' : isHigh ? '#fde68a' : '#cffafe',
                      border: isCritical ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(6, 182, 212, 0.3)'
                    }}
                  >
                    {inc.priority.overallScore}/100
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.4rem' }}>
                  {inc.title}
                </h3>

                {/* Metrics Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertTriangle size={12} color="var(--text-muted)" />
                    <span>{inc.signalIds.length} Signals</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: inc.velocitySurgePercent > 100 ? '#f87171' : 'var(--cyan-400)' }}>
                    <TrendingUp size={12} />
                    <span>+{inc.velocitySurgePercent}%/hr</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                    <Clock size={12} />
                    <span>{inc.latestSignalTime.slice(11, 16)}</span>
                  </div>
                </div>

                {/* Critical Asset Warning Badge if near school/hospital */}
                {inc.auditableInsight.calculatedMetrics.nearestSchoolName && inc.auditableInsight.calculatedMetrics.nearestSchoolDistanceMeters! <= 300 && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '5px',
                      background: 'rgba(139, 92, 246, 0.15)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      fontSize: '0.68rem',
                      color: '#c084fc',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>🏫 {inc.auditableInsight.calculatedMetrics.nearestSchoolName}</span>
                    <strong style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
                      {inc.auditableInsight.calculatedMetrics.nearestSchoolDistanceMeters}m
                    </strong>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
