import { IngestionMode, RawSignalPayload, SignalProvider } from '../../../types/ingestion';

export const CIVIC_SEARCH_QUERIES = [
  'waterlogging Delhi',
  'flooded road Delhi',
  'garbage Delhi',
  'pothole Delhi',
  'traffic Delhi',
  'traffic jam Delhi',
  'sewage Delhi',
  'drainage Delhi',
  'power outage Delhi',
  'street light Delhi',
  'road damage Delhi',
  'fire Delhi',
  'pollution Delhi',
  'waterlogging Noida',
  'waterlogging Gurgaon',
  'flooded road Ghaziabad'
];

export interface BlueskyHealthState {
  isAvailable: boolean;
  lastStatus: number;
  lastError: string | null;
  lastCheckedAt: string | null;
  endpoint: string;
}

export class BlueskySocialProvider implements SignalProvider {
  public id = 'provider-social-bluesky';
  public name = 'Public Social Stream (Bluesky AppView API)';
  public type = 'social_bluesky' as const;
  public mode: IngestionMode;

  public endpoint = 'https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts';

  private currentQueryIndex = 0;
  private isAvailableState = true;
  private lastStatus = 200;
  private lastError: string | null = null;
  private lastCheckedAt: string | null = null;

  constructor() {
    this.mode = 'LIVE';
  }

  public setMode(mode: IngestionMode): void {
    this.mode = mode;
  }

  /**
   * Meaningful provider availability tracking based on recent fetch health state.
   */
  public async isAvailable(): Promise<boolean> {
    return this.mode === 'SIMULATION' || this.isAvailableState;
  }

  /**
   * Retrieves full structured health status metadata for diagnostics
   */
  public getHealthStatus(): BlueskyHealthState {
    return {
      isAvailable: this.isAvailableState,
      lastStatus: this.lastStatus,
      lastError: this.lastError,
      lastCheckedAt: this.lastCheckedAt,
      endpoint: this.endpoint
    };
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
      try {
        const query = queryOverride || CIVIC_SEARCH_QUERIES[this.currentQueryIndex];
        // Rotate query index for next cycle
        this.currentQueryIndex = (this.currentQueryIndex + 1) % CIVIC_SEARCH_QUERIES.length;

        let rawPosts: any[] = [];
        let fetchedOk = false;
        let httpStatus = 200;
        let errorMessage: string | null = null;

        const proxyEndpoint = typeof window !== 'undefined'
          ? `/api/social/bluesky?query=${encodeURIComponent(query)}&limit=25&sort=latest`
          : `http://localhost:5173/api/social/bluesky?query=${encodeURIComponent(query)}&limit=25&sort=latest`;

        console.log(`[Bluesky] Querying proxy for: "${query}"`);
        const apiRes = await fetch(proxyEndpoint).catch(err => {
          errorMessage = `Network fetch error: ${err.message}`;
          return null;
        });

        if (apiRes && apiRes.ok) {
          const body = await apiRes.json().catch(() => null);

          if (body && body.ok && Array.isArray(body.data)) {
            rawPosts = body.data;
            fetchedOk = true;
            httpStatus = 200;
          } else if (body) {
            httpStatus = body.status || 500;
            errorMessage = body.message || body.error || 'Upstream Bluesky request failed';
          }
        } else if (apiRes) {
          httpStatus = apiRes.status;
          errorMessage = `HTTP ${apiRes.status} ${apiRes.statusText}`;
        }

        // Direct Browser Fallback using public.api.bsky.app endpoint (never exposing secrets)
        if (!fetchedOk && typeof window !== 'undefined') {
          console.log(`[Bluesky] Proxy unavailable. Attempting direct browser fetch to ${this.endpoint}`);
          const directUrl = `${this.endpoint}?q=${encodeURIComponent(query)}&sort=latest&limit=25`;
          const directRes = await fetch(directUrl).catch(err => {
            errorMessage = `Direct fetch exception: ${err.message}`;
            return null;
          });

          if (directRes && directRes.ok) {
            const directBody = await directRes.json().catch(() => null);
            if (directBody && Array.isArray(directBody.posts)) {
              rawPosts = directBody.posts;
              fetchedOk = true;
              httpStatus = 200;
              errorMessage = null;
            }
          } else if (directRes) {
            httpStatus = directRes.status;
            errorMessage = `Direct AppView returned HTTP ${directRes.status}`;
          }
        }

        // Update internal provider health state honestly
        this.lastStatus = httpStatus;
        this.lastCheckedAt = new Date().toISOString();

        if (fetchedOk) {
          this.isAvailableState = true;
          this.lastError = null;
          console.log(`[Bluesky] Live posts received: ${rawPosts.length}`);

          return rawPosts.map((post: any) => {
            const handle = post.author?.handle || 'bluesky_user';
            const rkey = (post.uri || '').split('/').pop() || Date.now().toString();
            const postUrl = `https://bsky.app/profile/${handle}/post/${rkey}`;

            return {
              id: post.uri || `bsky-${rkey}`,
              text: post.record?.text || post.text || '',
              sourceChannel: 'social_bluesky',
              author: post.author?.displayName || `@${handle}`,
              authorHandle: `@${handle}`,
              url: postUrl,
              timestamp: post.record?.createdAt || post.indexedAt || new Date().toISOString(),
              rawUri: post.uri
            };
          });
        } else {
          this.isAvailableState = false;
          this.lastError = errorMessage || `HTTP ${httpStatus} from upstream`;
          console.warn(`[Bluesky] Provider unavailable: ${this.lastError} (${this.endpoint})`);
          // Honest response: Return empty array, NEVER fabricate live posts!
          return [];
        }
      } catch (err: any) {
        this.isAvailableState = false;
        this.lastStatus = 500;
        this.lastError = err.message || 'Unhandled exception in provider';
        this.lastCheckedAt = new Date().toISOString();
        console.warn('[BlueskySocialProvider] Ingestion exception:', this.lastError);
        return [];
      }
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
