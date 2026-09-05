import { describe, expect, it } from 'vitest';
import { calculateResolutionVerification } from '../resolutionVerificationEngine';
import { CivicSignal, ClusteredIncident } from '../../types/civic';

const mockSignal1: CivicSignal = {
  id: 'sig-ver-1',
  timestamp: '2026-09-05T08:00:00Z',
  simulatedTimeLabel: '08:00 AM',
  channel: 'citizen_app',
  rawText: 'Severe waterlogging at Sector 15 underpass.',
  detectedLanguage: 'en',
  englishTranslation: 'Severe waterlogging at Sector 15 underpass.',
  category: 'waterlogging',
  reportedSeverity: 'high',
  confidenceScore: 0.95,
  coordinates: { lat: 28.5825, lng: 77.3175 },
  locationName: 'Sector 15 Underpass',
  ward: 'Ward 15 - Central Sub-city',
  sentiment: 'urgent',
  keyEntities: ['Sector 15', 'underpass']
};

const mockIncident: ClusteredIncident = {
  id: 'incident-ward-15-central-sub-city-waterlogging',
  title: 'Severe Waterlogging & Submerged Subway — Sector 15 Underpass',
  category: 'waterlogging',
  status: 'resolved',
  centroid: { lat: 28.5825, lng: 77.3175 },
  radiusMeters: 450,
  signalIds: ['sig-ver-1'],
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
      signalIds: ['sig-ver-1'],
      rawExcerpts: [],
      centroidCoordinates: { lat: 28.5825, lng: 77.3175 },
      firstReportedAt: '2026-09-05T08:00:00Z',
      latestReportedAt: '2026-09-05T10:18:00Z',
      sourceDistribution: { citizen_app: 1, social_x: 0, grievance_portal: 0, helpline_311: 0 }
    },
    calculatedMetrics: {
      signalCount: 31,
      velocityPerHour: 22,
      velocityDeltaPercent: 280,
      clusterRadiusMeters: 450,
      nearestHospitalDistanceMeters: 280,
      nearestSchoolDistanceMeters: 410,
      priorityScore: 94
    },
    modelInference: {
      title: 'Severe Waterlogging Sector 15',
      summary: '31 signals clustered',
      assessedRootCause: 'Drainage bottleneck',
      confidenceScore: 0.92,
      languageBreakdown: { en: 1, hi: 0, hinglish: 0 }
    },
    recommendation: {
      primaryDepartment: 'MCD Dewatering Wing',
      secondaryDepartments: [],
      recommendedActions: [],
      requiredResources: [],
      estimatedSLAHours: 1.5,
      justification: 'Critical underpass waterlogging'
    }
  }
};

describe('NagarBodh Resolution Verification Engine', () => {
  it('1. Retains peak baseline evidence (Before: 31 signals, Priority 94)', () => {
    const res = calculateResolutionVerification(mockIncident, [mockSignal1]);
    expect(res.beforeSignalCount).toBe(31);
    expect(res.beforePriorityScore).toBe(94);
  });

  it('2. Ingests post-resolution residual signals (After: 4 signals, Priority 21)', () => {
    const res = calculateResolutionVerification(mockIncident, [mockSignal1]);
    expect(res.afterSignalCount).toBe(4);
    expect(res.afterPriorityScore).toBe(21);
  });

  it('3. Calculates signal volume reduction accurately (-87%)', () => {
    const res = calculateResolutionVerification(mockIncident, [mockSignal1]);
    expect(res.signalReductionPercent).toBe(87);
    expect(res.priorityReductionPoints).toBe(73);
  });

  it('4. Calculates time-to-resolution formatted (2h 18m)', () => {
    const res = calculateResolutionVerification(mockIncident, [mockSignal1]);
    expect(res.timeToResolutionFormatted).toBe('2h 18m');
    expect(res.timeToResolutionMinutes).toBe(138);
  });

  it('5. Generates resolution confidence score (91%) and determines VERIFIED', () => {
    const res = calculateResolutionVerification(mockIncident, [mockSignal1]);
    expect(res.verificationConfidenceScore).toBe(91);
    expect(res.outcome).toBe('VERIFIED');
  });

  it('6. Includes AI conclusion text and mandatory signal-based verification disclaimer', () => {
    const res = calculateResolutionVerification(mockIncident, [mockSignal1]);
    expect(res.aiConclusion).toContain('Citizen signal volume has fallen substantially');
    expect(res.disclaimerText).toContain('Signal-Based Verification Notice');
    expect(res.disclaimerText).toContain('does not replace physical engineering verification');
  });
});
