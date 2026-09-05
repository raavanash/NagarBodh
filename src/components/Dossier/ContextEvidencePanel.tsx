import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  ExternalLink,
  Flame,
  Globe,
  Hospital,
  Info,
  Layers,
  MapPin,
  RefreshCw,
  School,
  Shield,
  Train,
  Umbrella,
  Zap
} from 'lucide-react';
import { ClusteredIncident } from '../../types/civic';
import { IncidentCivicContext, ProviderMode } from '../../types/contextDataLayer';
import { CivicContextDataLayer } from '../../engine/context/CivicContextDataLayer';

interface ContextEvidencePanelProps {
  incident: ClusteredIncident;
  dataLayer?: CivicContextDataLayer;
  onRefresh?: () => void;
}

export const ContextEvidencePanel: React.FC<ContextEvidencePanelProps> = ({
  incident,
  dataLayer: propDataLayer,
  onRefresh
}) => {
  const [dataLayer] = useState(() => propDataLayer || new CivicContextDataLayer('cached'));
  const [context, setContext] = useState<IncidentCivicContext | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [globalMode, setGlobalMode] = useState<ProviderMode>('cached');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
  const [showRawInspector, setShowRawInspector] = useState<boolean>(false);

  const fetchContext = async () => {
    setLoading(true);
    try {
      const ctx = await dataLayer.getIncidentContext(incident);
      setContext(ctx);
    } catch (err) {
      console.error('Error fetching civic context:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContext();
  }, [incident, globalMode]);

  const handleGlobalModeChange = (mode: ProviderMode) => {
    setGlobalMode(mode);
    dataLayer.setGlobalMode(mode);
    fetchContext();
    if (onRefresh) onRefresh();
  };

  const getModeBadge = (mode: ProviderMode) => {
    switch (mode) {
      case 'live':
        return (
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} />
            LIVE TELEMETRY
          </span>
        );
      case 'cached':
        return (
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <Database size={10} />
            CACHED
          </span>
        );
      case 'demo_fallback':
        return (
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <Info size={10} />
            DEMO FALLBACK
          </span>
        );
    }
  };

  if (loading || !context) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--cyan-400)' }} />
        <p style={{ fontSize: '0.85rem' }}>Aggregating 5 Civic Data Layer Providers...</p>
      </div>
    );
  }

  const { weather, rainfall, administrativeArea, ward, nearbySchools, nearbyHospitals, nearbyTransportInfrastructure, historicalIncidentFrequency, relevantGeospatialRiskIndicators, aiAssessmentEvidenceImpact } = context;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '1.25rem',
        marginTop: '1rem'
      }}
    >
      {/* Panel Header & Mode Control Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="var(--cyan-400)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Context Evidence Panel
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Auditable external data points contributing to AI assessment • Non-Fabrication Verified
          </p>
        </div>

        {/* Interactive Provider Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', paddingLeft: '0.4rem', textTransform: 'uppercase' }}>
            Provider Mode:
          </span>
          <button
            onClick={() => handleGlobalModeChange('live')}
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              background: globalMode === 'live' ? '#10b981' : 'transparent',
              color: globalMode === 'live' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Live Remote
          </button>
          <button
            onClick={() => handleGlobalModeChange('cached')}
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              background: globalMode === 'cached' ? '#f59e0b' : 'transparent',
              color: globalMode === 'cached' ? '#000' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Cached
          </button>
          <button
            onClick={() => handleGlobalModeChange('demo_fallback')}
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              background: globalMode === 'demo_fallback' ? '#3b82f6' : 'transparent',
              color: globalMode === 'demo_fallback' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Demo Fallback
          </button>
        </div>
      </div>

      {/* Freshness & Metadata Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '1.25rem',
          fontSize: '0.75rem'
        }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>OVERALL FRESHNESS</span>
          <strong style={{ color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)' }}>{context.overallDataFreshness}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>DATA CONFIDENCE</span>
          <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>
            {(context.overallConfidenceScore * 100).toFixed(0)}% Verified
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>RETRIEVED AT</span>
          <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {context.retrievedAt.slice(11, 19)} UTC
          </strong>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={() => setShowRawInspector(!showRawInspector)}
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Code2 size={12} />
            {showRawInspector ? 'Hide Raw Metadata' : 'Inspect JSON Envelope'}
          </button>
        </div>
      </div>

      {/* AI Assessment Evidence Contribution Breakdown */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cyan-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Zap size={14} /> AI Risk Assessment Evidence Weighting
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {aiAssessmentEvidenceImpact.contributions.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                borderRadius: '8px',
                padding: '0.6rem 0.85rem',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{item.category}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {getModeBadge(item.mode)}
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#f87171' }}>
                    +{item.riskPoints} pts ({item.weightPercent}%)
                  </span>
                </div>
              </div>

              {/* Weight Progress Bar */}
              <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: '0.4rem', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${item.weightPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--cyan-400), #f87171)',
                    borderRadius: 2,
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>

              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>
                {item.summaryText}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                <span>Source: <code style={{ color: 'var(--cyan-400)' }}>{item.source}</code></span>
                <span>Confidence: {item.confidence ? `${(item.confidence * 100).toFixed(0)}%` : 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9 Context Data Layers Detail Section */}
      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Layers size={14} color="var(--cyan-400)" /> Itemized 9-Point Context Data Layers
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>

        {/* 1 & 2. Weather & Rainfall */}
        <ContextCard
          icon={<Umbrella size={16} color="#38bdf8" />}
          title="1 & 2. Weather & Rainfall"
          mode={weather.mode}
          source={weather.source}
          freshness={weather.dataFreshness}
          confidence={weather.confidence}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Condition / Alert:</span>
              <strong style={{ color: weather.data.alertLevel === 'orange' ? '#fbbf24' : '#fff' }}>
                {weather.data.condition} ({weather.data.alertLevel.toUpperCase()})
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Rainfall Rate:</span>
              <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{rainfall.data.rainfallMmPerHour} mm/hr</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>24h Accumulation:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{rainfall.data.accumulation24hMm} mm</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Flood Risk Multiplier:</span>
              <strong style={{ color: '#f87171', fontFamily: 'var(--font-mono)' }}>{rainfall.data.floodMultiplier}x</strong>
            </div>
          </div>
        </ContextCard>

        {/* 3 & 4. Administrative Area & Ward */}
        <ContextCard
          icon={<Building2 size={16} color="#a78bfa" />}
          title="3 & 4. Admin Area & Ward Context"
          mode={administrativeArea.mode}
          source={administrativeArea.source}
          freshness={administrativeArea.dataFreshness}
          confidence={administrativeArea.confidence}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Administrative Zone:</span>
              <strong style={{ color: '#fff' }}>{administrativeArea.data.zone}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Ward Designation:</span>
              <strong style={{ color: 'var(--cyan-400)' }}>{ward.data.wardName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Population Density:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{ward.data.populationDensityPerSqKm.toLocaleString()} /km²</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Historical SLA Rate:</span>
              <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>{ward.data.slaCompliancePercent}% ({ward.data.avgResolutionTimeHours}h avg)</strong>
            </div>
          </div>
        </ContextCard>

        {/* 5. Nearby Schools */}
        <ContextCard
          icon={<School size={16} color="#fbbf24" />}
          title="5. Nearby Schools"
          mode={nearbySchools.mode}
          source={nearbySchools.source}
          freshness={nearbySchools.dataFreshness}
          confidence={nearbySchools.confidence}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Nearest School:</span>
              <strong style={{ color: '#fff' }}>{nearbySchools.data.nearestSchool?.name || 'None nearby'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Proximity Distance:</span>
              <strong style={{ color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                {nearbySchools.data.nearestSchool ? `${nearbySchools.data.nearestSchool.distanceMeters}m` : 'N/A'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Vulnerability Capacity:</span>
              <strong style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{nearbySchools.data.nearestSchool?.capacity || 'N/A'}</strong>
            </div>
          </div>
        </ContextCard>

        {/* 6. Nearby Hospitals */}
        <ContextCard
          icon={<Hospital size={16} color="#f87171" />}
          title="6. Nearby Hospitals"
          mode={nearbyHospitals.mode}
          source={nearbyHospitals.source}
          freshness={nearbyHospitals.dataFreshness}
          confidence={nearbyHospitals.confidence}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Nearest Hospital:</span>
              <strong style={{ color: '#fff' }}>{nearbyHospitals.data.nearestHospital?.name || 'None nearby'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Emergency Distance:</span>
              <strong style={{ color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                {nearbyHospitals.data.nearestHospital ? `${nearbyHospitals.data.nearestHospital.distanceMeters}m` : 'N/A'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Trauma Facility Capacity:</span>
              <strong style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{nearbyHospitals.data.nearestHospital?.capacity || 'N/A'}</strong>
            </div>
          </div>
        </ContextCard>

        {/* 7. Nearby Transport Infrastructure */}
        <ContextCard
          icon={<Train size={16} color="#38bdf8" />}
          title="7. Transport Infrastructure"
          mode={nearbyTransportInfrastructure.mode}
          source={nearbyTransportInfrastructure.source}
          freshness={nearbyTransportInfrastructure.dataFreshness}
          confidence={nearbyTransportInfrastructure.confidence}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Nearest Transport Node:</span>
              <strong style={{ color: '#fff' }}>{nearbyTransportInfrastructure.data.nearestTransport?.name || 'None'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Corridor Distance:</span>
              <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {nearbyTransportInfrastructure.data.nearestTransport ? `${nearbyTransportInfrastructure.data.nearestTransport.distanceMeters}m` : 'N/A'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Commuter Volume / Footfall:</span>
              <strong style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {nearbyTransportInfrastructure.data.nearestTransport?.capacityOrFootfall || 'N/A'}
              </strong>
            </div>
          </div>
        </ContextCard>

        {/* 8. Historical Incident Frequency */}
        <ContextCard
          icon={<Calendar size={16} color="#f59e0b" />}
          title="8. Historical Incident Frequency"
          mode={historicalIncidentFrequency.mode}
          source={historicalIncidentFrequency.source}
          freshness={historicalIncidentFrequency.dataFreshness}
          confidence={historicalIncidentFrequency.confidence}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>30-Day Ward Incidents:</span>
              <strong style={{ color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                {historicalIncidentFrequency.data.wardCategory30dCount} events
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Recurrence Rate:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>
                {historicalIncidentFrequency.data.wardCategoryRecurrenceRatePerWeek} / week
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Hotspot Level:</span>
              <strong style={{ color: historicalIncidentFrequency.data.hotspotRiskLevel === 'critical' ? '#f87171' : '#fbbf24', textTransform: 'uppercase' }}>
                {historicalIncidentFrequency.data.hotspotRiskLevel}
              </strong>
            </div>
          </div>
        </ContextCard>

        {/* 9. Relevant Geospatial Risk Indicators */}
        <ContextCard
          icon={<Globe size={16} color="#34d399" />}
          title="9. Geospatial Risk Indicators"
          mode={relevantGeospatialRiskIndicators.mode}
          source={relevantGeospatialRiskIndicators.source}
          freshness={relevantGeospatialRiskIndicators.dataFreshness}
          confidence={relevantGeospatialRiskIndicators.confidence}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Elevation MSL:</span>
              <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{relevantGeospatialRiskIndicators.data.elevationMeters} meters</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Drainage Capacity Bottleneck:</span>
              <strong style={{ color: '#f87171', fontFamily: 'var(--font-mono)' }}>{relevantGeospatialRiskIndicators.data.drainageBottleneckPercent}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Yamuna Basin Proximity:</span>
              <strong style={{ color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)' }}>
                {relevantGeospatialRiskIndicators.data.yamunaFloodplainDistanceMeters}m ({relevantGeospatialRiskIndicators.data.yamunaFloodRiskLevel})
              </strong>
            </div>
          </div>
        </ContextCard>

      </div>

      {/* Raw Payload Metadata Drawer */}
      {showRawInspector && (
        <div style={{ marginTop: '1.25rem', background: '#090d16', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)', fontWeight: 700 }}>
              RAW CIVIC CONTEXT METADATA ENVELOPE (JSON)
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Non-Fabrication Mode: {globalMode.toUpperCase()}</span>
          </div>
          <pre style={{ fontSize: '0.7rem', color: '#34d399', fontFamily: 'var(--font-mono)', overflowX: 'auto', maxHeight: 260, margin: 0, padding: '0.5rem', background: 'rgba(0,0,0,0.5)', borderRadius: '6px' }}>
            {JSON.stringify(context, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

interface ContextCardProps {
  icon: React.ReactNode;
  title: string;
  mode: ProviderMode;
  source: string;
  freshness: string;
  confidence?: number;
  children: React.ReactNode;
}

const ContextCard: React.FC<ContextCardProps> = ({ icon, title, mode, source, freshness, confidence, children }) => {
  const getBadgeColor = () => {
    if (mode === 'live') return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
    if (mode === 'cached') return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
    return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
  };

  const badgeStyle = getBadgeColor();

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.7)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {icon}
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{title}</span>
          </div>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              background: badgeStyle.bg,
              color: badgeStyle.text,
              border: `1px solid ${badgeStyle.border}`
            }}
          >
            {mode.toUpperCase()}
          </span>
        </div>

        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
          {children}
        </div>
      </div>

      <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '0.4rem', fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        <div>Source: <span style={{ color: 'var(--text-secondary)' }}>{source}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Freshness: <strong style={{ color: badgeStyle.text }}>{freshness}</strong></span>
          {confidence && <span>Conf: {(confidence * 100).toFixed(0)}%</span>}
        </div>
      </div>
    </div>
  );
};
