import { ClusteredIncident } from '../../types/civic';
import { IncidentCivicContext, ProviderMode } from '../../types/contextDataLayer';
import { WeatherContextProvider } from './providers/WeatherContextProvider';
import { AdminBoundaryContextProvider } from './providers/AdminBoundaryContextProvider';
import { CriticalAssetContextProvider } from './providers/CriticalAssetContextProvider';
import { HistoricalIncidentContextProvider } from './providers/HistoricalIncidentContextProvider';
import { GeospatialRiskContextProvider } from './providers/GeospatialRiskContextProvider';
import { LocationContextEngine } from '../location/LocationContextEngine';
import type { CanonicalLocation, UnifiedLocationContext } from '../../types/location';

export interface ProviderModesConfig {
  weather: ProviderMode;
  adminBoundary: ProviderMode;
  criticalAsset: ProviderMode;
  historicalIncident: ProviderMode;
  geospatialRisk: ProviderMode;
}

export class CivicContextDataLayer {
  private weatherProvider: WeatherContextProvider;
  private adminBoundaryProvider: AdminBoundaryContextProvider;
  private criticalAssetProvider: CriticalAssetContextProvider;
  private historicalIncidentProvider: HistoricalIncidentContextProvider;
  private geospatialRiskProvider: GeospatialRiskContextProvider;
  private locationContextEngine: LocationContextEngine;

  constructor(defaultMode: ProviderMode = 'cached') {
    this.weatherProvider = new WeatherContextProvider(defaultMode);
    this.adminBoundaryProvider = new AdminBoundaryContextProvider(defaultMode);
    this.criticalAssetProvider = new CriticalAssetContextProvider(defaultMode);
    this.historicalIncidentProvider = new HistoricalIncidentContextProvider(defaultMode);
    this.geospatialRiskProvider = new GeospatialRiskContextProvider(defaultMode);
    this.locationContextEngine = new LocationContextEngine(defaultMode === 'live' ? 'live' : 'cached');
  }

  public async getLocationContext(
    location: CanonicalLocation,
    mode: 'LIVE' | 'REPLAY' | 'SIMULATION' = 'SIMULATION'
  ): Promise<UnifiedLocationContext> {
    return this.locationContextEngine.getUnifiedLocationContext(location, mode);
  }

  public setGlobalMode(mode: ProviderMode) {
    this.weatherProvider.setMode(mode);
    this.adminBoundaryProvider.setMode(mode);
    this.criticalAssetProvider.setMode(mode);
    this.historicalIncidentProvider.setMode(mode);
    this.geospatialRiskProvider.setMode(mode);
  }

  public setProviderMode(provider: keyof ProviderModesConfig, mode: ProviderMode) {
    switch (provider) {
      case 'weather':
        this.weatherProvider.setMode(mode);
        break;
      case 'adminBoundary':
        this.adminBoundaryProvider.setMode(mode);
        break;
      case 'criticalAsset':
        this.criticalAssetProvider.setMode(mode);
        break;
      case 'historicalIncident':
        this.historicalIncidentProvider.setMode(mode);
        break;
      case 'geospatialRisk':
        this.geospatialRiskProvider.setMode(mode);
        break;
    }
  }

  public getProviderModes(): ProviderModesConfig {
    return {
      weather: this.weatherProvider.getMode(),
      adminBoundary: this.adminBoundaryProvider.getMode(),
      criticalAsset: this.criticalAssetProvider.getMode(),
      historicalIncident: this.historicalIncidentProvider.getMode(),
      geospatialRisk: this.geospatialRiskProvider.getMode()
    };
  }

