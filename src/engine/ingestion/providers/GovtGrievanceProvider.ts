import { IngestionMode, RawSignalPayload, SignalProvider } from '../../../types/ingestion';

export class GovtGrievanceProvider implements SignalProvider {
  public id = 'provider-govt-grievance';
  public name = 'Government Open Data & 311 Grievance Portal';
  public type = 'govt_grievance' as const;
  public mode: IngestionMode = 'REPLAY';

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async fetchOrIngest(payload?: RawSignalPayload | RawSignalPayload[]): Promise<RawSignalPayload[]> {
    if (payload) {
      const items = Array.isArray(payload) ? payload : [payload];
      return items.map(i => ({
        ...i,
        sourceChannel: i.sourceChannel || 'grievance_portal'
      }));
    }

    // Default mock 311 portal tickets
    return [
      {
        id: '311-ticket-901',
        text: 'Drainage overflow and sewer blockage reported near Rohini Sector 8 primary health center.',
        sourceChannel: 'helpline_311',
        authorHandle: 'Ticket #MCD-311-8841',
        timestamp: new Date().toISOString(),
        lat: 28.7041,
        lng: 77.1025,
        ward: 'Ward 8 - Rohini'
      }
    ];
  }
}
