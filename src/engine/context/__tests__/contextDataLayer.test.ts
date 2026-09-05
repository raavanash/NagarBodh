import { describe, expect, it } from 'vitest';
import { CivicContextDataLayer } from '../CivicContextDataLayer';
import { WeatherContextProvider } from '../providers/WeatherContextProvider';
import { AdminBoundaryContextProvider } from '../providers/AdminBoundaryContextProvider';
import { CriticalAssetContextProvider } from '../providers/CriticalAssetContextProvider';
import { HistoricalIncidentContextProvider } from '../providers/HistoricalIncidentContextProvider';
import { GeospatialRiskContextProvider } from '../providers/GeospatialRiskContextProvider';
import { ClusteredIncident } from '../../../types/civic';

const mockIncident: ClusteredIncident = {
  id: 'inc-sector-15',
  title: 'Severe Waterlogging & Drain Overflow at Sector 15 Metro Station',
  category: 'waterlogging',
  status: 'emerging',
  centroid: { lat: 28.5832, lng: 77.3188 },
  radiusMeters: 180,
  signalIds: ['sig-001', 'sig-002'],
  firstSignalTime: '2026-09-04T08:15:00Z',
  latestSignalTime: '2026-09-04T08:25:00Z',
  velocityPerHour: 12,
  velocitySurgePercent: 200,
  ward: 'Ward 15 - Sector 15 / Mayur Enclave',
  priority: {
    overallScore: 88,
    level: 'critical',
    factors: {
      severityScore: 24,
      velocityScore: 22,
      populationImpactScore: 18,
      criticalAssetExposureScore: 14,
      environmentalRiskScore: 8,
      slaRecurrenceScore: 8
    },
    formulaExplanation: 'High precipitation + Metro station proximity'
  },
  auditableInsight: {
    observedData: {
      signalIds: ['sig-001'],
      rawExcerpts: [{ original: 'Water near metro', language: 'en', channel: 'citizen_app', time: '08:15' }],
      centroidCoordinates: { lat: 28.5832, lng: 77.3188 },
      firstReportedAt: '2026-09-04T08:15:00Z',
      latestReportedAt: '2026-09-04T08:25:00Z',
      sourceDistribution: { citizen_app: 1, social_x: 0, grievance_portal: 0, helpline_311: 0 }
    },
    calculatedMetrics: {
      signalCount: 1,
      velocityPerHour: 12,
      velocityDeltaPercent: 200,
      clusterRadiusMeters: 180,
      nearestHospitalDistanceMeters: 250,
      nearestSchoolDistanceMeters: 150,
      priorityScore: 88
    },
    modelInference: {
      title: 'Waterlogging',
      summary: 'Severe waterlogging near Sector 15 Metro Station',
      assessedRootCause: 'Drainage blockage',
      confidenceScore: 0.95,
      languageBreakdown: { en: 1, hi: 0, hinglish: 0 }
    },
    recommendation: {
      primaryDepartment: 'Irrigation & Flood Control',
      secondaryDepartments: ['DMC'],
      recommendedActions: ['Deploy high-capacity pumps'],
      requiredResources: [{ item: 'Pump', quantity: '2', status: 'ready' }],
      estimatedSLAHours: 2,
      justification: 'Metro access at risk'
    }
  }
};

