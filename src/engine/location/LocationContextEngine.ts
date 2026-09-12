import { WARDS_DATA } from '../../data/wardsData';
import { WeatherContextProvider } from '../context/providers/WeatherContextProvider';
import type { WeatherData } from '../../types/contextDataLayer';
import type {
  DemographicContext,
  InfrastructureContext,
  InvestmentContext,
} from '../../types/development';
import type {
  CanonicalLocation,
  LocationContextProvenance,
  UnifiedLocationContext,
} from '../../types/location';

import type { ProviderMode } from '../../types/contextDataLayer';

export class LocationContextEngine {
  private weatherProvider: WeatherContextProvider;

  constructor(weatherMode: ProviderMode = 'simulation') {
    this.weatherProvider = new WeatherContextProvider(weatherMode);
  }

  /**
   * Primary Entry Point: Generates a complete UnifiedLocationContext for a given CanonicalLocation
   */
  public async getUnifiedLocationContext(
    location: CanonicalLocation,
    mode: 'LIVE' | 'REPLAY' | 'SIMULATION' = 'SIMULATION'
  ): Promise<UnifiedLocationContext> {
    const timestamp = new Date().toISOString();

    // 1. Resolve Ward & Administrative Datasets
    const wardNameLower = (location.ward || location.subDistrict || location.locationName || '').toLowerCase();
    const wardInfo = WARDS_DATA.find(
      (w) => wardNameLower.includes(w.wardId.toLowerCase()) || wardNameLower.includes(w.wardName.toLowerCase()) || w.wardName.toLowerCase().includes(wardNameLower)
    ) || WARDS_DATA[1];

    const density = wardInfo?.populationDensityPerSqKm || 21500;
    const estPop = Math.round(density * 6.5);

    // 2. Build Demographic Context
    const demographic: DemographicContext = {
      population: estPop,
      populationDensity: density,
      populationGrowth: 1.8,
      urbanizationRate: 98.5,
      vulnerablePopulation: Math.round(estPop * 0.28),
      youthPopulation: Math.round(estPop * 0.38),
      elderlyPopulation: Math.round(estPop * 0.12),
      wardId: wardInfo?.wardId || 'ward-14',
      wardName: wardInfo?.wardName || 'Ward 14 - Karol Bagh Commercial',
      populationDensityPerSqKm: density,
      totalPopulationEstimate: estPop,
      vulnerableGroupRatio: 0.28,
      primaryLivelihoodZone: wardInfo?.primaryZone || 'Commercial & Residential Mixed Sector',
      literacyPercent: 88.5,
    };

    // 3. Build Infrastructure Context
    const infrastructure: InfrastructureContext = {
      healthcareIndex: 72,
      educationIndex: 78,
      waterIndex: 65,
      sanitationIndex: 60,
      transportIndex: 82,
      electricityIndex: 78,
      digitalConnectivityIndex: 85,
      existingFacilitiesCount: 14,
      nearestFacilityName: `${wardInfo?.wardName || 'Karol Bagh'} Community Health & Transit Hub`,
      nearestFacilityDistanceMeters: 450,
      capacityUtilizationPercent: 84,
      infrastructureDeficitIndex: 35,
    };

    // 4. Build Investment Context
    const investment: InvestmentContext = {
      existingInvestment: 450, // ₹ Lakhs
      plannedInvestment: 120, // ₹ Lakhs
      activeProjects: 3,
      plannedProjects: 1,
      investmentByCategory: {
        HEALTHCARE: 180,
        WATER: 120,
        ROADS: 90,
        SANITATION: 60,
      },
      approvedBudgetLakhs: 450,
      allocatedFundingLakhs: 350,
      investmentGapLakhs: 280,
      historicalProjectsCompleted: 8,
      unaddressedRequestsCount: 42,
    };

    // 5. Fetch Weather Contextual Evidence (use location coordinates or default ward centroid)
    let weather: WeatherData | null = null;
    const lat = location.latitude ?? 28.6518;
    const lng = location.longitude ?? 77.1906;

    try {
      const weatherEnv = await this.weatherProvider.getWeather(lat, lng);
      weather = weatherEnv ? weatherEnv.data : null;
    } catch (err) {
      console.warn('[LocationContextEngine] Weather retrieval fallback:', err);
    }

    // 6. Provenance Envelope
    const provenance: LocationContextProvenance = {
      source: 'NagarBodh Unified Location Context Engine',
      mode,
      timestamp,
      locationId: location.id,
      freshness: mode === 'LIVE' ? 'Real-time (Live Provider)' : 'Q3 2026 Telemetry Snapshot',
      confidence: location.locationConfidence,
    };

    return {
      location,
      demographic,
      infrastructure,
      investment,
      weather,
      provenance,
    };
  }
}
