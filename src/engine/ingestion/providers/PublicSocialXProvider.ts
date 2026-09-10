import { IngestionMode, RawSignalPayload, SignalProvider } from '../../../types/ingestion';

export class PublicSocialXProvider implements SignalProvider {
  public id = 'provider-social-x';
  public name = 'Public Social Stream (X / Twitter API)';
  public type = 'social_x' as const;
  public mode: IngestionMode;

  constructor() {
    this.mode = 'REPLAY';
  }

  public setMode(mode: IngestionMode): void {
    this.mode = mode;
  }

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async fetchOrIngest(payload?: RawSignalPayload | RawSignalPayload[]): Promise<RawSignalPayload[]> {
    if (payload) {
      const items = Array.isArray(payload) ? payload : [payload];
      return items.map(i => ({ ...i, sourceChannel: 'social_x' }));
    }

    if (this.mode === 'LIVE') {
      try {
        const endpoint = typeof window !== 'undefined' ? '/api/social' : 'http://localhost:5173/api/social';
        const apiRes = await fetch(endpoint).catch(() => null);

        if (apiRes && apiRes.ok) {
          const body = await apiRes.json().catch(() => null);
          if (body && body.ok && Array.isArray(body.data)) {
            if (body.data.length === 0) {
              return [];
            }
            return body.data.map((tweet: any) => ({
              id: `x-live-${tweet.id}`,
              text: tweet.text,
              sourceChannel: 'social_x',
              authorHandle: `@user_${tweet.author_id || 'x_user'}`,
              timestamp: tweet.created_at || new Date().toISOString(),
              lat: 28.5833 + (Math.random() - 0.5) * 0.02,
              lng: 77.3185 + (Math.random() - 0.5) * 0.02,
              ward: 'Ward 15 - Central Sub-city',
              locationName: 'Sector 15 / NCR Corridor'
            }));
          }
        }

        console.warn('[PublicSocialXProvider] Live X API endpoint returned fallback or unconfigured state.');
        return [];
      } catch (err) {
        console.warn('[PublicSocialXProvider] Exception during live fetch:', err);
        return [];
      }
    }

    // SIMULATION / REPLAY mode: Deterministic calibrated social stream
    return [
      {
        id: 'x-sim-301',
        text: 'Sector 15 metro station underpass me paani bohot bhar gaya hai, cars unable to pass! @DelhiTrafficPol',
        sourceChannel: 'social_x',
        authorHandle: '@NCR_Commuter',
        timestamp: new Date().toISOString(),
        lat: 28.5833,
        lng: 77.3185,
        ward: 'Ward 15 - Central Sub-city',
        locationName: 'Sector 15 Underpass'
      },
      {
        id: 'x-sim-302',
        text: 'Huge waterlogging near Karol Bagh market road gate #2. @MCD_Delhi please send pumps ASAP.',
        sourceChannel: 'social_x',
        authorHandle: '@DelhiLiveUpdates',
        timestamp: new Date().toISOString(),
        lat: 28.6508,
        lng: 77.1895,
        ward: 'Ward 14 - Karol Bagh',
        locationName: 'Karol Bagh Market Gate #2'
      }
    ];
  }
}
