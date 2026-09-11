import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BlueskySocialProvider } from '../providers/BlueskySocialProvider';
import { SignalIngestionService } from '../SignalIngestionService';
import { SignalNormalizer } from '../SignalNormalizer';

describe('BlueskySocialProvider & Integration (Resilient Health State)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('1. provider defaults to LIVE mode & uses public.api.bsky.app endpoint', () => {
    const provider = new BlueskySocialProvider();
    expect(provider.id).toBe('provider-social-bluesky');
    expect(provider.type).toBe('social_bluesky');
    expect(provider.mode).toBe('LIVE');
    expect(provider.endpoint).toBe('https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts');
  });

  it('2. simulation mode still returns simulation signals', async () => {
    const provider = new BlueskySocialProvider();
    provider.setMode('SIMULATION');
    const payloads = await provider.fetchOrIngest();
    expect(payloads.length).toBeGreaterThan(0);
    expect(payloads[0].sourceChannel).toBe('social_bluesky');
    expect(payloads[0].id).toContain('at://');
    expect(await provider.isAvailable()).toBe(true);
  });

  it('3. Bluesky post normalization still works', () => {
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

  it('4. duplicate detection still works', async () => {
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

  it('5. successful API response is converted into RawSignalPayload[]', async () => {
    const mockPosts = [
      {
        uri: 'at://did:plc:mockpost1/app.bsky.feed.post/100',
        text: 'Drainage overflow near Connaught Place',
        author: { displayName: 'CP Resident', handle: 'cp_resident.bsky.social' },
        record: { createdAt: '2026-09-11T12:00:00.000Z' }
      }
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, data: mockPosts, count: 1 })
    } as Response);

    const provider = new BlueskySocialProvider();
    const result = await provider.fetchOrIngest();

    expect(result.length).toBe(1);
    expect(result[0].id).toBe('at://did:plc:mockpost1/app.bsky.feed.post/100');
    expect(result[0].text).toContain('Connaught Place');
    expect(await provider.isAvailable()).toBe(true);
    expect(provider.getHealthStatus().lastStatus).toBe(200);
  });

  it('6 & 7. HTTP 403 does NOT create fake signals and marks provider unavailable', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: false,
        fallback: false,
        provider: 'bluesky',
        status: 403,
        errorCode: 'UPSTREAM_FORBIDDEN',
        message: 'Bluesky API returned HTTP 403: Request forbidden by administrative rules.',
        endpoint: 'https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts'
      })
    } as Response);

    const provider = new BlueskySocialProvider();
    const result = await provider.fetchOrIngest();

    expect(result.length).toBe(0); // NO fake signals fabricated!
    expect(await provider.isAvailable()).toBe(false);

    const health = provider.getHealthStatus();
    expect(health.isAvailable).toBe(false);
    expect(health.lastStatus).toBe(403);
    expect(health.lastError).toContain('HTTP 403');
    expect(health.endpoint).toContain('public.api.bsky.app');
  });

  it('8. network failure does NOT create fake signals and records failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('DNS resolution failed'));

    const provider = new BlueskySocialProvider();
    const result = await provider.fetchOrIngest();

    expect(result.length).toBe(0);
    expect(await provider.isAvailable()).toBe(false);
    expect(provider.getHealthStatus().lastError).toContain('DNS resolution failed');
  });

  it('9. provider recovers availability after a later successful request', async () => {
    const provider = new BlueskySocialProvider();

    // 1st request fails with 403
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: false, status: 403, message: 'Forbidden' })
    } as Response);

    await provider.fetchOrIngest();
    expect(await provider.isAvailable()).toBe(false);

    // 2nd request succeeds
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        data: [{ uri: 'at://did:plc:rec1/app.bsky.feed.post/200', text: 'Pothole fixed near AIIMS' }]
      })
    } as Response);

    const recoveredResult = await provider.fetchOrIngest();
    expect(recoveredResult.length).toBe(1);
    expect(await provider.isAvailable()).toBe(true);
    expect(provider.getHealthStatus().lastStatus).toBe(200);
  });
});
