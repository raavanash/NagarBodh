import { IngestionMode, RawSignalPayload, SignalProvider } from '../../../types/ingestion';

export class FileImportProvider implements SignalProvider {
  public id = 'provider-file-import';
  public name = 'Offline File Dataset Import (CSV/JSON)';
  public type = 'file_import' as const;
  public mode: IngestionMode = 'REPLAY';

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  /**
   * Parse CSV string into RawSignalPayload array
   */
  public static parseCSV(csvText: string): RawSignalPayload[] {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    const results: RawSignalPayload[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      if (values.length < headers.length) continue;

      const obj: RawSignalPayload = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx];
      });

      // Map standard column names
      obj.text = obj.text || obj.rawtext || obj.body || obj.message || obj.description;
      obj.lat = obj.lat || obj.latitude;
      obj.lng = obj.lng || obj.longitude || obj.long;
      obj.sourceChannel = obj.channel || obj.sourcechannel || 'file_import';

      if (obj.text) {
        results.push(obj);
      }
    }

    return results;
  }

  /**
   * Parse JSON string or payload array
   */
  public static parseJSON(jsonText: string): RawSignalPayload[] {
    try {
      const parsed = JSON.parse(jsonText);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      return items.map(item => ({
        ...item,
        text: item.text || item.rawText || item.body || item.message,
        sourceChannel: item.channel || item.sourceChannel || 'file_import'
      }));
    } catch {
      return [];
    }
  }

  public async fetchOrIngest(payload?: string | RawSignalPayload | RawSignalPayload[]): Promise<RawSignalPayload[]> {
    if (typeof payload === 'string') {
      const trimmed = payload.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        return FileImportProvider.parseJSON(trimmed);
      }
      return FileImportProvider.parseCSV(trimmed);
    }

    if (payload) {
      const items = Array.isArray(payload) ? payload : [payload];
      return items;
    }

    return [];
  }
}
