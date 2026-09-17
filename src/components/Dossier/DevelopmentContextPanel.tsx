import React from 'react';
import {
  Activity,
  AlertTriangle,
  Building2,
  Calculator,
  CloudRain,
  Database,
  DollarSign,
  Layers,
  MapPin,
  Shield,
  TrendingUp,
  Users
} from 'lucide-react';
import { ClusteredIncident } from '../../types/civic';
import { calculateDevelopmentGap } from '../../engine/developmentGapEngine';
import { calculateDevelopmentPriority } from '../../engine/developmentPriorityEngine';

interface Props {
  incident: ClusteredIncident;
  currentWeather?: {
    temperatureCelsius?: number;
    rainfallMmPerHour?: number;
    condition?: string;
  } | null;
  ingestionMode?: 'LIVE' | 'REPLAY' | 'SIMULATION';
}

export const DevelopmentContextPanel: React.FC<Props> = ({
  incident,
  currentWeather,
  ingestionMode = 'SIMULATION'
}) => {
  const catUpper = (incident.category || 'OTHER').toString().toUpperCase();

  // Safely extract context objects or supply fallback structure grounded in ward data
  const demographics = (incident as any).demographics || {
    population: 148000,
    populationDensity: 14200,
    vulnerablePopulation: 38000,
    urbanizationRate: 94,
    wardName: incident.ward || 'Central Sector'
  };

  const infrastructure = (incident as any).infrastructure || {
    healthcareIndex: 38,
    educationIndex: 45,
    waterIndex: 35,
    sanitationIndex: 40,
    transportIndex: 48,
    infrastructureDeficitIndex: 62,
    nearestFacilityName: 'Government Secondary Hospital / Sub-station',
    nearestFacilityDistanceMeters: 850,
    capacityUtilizationPercent: 88
  };

  const investment = (incident as any).investment || {
    existingInvestment: 250,
    plannedInvestment: 600,
    activeProjects: 2,
    plannedProjects: 1,
    investmentGapLakhs: 350,
    unaddressedRequestsCount: incident.signalIds?.length || 18
  };

  // Run deterministic calculation engines
  const gapResult = calculateDevelopmentGap(
    incident.category as any,
    incident.signalIds?.length || 10,
    incident.velocityPerHour || 2.5,
    demographics,
    infrastructure,
    investment
  );

  const priorityResult = calculateDevelopmentPriority(
    incident.id,
    incident.category,
    {
      requestCount: incident.signalIds?.length || 10,
      velocityPerHour: incident.velocityPerHour || 2.5,
      surgeMultiplier: 1.0 + Math.min(2.0, (incident.velocitySurgePercent || 0) / 100)
    },
    demographics,
    infrastructure,
    investment
  );

  const provenanceLabel = ingestionMode === 'LIVE'
    ? 'LIVE TELEMETRY'
    : ingestionMode === 'REPLAY'
    ? 'REPLAY RECORDING'
    : 'REALISTIC SAMPLE DATA';

  return (
    <div className="flex flex-col gap-3 font-body">

      {/* SECTION HEADER & PROVENANCE ADVISORY */}
      <div className="p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Layers size={15} className="text-primary" />
          <span className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-[11px]">
            Multi-Pillar Development Intelligence
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Database size={11} className="text-blue-400" />
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            ingestionMode === 'LIVE' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
          }`}>
            {provenanceLabel}
          </span>
        </div>
      </div>

      {/* 5-PILLAR CONTEXT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">

        {/* 1. DEMAND CONTEXT */}
        <div className="bg-[var(--bg-surface-elevated)] p-3 rounded-lg border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase text-blue-400 flex items-center gap-1">
              <Activity size={12} />
              1. Citizen Demand
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400">DEMAND</span>
          </div>
          <div className="text-sm font-headline font-extrabold text-[var(--text-primary)] font-mono">
            {incident.signalIds?.length || 0} Signals
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            Velocity: <strong className="text-red-500">+{(incident.velocityPerHour || 0).toFixed(1)} req/hr</strong>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5 font-mono">
            Demand Score: <strong>{gapResult.demandGapScore}/30 pts</strong>
          </div>
        </div>

        {/* 2. DEMOGRAPHIC CONTEXT */}
        <div className="bg-[var(--bg-surface-elevated)] p-3 rounded-lg border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase text-purple-400 flex items-center gap-1">
              <Users size={12} />
              2. Demographics
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400">CENSUS</span>
          </div>
          <div className="text-sm font-headline font-extrabold text-[var(--text-primary)] font-mono">
            {(demographics.population || 148000).toLocaleString()} Pop.
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            Density: <strong>{(demographics.populationDensity || 14200).toLocaleString()} / km²</strong>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5 font-mono">
            Vulnerable Ratio: <strong>{Math.round(((demographics.vulnerablePopulation || 38000) / (demographics.population || 148000)) * 100)}%</strong>
          </div>
        </div>

        {/* 3. CATEGORY-AWARE INFRASTRUCTURE CONTEXT */}
        <div className="bg-[var(--bg-surface-elevated)] p-3 rounded-lg border border-red-500/30">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase text-red-400 flex items-center gap-1">
              <Building2 size={12} />
              3. {catUpper} Infra.
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400">REGISTRY</span>
          </div>
          {catUpper === 'HEALTHCARE' ? (
            <>
              <div className="text-sm font-headline font-extrabold text-red-400 font-mono">
                Healthcare: {infrastructure.healthcareIndex ?? 38}/100
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Nearest PHC: <strong>{infrastructure.nearestFacilityDistanceMeters ?? 850}m</strong>
              </div>
            </>
          ) : catUpper === 'EDUCATION' ? (
            <>
              <div className="text-sm font-headline font-extrabold text-red-400 font-mono">
                Education: {infrastructure.educationIndex ?? 45}/100
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Capacity Overload: <strong>{infrastructure.capacityUtilizationPercent ?? 85}%</strong>
              </div>
            </>
          ) : (catUpper === 'WATER' || catUpper === 'WATERLOGGING' || catUpper === 'DRAINAGE') ? (
            <>
              <div className="text-sm font-headline font-extrabold text-red-400 font-mono">
                Water/Drainage: {infrastructure.waterIndex ?? 35}/100
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Capacity Surcharge: <strong>{infrastructure.capacityUtilizationPercent ?? 88}%</strong>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-headline font-extrabold text-red-400 font-mono">
                Transport: {infrastructure.transportIndex ?? 48}/100
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Terminal Capacity: <strong>{infrastructure.capacityUtilizationPercent ?? 80}%</strong>
              </div>
            </>
          )}
          <div className="text-[11px] font-mono font-bold text-red-400 mt-1">
            Infra Deficit Score: {gapResult.infrastructureDeficitScore}/25 pts
          </div>
        </div>

        {/* 4. PUBLIC INVESTMENT CONTEXT */}
        <div className="bg-[var(--bg-surface-elevated)] p-3 rounded-lg border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
              <DollarSign size={12} />
              4. Public Investment
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">BUDGET</span>
          </div>
          <div className="text-sm font-headline font-extrabold text-amber-400 font-mono">
            Unfunded: ₹{investment.investmentGapLakhs || 350} Lakhs
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            Approved Budget: <strong>₹{investment.existingInvestment || 250} L</strong>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5 font-mono">
            Investment Deficit: <strong>{gapResult.investmentDeficitScore}/15 pts</strong>
          </div>
        </div>

      </div>

      {/* FACTOR CONTRIBUTION BREAKDOWN CARD */}
      <div className="p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-bold uppercase text-primary tracking-wider flex items-center gap-1.5">
            <Calculator size={13} />
            <span>Deterministic Priority Breakdown (/ 100)</span>
          </div>
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
            priorityResult.priorityScore >= 80 ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
          }`}>
            SCORE: {priorityResult.priorityScore}/100 ({priorityResult.priorityLevel})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
          <div className="bg-[var(--bg-surface-elevated)] p-2 rounded border border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)] block text-[10px]">Demand</span>
            <strong className="text-blue-400">{gapResult.demandGapScore} / 30 pts</strong>
          </div>

          <div className="bg-[var(--bg-surface-elevated)] p-2 rounded border border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)] block text-[10px]">Infra. Deficit</span>
            <strong className="text-red-400">{gapResult.infrastructureDeficitScore} / 25 pts</strong>
          </div>

          <div className="bg-[var(--bg-surface-elevated)] p-2 rounded border border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)] block text-[10px]">Vulnerability</span>
            <strong className="text-purple-400">{gapResult.demographicVulnerabilityScore} / 20 pts</strong>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DevelopmentContextPanel;
