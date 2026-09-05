import { CivicCategory, CriticalAsset, WardMetric } from './civic';

export type ProviderMode = 'live' | 'cached' | 'demo_fallback';

export interface ExternalDataPointEnvelope<T> {
  data: T;
  source: string;
  timestamp: string; // ISO string
  location: {
    lat?: number;
    lng?: number;
    name?: string;
  };
  dataFreshness: string; // e.g. "Live (30s ago)", "Cached (15m ago, TTL 60m)", "Demo Static Baseline"
  confidence?: number; // 0.0 - 1.0
  mode: ProviderMode;
  fetchDurationMs?: number;
}

export interface WeatherData {
  temperatureCelsius: number;
  humidityPercent: number;
  windSpeedKmh: number;
  condition: string;
  alertLevel: 'none' | 'yellow' | 'orange' | 'red';
  alertDescription: string;
  stationName: string;
}

export interface RainfallData {
  rainfallMmPerHour: number;
  accumulation24hMm: number;
  intensityCategory: 'none' | 'light' | 'moderate' | 'heavy' | 'torrential';
  floodMultiplier: number;
  stationLocation: string;
}

export interface AdminBoundaryData {
  zone: string;
  district: string;
  subDivision: string;
  isVipZone: boolean;
  jurisdictionalAuthority: string;
  wardBoundaryPolygonName: string;
}

export interface WardContextData {
  wardId: string;
  wardName: string;
  populationDensityPerSqKm: number;
  avgResolutionTimeHours: number;
  slaCompliancePercent: number;
  primaryZone: string;
}

export interface TransportAsset {
  id: string;
  name: string;
  type: 'metro_station' | 'bus_terminal' | 'arterial_road' | 'flyover';
  distanceMeters: number;
  impactLevel: 'low' | 'moderate' | 'severe';
  capacityOrFootfall?: string;
}

export interface HistoricalIncidentData {
  wardCategory30dCount: number;
  wardCategory90dCount: number;
  wardCategoryRecurrenceRatePerWeek: number;
  hotspotRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  avgResolutionTimeDays: number;
  lastIncidentDate?: string;
}

export interface GeospatialRiskData {
  elevationMeters: number;
  lowLyingFloodRiskScore: number; // 0 - 100
  drainageBottleneckPercent: number; // 0 - 100% capacity blocked
  yamunaFloodplainDistanceMeters: number;
  yamunaFloodRiskLevel: 'safe' | 'warning' | 'high_alert' | 'critical_inundation';
  slopeRunoffIndex: number; // 0 - 10
}

export interface IncidentCivicContext {
  incidentId: string;
  centroid: { lat: number; lng: number };
  retrievedAt: string;
  overallDataFreshness: string;
  overallConfidenceScore: number;
  providerModesUsed: {
    weather: ProviderMode;
    adminBoundary: ProviderMode;
    criticalAsset: ProviderMode;
    historicalIncident: ProviderMode;
    geospatialRisk: ProviderMode;
  };

  // 9 Required Context Elements
  weather: ExternalDataPointEnvelope<WeatherData>;
  rainfall: ExternalDataPointEnvelope<RainfallData>;
  administrativeArea: ExternalDataPointEnvelope<AdminBoundaryData>;
  ward: ExternalDataPointEnvelope<WardContextData>;
  nearbySchools: ExternalDataPointEnvelope<{
    count: number;
    nearestSchool: { name: string; distanceMeters: number; capacity?: string } | null;
    assets: Array<{ asset: CriticalAsset; distanceMeters: number }>;
  }>;
  nearbyHospitals: ExternalDataPointEnvelope<{
    count: number;
    nearestHospital: { name: string; distanceMeters: number; capacity?: string; contact?: string } | null;
    assets: Array<{ asset: CriticalAsset; distanceMeters: number }>;
  }>;
  nearbyTransportInfrastructure: ExternalDataPointEnvelope<{
    count: number;
    nearestTransport: TransportAsset | null;
    items: TransportAsset[];
  }>;
  historicalIncidentFrequency: ExternalDataPointEnvelope<HistoricalIncidentData>;
  relevantGeospatialRiskIndicators: ExternalDataPointEnvelope<GeospatialRiskData>;

  // AI Evidence Contribution Analysis
  aiAssessmentEvidenceImpact: {
    totalRiskPointsContributed: number;
    contributions: Array<{
      category: string;
      label: string;
      riskPoints: number;
      weightPercent: number;
      summaryText: string;
      source: string;
      mode: ProviderMode;
      confidence?: number;
    }>;
  };
}
