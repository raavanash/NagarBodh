import React, { useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, ArrowUpRight, BarChart3, Building2, CheckCircle2, DollarSign, Filter, Info, Layers, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { deriveInvestmentBoardMetrics, buildInvestmentExplanationDossier, InvestmentGapRow } from '../../engine/developmentGapEngine';
import { InvestmentExplanationDossier } from '../../types/development';
import { ExplainableInvestmentDossierDrawer } from './ExplainableInvestmentDossierDrawer';
import { JudgingJourneyStepper } from '../common/JudgingJourneyStepper';

export const InvestmentGapsView: React.FC = () => {
  const { incidents, signals, setSelectedIncidentId, setActiveTab, prioritizeRecommendationInPipeline, ingestionMode } = useCivic();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDossier, setSelectedDossier] = useState<InvestmentExplanationDossier | null>(null);

  // Dynamically derive sector metrics & gap leaderboard rows from active incidents using domain engines
  const { sectorMetrics, gapRows } = useMemo(() => {
    return deriveInvestmentBoardMetrics(incidents);
  }, [incidents]);

  const filteredRows = selectedCategory === 'all'
    ? gapRows
    : gapRows.filter(r => r.category === selectedCategory);

  const handleSelectGap = (incidentId?: string) => {
    if (incidentId) {
      prioritizeRecommendationInPipeline(incidentId);
    }
  };

  const handleOpenDossier = (row: InvestmentGapRow) => {
    const dossier = row.explanationDossier || buildInvestmentExplanationDossier(row.category, incidents, signals);
    setSelectedDossier(dossier);
  };

  return (
    <div className="investment-gaps-container" style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '1.25rem', background: 'var(--bg-canvas)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Unified 6-Stage Lifecycle Header */}
        <JudgingJourneyStepper
          currentStep="INVEST"
          compact={true}
        />

        {/* Screen Question Header Banner */}
      <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-accent)', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              CIVIC INVESTMENT INTELLIGENCE
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• BRICS Public Infrastructure Framework</span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '0.1rem 0.45rem',
              borderRadius: '999px',
              fontFamily: 'var(--font-mono)',
              background: ingestionMode === 'LIVE' ? '#dcfce7' : '#eff6ff',
              color: ingestionMode === 'LIVE' ? '#166534' : '#1e40af',
              border: `1px solid ${ingestionMode === 'LIVE' ? '#86efac' : '#bfdbfe'}`
            }}>
              MODE: {ingestionMode}
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Civic Investment Board
          </h2>
          <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.88rem', color: '#0284c7', fontWeight: 600 }}>
            "Where is demand not matched by infrastructure or investment?"
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

      {/* First 15-Seconds Decision Focus Banner (PART 2) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
        border: '1.5px solid rgba(96, 165, 250, 0.4)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        color: '#ffffff',
        boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.04em' }}>
              PRIORITY #1 INTERVENTION TARGET
            </span>
            <span style={{ fontSize: '0.74rem', color: '#93c5fd', fontWeight: 600 }}>
              Score: 94 / 100 [Level P1]
            </span>
          </div>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: '#ffffff' }}>
            "I have limited capital. Where should we intervene?"
          </h3>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.45 }}>
            NagarBodh aggregates multi-channel distress signals against baseline ward infrastructure to identify critical unaddressed gaps. Top recommendation: <strong>Subsurface Stormwater Retention Array</strong> in <strong>Sector 15</strong> (₹350L Capex, 184,000 population exposed).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              const targetRow = gapRows.find(r => r.category === 'WATER') || gapRows[0];
              handleOpenDossier(targetRow);
            }}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.15rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
            }}
          >
            <Sparkles size={14} />
            <span>Why this recommendation?</span>
          </button>

          <button
            onClick={() => {
              const targetRow = gapRows.find(r => r.category === 'WATER') || gapRows[0];
              handleSelectGap(targetRow.incidentId);
            }}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.15rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
            }}
          >
            <span>Prioritize in Pipeline</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Portfolio Summary Strip */}
      <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(6,182,212,0.06) 100%)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '10px', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DollarSign size={16} color="#2563eb" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Total Unfunded Portfolio Gap</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#b45309', fontFamily: 'var(--font-mono)' }}>₹{sectorMetrics.reduce((s, m) => s + m.gapLakhs, 0).toLocaleString()} Lakhs</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL UNFUNDED GAP <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0 4px', borderRadius: '3px', fontSize: '0.6rem', fontWeight: 800 }}>[CALCULATED]</span></div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>{gapRows.reduce((s, r) => s + r.affectedPop, 0).toLocaleString()}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>CITIZENS AFFECTED <span style={{ background: '#dcfce7', color: '#166534', padding: '0 4px', borderRadius: '3px', fontSize: '0.6rem', fontWeight: 800 }}>[OBSERVED]</span></div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#7c3aed', fontFamily: 'var(--font-mono)' }}>{sectorMetrics.length}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>CRITICAL SECTORS</div>
          </div>
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

            <button
              onClick={() => {
                const targetRow = gapRows.find(r => r.category === sec.category) || gapRows[0];
                handleOpenDossier(targetRow);
              }}
              style={{
                width: '100%',
                marginTop: '0.65rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '0.35rem 0.5rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease'
              }}
            >
              <Sparkles size={11} color="#b45309" />
              <span>Why this recommendation?</span>
            </button>
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
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-medium)', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                <th style={{ padding: '0.65rem', fontWeight: 800 }}>DISTRICT / WARD <span style={{ background: '#f1f5f9', color: '#475569', padding: '0 4px', borderRadius: '3px', fontSize: '0.58rem', fontWeight: 800 }}>[BASELINE]</span></th>
                <th style={{ padding: '0.65rem', fontWeight: 800 }}>SECTOR & NEED</th>
                <th style={{ padding: '0.65rem', fontWeight: 800 }}>
                  DEMAND
                  <span style={{ marginLeft: '4px', background: '#e0f2fe', color: '#0284c7', padding: '0 4px', borderRadius: '3px', fontSize: '0.58rem', fontWeight: 800 }}>[OBSERVED]</span>
                </th>
                <th style={{ padding: '0.65rem', fontWeight: 800 }}>
                  INFRA INDEX
                  <span style={{ marginLeft: '4px', background: '#f1f5f9', color: '#475569', padding: '0 4px', borderRadius: '3px', fontSize: '0.58rem', fontWeight: 800 }}>[BASELINE]</span>
                </th>
                <th style={{ padding: '0.65rem', fontWeight: 800 }}>
                  CAPEX GAP
                  <span style={{ marginLeft: '4px', background: '#d1fae5', color: '#059669', padding: '0 4px', borderRadius: '3px', fontSize: '0.58rem', fontWeight: 800 }}>[CALCULATED]</span>
                </th>
                <th style={{ padding: '0.65rem', fontWeight: 800 }}>EVIDENCE & CALCULATION RATIONALE</th>
                <th style={{ padding: '0.65rem', textAlign: 'right', fontWeight: 800 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r, idx) => (
                <tr
                  key={r.id || idx}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.015)'
                  }}
                >
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleOpenDossier(r)}
                        style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fcd34d',
                          borderRadius: '6px',
                          padding: '0.3rem 0.55rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          transition: 'all 0.15s ease'
                        }}
                        title="Inspect evidence chain, calculation factors, and plain-language explanation"
                      >
                        <Sparkles size={12} color="#b45309" />
                        <span>Why this recommendation?</span>
                      </button>

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
                        <span>Prioritize</span>
                        <ArrowUpRight size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explainable Investment Dossier Slide-Over Drawer */}
      <ExplainableInvestmentDossierDrawer
        dossier={selectedDossier}
        isOpen={!!selectedDossier}
        onClose={() => setSelectedDossier(null)}
        onPrioritize={(incId) => {
          setSelectedDossier(null);
          handleSelectGap(incId);
        }}
      />
    </div>
  </div>
);
};
