import { IngestionMode, RawSignalPayload, SignalProvider } from '../../../types/ingestion';

export const JETSTREAM_ENDPOINT = 'wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post';

export const CIVIC_STAGE_A_KEYWORDS = [
  // English civic terms
  'waterlogging', 'waterlogged', 'flooded', 'flooding', 'flood', 'pothole', 'potholes',
  'road', 'road damage', 'road hazard', 'traffic', 'traffic jam', 'traffic gridlock', 'sewage',
  'drain', 'drainage', 'drain overflow', 'gutter', 'power outage', 'electricity outage', 'transformer',
  'street light', 'streetlight', 'garbage', 'garbage dump', 'trash', 'trash pile', 'waste', 'fire', 'smoke',
  'fallen tree', 'accident', 'hospital', 'dispensary', 'clinic', 'ambulance', 'public safety', 'water supply',
  'pipeline', 'pipeline leak', 'metro', 'bus', 'aspatal',
  // Hindi Devanagari civic terms
  'जलभराव', 'सड़क', 'गड्ढा', 'ट्रैफिक', 'नाला', 'कचरा', 'बिजली', 'आग',
  'पानी', 'स्कूल', 'अस्पताल', 'इलाज', 'दवा', 'बत्ती', 'गटर', 'कूड़ा',
  // Hinglish civic terms
  'paani', 'pani', 'sadak', 'gaddha', 'gaddhe', 'kachra', 'naala', 'nala',
  'bijli', 'batti', 'bache', 'bachhe', 'gaadi', 'gadi'
];

export const CIVIC_STAGE_B_LOCATION_KEYWORDS = [
  'delhi', 'new delhi', 'ncr', 'noida', 'gurugram', 'gurgaon', 'ghaziabad',
  'faridabad', 'dwarka', 'rohini', 'karol bagh', 'mayur vihar', 'connaught place',
  'sector 15', 'rajiv chowk', 'india', 'भारत', 'दिल्ली'
];

export type JetstreamConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR';

export interface JetstreamHealthState {
  status: JetstreamConnectionStatus;
  isAvailable: boolean;
  lastEventTimestamp: string | null;
  lastAcceptedSignalAt: string | null;
  lastError: string | null;
  reconnectCount: number;
  bufferedCount: number;
  endpoint: string;
  telemetry: {
    websocketEventsReceived: number;
    createPostEvents: number;
    civicCandidates: number;
    civicAccepted: number;
    civicRejected: number;
    duplicatesRejected: number;
    normalizedAccepted: number;
  };
}

export class BlueskyJetstreamProvider implements SignalProvider {
  public id = 'provider-social-bluesky';
  public name = 'Public Social Stream (Bluesky Jetstream WebSocket)';
  public type = 'social_bluesky' as const;
  public mode: IngestionMode;

  public endpoint = JETSTREAM_ENDPOINT;

  private socket: any = null;
  private status: JetstreamConnectionStatus = 'DISCONNECTED';
  private lastEventTimestamp: string | null = null;
  public lastAcceptedSignalAt: string | null = null;
  private lastError: string | null = null;
  private reconnectCount = 0;
  private reconnectTimer: any = null;

  // Telemetry Counters
  public websocketEventsReceived = 0;
  public createPostEvents = 0;
  public civicCandidates = 0;
  public civicAccepted = 0;
  public civicRejected = 0;
  public duplicatesRejected = 0;
  public normalizedAccepted = 0;

  private buffer: RawSignalPayload[] = [];
  private maxBufferSize = 100;
  private maxReconnectAttempts = 10;
  private baseReconnectDelayMs = 1000;
  private maxReconnectDelayMs = 30000;

  public onSignalListener: ((payload: RawSignalPayload) => void) | null = null;

  constructor() {
    this.mode = 'LIVE';
  }

  public setOnSignalListener(listener: ((payload: RawSignalPayload) => void) | null): void {
    this.onSignalListener = listener;
  }

  public start(): void {
    console.log('[Bluesky Jetstream] Runtime start requested');
    this.mode = 'LIVE';
    this.connect();
  }

  public stop(): void {
    this.mode = 'SIMULATION';
    this.disconnect();
  }

  public setMode(mode: IngestionMode): void {
    if (mode === 'LIVE') {
      this.start();
    } else {
      console.log('[Bluesky Jetstream] Not started because ingestion mode = SIMULATION');
      this.stop();
    }
  }

  public async isAvailable(): Promise<boolean> {
    return this.mode === 'SIMULATION' || this.status === 'CONNECTED';
  }

