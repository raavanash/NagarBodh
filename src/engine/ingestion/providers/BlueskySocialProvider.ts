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

export class BlueskySocialProvider implements SignalProvider {
  public id = 'provider-social-bluesky';
  public name = 'Public Social Stream (Bluesky API)';
  public type = 'social_bluesky' as const;
  public mode: IngestionMode;

  private currentQueryIndex = 0;

  constructor() {
    this.mode = 'LIVE';
  }

  public setMode(mode: IngestionMode): void {
    this.mode = mode;
  }

  public async isAvailable(): Promise<boolean> {
    return true;
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

        const endpoint = typeof window !== 'undefined'
          ? `/api/social/bluesky?query=${encodeURIComponent(query)}&limit=25&sort=latest`
          : `http://localhost:5173/api/social/bluesky?query=${encodeURIComponent(query)}&limit=25&sort=latest`;

        console.log(`[Bluesky] Query: "${query}" (sort=latest, limit=25)`);
        const apiRes = await fetch(endpoint).catch(() => null);

        if (apiRes && apiRes.ok) {
          const body = await apiRes.json().catch(() => null);
          console.log(`[Bluesky] HTTP status: ${apiRes.status}`);

          if (body && body.ok && Array.isArray(body.data)) {
            rawPosts = body.data;
            fetchedOk = true;
          } else {
            console.warn(`[Bluesky] Proxy route returned non-OK or fallback:`, body?.error || 'Unknown error');
          }
        }

        // Direct Browser Fetch Fallback if proxy returned forbidden/error in local env
        if (!fetchedOk && typeof window !== 'undefined') {
          console.log(`[Bluesky] Attempting direct browser fetch to https://api.bsky.app for query: "${query}"`);
          const directUrl = `https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(query)}&sort=latest&limit=25`;
          const directRes = await fetch(directUrl).catch(() => null);

          if (directRes && directRes.ok) {
            const directBody = await directRes.json().catch(() => null);
            console.log(`[Bluesky] Direct browser fetch HTTP status: ${directRes.status}`);
            if (directBody && Array.isArray(directBody.posts)) {
              rawPosts = directBody.posts;
              fetchedOk = true;
            }
          }
        }

        console.log(`[Bluesky] Raw posts: ${rawPosts.length}`);

        if (fetchedOk && rawPosts.length > 0) {
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
        }
      } catch (err) {
        console.warn('[BlueskySocialProvider] Exception during live fetch:', err);
      }
      return [];
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
