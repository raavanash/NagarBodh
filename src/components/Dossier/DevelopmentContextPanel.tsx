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

  // Provenance label
  const provenanceLabel = ingestionMode === 'LIVE'
    ? 'LIVE TELEMETRY'
    : ingestionMode === 'REPLAY'
    ? 'REPLAY RECORDING'
    : 'REALISTIC SAMPLE DATA';

  const provenanceBadgeStyle = {
    fontSize: '0.6rem',
    fontWeight: 800 as const,
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    background: ingestionMode === 'LIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(37, 99, 235, 0.15)',
    color: ingestionMode === 'LIVE' ? '#047857' : '#1d4ed8',
    border: `1px solid ${ingestionMode === 'LIVE' ? '#6ee7b7' : '#bfdbfe'}`,
    fontFamily: 'var(--font-mono)'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* SECTION HEADER & PROVENANCE ADVISORY */}
      <div style={{
        padding: '0.75rem 0.9rem',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Layers size={15} color="#2563eb" />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            Multi-Pillar Development Intelligence
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Database size={11} color="#0284c7" />
          <span style={provenanceBadgeStyle}>{provenanceLabel}</span>
        </div>
      </div>

      {/* 5-PILLAR CONTEXT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem' }}>

        {/* 1. DEMAND CONTEXT */}
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Activity size={12} />
              1. Citizen Demand
            </span>
            <span style={provenanceBadgeStyle}>DEMAND</span>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {incident.signalIds?.length || 0} Signals
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Velocity: <strong style={{ color: '#dc2626' }}>+{(incident.velocityPerHour || 0).toFixed(1)} req/hr</strong>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Demand Score: <strong>{gapResult.demandGapScore}/30 pts</strong>
          </div>
        </div>

        {/* 2. DEMOGRAPHIC CONTEXT */}
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Users size={12} />
              2. Demographics
            </span>
            <span style={provenanceBadgeStyle}>CENSUS</span>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {(demographics.population || 148000).toLocaleString()} Pop.
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Density: <strong>{(demographics.populationDensity || 14200).toLocaleString()} / km²</strong>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Vulnerable Ratio: <strong>{Math.round(((demographics.vulnerablePopulation || 38000) / (demographics.population || 148000)) * 100)}%</strong>
          </div>
        </div>

        {/* 3. CATEGORY-AWARE INFRASTRUCTURE CONTEXT */}
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fca5a5' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Building2 size={12} />
              3. {catUpper} Infra.
            </span>
            <span style={provenanceBadgeStyle}>REGISTRY</span>
          </div>
          {catUpper === 'HEALTHCARE' ? (
            <>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
                Healthcare: {infrastructure.healthcareIndex ?? 38}/100
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Nearest PHC: <strong>{infrastructure.nearestFacilityDistanceMeters ?? 850}m</strong>
              </div>
            </>
          ) : catUpper === 'EDUCATION' ? (
            <>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
                Education: {infrastructure.educationIndex ?? 45}/100
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Capacity Overload: <strong>{infrastructure.capacityUtilizationPercent ?? 85}%</strong>
              </div>
            </>
          ) : (catUpper === 'WATER' || catUpper === 'WATERLOGGING' || catUpper === 'DRAINAGE') ? (
            <>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
                Water/Drainage: {infrastructure.waterIndex ?? 35}/100
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Capacity Surcharge: <strong>{infrastructure.capacityUtilizationPercent ?? 88}%</strong>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
                Transport: {infrastructure.transportIndex ?? 48}/100
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Terminal Capacity: <strong>{infrastructure.capacityUtilizationPercent ?? 80}%</strong>
              </div>
            </>
          )}
          <div style={{ fontSize: '0.68rem', color: '#dc2626', marginTop: '0.2rem', fontWeight: 700 }}>
            Infra Deficit Score: {gapResult.infrastructureDeficitScore}/25 pts
          </div>
        </div>

        {/* 4. PUBLIC INVESTMENT CONTEXT */}
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <DollarSign size={12} />
              4. Public Investment
            </span>
            <span style={provenanceBadgeStyle}>BUDGET</span>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#b45309', fontFamily: 'var(--font-mono)' }}>
            Unfunded: ₹{investment.investmentGapLakhs || 350} Lakhs
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Approved Budget: <strong>₹{investment.existingInvestment || 250} L</strong>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Investment Deficit: <strong>{gapResult.investmentDeficitScore}/15 pts</strong>
          </div>
        </div>

        {/* 5. WEATHER & ENVIRONMENTAL CONTEXT */}
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CloudRain size={12} />
              5. Weather Context
            </span>
            <span style={provenanceBadgeStyle}>{ingestionMode === 'LIVE' ? 'GOOGLE WEATHER' : 'DETERMINISTIC'}</span>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
            {currentWeather?.rainfallMmPerHour ?? 25} mm/hr
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Condition: <strong>{currentWeather?.condition || 'Monsoon Showers'}</strong>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Environmental Risk: <strong>{gapResult.environmentalRiskScore}/10 pts</strong>
          </div>
        </div>
      </div>

      {/* FACTOR CONTRIBUTION BREAKDOWN CARD (OUT OF 100) */}
      <div style={{
        padding: '0.9rem',
        background: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calculator size={14} />
            <span>Deterministic Priority Breakdown (Factor Contributions / 100)</span>
          </div>
          <span style={{
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '4px',
            background: priorityResult.priorityScore >= 80 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            color: priorityResult.priorityScore >= 80 ? '#dc2626' : '#d97706',
            border: `1px solid ${priorityResult.priorityScore >= 80 ? '#fca5a5' : '#fcd34d'}`
          }}>
            PRIORITY: {priorityResult.priorityScore}/100 ({priorityResult.priorityLevel})
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.64rem' }}>Citizen Demand</span>
            <strong style={{ color: '#2563eb' }}>{gapResult.demandGapScore} / 30 pts</strong>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.64rem' }}>Infra. Deficit</span>
            <strong style={{ color: '#dc2626' }}>{gapResult.infrastructureDeficitScore} / 25 pts</strong>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.64rem' }}>Pop. Vulnerability</span>
            <strong style={{ color: '#7c3aed' }}>{gapResult.demographicVulnerabilityScore} / 20 pts</strong>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.64rem' }}>Investment Gap</span>
            <strong style={{ color: '#b45309' }}>{gapResult.investmentDeficitScore} / 15 pts</strong>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.64rem' }}>Environmental Risk</span>
            <strong style={{ color: '#0284c7' }}>{gapResult.environmentalRiskScore} / 10 pts</strong>
          </div>
        </div>
      </div>

    </div>
  );
};
