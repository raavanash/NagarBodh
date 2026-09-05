import { describe, expect, it } from 'vitest';
import { clusterSignals } from '../clusteringEngine';
import { detectDuplicateSignals } from '../deduplicationEngine';
import { computeSemanticSimilarity } from '../semanticEngine';
import { calculateCentroid, calculateClusterRadius, calculateSignalVelocity } from '../spatialTemporalEngine';
import { CivicSignal } from '../../types/civic';

const mockSignal1: CivicSignal = {
  id: 'sig-test-1',
  timestamp: '2026-09-03T08:00:00Z',
  simulatedTimeLabel: '08:00 AM',
  channel: 'citizen_app',
  rawText: 'Severe waterlogging at Sector 15 underpass. Vehicles stranded.',
  detectedLanguage: 'en',
  englishTranslation: 'Severe waterlogging at Sector 15 underpass. Vehicles stranded.',
  category: 'waterlogging',
  reportedSeverity: 'high',
  confidenceScore: 0.92,
  coordinates: { lat: 28.5825, lng: 77.3175 },
  locationName: 'Sector 15 Underpass',
  ward: 'Ward 15 - Central Sub-city',
  authorHandle: '@UserA',
  sentiment: 'urgent',
  keyEntities: ['Sector 15', 'underpass', 'waterlogging']
};

const mockSignal2: CivicSignal = {
  id: 'sig-test-2',
  timestamp: '2026-09-03T08:15:00Z',
  simulatedTimeLabel: '08:15 AM',
  channel: 'social_x',
  rawText: 'Sector 15 underpass flooded, drain overflow! Avoid route.',
  detectedLanguage: 'en',
  englishTranslation: 'Sector 15 underpass flooded, drain overflow! Avoid route.',
  category: 'drainage',
  reportedSeverity: 'high',
  confidenceScore: 0.95,
  coordinates: { lat: 28.5830, lng: 77.3180 },
  locationName: 'Sector 15 Underpass Incline',
  ward: 'Ward 15 - Central Sub-city',
  authorHandle: '@UserB',
  sentiment: 'urgent',
  keyEntities: ['Sector 15', 'drain overflow', 'underpass']
};

const mockSignalFar: CivicSignal = {
  id: 'sig-test-far',
  timestamp: '2026-09-03T08:20:00Z',
  simulatedTimeLabel: '08:20 AM',
  channel: 'grievance_portal',
  rawText: 'Garbage dump overflowing at Karol Bagh market gate.',
  detectedLanguage: 'en',
  englishTranslation: 'Garbage dump overflowing at Karol Bagh market gate.',
  category: 'garbage',
  reportedSeverity: 'medium',
  confidenceScore: 0.88,
  coordinates: { lat: 28.6508, lng: 77.1895 },
  locationName: 'Ajmal Khan Road, Karol Bagh',
  ward: 'Ward 14 - Karol Bagh',
  authorHandle: '@UserC',
  sentiment: 'negative',
  keyEntities: ['Karol Bagh', 'Garbage']
};

describe('Incident Intelligence Engine', () => {
  it('1. Detects duplicate signals accurately', () => {
    const duplicateSignal: CivicSignal = {
      ...mockSignal1,
      id: 'sig-test-1-dup',
      timestamp: '2026-09-03T08:02:00Z'
    };
    const result = detectDuplicateSignals([mockSignal1, duplicateSignal]);
    expect(result.duplicateCount).toBe(1);
    expect(result.canonicalSignals.length).toBe(1);
  });

  it('2. Calculates semantic similarity between related signals', () => {
    const sim = computeSemanticSimilarity(mockSignal1, mockSignal2);
    expect(sim).toBeGreaterThan(0.5);
  });

  it('3 & 4. Performs geographic and temporal calculations correctly', () => {
    const coords = [mockSignal1.coordinates, mockSignal2.coordinates];
    const centroid = calculateCentroid(coords);
    expect(centroid.lat).toBeCloseTo(28.58275, 4);
    expect(centroid.lng).toBeCloseTo(77.31775, 4);

    const radius = calculateClusterRadius(centroid, coords);
    expect(radius).toBeGreaterThanOrEqual(50);

    const vel = calculateSignalVelocity([mockSignal1.timestamp, mockSignal2.timestamp]);
    expect(vel.velocityPerHour).toBeGreaterThan(0);
  });

  it('5, 6, 7 & 11. Clusters nearby signals into single incident and separates distant signals', () => {
    const { incidents } = clusterSignals([mockSignal1, mockSignal2, mockSignalFar]);
    expect(incidents.length).toBe(2); // Sector 15 cluster + Karol Bagh cluster

    const s15Incident = incidents.find((i) => i.ward.includes('Ward 15'));
    expect(s15Incident).toBeDefined();
    expect(s15Incident?.signalIds.length).toBe(2);

    const kbIncident = incidents.find((i) => i.ward.includes('Karol Bagh'));
    expect(kbIncident).toBeDefined();
    expect(kbIncident?.signalIds.length).toBe(1);
  });

  it('8, 9, 10, 12, 13. Recalculates metrics and generates explainable audit rationale', () => {
    const { incidents } = clusterSignals([mockSignal1, mockSignal2]);
    const incident = incidents[0];

    expect(incident.velocityPerHour).toBeGreaterThan(0);
    expect(incident.auditableInsight.explanation).toBeDefined();

    const explanation = incident.auditableInsight.explanation!;
    expect(explanation.summaryText).toContain('These 2 signals were clustered because:');
    expect(explanation.explanationBullets.length).toBe(4);
    expect(explanation.explanationBullets[3]).toContain('independent source channels');
  });

  it('Preserves Sector-15 demo fixture ID deterministically', () => {
    const { incidents } = clusterSignals([mockSignal1, mockSignal2]);
    expect(incidents[0].id).toBe('incident-ward-15-central-sub-city-waterlogging');
  });
});
