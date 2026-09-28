import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Database,
  Eye,
  FlaskConical,
  Globe,
  Info,
  Layers,
  Minus,
  Plus,
  Radio,
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
import { ScenarioChange, SimulationScenario, ScenarioAnalysisResult } from '../../types/simulationScenario';
import { ProvenanceBadge } from '../Evidence/ExpandableEvidenceUI';

export const ScenarioLabView: React.FC = () => {
  const { ingestionMode, incidents, signals, currentWeather, liveWeatherEnvelope } = useCivic();

  // 1. Target Sector Selection (Sector 15 Water is primary demo focus)
  const [targetSectorId, setTargetSectorId] = useState<string>('WATER');

  // 2. What-If Assumption Input Sliders/Steppers
  const [popPercent, setPopPercent] = useState<number>(15);
  const [vulnPopPercent, setVulnPopPercent] = useState<number>(10);
  const [signalVolPercent, setSignalVolPercent] = useState<number>(25);
  const [infraPts, setInfraPts] = useState<number>(-10);

  // 3. Calculation State (explicit Calculate Scenario execution)
  const [hasCalculated, setHasCalculated] = useState<boolean>(true);
  const [lastCalculatedAt, setLastCalculatedAt] = useState<string>(() => new Date().toLocaleTimeString());

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
  const analysisResult: ScenarioAnalysisResult = useMemo(() => {
    return runSimulationScenario(currentScenario, ingestionMode, incidents);
  }, [currentScenario, ingestionMode, incidents]);

  // Handle Calculate Action
  const handleCalculate = () => {
    setHasCalculated(true);
    setLastCalculatedAt(new Date().toLocaleTimeString());
  };

  // Reset helper
  const handleReset = () => {
    setPopPercent(0);
    setVulnPopPercent(0);
    setSignalVolPercent(0);
    setInfraPts(0);
    setHasCalculated(false);
  };

  // Stress-Test Presets
  const handleApplyMonsoonSurgePreset = () => {
    setPopPercent(0);
    setVulnPopPercent(5);
    setSignalVolPercent(35);
    setInfraPts(-15);
    setHasCalculated(true);
    setLastCalculatedAt(new Date().toLocaleTimeString());
  };

  const handleApplyDemographicGrowthPreset = () => {
    setPopPercent(20);
    setVulnPopPercent(15);
    setSignalVolPercent(10);
    setInfraPts(-5);
    setHasCalculated(true);
    setLastCalculatedAt(new Date().toLocaleTimeString());
  };

  const handleApplyModernizationPreset = () => {
    setPopPercent(0);
    setVulnPopPercent(-10);
    setSignalVolPercent(-20);
    setInfraPts(25);
    setHasCalculated(true);
    setLastCalculatedAt(new Date().toLocaleTimeString());
  };

  const isLiveWeather = Boolean(liveWeatherEnvelope && ingestionMode === 'LIVE');

  return (
    <div className="scenario-lab-view-container w-full h-full flex-1 overflow-y-auto bg-[var(--bg-canvas)] text-[var(--text-primary)] font-body p-4 md:p-6 space-y-6">
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">

        {/* 1. Header Banner & Mode Indicator */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="p-2 rounded-lg bg-[var(--civic-blue-50)] text-[var(--text-accent)] border border-[var(--border-accent)]">
                  <FlaskConical size={20} />
                </span>
                <div>
                  <h1 className="text-lg md:text-xl font-headline font-extrabold text-[var(--text-primary)] tracking-tight">
                    Scenario Lab
                  </h1>
                  <span className="text-[11px] font-mono text-[var(--text-muted)] font-medium">
                    Sandboxed What-If Analytical Workspace
                  </span>
                </div>
                <ProvenanceBadge label="[SANDBOXED SCENARIO]" type="simulation" />
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border ${
                  ingestionMode === 'LIVE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                }`}>
                  ● {ingestionMode} BASELINE
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-2 font-medium max-w-3xl leading-relaxed">
                Explore how changing civic assumptions could affect projected investment outcomes.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleCalculate}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                title="Execute scenario calculations against deterministic engines"
              >
                <Sparkles size={14} />
                <span>Calculate Scenario</span>
              </button>

              <button
                onClick={handleReset}
                className="px-3 py-2 rounded-lg bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-medium)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 transition-colors cursor-pointer"
                title="Reset all scenario parameters to baseline"
              >
                <RotateCcw size={14} className="text-[var(--text-muted)]" />
                <span>Reset Scenario</span>
              </button>
            </div>
          </div>

          {/* Hard Isolation Notice */}
          <div className="mt-4 p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-start gap-3 text-xs text-[var(--text-secondary)]">
            <ShieldAlert size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="leading-relaxed">
              <strong className="text-[var(--text-primary)] font-semibold">Sandboxed analysis:</strong> Scenario changes are temporary and do not modify NagarBodh's live data, simulation state, investment recommendations, or intervention records.
            </div>
          </div>
        </div>

        {/* 2. Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: Target Sector & What-If Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-5">

            {/* Sector Context Snapshot */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 md:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-[var(--text-muted)] tracking-wider">
                <span>Selected Sector</span>
                <span className="text-[var(--text-accent)] font-semibold">{analysisResult.wardName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'WATER', label: 'Sector 15 (Water)', desc: 'Water / Stormwater' },
                  { id: 'HEALTHCARE', label: 'Seelampur (Health)', desc: 'Primary Healthcare' },
                  { id: 'TRANSPORT', label: 'Rohini (Transit)', desc: 'Feeder Bus & Transit' },
                  { id: 'EDUCATION', label: 'Dwarka (Schools)', desc: 'Primary Schools' }
                ].map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setTargetSectorId(sec.id);
                      setHasCalculated(true);
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col ${
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

            {/* Authoritative Canonical Baseline Card */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 md:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={15} className="text-slate-600" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Authoritative Baseline Context
                  </h3>
                </div>
                <ProvenanceBadge label="[BASELINE CONTEXT]" type="baseline" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-[var(--bg-surface-elevated)] rounded-lg border border-[var(--border-subtle)]">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Priority Score</div>
                  <div className="text-base font-black font-mono text-[var(--text-primary)]">
                    {analysisResult.baseline.priorityScore}
                    <span className="text-[10px] font-normal text-[var(--text-muted)]">/100</span>
                  </div>
                  <div className="text-[9px] text-rose-600 font-bold mt-0.5">{analysisResult.baseline.priorityLevel}</div>
                </div>

                <div className="p-2.5 bg-[var(--bg-surface-elevated)] rounded-lg border border-[var(--border-subtle)]">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Population</div>
                  <div className="text-base font-black font-mono text-[var(--text-primary)]">
                    {analysisResult.baseline.population.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{analysisResult.baseline.vulnerablePopulation.toLocaleString()} vuln</div>
                </div>

                <div className="p-2.5 bg-[var(--bg-surface-elevated)] rounded-lg border border-[var(--border-subtle)]">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Capital Gap</div>
                  <div className="text-base font-black font-mono text-[var(--text-primary)]">
                    ₹{analysisResult.baseline.investmentGapLakhs}L
                  </div>
                  <div className="text-[9px] text-emerald-600 font-bold mt-0.5">{analysisResult.baseline.projectedImpactScore}/100 impact</div>
                </div>
              </div>
            </div>

            {/* What-If Assumption Controls */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 md:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-[var(--text-accent)]" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    What-If Civic Assumptions
                  </h3>
                </div>
                <ProvenanceBadge label="[SIMULATION]" type="simulation" />
              </div>

              {/* Control 1: Population Percentage */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <label className="text-[var(--text-primary)] font-semibold flex items-center gap-1.5">
                    <Users size={14} className="text-sky-500" />
                    <span>Population Adjustment</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPopPercent(p => Math.max(-50, p - 5))}
                      className="p-1 rounded bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      title="Decrease by 5%"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="font-mono font-bold text-sky-600 w-12 text-center text-xs">
                      {popPercent > 0 ? `+${popPercent}%` : `${popPercent}%`}
                    </span>
                    <button
                      onClick={() => setPopPercent(p => Math.min(50, p + 5))}
                      className="p-1 rounded bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      title="Increase by 5%"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
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
              </div>

              {/* Control 2: Vulnerable Population Percentage */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs font-medium">
                  <label className="text-[var(--text-primary)] font-semibold flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span>Vulnerable Population</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setVulnPopPercent(p => Math.max(-50, p - 5))}
                      className="p-1 rounded bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      title="Decrease by 5%"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="font-mono font-bold text-amber-600 w-12 text-center text-xs">
                      {vulnPopPercent > 0 ? `+${vulnPopPercent}%` : `${vulnPopPercent}%`}
                    </span>
                    <button
                      onClick={() => setVulnPopPercent(p => Math.min(50, p + 5))}
                      className="p-1 rounded bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      title="Increase by 5%"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
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
              </div>

              {/* Control 3: Demand Signal Volume */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs font-medium">
                  <label className="text-[var(--text-primary)] font-semibold flex items-center gap-1.5">
                    <Activity size={14} className="text-emerald-500" />
                    <span>Signal Volume</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSignalVolPercent(p => Math.max(-50, p - 5))}
                      className="p-1 rounded bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      title="Decrease by 5%"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="font-mono font-bold text-emerald-600 w-12 text-center text-xs">
                      {signalVolPercent > 0 ? `+${signalVolPercent}%` : `${signalVolPercent}%`}
                    </span>
                    <button
                      onClick={() => setSignalVolPercent(p => Math.min(100, p + 5))}
                      className="p-1 rounded bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      title="Increase by 5%"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
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
              </div>

              {/* Control 4: Infrastructure Index */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs font-medium">
                  <label className="text-[var(--text-primary)] font-semibold flex items-center gap-1.5">
                    <Building2 size={14} className="text-indigo-500" />
                    <span>Infrastructure Index</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setInfraPts(p => Math.max(-40, p - 5))}
                      className="p-1 rounded bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      title="Decrease by 5 pts"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="font-mono font-bold text-indigo-600 w-14 text-center text-xs">
                      {infraPts > 0 ? `+${infraPts} pts` : `${infraPts} pts`}
                    </span>
                    <button
                      onClick={() => setInfraPts(p => Math.min(40, p + 5))}
                      className="p-1 rounded bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      title="Increase by 5 pts"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
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
              </div>

              {/* Presets Row */}
              <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] tracking-wider">
                  Quick What-If Presets:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleApplyMonsoonSurgePreset}
                    className="flex-1 py-1 px-2 bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-card-hover)] rounded-md text-[11px] font-semibold text-[var(--text-primary)] border border-[var(--border-subtle)] cursor-pointer"
                  >
                    ⚡ Monsoon Surge
                  </button>
                  <button
                    onClick={handleApplyDemographicGrowthPreset}
                    className="flex-1 py-1 px-2 bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-card-hover)] rounded-md text-[11px] font-semibold text-[var(--text-primary)] border border-[var(--border-subtle)] cursor-pointer"
                  >
                    👥 Growth (+20%)
                  </button>
                  <button
                    onClick={handleApplyModernizationPreset}
                    className="flex-1 py-1 px-2 bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-card-hover)] rounded-md text-[11px] font-semibold text-[var(--text-primary)] border border-[var(--border-subtle)] cursor-pointer"
                  >
                    🛠️ Upgrade (+25 pts)
                  </button>
                </div>
              </div>
            </div>

            {/* Evidence Context Summary (Non-blocking contextual reference) */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5 text-[var(--text-primary)]">
                  <Eye size={13} className="text-blue-600" />
                  Evidence Context Baseline
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">Reference Only</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-[var(--bg-surface-elevated)] rounded-md border border-[var(--border-subtle)]">
                  <div className="text-[10px] text-[var(--text-muted)]">Citizen Grievances</div>
                  <div className="font-bold text-[var(--text-primary)] font-mono">32 Signals</div>
                  <div className="text-[9px] text-blue-600 font-bold">[OBSERVED]</div>
                </div>
                <div className="p-2 bg-[var(--bg-surface-elevated)] rounded-md border border-[var(--border-subtle)]">
                  <div className="text-[10px] text-[var(--text-muted)]">Rainfall Telemetry</div>
                  <div className="font-bold text-[var(--text-primary)] font-mono">{currentWeather?.rainfallMmPerHour ?? 42} mm/hr</div>
                  <div className="text-[9px] text-cyan-600 font-bold">[{isLiveWeather ? 'LIVE' : 'REPLAY'}]</div>
                </div>
                <div className="p-2 bg-[var(--bg-surface-elevated)] rounded-md border border-[var(--border-subtle)]">
                  <div className="text-[10px] text-[var(--text-muted)]">Government Facility</div>
                  <div className="font-bold text-[var(--text-primary)] truncate">OGD Hospitals</div>
                  <div className="text-[9px] text-slate-600 font-bold">[BASELINE CONTEXT]</div>
                </div>
                <div className="p-2 bg-[var(--bg-surface-elevated)] rounded-md border border-[var(--border-subtle)]">
                  <div className="text-[10px] text-[var(--text-muted)]">Public Stream</div>
                  <div className="font-bold text-[var(--text-primary)] truncate">Bluesky AppView</div>
                  <div className="text-[9px] text-pink-600 font-bold">[EXTERNAL PUBLIC]</div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Scenario Result & Sensitivity Matrix (7 cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Top Comparative Result Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* 1. Priority Score */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-xs relative overflow-hidden">
                <div className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
                  <span>Priority Score</span>
                  <ProvenanceBadge label="[CALCULATED]" type="calculated" />
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
                    <span className="text-rose-600 flex items-center gap-0.5">
                      <TrendingUp size={13} /> +{analysisResult.deltas.priorityScoreDelta} pts (Higher Urgency)
                    </span>
                  ) : analysisResult.deltas.priorityScoreDelta < 0 ? (
                    <span className="text-emerald-600 flex items-center gap-0.5">
                      <TrendingDown size={13} /> {analysisResult.deltas.priorityScoreDelta} pts (Lower Urgency)
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)] font-mono">No change from baseline</span>
                  )}
                </div>
              </div>

              {/* 2. Required CapEx */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-xs relative overflow-hidden">
                <div className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
                  <span>Required CapEx</span>
                  <ProvenanceBadge label="[CALCULATED]" type="calculated" />
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
                    <span className="text-amber-600 flex items-center gap-0.5">
                      <TrendingUp size={13} /> +₹{analysisResult.deltas.investmentGapDeltaLakhs}L Gap Increase
                    </span>
                  ) : analysisResult.deltas.investmentGapDeltaLakhs < 0 ? (
                    <span className="text-emerald-600 flex items-center gap-0.5">
                      <TrendingDown size={13} /> ₹{analysisResult.deltas.investmentGapDeltaLakhs}L Gap Reduction
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)] font-mono">Unchanged (₹350L Baseline)</span>
                  )}
                </div>
              </div>

              {/* 3. Projected Impact */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-xs relative overflow-hidden">
                <div className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
                  <span>Projected Impact</span>
                  <ProvenanceBadge label="[PROJECTED]" type="projected" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-2xl font-headline font-black text-emerald-600">
                    {analysisResult.scenarioResult.projectedImpactScore}
                    <span className="text-xs font-normal text-[var(--text-muted)]">/100</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-[var(--text-muted)]">
                    Base: {analysisResult.baseline.projectedImpactScore}
                  </div>
                </div>
                <div className="mt-2 text-[11px] font-bold flex items-center gap-1">
                  {analysisResult.deltas.projectedImpactScoreDelta > 0 ? (
                    <span className="text-emerald-600 flex items-center gap-0.5">
                      <TrendingUp size={13} /> +{analysisResult.deltas.projectedImpactScoreDelta} Impact Gain
                    </span>
                  ) : analysisResult.deltas.projectedImpactScoreDelta < 0 ? (
                    <span className="text-amber-600 flex items-center gap-0.5">
                      <TrendingDown size={13} /> {analysisResult.deltas.projectedImpactScoreDelta} Impact Drop
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)] font-mono">Unchanged (84/100 Baseline)</span>
                  )}
                </div>
              </div>

            </div>

            {/* Scenario Result Comparison Table */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 md:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div>
                  <h2 className="text-sm font-headline font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Database size={16} className="text-blue-600" />
                    <span>Scenario Result & Sensitivity Matrix</span>
                  </h2>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    Deterministic before-and-after comparison generated by NagarBodh's frozen scoring engines.
                  </p>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono hidden sm:inline">
                  Calculated: {lastCalculatedAt}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                      <th className="py-2.5 px-3">Metric</th>
                      <th className="py-2.5 px-3 text-right">Baseline</th>
                      <th className="py-2.5 px-3 text-right">Scenario</th>
                      <th className="py-2.5 px-3 text-right">Change</th>
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
                            <span className="text-amber-600">+{item.delta.toLocaleString()}</span>
                          ) : item.delta < 0 ? (
                            <span className="text-emerald-600">{item.delta.toLocaleString()}</span>
                          ) : (
                            <span className="text-[var(--text-muted)]">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <ProvenanceBadge label={item.provenance} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Regression Invariance Assurance Card */}
            <div className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-mono font-bold text-emerald-600 uppercase tracking-wider">
                <CheckCircle2 size={16} />
                <span>Canonical Invariance Guarantee</span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
                NagarBodh canonical outputs remain frozen: Priority <strong className="text-[var(--text-primary)]">94/100 P1</strong>, Population <strong className="text-[var(--text-primary)]">184,000</strong>, Vulnerable Population <strong className="text-[var(--text-primary)]">45,000 (24.5%)</strong>, Vulnerability Index <strong className="text-[var(--text-primary)]">91/100</strong>, Signals <strong className="text-[var(--text-primary)]">32</strong>, Investment Gap <strong className="text-[var(--text-primary)]">₹350L</strong>, Projected Impact <strong className="text-[var(--text-primary)]">84/100</strong>.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ScenarioLabView;
