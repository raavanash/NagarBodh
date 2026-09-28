import { describe, expect, it } from 'vitest';
import { SignalNormalizer } from '../SignalNormalizer';
import { DuplicateDetector } from '../DuplicateDetector';
import { SignalIngestionService } from '../SignalIngestionService';
import { clusterSignals } from '../../clusteringEngine';
import { RawSignalPayload } from '../../../types/ingestion';
import { SECTOR_15_SIMULATION_SIGNALS } from '../../../data/initialData';

describe('LIVE Mode Multi-Signal Fix Regression Suite', () => {

  it('1. assigns distinct, deterministic coordinates to unresolved live signals instead of single-point collapse', () => {
    const raw1: RawSignalPayload = {
      id: 'at://did:plc:user1/app.bsky.feed.post/post1',
      text: 'Heavy traffic and waterlogging reported on main street!',
      ingestionMode: 'LIVE'
    };

    const raw2: RawSignalPayload = {
      id: 'at://did:plc:user2/app.bsky.feed.post/post2',
      text: 'Pothole hazard causing major bottleneck near market area!',
      ingestionMode: 'LIVE'
    };

    const norm1 = SignalNormalizer.normalize(raw1, 'provider-social-bluesky', 'social_bluesky', false);
    const norm2 = SignalNormalizer.normalize(raw2, 'provider-social-bluesky', 'social_bluesky', false);

    expect(norm1.success).toBe(true);
    expect(norm2.success).toBe(true);

    const sig1 = norm1.signal!;
    const sig2 = norm2.signal!;

    expect(sig1.ward).toContain('Unassigned Ward');
    expect(sig2.ward).toContain('Unassigned Ward');

    // Coordinates should not be identical
    const isExactSameCoord = sig1.coordinates.lat === sig2.coordinates.lat && sig1.coordinates.lng === sig2.coordinates.lng;
    expect(isExactSameCoord).toBe(false);

    // Re-normalizing norm1 must be 100% deterministic (exact same coords)
    const norm1Repeat = SignalNormalizer.normalize(raw1, 'provider-social-bluesky', 'social_bluesky', false);
    expect(norm1Repeat.signal!.coordinates).toEqual(sig1.coordinates);
  });

  it('2. preserves genuine duplicate detection for exact text and fingerprint collisions', () => {
    const detector = new DuplicateDetector();

    const raw: RawSignalPayload = {
      id: 'at://did:plc:user1/app.bsky.feed.post/post1',
      text: 'Severe waterlogging at Connaught Place outer circle',
      lat: 28.6315,
      lng: 77.2167
    };

    const norm1 = SignalNormalizer.normalize(raw, 'provider-social-bluesky', 'social_bluesky', false).signal!;
    detector.register(norm1);

    // Exact text duplicate (even with different ID)
    const norm2 = SignalNormalizer.normalize(
      { ...raw, id: 'at://did:plc:user2/app.bsky.feed.post/post2' },
      'provider-social-bluesky',
      'social_bluesky',
      false
    ).signal!;

    const dupCheck = detector.isDuplicate(norm2);
    expect(dupCheck.isDuplicate).toBe(true);
    expect(dupCheck.reason).toContain('Exact repost content match');
  });

  it('3. allows multiple unresolved live signals to coexist without false spatial-temporal deduplication', () => {
    const detector = new DuplicateDetector();

    const raw1: RawSignalPayload = {
      id: 'at://did:plc:user1/app.bsky.feed.post/post1',
      text: 'Traffic jam due to broken down vehicle',
      ingestionMode: 'LIVE'
    };

    const raw2: RawSignalPayload = {
      id: 'at://did:plc:user2/app.bsky.feed.post/post2',
      text: 'Garbage dump overflow causing traffic delay',
      ingestionMode: 'LIVE'
    };

    const sig1 = SignalNormalizer.normalize(raw1, 'provider-social-bluesky', 'social_bluesky', false).signal!;
    const sig2 = SignalNormalizer.normalize(raw2, 'provider-social-bluesky', 'social_bluesky', false).signal!;

    detector.register(sig1);
    const dupCheck = detector.isDuplicate(sig2);

    expect(dupCheck.isDuplicate).toBe(false);
  });

  it('4. allows multiple distinct live signals to cluster into separate incidents when appropriate', () => {
    const raw1: RawSignalPayload = {
      id: 'at://did:plc:user1/app.bsky.feed.post/post1',
      text: 'Heavy waterlogging near Karol Bagh metro station',
      ingestionMode: 'LIVE'
    };

    const raw2: RawSignalPayload = {
      id: 'at://did:plc:user2/app.bsky.feed.post/post2',
      text: 'Garbage pile and drain overflow near Mayur Vihar Phase 1 market',
      ingestionMode: 'LIVE'
    };

    const sig1 = SignalNormalizer.normalize(raw1, 'provider-social-bluesky', 'social_bluesky', false).signal!;
    const sig2 = SignalNormalizer.normalize(raw2, 'provider-social-bluesky', 'social_bluesky', false).signal!;

    const clusterResult = clusterSignals([sig1, sig2], 20);
    expect(clusterResult.incidents.length).toBeGreaterThanOrEqual(2);
  });

  it('5. SignalIngestionService correctly handles REST search provider (provider-social-bluesky-legacy)', async () => {
    const service = new SignalIngestionService();
    service.setIngestionMode('LIVE');

    const provider = service.getProvider('provider-social-bluesky-legacy');
    expect(provider).toBeDefined();

    // Verify ingest call returns normalization results format
    const { normalizedSignals } = await service.ingest('provider-social-bluesky-legacy');
    expect(Array.isArray(normalizedSignals)).toBe(true);
  });

  it('6. canonical Sector 15 simulation signals remain completely unchanged', () => {
    const simSignals = SECTOR_15_SIMULATION_SIGNALS;
    expect(simSignals.length).toBeGreaterThan(0);
    const sector15Sig = simSignals.find(s => s.locationName.includes('Sector 15') || s.ward.includes('15'));
    expect(sector15Sig).toBeDefined();
    expect(sector15Sig?.coordinates).toEqual({ lat: 28.5825, lng: 77.3175 });
  });

});
