import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Send,
  ShieldCheck,
  User,
  Zap
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const ResolutionTimeline: React.FC = () => {
  const { auditLogs } = useCivic();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    if (filterType === 'all') return true;
    if (filterType === 'priority_spike' && (log.type === 'priority_spike' || log.type === 'incident_triaged')) return true;
    if (filterType === 'dispatch' && (log.type === 'dispatch_approved' || log.type === 'crew_dispatched')) return true;
    if (filterType === 'clustering' && (log.type === 'cluster_formed' || log.type === 'cluster_updated' || log.type === 'response_plan_generated')) return true;
    if (filterType === 'resolution' && (log.type === 'resolution_begun' || log.type === 'resolution_confirmed' || log.type === 'field_verification')) return true;
    return false;
  });

  return (
    <div className="timeline-view-container" style={{ padding: '1.5rem', height: '100%', overflowY: 'auto', background: 'var(--bg-canvas)' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Clock size={20} color="var(--cyan-400)" />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Incident Resolution Audit Timeline
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Immutable chronological audit record tracing civic signals from first report to AI clustering, priority scoring, officer approval, and citizen-verified resolution.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="timeline-filter-pills" style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterType('all')}
            style={{
              border: 'none',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filterType === 'all' ? 'var(--cyan-500)' : 'transparent',
              color: filterType === 'all' ? 'var(--outer-950)' : 'var(--text-secondary)'
            }}
          >
            All Events ({auditLogs.length})
          </button>
          <button
            onClick={() => setFilterType('priority_spike')}
            style={{
              border: 'none',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filterType === 'priority_spike' ? '#ef4444' : 'transparent',
              color: filterType === 'priority_spike' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            Priority & Triaged
          </button>
          <button
            onClick={() => setFilterType('clustering')}
            style={{
              border: 'none',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filterType === 'clustering' ? '#8b5cf6' : 'transparent',
              color: filterType === 'clustering' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            Clustering & SOPs
          </button>
          <button
            onClick={() => setFilterType('dispatch')}
            style={{
              border: 'none',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filterType === 'dispatch' ? '#10b981' : 'transparent',
              color: filterType === 'dispatch' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            Dispatches Executed
          </button>
          <button
            onClick={() => setFilterType('resolution')}
            style={{
              border: 'none',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filterType === 'resolution' ? '#06b6d4' : 'transparent',
              color: filterType === 'resolution' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            Resolutions & Verifications
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="timeline-stream-container" style={{ position: 'relative', paddingLeft: '2.5rem' }}>
        {/* Continuous vertical line */}
        <div
          className="timeline-vertical-line"
          style={{
            position: 'absolute',
            left: '17px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            background: 'linear-gradient(180deg, #06b6d4 0%, #3b82f6 50%, #10b981 100%)',
            opacity: 0.4
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredLogs.map(log => {
            const isSpike = log.type === 'priority_spike' || log.type === 'incident_triaged';
            const isDispatch = log.type === 'dispatch_approved' || log.type === 'crew_dispatched';
            const isResolution = log.type === 'resolution_confirmed' || log.type === 'field_verification' || log.type === 'resolution_begun';
            const isCluster = log.type === 'cluster_formed' || log.type === 'cluster_updated' || log.type === 'response_plan_generated';

            let nodeColor = 'var(--bg-surface-elevated)';
            let borderColor = 'var(--border-accent)';
            let icon = <Activity size={16} />;
            let badgeBg = 'rgba(6, 182, 212, 0.2)';
            let badgeColor = '#cffafe';

            if (isSpike) {
              nodeColor = '#ef4444';
              borderColor = '#fecaca';
              icon = <Flame size={18} />;
              badgeBg = 'rgba(239, 68, 68, 0.2)';
              badgeColor = '#fca5a5';
            } else if (isDispatch) {
              nodeColor = '#10b981';
              borderColor = '#a7f3d0';
              icon = <Send size={16} />;
              badgeBg = 'rgba(16, 185, 129, 0.2)';
              badgeColor = '#a7f3d0';
            } else if (isResolution) {
              nodeColor = '#06b6d4';
              borderColor = '#67e8f9';
              icon = <CheckCircle2 size={18} />;
              badgeBg = 'rgba(6, 182, 212, 0.2)';
              badgeColor = '#67e8f9';
            } else if (isCluster) {
              nodeColor = '#8b5cf6';
              borderColor = '#c4b5fd';
              icon = <Zap size={16} />;
              badgeBg = 'rgba(139, 92, 246, 0.2)';
              badgeColor = '#ddd6fe';
            }

            return (
              <div key={log.id} style={{ position: 'relative' }} className="animate-fade-in">
                {/* Node icon */}
                <div
                  className="timeline-node-icon"
                  style={{
                    position: 'absolute',
                    left: '-2.5rem',
                    top: '2px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: nodeColor,
                    border: `2px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: isSpike ? '0 0 16px rgba(239, 68, 68, 0.6)' : isDispatch ? '0 0 16px rgba(16, 185, 129, 0.6)' : 'none'
                  }}
                >
                  {icon}
                </div>

                {/* Event Card */}
                <div
                  className="card"
                  style={{
                    padding: '1.1rem',
                    borderLeft: `4px solid ${nodeColor === 'var(--bg-surface-elevated)' ? 'var(--cyan-500)' : nodeColor}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: badgeBg,
                          color: badgeColor
                        }}
                      >
                        {log.type.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Actor: <strong style={{ color: 'var(--text-secondary)' }}>{log.actor}</strong>
                      </span>
                    </div>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--cyan-400)', fontWeight: 700 }}>
                      ⏱ {log.timeLabel}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {log.title}
                  </h3>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    {log.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
