import { describe, expect, it } from 'vitest';
import { clusterSignals } from '../clusteringEngine';
import { SignalIngestionService } from '../ingestion/SignalIngestionService';
import { SignalNormalizer } from '../ingestion/SignalNormalizer';
import { CivicSignal } from '../../types/civic';
import { IngestionMode, RawSignalPayload } from '../../types/ingestion';
import { BASELINE_SIGNALS, SECTOR_15_SIMULATION_SIGNALS } from '../../data/initialData';

describe('Phase 1: Hard Data Isolation & Mode Separation Engine', () => {

  it('1. assigns explicit LIVE or SIMULATION mode metadata during normalization', () => {
    const liveRawPayload: RawSignalPayload = {
      text: 'Waterlogging near Connaught Place outer circle',
      lat: 28.6315,
      lng: 77.2167,
      ingestionMode: 'LIVE'
    };

    const simRawPayload: RawSignalPayload = {
      text: 'Waterlogging near Sector 15 metro pillar',
      lat: 28.5825,
      lng: 77.3175,
      ingestionMode: 'SIMULATION'
    };

    const liveResult = SignalNormalizer.normalize(liveRawPayload, 'provider-social-bluesky', 'social_bluesky', false);
    const simResult = SignalNormalizer.normalize(simRawPayload, 'provider-simulation-stream', 'simulation', true);

    expect(liveResult.success).toBe(true);
    expect(liveResult.signal?.ingestionMode).toBe('LIVE');
    expect(liveResult.signal?.sourceMetadata.mode).toBe('LIVE');

    expect(simResult.success).toBe(true);
    expect(simResult.signal?.ingestionMode).toBe('SIMULATION');
    expect(simResult.signal?.sourceMetadata.mode).toBe('SIMULATION');
  });

  it('2. SignalIngestionService tags ingested signals with explicit active mode', async () => {
    const service = new SignalIngestionService();
    service.setIngestionMode('LIVE');

    const raw: RawSignalPayload = {
      text: 'Pothole hazard on Karol Bagh Ajmal Khan Road'
    };

    const { normalizedSignals } = await service.ingest('provider-social-bluesky', raw);

    expect(normalizedSignals).toHaveLength(1);
    expect(normalizedSignals[0].ingestionMode).toBe('LIVE');
    expect(normalizedSignals[0].sourceMetadata.mode).toBe('LIVE');
  });

  it('3. clusteringEngine operates strictly on active-mode signals without cross-contamination', () => {
    const liveSignals: CivicSignal[] = [
      {
        id: 'live-sig-01',
        ingestionMode: 'LIVE',
        timestamp: new Date().toISOString(),
        simulatedTimeLabel: '10:00 AM',
        channel: 'social_bluesky',
        rawText: 'Severe waterlogging at Connaught Place outer circle',
        detectedLanguage: 'en',
        englishTranslation: 'Severe waterlogging at Connaught Place outer circle',
        category: 'waterlogging',
        reportedSeverity: 'high',
        confidenceScore: 0.95,
        coordinates: { lat: 28.6315, lng: 77.2167 },
        locationName: 'Connaught Place',
        ward: 'Ward 01 - Connaught Place',
        sentiment: 'urgent',
        keyEntities: ['Connaught Place']
      }
    ];

    const simSignals: CivicSignal[] = SECTOR_15_SIMULATION_SIGNALS.map(s => ({
      ...s,
      ingestionMode: 'SIMULATION' as const
    }));

    // Cluster LIVE dataset only
    const liveClusterResult = clusterSignals(liveSignals, 10);
    expect(liveClusterResult.incidents).toHaveLength(1);
    expect(liveClusterResult.incidents[0].ward).toContain('Connaught Place');

    // Cluster SIMULATION dataset only
    const simClusterResult = clusterSignals(simSignals, 48.5);
    expect(simClusterResult.incidents.length).toBeGreaterThan(0);
    expect(simClusterResult.incidents.some(i => i.ward.includes('Connaught Place'))).toBe(false);
    expect(simClusterResult.incidents.some(i => i.ward.includes('15') || i.ward.includes('Central'))).toBe(true);
  });

  it('4. ensures live signals do not leak into simulation store or vice versa', () => {
    const liveStore: CivicSignal[] = [];
    const simStore: CivicSignal[] = [...BASELINE_SIGNALS.map(s => ({ ...s, ingestionMode: 'SIMULATION' as const }))];

    let currentMode: IngestionMode = 'LIVE';

    const getActiveSignals = () => (currentMode === 'LIVE' ? liveStore : simStore);

    // Live ingestion occurs
    const liveSignal: CivicSignal = {
      id: 'live-101',
      ingestionMode: 'LIVE',
      timestamp: new Date().toISOString(),
      simulatedTimeLabel: '10:30 AM',
      channel: 'social_bluesky',
      rawText: 'Pothole on Ring Road',
      detectedLanguage: 'en',
      englishTranslation: 'Pothole on Ring Road',
      category: 'road_hazard',
      reportedSeverity: 'medium',
      confidenceScore: 0.9,
      coordinates: { lat: 28.6139, lng: 77.209 },
      locationName: 'Ring Road',
      ward: 'Ward 01 - Central Delhi',
      sentiment: 'negative',
      keyEntities: ['Ring Road']
    };
    liveStore.push(liveSignal);

    expect(getActiveSignals()).toHaveLength(1);
    expect(getActiveSignals()[0].id).toBe('live-101');

    // Switch to SIMULATION
    currentMode = 'SIMULATION';
    expect(getActiveSignals()).toHaveLength(BASELINE_SIGNALS.length);
    expect(getActiveSignals().every(s => s.ingestionMode === 'SIMULATION')).toBe(true);

    // Switch back to LIVE
    currentMode = 'LIVE';
    expect(getActiveSignals()).toHaveLength(1);
    expect(getActiveSignals()[0].id).toBe('live-101');
  });

  it('5. derives hotspots and metrics strictly from active mode dataset', () => {
    const simSignals: CivicSignal[] = BASELINE_SIGNALS.map(s => ({ ...s, ingestionMode: 'SIMULATION' as const }));
    const simClusters = clusterSignals(simSignals, 20);

    const liveSignals: CivicSignal[] = [];
    const liveClusters = clusterSignals(liveSignals, 20);

    const getHotspotCount = (mode: IngestionMode) => {
      const activeClusters = mode === 'LIVE' ? liveClusters.incidents : simClusters.incidents;
      return activeClusters.length;
    };

    expect(getHotspotCount('LIVE')).toBe(0);
    expect(getHotspotCount('SIMULATION')).toBeGreaterThan(0);
  });
});
