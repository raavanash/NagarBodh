import { describe, expect, it, vi } from 'vitest';
import { BlueskySocialProvider } from '../providers/BlueskySocialProvider';
import { SignalIngestionService } from '../SignalIngestionService';
import { SignalNormalizer } from '../SignalNormalizer';

describe('BlueskySocialProvider & Integration', () => {
  it('instantiates BlueskySocialProvider with default LIVE mode', () => {
    const provider = new BlueskySocialProvider();
    expect(provider.id).toBe('provider-social-bluesky');
    expect(provider.type).toBe('social_bluesky');
    expect(provider.mode).toBe('LIVE');
  });

  it('returns simulation payloads when set to SIMULATION mode', async () => {
    const provider = new BlueskySocialProvider();
    provider.setMode('SIMULATION');
    const payloads = await provider.fetchOrIngest();
    expect(payloads.length).toBeGreaterThan(0);
    expect(payloads[0].sourceChannel).toBe('social_bluesky');
    expect(payloads[0].id).toContain('at://');
  });

  it('normalizes Bluesky post into IngestedCivicSignal preserving URI as ID', () => {
    const rawPayload = {
      id: 'at://did:plc:test12345/app.bsky.feed.post/3k999',
      text: 'Waterlogging near Karol Bagh metro gate #2. Traffic at a standstill!',
      sourceChannel: 'social_bluesky',
      author: 'Karol Bagh Resident',
      authorHandle: '@karolbagh.bsky.social',
      timestamp: '2026-09-10T10:00:00.000Z'
    };

    const normRes = SignalNormalizer.normalize(rawPayload, 'provider-social-bluesky', 'social_bluesky');
    expect(normRes.success).toBe(true);
    expect(normRes.signal?.channel).toBe('social_bluesky');
    expect(normRes.signal?.id).toBe('at://did:plc:test12345/app.bsky.feed.post/3k999');
    expect(normRes.signal?.locationName).toBe('Karol Bagh');
    expect(normRes.signal?.ward).toBe('Ward 14 - Karol Bagh');
  });

  it('deduplicates identical Bluesky URIs in SignalIngestionService', async () => {
    const service = new SignalIngestionService();
    const rawPayload = {
      id: 'at://did:plc:uniqueuri999/app.bsky.feed.post/3k888',
      text: 'Waterlogging near Mayur Vihar Phase 1 market road',
      sourceChannel: 'social_bluesky',
      authorHandle: '@mv.bsky.social',
      timestamp: new Date().toISOString()
    };

    const res1 = await service.ingest('provider-social-bluesky', rawPayload);
    expect(res1.normalizedSignals.length).toBe(1);

    const res2 = await service.ingest('provider-social-bluesky', rawPayload);
    expect(res2.normalizedSignals.length).toBe(0);
    expect(res2.results[0].isDuplicate).toBe(true);
  });
});