  public getHealthStatus(): JetstreamHealthState {
    return {
      status: this.status,
      isAvailable: this.mode === 'SIMULATION' || this.status === 'CONNECTED',
      lastEventTimestamp: this.lastEventTimestamp,
      lastAcceptedSignalAt: this.lastAcceptedSignalAt,
      lastError: this.lastError,
      reconnectCount: this.reconnectCount,
      bufferedCount: this.buffer.length,
      endpoint: this.endpoint,
      telemetry: {
        websocketEventsReceived: this.websocketEventsReceived,
        createPostEvents: this.createPostEvents,
        civicCandidates: this.civicCandidates,
        civicAccepted: this.civicAccepted,
        civicRejected: this.civicRejected,
        duplicatesRejected: this.duplicatesRejected,
        normalizedAccepted: this.normalizedAccepted
      }
    };
  }

  /**
   * Deterministic local civic relevance filter
   */
  public isCivicRelevant(text: string): boolean {
    if (!text) return false;
    const lower = text.toLowerCase();
    return CIVIC_STAGE_A_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
  }

  /**
   * Parse incoming Jetstream message event into RawSignalPayload if relevant
   */
  public parseJetstreamEvent(rawMessage: string | ArrayBuffer): RawSignalPayload | null {
    try {
      const textData = typeof rawMessage === 'string'
        ? rawMessage
        : new TextDecoder().decode(rawMessage);

      const parsed = JSON.parse(textData);

      // Validate Jetstream commit structure
      if (
        parsed &&
        parsed.kind === 'commit' &&
        parsed.commit &&
        parsed.commit.operation === 'create' &&
        parsed.commit.collection === 'app.bsky.feed.post' &&
        parsed.commit.record &&
        typeof parsed.commit.record.text === 'string'
      ) {
        const postText = parsed.commit.record.text;

        // Apply Stage A deterministic civic relevance filter
        if (!this.isCivicRelevant(postText)) {
          return null;
        }

        const did = parsed.did || 'did:plc:unknown';
        const rkey = parsed.commit.rkey || Date.now().toString();
        const handle = did.replace('did:plc:', '');
        const uri = `at://${did}/app.bsky.feed.post/${rkey}`;
        const postUrl = `https://bsky.app/profile/${handle}/post/${rkey}`;

        this.lastEventTimestamp = new Date().toISOString();

        return {
          id: uri,
          text: postText,
          sourceChannel: 'social_bluesky',
          author: `@${handle}`,
          authorHandle: `@${handle}`,
          url: postUrl,
          timestamp: parsed.commit.record.createdAt || this.lastEventTimestamp,
          rawUri: uri
        };
      }
    } catch {
      // Safe fallback for malformed events
    }
    return null;
  }

  /**
   * TEST ONLY: Simulates receiving a raw Jetstream JSON event string through the full parser & listener pipeline.
   */
  public simulateRawJetstreamEventForTesting(rawMessage: string): RawSignalPayload | null {
    const payload = this.parseJetstreamEvent(rawMessage);
    if (payload) {
      this.civicCandidates++;
      this.civicAccepted++;
      this.lastAcceptedSignalAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      console.log(`[Bluesky Jetstream] Civic candidate accepted: "${(payload.text || '').slice(0, 60)}..."`);
      this.addToBuffer(payload);
      if (this.onSignalListener) {
        console.log('[Bluesky Jetstream] Forwarding RawSignalPayload');
        this.onSignalListener(payload);
      }
    } else {
      this.civicRejected++;
      console.log('[Bluesky Jetstream] Civic candidate rejected');
    }
    return payload;
  }

