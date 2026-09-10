import React from 'react';
import {
  Activity,
  AlertOctagon,
  Building,
  CheckCircle,
  Clock,
  Gauge,
  Layers,
  MapPin,
  PieChart,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { WARDS_DATA } from '../../data/wardsData';
import { IncidentLifecycleStepper } from '../Planner/IncidentLifecycleStepper';

export const AuthorityDashboard: React.FC = () => {
  const { incidents, signals, wardStats, setSelectedIncidentId, setActiveTab } = useCivic();

  const criticalIncidents = incidents.filter(i => i.priority.overallScore >= 80);
  const resolvedCount = incidents.filter(i => i.status === 'resolved' || i.status === 'verified').length;
  const activeIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'verified');

  // Compute KPIs from live data + WARDS_DATA historical baseline
  const avgSLACompliance = WARDS_DATA.reduce((acc, w) => acc + w.slaCompliancePercent, 0) / WARDS_DATA.length;
  const avgResponseTimeHours = WARDS_DATA.reduce((acc, w) => acc + w.avgResolutionTimeHours, 0) / WARDS_DATA.length;
  const avgResponseMins = (avgResponseTimeHours * 60).toFixed(0);

  // Dynamic departmental workload distribution calculated from live incidents
  const totalIncidentsCount = incidents.length || 1;
  const drainageCount = incidents.filter(i => i.category === 'waterlogging' || i.category === 'drainage').length;
  const trafficCount = incidents.filter(i => i.category === 'traffic').length;
  const garbageCount = incidents.filter(i => i.category === 'garbage').length;
  const otherCount = incidents.filter(i => i.category === 'electricity' || i.category === 'road_hazard').length;

  const drainagePct = Math.round((drainageCount / totalIncidentsCount) * 100);
  const trafficPct = Math.round((trafficCount / totalIncidentsCount) * 100);
  const garbagePct = Math.round((garbageCount / totalIncidentsCount) * 100);
  const otherPct = Math.max(0, 100 - drainagePct - trafficPct - garbagePct);


  return (
    <div style={{ padding: '1.5rem', height: '100%', overflowY: 'auto', background: 'var(--bg-canvas)' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Sparkles size={20} color="var(--cyan-400)" />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Authority Executive Dashboard
          </h2>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Municipal ward rollups, high-velocity incident leaderboards, and inter-departmental SLA compliance.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* KPI 1 */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Total Clustered Incidents</span>
            <Layers size={16} color="var(--cyan-400)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {incidents.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--cyan-400)', marginTop: '0.25rem' }}>
            Consolidated from {signals.length} raw signals
          </div>
        </div>

        {/* KPI 2 */}
        <div className="card" style={{ padding: '1.15rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>P1 Critical Incidents</span>
            <AlertOctagon size={16} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#f87171' }}>
            {criticalIncidents.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#fca5a5', marginTop: '0.25rem' }}>
            Requires immediate executive intervention
          </div>
        </div>

        {/* KPI 3 */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Citywide SLA Compliance</span>
            <Gauge size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#34d399' }}>
            {avgSLACompliance.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#a7f3d0', marginTop: '0.25rem' }}>
            Target benchmark: &gt;= 90%
          </div>
        </div>

        {/* KPI 4 */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Avg Response Time</span>
            <Clock size={16} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
            {avgResponseMins} min
          </div>
          <div style={{ fontSize: '0.72rem', color: '#fde68a', marginTop: '0.25rem' }}>
            -18% faster than traditional manual ticket triage
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="authority-mid-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* High-Velocity Incidents Leaderboard */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={16} color="#ef4444" />
              <span>High-Velocity Incident Leaderboard</span>
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ranked by Surge %</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {[...incidents]
              .sort((a, b) => b.velocitySurgePercent - a.velocitySurgePercent)
              .slice(0, 4)
              .map((inc, i) => {
                const isCritical = inc.priority.overallScore >= 80;

                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncidentId(inc.id);
                      setActiveTab('live_map');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: i === 0 ? 'rgba(239, 68, 68, 0.25)' : 'var(--bg-card)',
                        color: i === 0 ? '#f87171' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {i + 1}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {inc.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {inc.ward} • {inc.signalIds.length} Signals
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        color: inc.velocitySurgePercent > 100 ? '#f87171' : 'var(--cyan-400)'
                      }}>
                        +{inc.velocitySurgePercent}%/hr
                      </div>
                      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                        Priority: {inc.priority.overallScore}/100
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Department Workload Distribution */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building size={16} color="var(--cyan-400)" />
              <span>Departmental Incident Allocation</span>
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Live Field Load</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                <span>Drainage & Dewatering Division (MCD)</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#f87171' }}>{drainagePct}% {drainagePct > 40 ? '(High Surge)' : ''}</strong>
              </div>
              <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${drainagePct}%`, height: '100%', background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                <span>Traffic Police Quick Response Wing</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>{trafficPct}%</strong>
              </div>
              <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${trafficPct}%`, height: '100%', background: 'linear-gradient(90deg, #fbbf24 0%, #eab308 100%)', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                <span>Solid Waste Management (Sanitation)</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)' }}>{garbagePct}%</strong>
              </div>
              <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${garbagePct}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                <span>Electrical & Road Maintenance Wing</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#34d399' }}>{otherPct}%</strong>
              </div>
              <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${otherPct}%`, height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Lifecycle & Governance Pipeline Control */}
      <div style={{ marginBottom: '1.5rem' }}>
        <IncidentLifecycleStepper />
      </div>

      {/* Municipal Ward Performance Table & Mobile Stacked Cards */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={16} color="var(--cyan-400)" />
            <span>Municipal Ward Breakdown & SLA Compliance</span>
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>4 Monitored Sub-Zones</span>
        </div>

        {/* Desktop Table View */}
        <div className="desktop-ward-table" style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.65rem 0.75rem' }}>Ward Name</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Zone</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Active Incidents</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Avg Resolution Time</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>SLA Compliance</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {WARDS_DATA.map(w => {
                const isHighRisk = w.wardId === 'ward-15';
                const activeCount = wardStats[w.wardId]?.activeCount ?? 0;
                const criticalCount = wardStats[w.wardId]?.criticalCount ?? 0;

                return (
                  <tr key={w.wardId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: isHighRisk ? '#fca5a5' : 'var(--text-primary)' }}>
                      {w.wardName}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                      {w.primaryZone}
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: isHighRisk ? '#f87171' : 'var(--text-primary)', fontWeight: isHighRisk ? 700 : 400 }}>
                        {activeCount} {criticalCount > 0 ? `(${criticalCount} Critical)` : ''}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                      {w.avgResolutionTimeHours} Hours
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: w.slaCompliancePercent >= 90 ? '#34d399' : '#fbbf24', fontWeight: 700 }}>
                        {w.slaCompliancePercent}%
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: isHighRisk ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: isHighRisk ? '#f87171' : '#34d399'
                      }}>
                        {isHighRisk ? 'ACTIVE MONSOON ALERT' : 'OPERATIONAL NORMAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards View (Preserves P1 and Ward Details) */}
        <div className="mobile-ward-cards" style={{ display: 'none', flexDirection: 'column', gap: '0.75rem' }}>
          {WARDS_DATA.map(w => {
            const isHighRisk = w.wardId === 'ward-15';
            const activeCount = wardStats[w.wardId]?.activeCount ?? 0;
            const criticalCount = wardStats[w.wardId]?.criticalCount ?? 0;

            return (
              <div
                key={w.wardId}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: isHighRisk ? '1.5px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: isHighRisk ? '#ef4444' : 'var(--text-primary)' }}>{w.wardName}</strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{w.primaryZone}</div>
                  </div>

                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    background: isHighRisk ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: isHighRisk ? '#f87171' : '#34d399'
                  }}>
                    {isHighRisk ? 'MONSOON ALERT' : 'NORMAL'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.74rem', background: 'var(--bg-card)', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.64rem', display: 'block', textTransform: 'uppercase' }}>Active Incidents</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: isHighRisk ? '#ef4444' : 'var(--text-primary)' }}>
                      {activeCount} {criticalCount > 0 ? `(${criticalCount} P1)` : ''}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.64rem', display: 'block', textTransform: 'uppercase' }}>SLA Compliance</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: w.slaCompliancePercent >= 90 ? '#059669' : '#d97706' }}>
                      {w.slaCompliancePercent}% ({w.avgResolutionTimeHours}h avg)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
