import { describe, expect, it } from 'vitest';
import { generateIncidentEvidenceChain } from '../evidenceProvenanceEngine';
import { CivicSignal, ClusteredIncident } from '../../types/civic';

const mockSignal1: CivicSignal = {
  id: 'sig-s15-05',
  timestamp: '2026-09-05T10:14:00Z',
  simulatedTimeLabel: '10:14 AM',
  channel: 'social_x',
  rawText: 'SOS!! St. Jude primary school yellow van trapped in flood water under subway!',
  detectedLanguage: 'hinglish',
  englishTranslation: 'SOS!! St. Jude primary school yellow van trapped in flood water under subway!',
  category: 'waterlogging',
  reportedSeverity: 'critical',
  confidenceScore: 0.99,
  coordinates: { lat: 28.5825, lng: 77.3175 },
  locationName: 'Sector 15 Underpass',
  ward: 'Ward 15 - Central Sub-city',
  authorHandle: '@Parent_PoojaG',
  sentiment: 'urgent',
  keyEntities: ['St. Jude School', 'Sector 15 Underpass']
};

const mockIncident: ClusteredIncident = {
  id: 'incident-ward-15-central-sub-city-waterlogging',
  title: 'Severe Waterlogging & Submerged Subway — Sector 15 Underpass',
  category: 'waterlogging',
  status: 'resolved',
  centroid: { lat: 28.5825, lng: 77.3175 },
  radiusMeters: 450,
  signalIds: ['sig-s15-05'],
  firstSignalTime: '2026-09-05T08:00:00Z',
  latestSignalTime: '2026-09-05T10:18:00Z',
  velocityPerHour: 22,
  velocitySurgePercent: 280,
  ward: 'Ward 15 - Central Sub-city',
  priority: {
    overallScore: 94,
    level: 'critical',
    factors: {
      severityScore: 22,
      velocityScore: 23,
      populationImpactScore: 18,
      criticalAssetExposureScore: 14,
      environmentalRiskScore: 8,
      slaRecurrenceScore: 9
    },
    formulaExplanation: 'Deterministic test priority'
  },
  auditableInsight: {
    observedData: {
      signalIds: ['sig-s15-05'],
      rawExcerpts: [],
      centroidCoordinates: { lat: 28.5825, lng: 77.3175 },
      firstReportedAt: '2026-09-05T08:00:00Z',
      latestReportedAt: '2026-09-05T10:18:00Z',
      sourceDistribution: { citizen_app: 0, social_x: 1, grievance_portal: 0, helpline_311: 0 }
    },
    calculatedMetrics: {
      signalCount: 31,
      velocityPerHour: 22,
      velocityDeltaPercent: 280,
      clusterRadiusMeters: 450,
      nearestHospitalDistanceMeters: 250,
      nearestHospitalName: 'Sanjivani Hospital',
      nearestSchoolDistanceMeters: 120,
      nearestSchoolName: 'St. Jude School',
      priorityScore: 94
    },
    modelInference: {
      title: 'Severe Waterlogging Sector 15',
      summary: '31 signals clustered',
      assessedRootCause: 'Drainage bottleneck',
      confidenceScore: 0.92,
      languageBreakdown: { en: 0, hi: 0, hinglish: 1 }
    },
    recommendation: {
      primaryDepartment: 'MCD Dewatering Wing',
      secondaryDepartments: [],
      recommendedActions: [],
      requiredResources: [],
      estimatedSLAHours: 1.5,
      justification: 'Critical underpass waterlogging'
    }
  },
  resolutionVerification: {
    beforeSignalCount: 31,
    beforePriorityScore: 94,
    afterSignalCount: 4,
    afterPriorityScore: 21,
    signalReductionPercent: 87,
    priorityReductionPoints: 73,
    timeToResolutionFormatted: '2h 18m',
    timeToResolutionMinutes: 138,
    recurringComplaintsDetected: false,
    positiveConfirmationCount: 3,
    verificationConfidenceScore: 91,
    outcome: 'VERIFIED',
    aiConclusion: 'Citizen signal volume has fallen substantially and no new critical reports have appeared in the affected zone.',
    disclaimerText: 'Signal-Based Verification Notice'
  }
};

describe('NagarBodh Evidence & Provenance System', () => {
  it('1. Generates traceable evidence items with all 6 required metadata fields', () => {
    const chain = generateIncidentEvidenceChain(mockIncident, [mockSignal1], {
      rainfallMmPerHour: 42.5,
      description: 'Torrential downpour'
    });

    expect(chain.length).toBeGreaterThanOrEqual(5);

    chain.forEach(item => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('source');
      expect(item).toHaveProperty('type');
      expect(item).toHaveProperty('timestamp');
      expect(item).toHaveProperty('location');
      expect(item).toHaveProperty('dataFreshness');
      expect(item).toHaveProperty('usedFor');
    });
  });

  it('2. Traces Citizen Signal evidence to source (X/public signal, 10:14 AM, Sector 15)', () => {
    const chain = generateIncidentEvidenceChain(mockIncident, [mockSignal1]);
    const citizenItem = chain.find(i => i.usedFor.includes('incident detection'));

    expect(citizenItem).toBeDefined();
    expect(citizenItem?.source).toContain('sig-s15-05');
    expect(citizenItem?.type).toBe('X/public signal');
    expect(citizenItem?.timestamp).toBe('10:14 AM');
    expect(citizenItem?.location).toBe('Sector 15 Underpass');
  });

  it('3. Traces Environmental Risk telemetry (IMD rainfall, 42.5 mm/hr)', () => {
    const chain = generateIncidentEvidenceChain(mockIncident, [mockSignal1], {
      rainfallMmPerHour: 42.5,
      description: 'Torrential downpour'
    });
    const weatherItem = chain.find(i => i.usedFor.includes('environmental risk'));

    expect(weatherItem).toBeDefined();
    expect(weatherItem?.source).toContain('IMD rainfall telemetry');
    expect(weatherItem?.type).toBe('Telemetry sensor');
    expect(weatherItem?.snippet).toContain('42.5 mm/hr');
  });

  it('4. Traces Critical Asset Vulnerability score (St. Jude School, 120m)', () => {
    const chain = generateIncidentEvidenceChain(mockIncident, [mockSignal1]);
    const assetItem = chain.find(i => i.source.includes('St. Jude School'));

    expect(assetItem).toBeDefined();
    expect(assetItem?.type).toBe('Critical asset proximity GIS');
    expect(assetItem?.location).toContain('120m');
    expect(assetItem?.usedFor).toContain('vulnerability score');
  });

  it('5. Traces Historical Recurrence log (11 incidents, Last 90 days)', () => {
    const chain = generateIncidentEvidenceChain(mockIncident, [mockSignal1]);
    const histItem = chain.find(i => i.usedFor.includes('recurrence score'));

    expect(histItem).toBeDefined();
    expect(histItem?.source).toBe('Municipal historical incident log');
    expect(histItem?.timestamp).toBe('Last 90 days');
    expect(histItem?.snippet).toContain('11 historical inundation reports');
  });

  it('6. Traces Post-Resolution Verification evidence (Signal drop -87%, VERIFIED)', () => {
    const chain = generateIncidentEvidenceChain(mockIncident, [mockSignal1]);
    const resItem = chain.find(i => i.usedFor.includes('resolution verification'));

    expect(resItem).toBeDefined();
    expect(resItem?.snippet).toContain('-87%');
    expect(resItem?.snippet).toContain('VERIFIED');
  });
});
