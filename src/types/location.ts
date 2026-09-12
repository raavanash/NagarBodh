import type { DemographicContext, InfrastructureContext, InvestmentContext } from './development';
import type { WeatherData } from './contextDataLayer';

export type ResolutionStatus = 'exact' | 'approximate' | 'district_level' | 'uncertain';

export interface CanonicalLocation {
  id: string; // Stable Geographic Identifier e.g. "IN/Delhi/Central-Delhi/Ward-14"
  countryCode: string; // "IN"
  country: string; // "India"
  state: string;
  district: string;
  subDistrict?: string;
  block?: string;
  village?: string;
  ward?: string;
  pincode?: string;
  latitude?: number | null;
  longitude?: number | null;
  geohash?: string;
  locationName: string;
  locationConfidence: number; // 0.0 - 1.0
  resolutionStatus: ResolutionStatus;
}

export interface LocationContextProvenance {
  source: string;
  mode: 'LIVE' | 'REPLAY' | 'SIMULATION';
  timestamp: string;
  locationId: string;
  freshness: string;
  confidence: number;
}

export interface UnifiedLocationContext {
  location: CanonicalLocation;
  demographic: DemographicContext;
  infrastructure: InfrastructureContext;
  investment: InvestmentContext;
  weather?: WeatherData | null;
  provenance: LocationContextProvenance;
}
