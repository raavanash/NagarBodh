import { describe, expect, it, vi } from 'vitest';
import {
  convertExternalPublicSignalToEvidence,
  fetchDelhiGovernmentHospitals,
  getDelhiHospitalEvidenceItems,
  isDelhiRecord,
  normalizeOgdHospitalToEvidence,
  OgdHospitalRecord,
  parseAndFilterOgdRecords
} from '../externalEvidenceAdapter';
import replayData from '../../data/ogdFacilitiesReplay.json';

describe('OGD Delhi Government Hospitals External Evidence Adapter', () => {
  describe('Delhi-Only Geographic Filtering', () => {
    it('accepts authentic Delhi records with valid state or district', () => {
      expect(isDelhiRecord({ state: 'Delhi', district: 'Central Delhi' })).toBe(true);
      expect(isDelhiRecord({ state: 'NCT of Delhi', district: 'East' })).toBe(true);
      expect(isDelhiRecord({ address: 'Jawaharlal Nehru Marg, New Delhi 110002' })).toBe(true);
    });

    it('accepts Delhi postal PIN codes (110001 - 110096)', () => {
      expect(isDelhiRecord({ pincode: '110001' })).toBe(true);
      expect(isDelhiRecord({ pincode: '110092' })).toBe(true);
    });

    it('strictly rejects records outside Delhi scope', () => {
      expect(isDelhiRecord({ state: 'Maharashtra', district: 'Mumbai' })).toBe(false);
      expect(isDelhiRecord({ state: 'Karnataka', district: 'Bengaluru Urban' })).toBe(false);
      expect(isDelhiRecord({ state: 'Uttar Pradesh', district: 'Lucknow', pincode: '226001' })).toBe(false);
      expect(isDelhiRecord({ state: 'Rajasthan', district: 'Jaipur', pincode: '302001' })).toBe(false);
    });

    it('safely handles empty, null, or malformed inputs without throwing', () => {
      expect(isDelhiRecord({} as any)).toBe(false);
      expect(isDelhiRecord(null as any)).toBe(false);
      expect(isDelhiRecord(undefined as any)).toBe(false);
    });
  });

  describe('Record Parsing and Validation', () => {
    it('parses valid OGD records correctly', () => {
      const rawRecords = [
        {
          id: 'test-hosp-1',
          name: 'Lok Nayak Hospital',
          facilityType: 'Government Hospital',
          district: 'Central Delhi',
          state: 'Delhi',
          totalBeds: 2000,
          pincode: '110002',
          ownership: 'Govt of Delhi'
        }
      ];

      const parsed = parseAndFilterOgdRecords(rawRecords);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('Lok Nayak Hospital');
      expect(parsed[0].totalBeds).toBe(2000);
      expect(parsed[0].district).toBe('Central Delhi');
    });

    it('filters out non-Delhi records from mixed raw arrays', () => {
      const mixedRecords = [
        { name: 'LNJP Hospital', state: 'Delhi', district: 'Central' },
        { name: 'KEM Hospital', state: 'Maharashtra', district: 'Mumbai' },
        { name: 'GTB Hospital', state: 'Delhi', district: 'Shahdara' },
        { name: 'SMS Hospital', state: 'Rajasthan', district: 'Jaipur' }
      ];

      const parsed = parseAndFilterOgdRecords(mixedRecords);
      expect(parsed).toHaveLength(2);
      expect(parsed.map(p => p.name)).toEqual(['LNJP Hospital', 'GTB Hospital']);
    });

    it('handles missing fields gracefully by substituting defaults', () => {
      const sparseRecord = [
        {
          name: 'Community Dispensary',
          state: 'Delhi'
        }
      ];

      const parsed = parseAndFilterOgdRecords(sparseRecord);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('Community Dispensary');
      expect(parsed[0].facilityType).toBe('Government Hospital');
      expect(parsed[0].district).toBe('Delhi');
      expect(parsed[0].totalBeds).toBeUndefined();
    });

    it('ignores empty records or records without hospital names', () => {
      const invalid = [
        null,
        {},
        { state: 'Delhi' },
        { name: '   ', state: 'Delhi' }
      ];

      const parsed = parseAndFilterOgdRecords(invalid);
      expect(parsed).toHaveLength(0);
    });
  });

  describe('EvidenceItem Normalization and Provenance Contract', () => {
    it('normalizes OGD hospital record to EvidenceItem with [BASELINE CONTEXT] classification', () => {
      const hosp: OgdHospitalRecord = {
        id: 'ogd-dl-01',
        name: 'Sanjivani District Hospital',
        district: 'East Delhi',
        facilityType: 'District Hospital',
        totalBeds: 250,
        ownership: 'Govt. of NCT of Delhi'
      };

      const evidence = normalizeOgdHospitalToEvidence(hosp, 'REPLAY');

      expect(evidence.classification).toBe('BASELINE CONTEXT');
      expect(evidence.evidenceMode).toBe('REPLAY');
      expect(evidence.source).toContain('data.gov.in');
      expect(evidence.type).toBe('Government facility baseline');
      expect(evidence.snippet).toContain('Sanjivani District Hospital');
      expect(evidence.snippet).toContain('250 total beds');
      expect(evidence.dataFreshness).toContain('[REPLAY]');
    });

    it('attaches LIVE evidenceMode when retrieved via live proxy stream', () => {
      const hosp: OgdHospitalRecord = {
        id: 'ogd-dl-live-01',
        name: 'Live GTB Hospital Feed',
        district: 'Shahdara',
        totalBeds: 1500
      };

      const evidence = normalizeOgdHospitalToEvidence(hosp, 'LIVE');

      expect(evidence.classification).toBe('BASELINE CONTEXT');
      expect(evidence.evidenceMode).toBe('LIVE');
      expect(evidence.dataFreshness).toContain('Live OGD REST API Stream');
    });

    it('normalizes Bluesky public signals to EvidenceItem with [EXTERNAL PUBLIC SIGNAL] context', () => {
      const bskyPost = {
        id: 'bsky-post-123',
        text: 'Severe waterlogging at Sector 15 underpass dip! Drainage completely clogged.',
        authorHandle: '@delhi_watchdog',
        timestamp: '10:15 AM',
        locationName: 'Sector 15 Underpass'
      };

      const evidence = convertExternalPublicSignalToEvidence(bskyPost);

      expect(evidence.classification).toBe('OBSERVED');
      expect(evidence.type).toBe('External public signal');
      expect(evidence.source).toBe('Bluesky Public Stream (@delhi_watchdog)');
      expect(evidence.dataFreshness).toContain('[EXTERNAL PUBLIC SIGNAL]');
      expect(evidence.snippet).toBe('"Severe waterlogging at Sector 15 underpass dip! Drainage completely clogged."');
      expect(evidence.confidence).toBe(0.75);
    });
  });

  describe('Deterministic Replay Fallback and API Error Handling', () => {
    it('returns checked-in replay fixture when forceReplay is requested', async () => {
      const res = await fetchDelhiGovernmentHospitals({ forceReplay: true });

      expect(res.ok).toBe(true);
      expect(res.mode).toBe('REPLAY');
      expect(res.records.length).toBeGreaterThan(0);
      expect(res.totalCount).toBe(replayData.records.length);
      expect(res.dataset).toContain('Hospitals');
      expect(res.records[0].name).toBe('Lok Nayak Jai Prakash Hospital (LNJP)');
    });

    it('falls back to deterministic replay when network fetch fails or times out', async () => {
      // Mock global fetch failure
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network timeout'));

      try {
        const res = await fetchDelhiGovernmentHospitals();
        expect(res.ok).toBe(true);
        expect(res.mode).toBe('REPLAY');
        expect(res.records.length).toBeGreaterThan(0);
        expect(res.source).toContain('[REPLAY]');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('getDelhiHospitalEvidenceItems returns an array of valid EvidenceItem objects with [BASELINE CONTEXT]', async () => {
      const items = await getDelhiHospitalEvidenceItems('REPLAY');

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
      for (const item of items) {
        expect(item.classification).toBe('BASELINE CONTEXT');
        expect(item.evidenceMode).toBe('REPLAY');
        expect(item.source).toContain('data.gov.in');
      }
    });
  });
});
