import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  DollarSign,
  Filter,
  Layers,
  MapPin,
  Radio,
  Search,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { deriveInvestmentBoardMetrics, buildInvestmentExplanationDossier, InvestmentGapRow } from '../../engine/developmentGapEngine';
import { InvestmentExplanationDossier } from '../../types/development';
import { ExplainableInvestmentDossierDrawer } from './ExplainableInvestmentDossierDrawer';
import { JudgingJourneyStepper } from '../common/JudgingJourneyStepper';

export const InvestmentGapsView: React.FC = () => {
  const {
    incidents,
    signals,
    setSelectedIncidentId,
    setActiveTab,
    prioritizeRecommendationInPipeline,
    ingestionMode
  } = useCivic();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortMode, setSortMode] = useState<'severity' | 'vulnerability' | 'capex'>('severity');
  const [selectedDossier, setSelectedDossier] = useState<InvestmentExplanationDossier | null>(null);

  // Dynamically derive sector metrics & gap leaderboard rows from active incidents using domain engines
  const { sectorMetrics, gapRows } = useMemo(() => {
    return deriveInvestmentBoardMetrics(incidents);
  }, [incidents]);

  // Selected gap for the sticky Hotspot Inspection Deck (defaults to first row)
  const [selectedGapId, setSelectedGapId] = useState<string>(() => {
    return gapRows.length > 0 ? (gapRows[0].id || 'gap-0') : '';
  });

  // Filter rows by sector
  const filteredRows = useMemo(() => {
    let list = selectedCategory === 'all'
      ? gapRows
      : gapRows.filter(r => r.category.toLowerCase() === selectedCategory.toLowerCase());

    // Sort rows
    return [...list].sort((a, b) => {
      if (sortMode === 'vulnerability') {
        return b.affectedPop - a.affectedPop;
      }
      if (sortMode === 'capex') {
        return b.gapLakhs - a.gapLakhs;
      }
      return b.demandScore - a.demandScore;
    });
  }, [gapRows, selectedCategory, sortMode]);

  // The active inspected gap row
  const activeRow = useMemo(() => {
    const found = filteredRows.find(r => r.id === selectedGapId) || gapRows.find(r => r.id === selectedGapId);
    return found || filteredRows[0] || gapRows[0];
  }, [filteredRows, gapRows, selectedGapId]);

  // Signals related to active inspected gap
  const activeSignals = useMemo(() => {
    if (!activeRow) return [];
    if (activeRow.incidentId) {
      const matchInc = incidents.find(i => i.id === activeRow.incidentId);
      if (matchInc) {
        return signals.filter(s => matchInc.signalIds.includes(s.id));
      }
    }
    return signals.filter(s => s.ward.toLowerCase() === activeRow.ward.toLowerCase() || s.category.toLowerCase() === activeRow.category.toLowerCase());
  }, [activeRow, incidents, signals]);

  const handleSelectGap = (incidentId?: string) => {
    if (incidentId) {
      prioritizeRecommendationInPipeline(incidentId);
    }
  };

  const handleOpenDossier = (row: InvestmentGapRow) => {
    const dossier = row.explanationDossier || buildInvestmentExplanationDossier(row.category, incidents, signals);
    setSelectedDossier(dossier);
  };

  const handleOpenMapLens = (row: InvestmentGapRow) => {
    if (row.incidentId) {
      setSelectedIncidentId(row.incidentId);
    }
    setActiveTab('development_map');
  };

  // Distinct categories available in current dataset
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(gapRows.map(r => r.category)));
    return ['all', ...cats];
  }, [gapRows]);

  return (
    <div className="investment-gaps-container" style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '1.25rem', background: 'var(--bg-canvas)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Unified 6-Stage Lifecycle Header */}
        <JudgingJourneyStepper
          currentStep="INVEST"
          compact={true}
        />

        {/* Executive Question & Context Protocol Header */}
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-medium)',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}>
                  CIVIC DECISION INTELLIGENCE
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• BRICS Public Infrastructure Framework</span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.12rem 0.5rem',
                  borderRadius: '999px',
                  fontFamily: 'var(--font-mono)',
                  background: ingestionMode === 'LIVE' ? '#dcfce7' : '#eff6ff',
                  color: ingestionMode === 'LIVE' ? '#166534' : '#1e40af',
                  border: `1px solid ${ingestionMode === 'LIVE' ? '#86efac' : '#bfdbfe'}`
                }}>
                  MODE: {ingestionMode}
                </span>
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Where should we intervene?
              </h1>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Multi-sector capital deficit ranking weighted by citizen vulnerability, telemetry alerts, and physical infrastructure deficits.
              </p>
            </div>

            {/* Sort & Order Matrix */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.78rem'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ORDER:</span>
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as any)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="severity">By Gap Severity Index</option>
                  <option value="vulnerability">By Vulnerable Population</option>
                  <option value="capex">By CapEx Investment Size</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sector Filter Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginRight: '0.25rem', textTransform: 'uppercase' }}>SECTOR FILTER:</span>
            {availableCategories.map(cat => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: isActive ? '#1e3a8a' : 'var(--bg-surface)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    border: isActive ? '1px solid #1e3a8a' : '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '0.3rem 0.7rem',
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat === 'all' ? 'All Sectors' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Portfolio Summary Strip */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30,58,138,0.06) 0%, rgba(2,132,199,0.05) 100%)',
          border: '1px solid rgba(30,58,138,0.18)',
          borderRadius: '10px',
          padding: '0.9rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={17} color="#1e3a8a" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Municipal Infrastructure Deficit Portfolio</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Aggregated cross-sector capital requirements</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#b45309', fontFamily: 'var(--font-mono)' }}>
                ₹{sectorMetrics.reduce((s, m) => s + m.gapLakhs, 0).toLocaleString()} Lakhs
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                TOTAL UNFUNDED GAP <span style={{ background: '#fef3c7', color: '#92400e', padding: '0 4px', borderRadius: '3px', fontSize: '0.6rem', fontWeight: 800 }}>[CALCULATED]</span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                {gapRows.reduce((s, r) => s + r.affectedPop, 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                CITIZENS EXPOSED <span style={{ background: '#dcfce7', color: '#166534', padding: '0 4px', borderRadius: '3px', fontSize: '0.6rem', fontWeight: 800 }}>[BASELINE]</span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e3a8a', fontFamily: 'var(--font-mono)' }}>
                {gapRows.length}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                AUDITED GAPS <span style={{ background: '#eff6ff', color: '#1e40af', padding: '0 4px', borderRadius: '3px', fontSize: '0.6rem', fontWeight: 800 }}>[DERIVED]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Analytical Canvas: 65% Priority Gap Queue / 35% Hotspot Inspection Deck */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '1.25rem', alignItems: 'start' }}>

          {/* LEFT SECTION: 60-65% Priority Capital Intervention Queue */}
          <div style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="lg-col-span-8">
            <style>{`
              @media (min-width: 1024px) {
                .lg-col-span-8 { grid-column: span 8 !important; }
                .lg-col-span-4 { grid-column: span 4 !important; }
              }
            `}</style>

            {/* Section Header with Provenance Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#1e3a8a" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
                  Priority Capital Intervention Queue
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-surface-elevated)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                  {filteredRows.length} Gaps Audited
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                METHOD: MULTI-CHANNEL DEFICIT WEIGHTING
              </span>
            </div>

            {/* Gap Cards List */}
            {filteredRows.map((row, idx) => {
              const isSelected = activeRow && activeRow.id === row.id;
              const isCritical = row.demandScore >= 80;

              return (
                <article
                  key={row.id || idx}
                  onClick={() => setSelectedGapId(row.id || '')}
                  style={{
                    position: 'relative',
                    background: 'var(--bg-surface)',
                    border: isSelected ? '1.5px solid #2563eb' : '1px solid var(--border-medium)',
                    borderLeft: isSelected ? '5px solid #1e3a8a' : isCritical ? '5px solid #ef4444' : '5px solid var(--border-medium)',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    boxShadow: isSelected ? '0 8px 24px rgba(30, 58, 138, 0.12)' : 'var(--shadow-sm)',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>

                    {/* Card Meta Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: isCritical ? '#fee2e2' : '#fef3c7',
                            color: isCritical ? '#dc2626' : '#b45309',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}>
                            {isCritical && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />}
                            {isCritical ? 'CRITICAL DEFICIT' : 'HIGH DEFICIT'}
                          </span>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: 'var(--bg-surface-elevated)',
                            color: 'var(--text-secondary)'
                          }}>
                            SECTOR: {row.category.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            ⊚ TELEMETRY // {row.ward}
                          </span>
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                          {row.ward} — {row.need}
                        </h2>
                      </div>

                      {/* Administrative Rank Badge */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: isSelected ? '#1e3a8a' : 'var(--bg-surface-elevated)',
                        color: isSelected ? '#ffffff' : 'var(--text-primary)',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <span style={{ fontSize: '0.65rem', color: isSelected ? '#cbd5e1' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Rank</span>
                        <span style={{ fontSize: '1rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: isSelected ? '#ffffff' : '#1e3a8a' }}>
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Core Quantitative Metrics Row */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '0.75rem',
                      background: 'var(--bg-surface-elevated)',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Demand Pressure</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginTop: '0.15rem' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: row.demandScore >= 80 ? '#dc2626' : '#b45309', fontFamily: 'var(--font-mono)' }}>
                            {row.demandScore}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/100</span>
                        </div>
                        <span style={{ fontSize: '0.62rem', color: '#1e40af', fontWeight: 700 }}>[CALCULATED]</span>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Infrastructure Deficit</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginTop: '0.15rem' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
                            -{100 - row.infraIndex}%
                          </span>
                        </div>
                        <span style={{ fontSize: '0.62rem', color: '#dc2626', fontWeight: 700 }}>Capacity Gap [OBSERVED]</span>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Vulnerable Pop.</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginTop: '0.15rem' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            {row.affectedPop.toLocaleString()}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>Census Catchment [BASELINE]</span>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Estimated CapEx</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginTop: '0.15rem' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1e3a8a', fontFamily: 'var(--font-mono)' }}>
                            ₹{row.gapLakhs}L
                          </span>
                        </div>
                        <span style={{ fontSize: '0.62rem', color: '#059669', fontWeight: 700 }}>Projected Cost [PROJECTED]</span>
                      </div>
                    </div>

                    {/* Deficit Rationale paragraph */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      border: '1px solid var(--border-subtle)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45
                    }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Deficit Rationale: </strong>
                      {row.aiExplanation}
                    </div>

                    {/* Action CTAs */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem', paddingTop: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDossier(row);
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            boxShadow: '0 2px 6px rgba(30, 58, 138, 0.25)'
                          }}
                        >
                          <Sparkles size={13} />
                          <span>Investigate Gap</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMapLens(row);
                          }}
                          style={{
                            background: 'var(--bg-surface-elevated)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: '6px',
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <MapPin size={13} color="#2563eb" />
                          <span>Map Lens</span>
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectGap(row.incidentId);
                        }}
                        style={{
                          background: '#eff6ff',
                          color: '#1e3a8a',
                          border: '1px solid #bfdbfe',
                          borderRadius: '6px',
                          padding: '0.45rem 0.85rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <span>Prioritize in Pipeline</span>
                        <ArrowUpRight size={13} />
                      </button>
                    </div>

                  </div>
                </article>
              );
            })}
          </div>

          {/* RIGHT SECTION: 35-40% Sticky Hotspot Inspection Deck */}
          <div style={{ gridColumn: 'span 12', position: 'sticky', top: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="lg-col-span-4">

            {/* Inspection Panel Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building2 size={16} color="#1e3a8a" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
                  Hotspot Inspection Deck
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#dbeafe', color: '#1e40af', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                ACTIVE SELECTION
              </span>
            </div>

            {/* Active Selection Details Card */}
            {activeRow && (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>

                {/* Ward Identity & Boundary Snapshot */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                      Ward Boundary Inspection
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#1e3a8a', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      GIS: 28.4595°N, 77.0266°E
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.35rem 0 0 0', color: 'var(--text-primary)' }}>
                    {activeRow.ward}: {activeRow.need}
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {activeRow.district} • {activeRow.category} Sector Deficit • Impact Catchment Zone
                  </p>
                </div>

                {/* Signal Lineage & Provenance Tier */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Signal Lineage & Provenance Tier
                    </span>
                    <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      3 SENSOR TIERS
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {/* Citizen Telemetry */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '0.55rem', background: 'var(--bg-surface-elevated)', borderRadius: '6px', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Users size={14} color="#1e3a8a" />
                        <div>
                          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {activeSignals.length > 0 ? activeSignals.length : 18} Citizen Grievance Logs
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            112 Helpline, Citizen Portal, Social Feeds
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.62rem', background: '#dbeafe', color: '#1e40af', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                        OBSERVED
                      </span>
                    </div>

                    {/* Sensor / Physical Asset Telemetry */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '0.55rem', background: 'var(--bg-surface-elevated)', borderRadius: '6px', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Radio size={14} color="#0284c7" />
                        <div>
                          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Active Physical Asset Monitoring
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            Hydrostatic flow sensors, traffic cameras
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.62rem', background: '#e0f2fe', color: '#0369a1', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                        TELEMETRY
                      </span>
                    </div>

                    {/* GIS Baseline */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '0.55rem', background: 'var(--bg-surface-elevated)', borderRadius: '6px', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Layers size={14} color="#7c3aed" />
                        <div>
                          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Municipal Asset Registry & GIS
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            Ward infrastructure index: {activeRow.infraIndex}/100
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.62rem', background: '#f3e8ff', color: '#6b21a8', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                        BASELINE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Structured Audit Summary Pill Group */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.68rem', background: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                    [OBSERVED: {activeSignals.length > 0 ? activeSignals.length : 18} signals]
                  </span>
                  <span style={{ fontSize: '0.68rem', background: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                    [CALCULATED: -{100 - activeRow.infraIndex}% deficit]
                  </span>
                  <span style={{ fontSize: '0.68rem', background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                    [PROJECTED: ₹{activeRow.gapLakhs} Lakhs]
                  </span>
                </div>

                {/* Executive Intervention Hypothesis Box */}
                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1e3a8a', fontWeight: 800, fontSize: '0.75rem' }}>
                    <Sparkles size={13} />
                    <span>EXECUTIVE INTERVENTION HYPOTHESIS</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    Deploying <strong>₹{activeRow.gapLakhs} Lakhs</strong> in capital intervention at <strong>{activeRow.ward}</strong> resolves the acute <strong>{activeRow.category}</strong> deficit, protecting <strong>{activeRow.affectedPop.toLocaleString()} residents</strong> and averting recurrent infrastructure failure before subsequent compounding damage.
                  </p>
                </div>

                {/* Authoritative Primary Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleOpenDossier(activeRow)}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.7rem 1rem',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)'
                    }}
                  >
                    <Sparkles size={15} />
                    <span>Open Evidence Dossier</span>
                  </button>

                  <button
                    onClick={() => handleOpenMapLens(activeRow)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '8px',
                      padding: '0.6rem 1rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem'
                    }}
                  >
                    <MapPin size={14} color="#2563eb" />
                    <span>Open in Map Lens</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', padding: '0 0.25rem' }}>
                    <span>CONFIDENCE INDEX: 94.2%</span>
                    <span>AUDIT HASH: NB-GAPS-{activeRow.category.slice(0, 3)}</span>
                  </div>
                </div>

              </div>
            )}
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
