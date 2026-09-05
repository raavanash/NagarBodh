import { IngestionMode, RawSignalPayload, SignalProvider } from '../../../types/ingestion';

export class PublicSocialXProvider implements SignalProvider {
  public id = 'provider-social-x';
  public name = 'Public Social Stream (X / Twitter API)';
  public type = 'social_x' as const;
  public mode: IngestionMode;

  private bearerToken: string;

  constructor(bearerToken?: string) {
    this.bearerToken = bearerToken || (import.meta.env.VITE_X_BEARER_TOKEN as string) || '';
    this.mode = Boolean(this.bearerToken && this.bearerToken.trim().length > 10) ? 'LIVE' : 'REPLAY';
  }

  public async isAvailable(): Promise<boolean> {
    return true; // Available via Live API or Replay fallback
  }

  public async fetchOrIngest(payload?: RawSignalPayload | RawSignalPayload[]): Promise<RawSignalPayload[]> {
    // If incoming payload is passed directly, tag with channel
    if (payload) {
      const items = Array.isArray(payload) ? payload : [payload];
      return items.map(i => ({ ...i, sourceChannel: 'social_x' }));
    }

    // Live X API Mode using Bearer Token
    if (this.mode === 'LIVE' && this.bearerToken) {
      try {
        let cleanToken = this.bearerToken.trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '');
        if (cleanToken.includes('%')) {
          try {
            cleanToken = decodeURIComponent(cleanToken);
          } catch {
            // Keep original if decode fails
          }
        }
        const query = encodeURIComponent('(waterlogging OR "drain overflow" OR "paani bhar gaya") (Delhi OR Noida OR Gurgaon)');
        const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&tweet.fields=created_at,author_id&max_results=10`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${cleanToken}`
          }
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            return json.data.map((tweet: any) => ({
              id: `x-live-${tweet.id}`,
              text: tweet.text,
              sourceChannel: 'social_x',
              authorHandle: `@user_${tweet.author_id}`,
              timestamp: tweet.created_at || new Date().toISOString(),
              lat: 28.5833 + (Math.random() - 0.5) * 0.02,
              lng: 77.3185 + (Math.random() - 0.5) * 0.02
            }));
          }
        }
      } catch (err) {
        console.warn('X API Live Stream fetch failed, falling back to cached simulation feed:', err);
      }
    }

    // Default simulation / replay fallback stream
    return [
      {
        id: 'x-mock-301',
        text: 'Sector 15 metro station underpass me paani bohot bhar gaya hai, cars unable to pass! @DelhiTrafficPol',
        sourceChannel: 'social_x',
        authorHandle: '@NCR_Commuter',
        timestamp: new Date().toISOString(),
        lat: 28.5833,
        lng: 77.3185
      },
      {
        id: 'x-mock-302',
        text: 'Huge waterlogging near Karol Bagh market road gate #2. @MCD_Delhi please send pumps ASAP.',
        sourceChannel: 'social_x',
        authorHandle: '@DelhiLiveUpdates',
        timestamp: new Date().toISOString(),
        lat: 28.6508,
        lng: 77.1895
      }
    ];
  }
}
