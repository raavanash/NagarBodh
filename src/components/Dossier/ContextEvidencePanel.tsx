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
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-4 text-slate-800 shadow-sm">
      {/* Panel Header & Mode Control Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} className="text-blue-700" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Context Evidence Panel
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
            Auditable external data points contributing to AI assessment • Non-Fabrication Verified
          </p>
        </div>

        {/* Interactive Provider Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', padding: '0.25rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', paddingLeft: '0.4rem', textTransform: 'uppercase' }}>
            Provider Mode:
          </span>
          <button
            onClick={() => handleGlobalModeChange('live')}
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              background: globalMode === 'live' ? '#059669' : 'transparent',
              color: globalMode === 'live' ? '#fff' : '#475569',
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
              background: globalMode === 'cached' ? '#d97706' : 'transparent',
              color: globalMode === 'cached' ? '#fff' : '#475569',
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
              background: globalMode === 'demo_fallback' ? '#2563eb' : 'transparent',
              color: globalMode === 'demo_fallback' ? '#fff' : '#475569',
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
          background: '#ffffff',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.25rem',
          fontSize: '0.75rem'
        }}
      >
        <div>
          <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}>OVERALL FRESHNESS</span>
          <strong style={{ color: '#1e3a8a', fontFamily: 'var(--font-mono)' }}>{context.overallDataFreshness}</strong>
        </div>
        <div>
          <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}>DATA CONFIDENCE</span>
          <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>
            {(context.overallConfidenceScore * 100).toFixed(0)}% Verified
          </strong>
        </div>
        <div>
          <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}>RETRIEVED AT</span>
          <strong style={{ color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
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
              background: '#f1f5f9',
              color: '#1e293b',
              border: '1px solid #cbd5e1',
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
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Zap size={14} /> AI Risk Assessment Evidence Weighting
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {aiAssessmentEvidenceImpact.contributions.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                borderRadius: '8px',
                padding: '0.6rem 0.85rem',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{item.category}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {getModeBadge(item.mode)}
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#dc2626' }}>
                    +{item.riskPoints} pts ({item.weightPercent}%)
                  </span>
                </div>
              </div>

              {/* Weight Progress Bar */}
              <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2, marginBottom: '0.4rem', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${item.weightPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #2563eb, #dc2626)',
                    borderRadius: 2,
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>

              <p style={{ fontSize: '0.74rem', color: '#475569', margin: 0, lineHeight: 1.35 }}>
                {item.summaryText}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.68rem', color: '#64748b' }}>
                <span>Source: <code style={{ color: '#1e3a8a' }}>{item.source}</code></span>
                <span>Confidence: {item.confidence ? `${(item.confidence * 100).toFixed(0)}%` : 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9 Context Data Layers Detail Section */}
      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Layers size={14} className="text-blue-700" /> Itemized 9-Point Context Data Layers
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>

        {/* 1 & 2. Weather & Rainfall */}
        <ContextCard
          icon={<Umbrella size={16} color="#0284c7" />}
          title="1 & 2. Weather & Rainfall"
          mode={weather.mode}
          source={weather.source}
          freshness={weather.dataFreshness}
          confidence={weather.confidence}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Condition / Alert:</span>
              <strong style={{ color: weather.data.alertLevel === 'orange' ? '#d97706' : '#0f172a' }}>
                {weather.data.condition} ({weather.data.alertLevel.toUpperCase()})
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Rainfall Rate:</span>
              <strong style={{ color: '#0284c7', fontFamily: 'var(--font-mono)' }}>{rainfall.data.rainfallMmPerHour} mm/hr</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>24h Accumulation:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{rainfall.data.accumulation24hMm} mm</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Flood Risk Multiplier:</span>
              <strong style={{ color: '#dc2626', fontFamily: 'var(--font-mono)' }}>{rainfall.data.floodMultiplier}x</strong>
            </div>
          </div>
        </ContextCard>

        {/* 3 & 4. Administrative Area & Ward */}
        <ContextCard
          icon={<Building2 size={16} color="#7c3aed" />}
          title="3 & 4. Admin Area & Ward Context"
          mode={administrativeArea.mode}
          source={administrativeArea.source}
          freshness={administrativeArea.dataFreshness}
          confidence={administrativeArea.confidence}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Administrative Zone:</span>
              <strong style={{ color: '#0f172a' }}>{administrativeArea.data.zone}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Ward Designation:</span>
              <strong style={{ color: '#1e3a8a' }}>{ward.data.wardName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Population Density:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{ward.data.populationDensityPerSqKm.toLocaleString()} /km²</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Historical SLA Rate:</span>
              <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>{ward.data.slaCompliancePercent}% ({ward.data.avgResolutionTimeHours}h avg)</strong>
            </div>
          </div>
        </ContextCard>

        {/* 5. Nearby Schools */}
        <ContextCard
          icon={<School size={16} color="#d97706" />}
          title="5. Nearby Schools"
          mode={nearbySchools.mode}
          source={nearbySchools.source}
          freshness={nearbySchools.dataFreshness}
          confidence={nearbySchools.confidence}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Nearest School:</span>
              <strong style={{ color: '#0f172a' }}>{nearbySchools.data.nearestSchool?.name || 'None nearby'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Proximity Distance:</span>
              <strong style={{ color: '#d97706', fontFamily: 'var(--font-mono)' }}>
                {nearbySchools.data.nearestSchool ? `${nearbySchools.data.nearestSchool.distanceMeters}m` : 'N/A'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Vulnerability Capacity:</span>
              <strong style={{ fontSize: '0.7rem', color: '#64748b' }}>{nearbySchools.data.nearestSchool?.capacity || 'N/A'}</strong>
            </div>
          </div>
        </ContextCard>

        {/* 6. Nearby Hospitals */}
        <ContextCard
          icon={<Hospital size={16} color="#dc2626" />}
          title="6. Nearby Hospitals"
          mode={nearbyHospitals.mode}
          source={nearbyHospitals.source}
          freshness={nearbyHospitals.dataFreshness}
          confidence={nearbyHospitals.confidence}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Nearest Hospital:</span>
              <strong style={{ color: '#0f172a' }}>{nearbyHospitals.data.nearestHospital?.name || 'None nearby'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Emergency Distance:</span>
              <strong style={{ color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
                {nearbyHospitals.data.nearestHospital ? `${nearbyHospitals.data.nearestHospital.distanceMeters}m` : 'N/A'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Trauma Facility Capacity:</span>
              <strong style={{ fontSize: '0.7rem', color: '#64748b' }}>{nearbyHospitals.data.nearestHospital?.capacity || 'N/A'}</strong>
            </div>
          </div>
        </ContextCard>

        {/* 7. Nearby Transport Infrastructure */}
        <ContextCard
          icon={<Train size={16} color="#0284c7" />}
          title="7. Transport Infrastructure"
          mode={nearbyTransportInfrastructure.mode}
          source={nearbyTransportInfrastructure.source}
          freshness={nearbyTransportInfrastructure.dataFreshness}
          confidence={nearbyTransportInfrastructure.confidence}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Nearest Transport Node:</span>
              <strong style={{ color: '#0f172a' }}>{nearbyTransportInfrastructure.data.nearestTransport?.name || 'None'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Corridor Distance:</span>
              <strong style={{ color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                {nearbyTransportInfrastructure.data.nearestTransport ? `${nearbyTransportInfrastructure.data.nearestTransport.distanceMeters}m` : 'N/A'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Commuter Volume / Footfall:</span>
              <strong style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {nearbyTransportInfrastructure.data.nearestTransport?.capacityOrFootfall || 'N/A'}
              </strong>
            </div>
          </div>
        </ContextCard>

        {/* 8. Historical Incident Frequency */}
        <ContextCard
          icon={<Calendar size={16} color="#d97706" />}
          title="8. Historical Incident Frequency"
          mode={historicalIncidentFrequency.mode}
          source={historicalIncidentFrequency.source}
          freshness={historicalIncidentFrequency.dataFreshness}
          confidence={historicalIncidentFrequency.confidence}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>30-Day Ward Incidents:</span>
              <strong style={{ color: '#d97706', fontFamily: 'var(--font-mono)' }}>
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
              <strong style={{ color: historicalIncidentFrequency.data.hotspotRiskLevel === 'critical' ? '#dc2626' : '#d97706', textTransform: 'uppercase' }}>
                {historicalIncidentFrequency.data.hotspotRiskLevel}
              </strong>
            </div>
          </div>
        </ContextCard>

        {/* 9. Relevant Geospatial Risk Indicators */}
        <ContextCard
          icon={<Globe size={16} color="#059669" />}
          title="9. Geospatial Risk Indicators"
          mode={relevantGeospatialRiskIndicators.mode}
          source={relevantGeospatialRiskIndicators.source}
          freshness={relevantGeospatialRiskIndicators.dataFreshness}
          confidence={relevantGeospatialRiskIndicators.confidence}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Elevation MSL:</span>
              <strong style={{ color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{relevantGeospatialRiskIndicators.data.elevationMeters} meters</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Drainage Capacity Bottleneck:</span>
              <strong style={{ color: '#dc2626', fontFamily: 'var(--font-mono)' }}>{relevantGeospatialRiskIndicators.data.drainageBottleneckPercent}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Yamuna Basin Proximity:</span>
              <strong style={{ color: '#1e3a8a', fontFamily: 'var(--font-mono)' }}>
                {relevantGeospatialRiskIndicators.data.yamunaFloodplainDistanceMeters}m ({relevantGeospatialRiskIndicators.data.yamunaFloodRiskLevel})
              </strong>
            </div>
          </div>
        </ContextCard>

      </div>

      {/* Raw Payload Metadata Drawer */}
      {showRawInspector && (
        <div style={{ marginTop: '1.25rem', background: '#0f172a', borderRadius: '8px', padding: '1rem', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 700 }}>
              RAW CIVIC CONTEXT METADATA ENVELOPE (JSON)
            </span>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Non-Fabrication Mode: {globalMode.toUpperCase()}</span>
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
    if (mode === 'live') return { bg: '#dcfce7', text: '#15803d', border: '#86efac' };
    if (mode === 'cached') return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
    return { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' };
  };

  const badgeStyle = getBadgeColor();

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
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
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{title}</span>
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

        <div style={{ fontSize: '0.74rem', color: '#334155', marginBottom: '0.6rem' }}>
          {children}
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '0.4rem', fontSize: '0.65rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        <div>Source: <span style={{ color: '#475569' }}>{source}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Freshness: <strong style={{ color: badgeStyle.text }}>{freshness}</strong></span>
          {confidence && <span>Conf: {(confidence * 100).toFixed(0)}%</span>}
        </div>
      </div>
    </div>
  );
};