describe('Civic Context Data Layer', () => {

  it('WeatherContextProvider supports live, cached, and demo_fallback modes with envelopes', async () => {
    const provider = new WeatherContextProvider('demo_fallback');
    
    // Demo mode
    const demoWeather = await provider.getWeather(28.5832, 77.3188);
    expect(demoWeather.mode).toBe('demo_fallback');
    expect(demoWeather.source).toContain('Demo');
    expect(demoWeather.dataFreshness).toContain('Demo');

    // Live mode
    provider.setMode('live');
    const liveWeather = await provider.getWeather(28.5832, 77.3188);
    expect(liveWeather.mode).toBe('live');
    expect(liveWeather.dataFreshness).toContain('Live');
    expect(liveWeather.confidence).toBeGreaterThan(0.9);

    // Cached mode
    provider.setMode('cached');
    const cachedWeather = await provider.getWeather(28.5832, 77.3188);
    expect(cachedWeather.mode).toBe('cached');
    expect(cachedWeather.dataFreshness).toContain('Cached');
  });

  it('AdminBoundaryContextProvider returns accurate ward and zone boundaries', async () => {
    const provider = new AdminBoundaryContextProvider('live');
    const adminEnv = await provider.getAdminBoundary(28.5832, 77.3188);
    
    expect(adminEnv.mode).toBe('live');
    expect(adminEnv.data.zone).toContain('East Zone');
    expect(adminEnv.data.district).toContain('East Delhi');
    expect(adminEnv.data.jurisdictionalAuthority).toBeDefined();

    const wardEnv = await provider.getWardContext('Ward 15');
    expect(wardEnv.data.wardId).toBe('ward-15');
    expect(wardEnv.data.populationDensityPerSqKm).toBe(18400);
  });

  it('CriticalAssetContextProvider calculates proximity to schools, hospitals, and transport infrastructure', async () => {
    const provider = new CriticalAssetContextProvider('cached');
    const lat = 28.5832;
    const lng = 77.3188;

    const schoolsEnv = await provider.getNearbySchools(lat, lng);
    expect(schoolsEnv.data.nearestSchool).not.toBeNull();
    expect(schoolsEnv.data.nearestSchool?.name).toContain('St. Jude');

    const hospitalsEnv = await provider.getNearbyHospitals(lat, lng);
    expect(hospitalsEnv.data.nearestHospital).not.toBeNull();
    expect(hospitalsEnv.data.nearestHospital?.name).toContain('Sanjivani');

    const transportEnv = await provider.getNearbyTransportInfrastructure(lat, lng);
    expect(transportEnv.data.nearestTransport).not.toBeNull();
    expect(transportEnv.data.nearestTransport?.name).toContain('Metro Station');
  });

  it('HistoricalIncidentContextProvider provides recurrence and hotspot risk levels', async () => {
    const provider = new HistoricalIncidentContextProvider('demo_fallback');
    const histEnv = await provider.getHistoricalFrequency('Ward 15', 'waterlogging');

    expect(histEnv.data.wardCategory30dCount).toBeGreaterThan(0);
    expect(histEnv.data.hotspotRiskLevel).toBe('critical');
    expect(histEnv.mode).toBe('demo_fallback');
  });

  it('GeospatialRiskContextProvider calculates elevation and Yamuna floodplain proximity', async () => {
    const provider = new GeospatialRiskContextProvider('live');
    const geoEnv = await provider.getGeospatialRisk(28.5832, 77.3188);

    expect(geoEnv.mode).toBe('live');
    expect(geoEnv.data.elevationMeters).toBeLessThan(200);
    expect(geoEnv.data.drainageBottleneckPercent).toBeGreaterThan(70);
    expect(geoEnv.data.yamunaFloodplainDistanceMeters).toBeGreaterThan(0);
  });

  it('CivicContextDataLayer aggregates all 9 context categories for an incident with evidence weighting', async () => {
    const dataLayer = new CivicContextDataLayer('cached');
    const incidentContext = await dataLayer.getIncidentContext(mockIncident);

    expect(incidentContext.incidentId).toBe(mockIncident.id);
    expect(incidentContext.weather).toBeDefined();
    expect(incidentContext.rainfall).toBeDefined();
    expect(incidentContext.administrativeArea).toBeDefined();
    expect(incidentContext.ward).toBeDefined();
    expect(incidentContext.nearbySchools).toBeDefined();
    expect(incidentContext.nearbyHospitals).toBeDefined();
    expect(incidentContext.nearbyTransportInfrastructure).toBeDefined();
    expect(incidentContext.historicalIncidentFrequency).toBeDefined();
    expect(incidentContext.relevantGeospatialRiskIndicators).toBeDefined();

    // Verify AI evidence contribution analysis
    const impact = incidentContext.aiAssessmentEvidenceImpact;
    expect(impact.totalRiskPointsContributed).toBeGreaterThan(0);
    expect(impact.contributions.length).toBeGreaterThanOrEqual(7);

    // Sum of contribution weights should equal ~100%
    const totalWeight = impact.contributions.reduce((acc, c) => acc + c.weightPercent, 0);
    expect(totalWeight).toBeGreaterThanOrEqual(98);
    expect(totalWeight).toBeLessThanOrEqual(102);
  });

});
