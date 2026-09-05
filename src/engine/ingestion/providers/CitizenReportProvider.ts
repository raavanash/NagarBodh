import { IngestionMode, RawSignalPayload, SignalProvider } from '../../../types/ingestion';

export class CitizenReportProvider implements SignalProvider {
  public id = 'provider-citizen-direct';
  public name = 'Direct Citizen Mobile & Portal App';
  public type = 'citizen_app' as const;
  public mode: IngestionMode = 'LIVE';

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async fetchOrIngest(payload?: RawSignalPayload | RawSignalPayload[]): Promise<RawSignalPayload[]> {
    if (!payload) return [];
    const items = Array.isArray(payload) ? payload : [payload];
    return items.map(item => ({
      ...item,
      sourceChannel: item.sourceChannel || 'citizen_app',
      timestamp: item.timestamp || new Date().toISOString()
    }));
  }
}
