import { IngestionMode, RawSignalPayload, SignalProvider } from '../../../types/ingestion';

export class PublicSocialXProvider implements SignalProvider {
  public id = 'provider-social-x';
  public name = 'Public Social Stream (X / Twitter API)';
  public type = 'social_x' as const;
  public mode: IngestionMode;

  private hasApiKey: boolean;

  constructor(apiKey?: string) {
    this.hasApiKey = Boolean(apiKey && apiKey.trim().length > 10);
    this.mode = this.hasApiKey ? 'LIVE' : 'REPLAY';
  }

  public async isAvailable(): Promise<boolean> {
    return true; // Always available via Mock/Replay fallback
  }

  public async fetchOrIngest(payload?: RawSignalPayload | RawSignalPayload[]): Promise<RawSignalPayload[]> {
    if (this.hasApiKey) {
      // Authorized API Mode (If backend proxy or key is provided)
      if (payload) {
        const items = Array.isArray(payload) ? payload : [payload];
        return items.map(i => ({ ...i, sourceChannel: 'social_x' }));
      }
      return [];
    }

    // Mock / Replay Fallback Mode (No secrets required)
    if (payload) {
      const items = Array.isArray(payload) ? payload : [payload];
      return items.map(i => ({ ...i, sourceChannel: 'social_x' }));
    }

    // Default mock social stream posts
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
