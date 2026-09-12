import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, ArrowUpRight, BarChart3, Building2, CheckCircle2, DollarSign, Filter, Layers, MapPin, TrendingUp } from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const InvestmentGapsView: React.FC = () => {
  const { incidents, setSelectedIncidentId, setActiveTab } = useCivic();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const sectorMetrics = [
    {
      category: 'HEALTHCARE',
      label: 'Healthcare Infrastructure',
      demandScore: 91,
      infraIndex: 38,
      gapLakhs: 450,
      affectedPop: '148,000',
      status: 'CRITICAL DEFICIT',
      color: '#ef4444'
    },
    {
      category: 'WATER',
      label: 'Water & Urban Drainage',
      demandScore: 88,
      infraIndex: 35,
      gapLakhs: 350,
      affectedPop: '184,000',
      status: 'HIGH DEFICIT',
      color: '#f59e0b'
    },
    {
      category: 'TRANSPORT',
      label: 'Public Transit & Arterials',
      demandScore: 76,
      infraIndex: 48,
      gapLakhs: 280,
      affectedPop: '210,000',
      status: 'MODERATE DEFICIT',
      color: '#3b82f6'
    },
    {
      category: 'EDUCATION',
      label: 'Primary School Infrastructure',
      demandScore: 64,
      infraIndex: 55,
      gapLakhs: 180,
      affectedPop: '92,000',
      status: 'MODERATE DEFICIT',
      color: '#10b981'
    }
  ];

  const gapRows = [
    {
      id: 'gap-001',
      district: 'North East Delhi',
      ward: 'Ward 15 — Seelampur / Mayur Enclave',
      category: 'HEALTHCARE',
      need: 'Primary Health Sub-Center & Mobile Emergency Unit',
      demandScore: 91,
      infraIndex: 38,
      gapLakhs: 450,
      affectedPop: 148000,
      aiExplanation: 'Citizen demand pressure (91/100) exceeds current healthcare index (38/100). Nearest hospital is 28 km away.',
      incidentId: incidents[0]?.id
    },
    {
      id: 'gap-002',
      district: 'East Delhi',
      ward: 'Ward 18 — Laxmi Nagar Dip',
      category: 'WATER',
      need: 'Sub-surface Automated Stormwater Pumping Array',
      demandScore: 88,
      infraIndex: 35,
      gapLakhs: 350,
      affectedPop: 184000,
      aiExplanation: '80% drainage capacity surcharge during monsoon downpours creates recurring flood risk near metro corridor.',
      incidentId: incidents[1]?.id || incidents[0]?.id
    },
    {
      id: 'gap-003',
      district: 'North West Delhi',
      ward: 'Ward 08 — Rohini Sector 16',
      category: 'TRANSPORT',
      need: 'Feeder Transit Corridor & Bus Terminal Upgrade',
      demandScore: 76,
      infraIndex: 48,
      gapLakhs: 280,
      affectedPop: 210000,
      aiExplanation: 'High last-mile connectivity requests. Current bus terminal capacity overloaded by 140%.',
      incidentId: incidents[2]?.id || incidents[0]?.id
    },
    {
      id: 'gap-004',
      district: 'South West Delhi',
      ward: 'Ward 24 — Dwarka Sector 12',
      category: 'EDUCATION',
      need: 'Maternal & Primary Care Smart Annex',
      demandScore: 64,
      infraIndex: 55,
      gapLakhs: 180,
      affectedPop: 92000,
      aiExplanation: 'School corridor lacks safe pedestrian crossing and emergency first-aid sub-center.',
      incidentId: incidents[3]?.id || incidents[0]?.id
    }
  ];

  const filteredRows = selectedCategory === 'all'
    ? gapRows
    : gapRows.filter(r => r.category === selectedCategory);

  const handleSelectGap = (incidentId?: string) => {
    if (incidentId) {
      setSelectedIncidentId(incidentId);
      setActiveTab('project_priorities');
    }
  };

  return (
    <div className="investment-gaps-container" style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '1.25rem', background: 'var(--bg-canvas)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Screen Question Header Banner */}
      <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-accent)', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              INVESTMENT GAP ANALYSIS
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• BRICS Public Infrastructure Framework</span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Investment Gaps
          </h2>
          <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.88rem', color: '#0284c7', fontWeight: 600 }}>
            "Where is demand not matched by infrastructure/investment?"
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Filter size={14} color="var(--text-muted)" />
          {['all', 'HEALTHCARE', 'WATER', 'TRANSPORT', 'EDUCATION'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#2563eb' : 'var(--bg-surface)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cat === 'all' ? 'All Sectors' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sector Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {sectorMetrics.map(sec => (
          <div key={sec.category} className="card" style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: sec.color, fontFamily: 'var(--font-mono)' }}>{sec.status}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Pop: {sec.affectedPop}</span>
            </div>

            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 700 }}>{sec.label}</h4>

            {/* Demand vs Infra Progress Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                  <span>Citizen Demand Pressure</span>
                  <strong style={{ color: sec.color }}>{sec.demandScore}/100</strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${sec.demandScore}%`, height: '100%', background: sec.color, borderRadius: '3px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                  <span>Current Infrastructure Index</span>
                  <strong>{sec.infraIndex}/100</strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${sec.infraIndex}%`, height: '100%', background: '#94a3b8', borderRadius: '3px' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unfunded Investment Gap</span>
              <strong style={{ fontSize: '0.95rem', color: '#b45309', fontFamily: 'var(--font-mono)' }}>₹{sec.gapLakhs} Lakhs</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Main Leaderboard Table: Unmatched Demand & Infrastructure Gaps */}
      <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
              District Infrastructure Deficit Leaderboard
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              High-priority locations where citizen demand is not matched by existing public infrastructure or budget allocations.
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', background: 'var(--bg-surface)', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            Showing {filteredRows.length} Locations
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textWrap: 'nowrap' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '2px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.65rem' }}>District & Ward</th>
                <th style={{ padding: '0.65rem' }}>Sector Need</th>
                <th style={{ padding: '0.65rem' }}>Demand Score</th>
                <th style={{ padding: '0.65rem' }}>Infra Index</th>
                <th style={{ padding: '0.65rem' }}>Investment Gap</th>
                <th style={{ padding: '0.65rem' }}>AI Deficit Justification</th>
                <th style={{ padding: '0.65rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r, idx) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                  <td style={{ padding: '0.65rem', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={13} color="#2563eb" />
                      <span>{r.ward}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>{r.district}</span>
                  </td>
                  <td style={{ padding: '0.65rem' }}>
                    <span style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', border: '1px solid rgba(37, 99, 235, 0.2)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                      {r.category}
                    </span>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '0.2rem' }}>{r.need}</div>
                  </td>
                  <td style={{ padding: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: r.demandScore >= 80 ? '#dc2626' : '#d97706' }}>
                    {r.demandScore}/100
                  </td>
                  <td style={{ padding: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {r.infraIndex}/100
                  </td>
                  <td style={{ padding: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#b45309' }}>
                    ₹{r.gapLakhs} Lakhs
                  </td>
                  <td style={{ padding: '0.65rem', fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '300px', whiteSpace: 'normal' }}>
                    {r.aiExplanation}
                  </td>
                  <td style={{ padding: '0.65rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleSelectGap(r.incidentId)}
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <span>Prioritize Project</span>
                      <ArrowUpRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
};
