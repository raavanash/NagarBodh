import { describe, expect, it } from 'vitest';
import { FileImportProvider } from '../providers/FileImportProvider';
import { SignalIngestionService } from '../SignalIngestionService';
import { SignalNormalizer } from '../SignalNormalizer';

describe('SignalIngestionService & Normalizer', () => {
  it('detects language correctly', () => {
    expect(SignalNormalizer.detectLanguage('पानी भर गया है अंडरपास में')).toBe('hi');
    expect(SignalNormalizer.detectLanguage('paani bhar gaya hai subway me fast dhar do')).toBe('hinglish');
    expect(SignalNormalizer.detectLanguage('Waterlogging at sector 15 subway')).toBe('en');
  });

  it('normalizes coordinates and filters non-civic noise', () => {
    const validCoords = SignalNormalizer.normalizeCoordinates(28.5833, 77.3185);
    expect(validCoords.lat).toBe(28.5833);
    expect(validCoords.lng).toBe(77.3185);

    const invalidCoords = SignalNormalizer.normalizeCoordinates(99.999, -150.0);
    expect(invalidCoords.lat).toBe(28.5835);

    expect(SignalNormalizer.isCivicRelevant('Huge waterlogging and flooded underpass near metro')).toBe(true);
    expect(SignalNormalizer.isCivicRelevant('Hello world good morning everyone crypto bitcoin')).toBe(false);
  });

  it('normalizes raw payloads into CivicSignal with provenance', () => {
    const normRes = SignalNormalizer.normalize(
      {
        text: 'Heavy traffic jam and blocked storm drain at Sector 15 underpass',
        author: '@CitizenTest',
        lat: 28.5833,
        lng: 77.3185
      },
      'provider-citizen-direct',
      'citizen_app'
    );
    expect(normRes.success).toBe(true);
    expect(normRes.signal?.detectedLanguage).toBe('en');
    expect(normRes.signal?.sourceMetadata.providerType).toBe('citizen_app');
  });

  it('parses CSV rows into payload array', () => {
    const sampleCSV = `text,lat,lng,channel\n"Pothole on main road",28.58,77.31,citizen_app\n"Garbage overflow near school",28.65,77.18,social_x`;
    const parsedCSV = FileImportProvider.parseCSV(sampleCSV);
    expect(parsedCSV.length).toBe(2);
    expect(parsedCSV[0].text).toBe('Pothole on main road');
  });

  it('tracks statistics and duplicate signals in SignalIngestionService', async () => {
    const service = new SignalIngestionService();

    await service.ingest('provider-citizen-direct', {
      id: 'sig-test-1',
      text: 'Waterlogging at Sector 15 underpass near school van',
      lat: 28.5833,
      lng: 77.3185
    });

    await service.ingest('provider-citizen-direct', {
      id: 'sig-test-duplicate',
      text: 'Waterlogging at Sector 15 underpass near school van',
      lat: 28.5833,
      lng: 77.3185
    });

    const stats = service.getStats();
    expect(stats.signalsReceived).toBeGreaterThanOrEqual(2);
    expect(stats.duplicates).toBeGreaterThanOrEqual(1);
  });
});