  /**
   * Open WebSocket connection to Bluesky Jetstream firehose
   */
  public connect(): void {
    if (this.mode !== 'LIVE') {
      console.log('[Bluesky Jetstream] Not started because ingestion mode = SIMULATION');
      return;
    }

    if (this.socket && (this.status === 'CONNECTED' || this.status === 'CONNECTING')) {
      console.log('[Bluesky Jetstream] Active socket connection already running.');
      return;
    }

    this.status = 'CONNECTING';
    console.log('[Bluesky Jetstream] Connecting...');

    const WSClass = (typeof globalThis !== 'undefined' && globalThis.WebSocket)
      ? globalThis.WebSocket
      : null;

    if (!WSClass) {
      this.status = 'ERROR';
      this.lastError = 'WebSocket environment unavailable';
      console.warn('[Bluesky Jetstream] WebSocket constructor not found in environment');
      return;
    }

    try {
      this.socket = new WSClass(this.endpoint);

      this.socket.onopen = () => {
        this.status = 'CONNECTED';
        this.reconnectCount = 0;
        this.lastError = null;
        console.log('[Bluesky Jetstream] Connected');
      };

      this.socket.onmessage = (event: any) => {
        this.websocketEventsReceived++;

        let isPostCommit = false;
        try {
          const textData = typeof event.data === 'string'
            ? event.data
            : new TextDecoder().decode(event.data);
          const parsed = JSON.parse(textData);
          if (
            parsed &&
            parsed.kind === 'commit' &&
            parsed.commit &&
            parsed.commit.operation === 'create' &&
            parsed.commit.collection === 'app.bsky.feed.post'
          ) {
            isPostCommit = true;
            this.createPostEvents++;
            console.log('[Bluesky Jetstream] CREATE app.bsky.feed.post');
          }
        } catch {}

        const payload = this.parseJetstreamEvent(event.data);
        if (payload) {
          this.civicCandidates++;
          this.civicAccepted++;
          this.lastAcceptedSignalAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          console.log(`[Bluesky Jetstream] Civic candidate accepted: "${(payload.text || '').slice(0, 60)}..."`);
          this.addToBuffer(payload);
          if (this.onSignalListener) {
            console.log('[Bluesky Jetstream] Forwarding RawSignalPayload');
            this.onSignalListener(payload);
          }
        } else if (isPostCommit) {
          this.civicRejected++;
          console.log('[Bluesky Jetstream] Civic candidate rejected');
        }
      };

      this.socket.onerror = (err: any) => {
        this.status = 'ERROR';
        this.lastError = err?.message || 'WebSocket error';
        console.warn('[Bluesky Jetstream] WebSocket error:', this.lastError);
      };

      this.socket.onclose = () => {
        if (this.status !== 'DISCONNECTED') {
          this.status = 'DISCONNECTED';
          console.log('[Bluesky Jetstream] Disconnected');
          this.scheduleReconnect();
        }
      };
    } catch (err: any) {
      this.status = 'ERROR';
      this.lastError = err.message || 'Failed to initialize WebSocket';
      console.warn('[Bluesky Jetstream] Connection exception:', this.lastError);
      this.scheduleReconnect();
    }
  }

  /**
   * Graceful disconnect
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      try {
        this.socket.close();
      } catch {}
      this.socket = null;
    }
    this.status = 'DISCONNECTED';
    console.log('[Bluesky Jetstream] Disconnected');
  }

  /**
   * Exponential backoff reconnect
   */
  private scheduleReconnect(): void {
    if (this.mode !== 'LIVE' || this.reconnectTimer) return;
    if (this.reconnectCount >= this.maxReconnectAttempts) {
      console.warn(`[Bluesky Jetstream] Reached max reconnect attempts (${this.maxReconnectAttempts}). Pausing auto-reconnect.`);
      return;
    }

    this.reconnectCount++;
    const delay = Math.min(
      this.maxReconnectDelayMs,
      this.baseReconnectDelayMs * Math.pow(2, this.reconnectCount - 1)
    );

    console.log(`[Bluesky Jetstream] Reconnecting in ${(delay / 1000).toFixed(1)}s (attempt ${this.reconnectCount}/${this.maxReconnectAttempts})...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  /**
   * Bounded ring buffer insertion (prevents memory leaks)
   */
  private addToBuffer(payload: RawSignalPayload): void {
    if (this.buffer.length >= this.maxBufferSize) {
      this.buffer.shift(); // Drop oldest payload
    }
    this.buffer.push(payload);
  }

  public async fetchOrIngest(
    payload?: RawSignalPayload | RawSignalPayload[],
    queryOverride?: string
  ): Promise<RawSignalPayload[]> {
    if (payload) {
      const items = Array.isArray(payload) ? payload : [payload];
      return items.map(i => ({ ...i, sourceChannel: 'social_bluesky' }));
    }

    if (this.mode === 'LIVE') {
      // Return and flush all buffered civic signals
      const flushed = [...this.buffer];
      this.buffer = [];
      return flushed;
    }

    // SIMULATION mode fallback
    return [
      {
        id: 'at://did:plc:sim1/app.bsky.feed.post/3k123456789',
        text: 'Heavy waterlogging near Karol Bagh metro gate #3. Traffic moving very slowly. #DelhiRains',
        sourceChannel: 'social_bluesky',
        author: 'Delhi Commuter',
        authorHandle: '@delhicommuter.bsky.social',
        url: 'https://bsky.app/profile/delhicommuter.bsky.social/post/3k123456789',
        timestamp: new Date().toISOString(),
        locationName: 'Karol Bagh Metro Station'
      },
      {
        id: 'at://did:plc:sim2/app.bsky.feed.post/3k987654321',
        text: 'Drain overflow and garbage pile-up near Mayur Vihar Phase 1 market road. Water entering shops!',
        sourceChannel: 'social_bluesky',
        author: 'Mayur Vihar Resident',
        authorHandle: '@mv_resident.bsky.social',
        url: 'https://bsky.app/profile/mv_resident.bsky.social/post/3k987654321',
        timestamp: new Date().toISOString(),
        locationName: 'Mayur Vihar Phase 1 Market'
      }
    ];
  }
}
