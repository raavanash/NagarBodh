import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BlueskyJetstreamProvider, CIVIC_KEYWORDS } from '../providers/BlueskyJetstreamProvider';
import { SignalIngestionService } from '../SignalIngestionService';
import { SignalNormalizer } from '../SignalNormalizer';

class MockWebSocket {
  public static instances: MockWebSocket[] = [];
  public url: string;
  public readyState = 0; // CONNECTING
  public onopen: (() => void) | null = null;
  public onmessage: ((event: { data: any }) => void) | null = null;
  public onerror: ((err: any) => void) | null = null;
  public onclose: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) this.onopen();
    }, 10);
  }

  public send(_data: any) {}

  public close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose();
  }

  public simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage({ data: typeof data === 'string' ? data : JSON.stringify(data) });
    }
  }

  public simulateError(err: any) {
    if (this.onerror) this.onerror(err);
  }
}

describe('BlueskyJetstreamProvider Unit Tests', () => {
  let originalWebSocket: any;

  beforeEach(() => {
    MockWebSocket.instances = [];
    originalWebSocket = (globalThis as any).WebSocket;
    (globalThis as any).WebSocket = MockWebSocket;
    vi.useFakeTimers();
  });

  afterEach(() => {
    (globalThis as any).WebSocket = originalWebSocket;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('1. initializes provider in LIVE mode with default endpoint', () => {
    const provider = new BlueskyJetstreamProvider();
    expect(provider.id).toBe('provider-social-bluesky');
    expect(provider.type).toBe('social_bluesky');
    expect(provider.mode).toBe('LIVE');
    expect(provider.endpoint).toContain('jetstream2.us-east.bsky.network');
  });

  it('2. parses valid CREATE app.bsky.feed.post commit event', () => {
    const provider = new BlueskyJetstreamProvider();
    const eventData = {
      did: 'did:plc:user123',
      kind: 'commit',
      commit: {
        operation: 'create',
        collection: 'app.bsky.feed.post',
        rkey: 'post456',
        record: {
          $type: 'app.bsky.feed.post',
          text: 'Severe waterlogging near Karol Bagh metro station. Traffic halted!',
          createdAt: '2026-09-11T12:00:00.000Z'
        }
      }
    };

    const payload = provider.parseJetstreamEvent(JSON.stringify(eventData));
    expect(payload).not.toBeNull();
    expect(payload?.id).toBe('at://did:plc:user123/app.bsky.feed.post/post456');
    expect(payload?.text).toContain('waterlogging');
    expect(payload?.sourceChannel).toBe('social_bluesky');
    expect(payload?.url).toContain('bsky.app/profile/user123/post/post456');
  });

  it('3 & 4. ignores UPDATE, DELETE, and non-feed-post collections', () => {
    const provider = new BlueskyJetstreamProvider();

    // UPDATE operation
    const updateEvent = {
      did: 'did:plc:user123',
      kind: 'commit',
      commit: {
        operation: 'update',
        collection: 'app.bsky.feed.post',
        rkey: 'post456',
        record: { text: 'waterlogging update' }
      }
    };
    expect(provider.parseJetstreamEvent(JSON.stringify(updateEvent))).toBeNull();

    // DELETE operation
    const deleteEvent = {
      did: 'did:plc:user123',
      kind: 'commit',
      commit: {
        operation: 'delete',
        collection: 'app.bsky.feed.post',
        rkey: 'post456'
      }
    };
    expect(provider.parseJetstreamEvent(JSON.stringify(deleteEvent))).toBeNull();

    // Like collection (non-post)
    const likeEvent = {
      did: 'did:plc:user123',
      kind: 'commit',
      commit: {
        operation: 'create',
        collection: 'app.bsky.feed.like',
        rkey: 'like123',
        record: { subject: { uri: 'at://did:plc:1/2/3' } }
      }
    };
    expect(provider.parseJetstreamEvent(JSON.stringify(likeEvent))).toBeNull();
  });

  it('5 & 6. filters out irrelevant non-civic posts', () => {
    const provider = new BlueskyJetstreamProvider();
    const irrelevantEvent = {
      did: 'did:plc:user999',
      kind: 'commit',
      commit: {
        operation: 'create',
        collection: 'app.bsky.feed.post',
        rkey: 'post999',
        record: { text: 'Enjoying my morning coffee and listening to music today!' }
      }
    };

    expect(provider.parseJetstreamEvent(JSON.stringify(irrelevantEvent))).toBeNull();
  });

  it('7 & 8. recognizes English, Devanagari Hindi, and Hinglish civic terms', () => {
    const provider = new BlueskyJetstreamProvider();

    // English
    expect(provider.isCivicRelevant('Huge pothole on main road causing hazard')).toBe(true);

    // Hindi Devanagari
    expect(provider.isCivicRelevant('हमारे क्षेत्र में जलभराव की गंभीर समस्या है')).toBe(true);

    // Hinglish
    expect(provider.isCivicRelevant('Mayur Vihar me paani bhar gaya aur sadak pe gaddha hai')).toBe(true);

    // Irrelevant
    expect(provider.isCivicRelevant('Having lunch with friends')).toBe(false);
  });

  it('9. handles malformed event JSON safely without throwing', () => {
    const provider = new BlueskyJetstreamProvider();
    expect(provider.parseJetstreamEvent('INVALID_JSON{{{')).toBeNull();
    expect(provider.parseJetstreamEvent('')).toBeNull();
  });

  it('10. updates connection health status on WebSocket lifecycle events', () => {
    const provider = new BlueskyJetstreamProvider();
    provider.connect();

    vi.advanceTimersByTime(20);
    const mockWS = MockWebSocket.instances[0];
    expect(mockWS).toBeDefined();

    // Connection opened
    const health = provider.getHealthStatus();
    expect(health.status).toBe('CONNECTED');
    expect(health.isAvailable).toBe(true);

    // Connection error
    mockWS.simulateError(new Error('Network drop'));
    expect(provider.getHealthStatus().status).toBe('ERROR');

    // Connection closed
    mockWS.close();
    expect(provider.getHealthStatus().status).toBe('DISCONNECTED');
  });

  it('11. performs exponential backoff reconnect behavior when disconnected', () => {
    const provider = new BlueskyJetstreamProvider();
    provider.connect();
    vi.advanceTimersByTime(20);

    const mockWS = MockWebSocket.instances[0];
    mockWS.close();

    // Expect 1st reconnect scheduled in 1000ms
    vi.advanceTimersByTime(1050);
    expect(MockWebSocket.instances.length).toBe(2);

    // Disconnect 2nd instance
    MockWebSocket.instances[1].close();

    // Expect 2nd reconnect scheduled in 2000ms
    vi.advanceTimersByTime(2050);
    expect(MockWebSocket.instances.length).toBe(3);

    provider.disconnect();
  });

  it('12. prevents duplicate signal ingestion when ingested via SignalIngestionService', async () => {
    const service = new SignalIngestionService();
    const provider = service.getProvider('provider-social-bluesky') as BlueskyJetstreamProvider;
    provider.setMode('LIVE');

    vi.advanceTimersByTime(20);
    const mockWS = MockWebSocket.instances[0];

    const civicEvent = {
      did: 'did:plc:dupuser',
      kind: 'commit',
      commit: {
        operation: 'create',
        collection: 'app.bsky.feed.post',
        rkey: 'dup123',
        record: {
          text: 'Pothole hazard near Connaught Place',
          createdAt: new Date().toISOString()
        }
      }
    };

    // Simulate receiving message twice
    mockWS.simulateMessage(civicEvent);
    mockWS.simulateMessage(civicEvent);

    const res1 = await service.ingest('provider-social-bluesky');
    expect(res1.normalizedSignals.length).toBe(1);

    const res2 = await service.ingest('provider-social-bluesky');
    expect(res2.normalizedSignals.length).toBe(0);
  });

  it('13. simulation mode returns mock simulation signals', async () => {
    const provider = new BlueskyJetstreamProvider();
    provider.setMode('SIMULATION');
    const signals = await provider.fetchOrIngest();

    expect(signals.length).toBeGreaterThan(0);
    expect(signals[0].sourceChannel).toBe('social_bluesky');
    expect(await provider.isAvailable()).toBe(true);
  });

  it('14. normalizes parsed Jetstream payload seamlessly with SignalNormalizer', () => {
    const provider = new BlueskyJetstreamProvider();
    const event = {
      did: 'did:plc:normuser',
      kind: 'commit',
      commit: {
        operation: 'create',
        collection: 'app.bsky.feed.post',
        rkey: 'norm789',
        record: {
          text: 'Waterlogging near Karol Bagh metro station. Traffic halted!',
          createdAt: '2026-09-11T12:00:00.000Z'
        }
      }
    };

    const rawPayload = provider.parseJetstreamEvent(JSON.stringify(event))!;
    const normRes = SignalNormalizer.normalize(rawPayload, 'provider-social-bluesky', 'social_bluesky');

    expect(normRes.success).toBe(true);
    expect(normRes.signal?.id).toBe('at://did:plc:normuser/app.bsky.feed.post/norm789');
    expect(normRes.signal?.category).toBe('waterlogging');
    expect(normRes.signal?.locationName).toBe('Karol Bagh');
  });

  it('15. development-only end-to-end fixture test passes raw Jetstream JSON event to onSignalListener and SignalIngestionService', async () => {
    const service = new SignalIngestionService();
    const provider = service.getProvider('provider-social-bluesky') as BlueskyJetstreamProvider;
    
    let receivedNormalizedSignal: any = null;
    provider.setOnSignalListener(async (rawPayload) => {
      const { normalizedSignals } = await service.ingest('provider-social-bluesky', rawPayload);
      if (normalizedSignals.length > 0) {
        receivedNormalizedSignal = normalizedSignals[0];
      }
    });

    const realJetstreamFixture = JSON.stringify({
      did: 'did:plc:delhicivicuser',
      kind: 'commit',
      commit: {
        operation: 'create',
        collection: 'app.bsky.feed.post',
        rkey: 'post321',
        record: {
          $type: 'app.bsky.feed.post',
          text: 'Delhi road completely flooded near Karol Bagh metro station. Drain overflow!',
          createdAt: new Date().toISOString()
        }
      }
    });

    const parsed = provider.simulateRawJetstreamEventForTesting(realJetstreamFixture);
    await vi.advanceTimersByTimeAsync(50);
    expect(parsed).not.toBeNull();
    expect(receivedNormalizedSignal).not.toBeNull();
    expect(receivedNormalizedSignal.category).toBe('waterlogging');
    expect(receivedNormalizedSignal.channel).toBe('social_bluesky');
    expect(receivedNormalizedSignal.locationName).toBe('Karol Bagh');
  });
});
