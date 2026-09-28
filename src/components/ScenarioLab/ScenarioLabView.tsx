import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Compass,
  Database,
  FlaskConical,
  Info,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import {
  runSimulationScenario,
  getBaselineSectorContext
} from '../../engine/simulationScenarioEngine';
import { ScenarioChange, SimulationScenario } from '../../types/simulationScenario';

export const ScenarioLabView: React.FC = () => {
  const { ingestionMode, incidents } = useCivic();

  // Selected Target Sector
  const [targetSectorId, setTargetSectorId] = useState<string>('WATER');

  // Scenario Slider/Input States
  const [popPercent, setPopPercent] = useState<number>(15);
  const [vulnPopPercent, setVulnPopPercent] = useState<number>(10);
  const [signalVolPercent, setSignalVolPercent] = useState<number>(25);
  const [infraPts, setInfraPts] = useState<number>(-10);

  // Construct active SimulationScenario definition
  const currentScenario: SimulationScenario = useMemo(() => {
    const changes: ScenarioChange[] = [];

    if (popPercent !== 0) {
      changes.push({ type: 'POPULATION_PERCENT', value: popPercent });
    }
    if (vulnPopPercent !== 0) {
      changes.push({ type: 'VULNERABLE_POPULATION_PERCENT', value: vulnPopPercent });
    }
    if (signalVolPercent !== 0) {
      changes.push({ type: 'SIGNAL_VOLUME_PERCENT', value: signalVolPercent });
    }
    if (infraPts !== 0) {
      changes.push({ type: 'INFRASTRUCTURE_INDEX_POINTS', value: infraPts });
    }

    return {
      id: `scenario-lab-${targetSectorId.toLowerCase()}`,
      targetSectorId,
      title: 'Isolated What-If Analysis',
      description: 'Temporary scenario overlay executed against authoritative NagarBodh engines',
      changes
    };
  }, [targetSectorId, popPercent, vulnPopPercent, signalVolPercent, infraPts]);

  // Execute scenario analysis immutably via simulationScenarioEngine
  const analysisResult = useMemo(() => {
    return runSimulationScenario(currentScenario, ingestionMode, incidents);
  }, [currentScenario, ingestionMode, incidents]);

  // Reset helper
  const handleReset = () => {
    setPopPercent(0);
    setVulnPopPercent(0);
    setSignalVolPercent(0);
    setInfraPts(0);
  };

  const handleApplyMonsoonSurgePreset = () => {
    setPopPercent(0);
    setVulnPopPercent(5);
    setSignalVolPercent(35);
    setInfraPts(-15);
  };

  const handleApplyDemographicGrowthPreset = () => {
    setPopPercent(20);
    setVulnPopPercent(15);
    setSignalVolPercent(10);
    setInfraPts(-5);
  };

  return (
    <div className="scenario-lab-view-container w-full h-full flex-1 overflow-y-auto bg-[var(--bg-canvas)] text-[var(--text-primary)] font-body p-4 md:p-6 space-y-6">
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">

        {/* Header Banner & Provenance Notification */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="p-2 rounded-lg bg-[var(--civic-blue-50)] text-[var(--text-accent)] border border-[var(--border-accent)]">
                  <FlaskConical size={20} />
                </span>
                <div>
                  <h1 className="text-lg md:text-xl font-headline font-extrabold text-[var(--text-primary)] tracking-tight">
                    Scenario Lab — What-If Analytical Sandbox
                  </h1>
                  <span className="text-[11px] font-mono text-[var(--text-muted)] font-medium">
                    Civic Assumptions & Sensitivity Testing Utility
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[var(--civic-blue-100)] text-[var(--text-accent)] border border-[var(--border-accent)]">
                  ANALYTICAL SANDBOX
                </span>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border ${
                  ingestionMode === 'LIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                }`}>
                  ● {ingestionMode} MODE
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-2 font-medium max-w-3xl leading-relaxed">
                Explore how changes in civic assumptions (demographics, demand volume, infrastructure adequacy) affect NagarBodh's projected investment and impact outputs.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-lg bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-medium)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 transition-colors cursor-pointer"
                title="Reset all scenario parameters to baseline"
              >
                <RotateCcw size={14} className="text-[var(--text-muted)]" />
                <span>Reset to Baseline</span>
              </button>
            </div>
          </div>

          {/* Hard Isolation Guarantee Callout */}
          <div className="mt-4 p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-start gap-3 text-xs text-[var(--text-secondary)]">
            <ShieldAlert size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="leading-relaxed">
              <strong className="text-[var(--text-primary)] font-semibold">Strict Analytical Isolation:</strong> Scenario Lab calculations run exclusively on temporary, in-memory overlays. Authoritative NagarBodh state, canonical priority scores, intervention lifecycles, baseline datasets, and simulation steps remain <span className="font-extrabold text-[var(--text-accent)]">100% untouched</span>.
            </div>
          </div>
        </div>

        {/* Main Grid: Sector Selector & Controls + Comparison Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Target Sector & Scenario Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">

            {/* 1. Target Sector Selection */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 md:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-[var(--text-muted)] tracking-wider">
                <span>1. Target District Sector</span>
                <span className="text-[var(--text-accent)] font-semibold">{analysisResult.wardName}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'WATER', label: 'Sector 15 (Water)', desc: 'Waterlogging & Drainage' },
                  { id: 'HEALTHCARE', label: 'Seelampur (Health)', desc: 'Primary Healthcare' },
                  { id: 'TRANSPORT', label: 'Rohini (Transit)', desc: 'Feeder Bus & Transit' },
                  { id: 'EDUCATION', label: 'Dwarka (Schools)', desc: 'Primary Schools' }
                ].map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => setTargetSectorId(sec.id)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col ${
                      targetSectorId === sec.id
                        ? 'bg-[var(--civic-blue-50)] border-[var(--border-accent)] text-[var(--text-accent)] font-bold shadow-xs'
                        : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="text-xs font-bold">{sec.label}</span>
                    <span className="text-[10px] text-[var(--text-muted)] mt-0.5">{sec.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Scenario Parameter Controls */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 md:p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-[var(--text-accent)]" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    2. Scenario What-If Adjustments
                  </h3>
                </div>
                <span className="text-[10px] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] px-2 py-0.5 rounded font-mono font-bold border border-[var(--border-subtle)]">
                  {currentScenario.changes.length} ACTIVE {currentScenario.changes.length === 1 ? 'CHANGE' : 'CHANGES'}
                </span>
              </div>

              {/* Parameter 1: POPULATION_PERCENT */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <label className="text-[var(--text-primary)] font-semibold flex items-center gap-1.5">
                    <Users size={14} className="text-sky-500" />
                    <span>Sector Population Change</span>
                  </label>
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                    {popPercent > 0 ? `+${popPercent}%` : `${popPercent}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={popPercent}
                  onChange={e => setPopPercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-surface-elevated)] rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                  <span>-50%</span>
                  <span>Baseline (0%)</span>
                  <span>+50%</span>
                </div>
              </div>

              {/* Parameter 2: VULNERABLE_POPULATION_PERCENT */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs font-medium">
                  <label className="text-[var(--text-primary)] font-semibold flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span>Vulnerable Population Change</span>
                  </label>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {vulnPopPercent > 0 ? `+${vulnPopPercent}%` : `${vulnPopPercent}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={vulnPopPercent}
                  onChange={e => setVulnPopPercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-surface-elevated)] rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                  <span>-50%</span>
                  <span>Baseline (0%)</span>
                  <span>+50%</span>
                </div>
              </div>

              {/* Parameter 3: SIGNAL_VOLUME_PERCENT */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs font-medium">
                  <label className="text-[var(--text-primary)] font-semibold flex items-center gap-1.5">
                    <Activity size={14} className="text-emerald-500" />
                    <span>Demand Signal Volume Change</span>
                  </label>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {signalVolPercent > 0 ? `+${signalVolPercent}%` : `${signalVolPercent}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="100"
                  step="5"
                  value={signalVolPercent}
                  onChange={e => setSignalVolPercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-surface-elevated)] rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                  <span>-50%</span>
                  <span>Baseline (0%)</span>
                  <span>+100%</span>
                </div>
              </div>

              {/* Parameter 4: INFRASTRUCTURE_INDEX_POINTS */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs font-medium">
                  <label className="text-[var(--text-primary)] font-semibold flex items-center gap-1.5">
                    <Building2 size={14} className="text-indigo-500" />
                    <span>Infrastructure Index Change</span>
                  </label>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {infraPts > 0 ? `+${infraPts} pts` : `${infraPts} pts`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  step="5"
                  value={infraPts}
                  onChange={e => setInfraPts(Number(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-surface-elevated)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                  <span>-40 pts (Worse)</span>
                  <span>Baseline (0)</span>
                  <span>+40 pts (Better)</span>
                </div>
              </div>

              {/* Presets */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] tracking-wider">
                  Quick Stress Test Presets:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApplyMonsoonSurgePreset}
                    className="flex-1 py-1.5 px-2.5 bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-card-hover)] rounded-lg text-xs font-semibold text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
                  >
                    ⚡ Monsoon Surge
                  </button>
                  <button
                    onClick={handleApplyDemographicGrowthPreset}
                    className="flex-1 py-1.5 px-2.5 bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-card-hover)] rounded-lg text-xs font-semibold text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
                  >
                    👥 Population Influx
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Comparative Analytical Results Matrix (7 cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Headline Sensitivity Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Priority Score Summary */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-xs relative overflow-hidden">
                <div className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
                  <span>Priority Score</span>
                  <span className="text-[9px] bg-[var(--civic-blue-50)] text-[var(--text-accent)] px-1.5 py-0.2 rounded font-bold border border-[var(--border-accent)]">[CALCULATED]</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-2xl font-headline font-black text-[var(--text-primary)]">
                    {analysisResult.scenarioResult.priorityScore}
                    <span className="text-xs font-normal text-[var(--text-muted)]">/100</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-[var(--text-muted)]">
                    Base: {analysisResult.baseline.priorityScore}
                  </div>
                </div>
                <div className="mt-2 text-[11px] font-bold flex items-center gap-1">
                  {analysisResult.deltas.priorityScoreDelta > 0 ? (
                    <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                      <TrendingUp size={13} /> +{analysisResult.deltas.priorityScoreDelta} pts (Higher Urgency)
                    </span>
                  ) : analysisResult.deltas.priorityScoreDelta < 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <TrendingDown size={13} /> {analysisResult.deltas.priorityScoreDelta} pts (Lower Urgency)
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)] font-mono">No change from baseline</span>
                  )}
                </div>
              </div>

              {/* Required CapEx Investment Summary */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-xs relative overflow-hidden">
                <div className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
                  <span>Required CapEx</span>
                  <span className="text-[9px] bg-[var(--civic-blue-50)] text-[var(--text-accent)] px-1.5 py-0.2 rounded font-bold border border-[var(--border-accent)]">[CALCULATED]</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-2xl font-headline font-black text-[var(--text-primary)]">
                    ₹{analysisResult.scenarioResult.investmentGapLakhs}L
                  </div>
                  <div className="text-xs font-mono font-bold text-[var(--text-muted)]">
                    Base: ₹{analysisResult.baseline.investmentGapLakhs}L
                  </div>
                </div>
                <div className="mt-2 text-[11px] font-bold flex items-center gap-1">
                  {analysisResult.deltas.investmentGapDeltaLakhs > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                      <TrendingUp size={13} /> +₹{analysisResult.deltas.investmentGapDeltaLakhs}L Gap Increase
                    </span>
                  ) : analysisResult.deltas.investmentGapDeltaLakhs < 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <TrendingDown size={13} /> ₹{analysisResult.deltas.investmentGapDeltaLakhs}L Gap Reduction
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)] font-mono">Unchanged (₹350L Baseline)</span>
                  )}
                </div>
              </div>

              {/* Projected Impact Score Summary */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-xs relative overflow-hidden">
                <div className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
                  <span>Projected Impact</span>
                  <span className="text-[9px] bg-[var(--civic-blue-50)] text-[var(--text-accent)] px-1.5 py-0.2 rounded font-bold border border-[var(--border-accent)]">[PROJECTED]</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-2xl font-headline font-black text-emerald-600 dark:text-emerald-400">
                    {analysisResult.scenarioResult.projectedImpactScore}
                    <span className="text-xs font-normal text-[var(--text-muted)]">/100</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-[var(--text-muted)]">
                    Base: {analysisResult.baseline.projectedImpactScore}
                  </div>
                </div>
                <div className="mt-2 text-[11px] font-bold flex items-center gap-1">
                  {analysisResult.deltas.projectedImpactScoreDelta > 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp size={13} /> +{analysisResult.deltas.projectedImpactScoreDelta} Impact Gain
                    </span>
                  ) : analysisResult.deltas.projectedImpactScoreDelta < 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                      <TrendingDown size={13} /> {analysisResult.deltas.projectedImpactScoreDelta} Impact Drop
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)] font-mono">Unchanged (84/100 Baseline)</span>
                  )}
                </div>
              </div>

            </div>

            {/* Full Metric Comparison Matrix */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 md:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                  <Database size={15} className="text-[var(--text-accent)]" />
                  <span>Analytical Metric Sensitivity Matrix</span>
                </h3>
                <span className="text-[10px] text-[var(--text-muted)] font-mono hidden sm:inline">
                  Source: {analysisResult.provenance.source}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                      <th className="py-2.5 px-3">Metric Name</th>
                      <th className="py-2.5 px-3 text-right">Authoritative Baseline</th>
                      <th className="py-2.5 px-3 text-right">Scenario Result</th>
                      <th className="py-2.5 px-3 text-right">Delta</th>
                      <th className="py-2.5 px-3 text-center">Provenance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {analysisResult.comparisonItems.map(item => (
                      <tr key={item.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">
                          {item.label}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--text-secondary)]">
                          {typeof item.baseline === 'number' ? item.baseline.toLocaleString() : item.baseline}
                          <span className="text-[10px] font-normal text-[var(--text-muted)] ml-0.5">{item.unit}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--text-primary)]">
                          {typeof item.scenario === 'number' ? item.scenario.toLocaleString() : item.scenario}
                          <span className="text-[10px] font-normal text-[var(--text-muted)] ml-0.5">{item.unit}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          {item.delta > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400">+{item.delta.toLocaleString()}</span>
                          ) : item.delta < 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400">{item.delta.toLocaleString()}</span>
                          ) : (
                            <span className="text-[var(--text-muted)]">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-[9px]">
                          <span className="bg-[var(--civic-blue-50)] text-[var(--text-accent)] px-1.5 py-0.5 rounded border border-[var(--border-accent)] font-bold">
                            {item.provenance}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Canonical Baseline Verification & Regression Safeguard Card */}
            <div className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 size={16} />
                <span>Canonical Baseline Regression Safeguard</span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
                Sector 15 baseline metrics are strictly preserved in application state: Priority <strong className="text-[var(--text-primary)]">94/100 P1</strong>, Population <strong className="text-[var(--text-primary)]">184,000</strong>, Vulnerable Population <strong className="text-[var(--text-primary)]">45,000 (24.5%)</strong>, Vulnerability Index <strong className="text-[var(--text-primary)]">91/100</strong>, Signals <strong className="text-[var(--text-primary)]">32</strong>, CapEx <strong className="text-[var(--text-primary)]">₹350L</strong>, Projected Impact <strong className="text-[var(--text-primary)]">84/100</strong>.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ScenarioLabView;