  /**
   * Primary Entry Point: Assembles the complete Civic Context for a given municipal incident
   * containing all 9 required context dimensions with standard external data envelopes.
   */
  public async getIncidentContext(
    incident: ClusteredIncident,
    coordinatesOverride?: { lat: number; lng: number }
  ): Promise<IncidentCivicContext> {
    const lat = coordinatesOverride?.lat ?? incident.centroid.lat;
    const lng = coordinatesOverride?.lng ?? incident.centroid.lng;
    const retrievedAt = new Date().toISOString();

    // 1. Fetch from all 5 providers concurrently
    const [
      weatherEnv,
      rainfallEnv,
      adminEnv,
      wardEnv,
      schoolsEnv,
      hospitalsEnv,
      transportEnv,
      historicalEnv,
      geospatialEnv
    ] = await Promise.all([
      this.weatherProvider.getWeather(lat, lng),
      this.weatherProvider.getRainfall(lat, lng),
      this.adminBoundaryProvider.getAdminBoundary(lat, lng),
      this.adminBoundaryProvider.getWardContext(incident.ward),
      this.criticalAssetProvider.getNearbySchools(lat, lng),
      this.criticalAssetProvider.getNearbyHospitals(lat, lng),
      this.criticalAssetProvider.getNearbyTransportInfrastructure(lat, lng),
      this.historicalIncidentProvider.getHistoricalFrequency(incident.ward, incident.category),
      this.geospatialRiskProvider.getGeospatialRisk(lat, lng)
    ]);

    // 2. Compute overall data freshness and average confidence
    const confidences = [
      weatherEnv.confidence ?? 0.9,
      rainfallEnv.confidence ?? 0.9,
      adminEnv.confidence ?? 0.9,
      wardEnv.confidence ?? 0.9,
      schoolsEnv.confidence ?? 0.9,
      hospitalsEnv.confidence ?? 0.9,
      transportEnv.confidence ?? 0.9,
      historicalEnv.confidence ?? 0.9,
      geospatialEnv.confidence ?? 0.9
    ];
    const overallConfidenceScore = Number((confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(2));

    const modes = this.getProviderModes();
    const hasLive = Object.values(modes).includes('live');
    const hasCached = Object.values(modes).includes('cached');

    let overallDataFreshness = 'Demo Fallback Data (Static Baseline)';
    if (hasLive && !hasCached) {
      overallDataFreshness = 'Live Telemetry & Real-Time Feeds';
    } else if (hasLive && hasCached) {
      overallDataFreshness = 'Hybrid (Live Sensors + Cached GIS Topology)';
    } else if (hasCached) {
      overallDataFreshness = 'Cached Context Repository (TTL 15m - 24h)';
    }

    // 3. Compute AI Evidence Contribution Breakdown
    const evidenceContributions = this.calculateAIEvidenceImpact(
      weatherEnv,
      rainfallEnv,
      adminEnv,
      wardEnv,
      schoolsEnv,
      hospitalsEnv,
      transportEnv,
      historicalEnv,
      geospatialEnv
    );

    return {
      incidentId: incident.id,
      centroid: { lat, lng },
      retrievedAt,
      overallDataFreshness,
      overallConfidenceScore,
      providerModesUsed: modes,

      // 9 Required Context Elements
      weather: weatherEnv,
      rainfall: rainfallEnv,
      administrativeArea: adminEnv,
      ward: wardEnv,
      nearbySchools: schoolsEnv,
      nearbyHospitals: hospitalsEnv,
      nearbyTransportInfrastructure: transportEnv,
      historicalIncidentFrequency: historicalEnv,
      relevantGeospatialRiskIndicators: geospatialEnv,

      aiAssessmentEvidenceImpact: evidenceContributions
    };
  }

  private calculateAIEvidenceImpact(
    weatherEnv: any,
    rainfallEnv: any,
    adminEnv: any,
    wardEnv: any,
    schoolsEnv: any,
    hospitalsEnv: any,
    transportEnv: any,
    historicalEnv: any,
    geospatialEnv: any
  ) {
    const rawContributions: Array<{
      category: string;
      label: string;
      riskPoints: number;
      summaryText: string;
      source: string;
      mode: ProviderMode;
      confidence?: number;
    }> = [];

    // Weather / Rainfall Impact
    const mm = rainfallEnv.data.rainfallMmPerHour;
    let rainPts = 0;
    if (mm > 50) rainPts = 25;
    else if (mm > 20) rainPts = 15;
    else if (mm > 5) rainPts = 8;

    rawContributions.push({
      category: 'Rainfall Telemetry',
      label: `${mm} mm/hr ${rainfallEnv.data.intensityCategory.toUpperCase()}`,
      riskPoints: rainPts,
      summaryText: `Rainfall intensity (${mm} mm/hr, 24h accumulation ${rainfallEnv.data.accumulation24hMm}mm) drives flood risk multiplier to ${rainfallEnv.data.floodMultiplier}x.`,
      source: rainfallEnv.source,
      mode: rainfallEnv.mode,
      confidence: rainfallEnv.confidence
    });

    // Nearby Hospitals Impact
    const nearestHosp = hospitalsEnv.data.nearestHospital;
    let hospPts = 0;
    if (nearestHosp && nearestHosp.distanceMeters <= 500) {
      hospPts = 22;
    } else if (nearestHosp && nearestHosp.distanceMeters <= 1000) {
      hospPts = 12;
    }

    rawContributions.push({
      category: 'Nearby Hospital Asset',
      label: nearestHosp ? `${nearestHosp.name} (${nearestHosp.distanceMeters}m)` : 'None within 1km',
      riskPoints: hospPts,
      summaryText: nearestHosp
        ? `Proximity to hospital (${nearestHosp.name}, ${nearestHosp.distanceMeters}m away) elevates emergency response urgency to protect trauma routes.`
        : 'No major hospital within 1km vulnerability zone.',
      source: hospitalsEnv.source,
      mode: hospitalsEnv.mode,
      confidence: hospitalsEnv.confidence
    });

    // Nearby Schools Impact
    const nearestSchool = schoolsEnv.data.nearestSchool;
    let schoolPts = 0;
    if (nearestSchool && nearestSchool.distanceMeters <= 400) {
      schoolPts = 18;
    } else if (nearestSchool && nearestSchool.distanceMeters <= 800) {
      schoolPts = 8;
    }

    rawContributions.push({
      category: 'Nearby School Asset',
      label: nearestSchool ? `${nearestSchool.name} (${nearestSchool.distanceMeters}m)` : 'None within 800m',
      riskPoints: schoolPts,
      summaryText: nearestSchool
        ? `School located ${nearestSchool.distanceMeters}m from incident (${nearestSchool.name}, ${nearestSchool.capacity || 'Active students'}).`
        : 'No school located in immediate 800m buffer.',
      source: schoolsEnv.source,
      mode: schoolsEnv.mode,
      confidence: schoolsEnv.confidence
    });

    // Nearby Transport Infrastructure Impact
    const nearestTr = transportEnv.data.nearestTransport;
    let trPts = 0;
    if (nearestTr && nearestTr.distanceMeters <= 400) {
      trPts = 15;
    } else if (nearestTr && nearestTr.distanceMeters <= 800) {
      trPts = 8;
    }

    rawContributions.push({
      category: 'Transport Infrastructure',
      label: nearestTr ? `${nearestTr.name} (${nearestTr.distanceMeters}m)` : 'Clear of transit hubs',
      riskPoints: trPts,
      summaryText: nearestTr
        ? `Proximity to ${nearestTr.name} (${nearestTr.distanceMeters}m) creates potential transit corridor disruption (${nearestTr.capacityOrFootfall || 'High footfall'}).`
        : 'No transit corridor affected.',
      source: transportEnv.source,
      mode: transportEnv.mode,
      confidence: transportEnv.confidence
    });

    // Geospatial Risk Indicators Impact
    const geoData = geospatialEnv.data;
    let geoPts = 0;
    if (geoData.lowLyingFloodRiskScore >= 80) geoPts += 15;
    else if (geoData.lowLyingFloodRiskScore >= 50) geoPts += 8;
    if (geoData.drainageBottleneckPercent >= 70) geoPts += 10;

    rawContributions.push({
      category: 'Geospatial Risk Indicators',
      label: `Elevation: ${geoData.elevationMeters}m | Drain Bottleneck: ${geoData.drainageBottleneckPercent}%`,
      riskPoints: geoPts,
      summaryText: `Low-lying elevation (${geoData.elevationMeters}m MSL) and stormwater drainage bottleneck (${geoData.drainageBottleneckPercent}% capacity reduction) increase flooding duration probability.`,
      source: geospatialEnv.source,
      mode: geospatialEnv.mode,
      confidence: geospatialEnv.confidence
    });

    // Historical Incident Frequency Impact
    const histData = historicalEnv.data;
    let histPts = 0;
    if (histData.hotspotRiskLevel === 'critical') histPts = 10;
    else if (histData.hotspotRiskLevel === 'high') histPts = 7;
    else if (histData.hotspotRiskLevel === 'moderate') histPts = 4;

    rawContributions.push({
      category: 'Historical Recurrence',
      label: `30-Day: ${histData.wardCategory30dCount} events (${histData.wardCategoryRecurrenceRatePerWeek} / wk)`,
      riskPoints: histPts,
      summaryText: `Ward has experienced ${histData.wardCategory30dCount} similar category incidents in last 30 days (Hotspot Level: ${histData.hotspotRiskLevel.toUpperCase()}).`,
      source: historicalEnv.source,
      mode: historicalEnv.mode,
      confidence: historicalEnv.confidence
    });

    // Administrative Area & Ward Priority Impact
    const adminData = adminEnv.data;
    let adminPts = adminData.isVipZone ? 8 : 4;

    rawContributions.push({
      category: 'Administrative Jurisdiction',
      label: `${adminData.zone} ${adminData.isVipZone ? '(VIP Zone)' : ''}`,
      riskPoints: adminPts,
      summaryText: `Jurisdiction: ${adminData.jurisdictionalAuthority}. Ward population density: ${wardEnv.data.populationDensityPerSqKm.toLocaleString()}/km².`,
      source: adminEnv.source,
      mode: adminEnv.mode,
      confidence: adminEnv.confidence
    });

    const totalRiskPointsContributed = rawContributions.reduce((sum, item) => sum + item.riskPoints, 0);

    const contributions = rawContributions.map(item => ({
      ...item,
      weightPercent: totalRiskPointsContributed > 0 ? Math.round((item.riskPoints / totalRiskPointsContributed) * 100) : 0
    }));

    return {
      totalRiskPointsContributed,
      contributions
    };
  }
}

// Global Singleton Instance
export const civicContextDataLayerInstance = new CivicContextDataLayer('cached');
