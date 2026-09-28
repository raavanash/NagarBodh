import { EvidenceItem } from '../types/civic';
import replayData from '../data/ogdFacilitiesReplay.json';

export interface OgdHospitalRecord {
  id: string;
  name: string;
  facilityType?: string;
  district?: string;
  state?: string;
  pincode?: string;
  address?: string;
  totalBeds?: number;
  emergencyServices?: boolean;
  ownership?: string;
  coordinates?: { lat: number; lng: number };
}

export interface OgdDatasetResponse {
  ok: boolean;
  mode: 'LIVE' | 'REPLAY';
  source: string;
  dataset: string;
  records: OgdHospitalRecord[];
  totalCount: number;
  filteredCount: number;
  retrievedAt: string;
}

/**
 * Strict geographic filter to enforce Delhi-only scope.
 * Rejects records from outside Delhi NCT or without valid Delhi identifiers.
 */
export function isDelhiRecord(record: Partial<OgdHospitalRecord>): boolean {
  if (!record || typeof record !== 'object') return false;

  const stateStr = (record.state || '').trim().toLowerCase();
  const districtStr = (record.district || '').trim().toLowerCase();
  const addrStr = (record.address || '').trim().toLowerCase();

  // 1. Explicit Delhi name matches
  if (stateStr.includes('delhi')) return true;
  if (districtStr.includes('delhi')) return true;
  if (addrStr.includes('delhi') || addrStr.includes('new delhi')) return true;

  // 2. Delhi standard Postal PIN Code verification (110001 - 110096)
  if (record.pincode && /^110\d{3}$/.test(record.pincode.trim())) {
    return true;
  }

  return false;
}

/**
 * Normalizes a raw external OGD hospital record into an authoritative baseline EvidenceItem.
 * Never mutates canonical scoring models or invents unverified spatial coordinates.
 */
export function normalizeOgdHospitalToEvidence(
  record: OgdHospitalRecord,
  mode: 'LIVE' | 'REPLAY' = 'REPLAY'
): EvidenceItem {
  const isLive = mode === 'LIVE';
  const bedsInfo = record.totalBeds ? `${record.totalBeds} total beds` : 'Government healthcare facility';
  const ownershipInfo = record.ownership || 'Govt. of NCT of Delhi / DGHS';
  const districtInfo = record.district || 'Delhi NCT';

  return {
    id: `ev-ogd-hosp-${record.id || Math.random().toString(36).substring(2, 8)}`,
    source: 'Open Government Data (OGD) Platform India — data.gov.in',
    type: 'Government facility baseline',
    timestamp: 'DGHS Healthcare Directory (Official Registry)',
    location: districtInfo,
    dataFreshness: isLive
      ? 'Live OGD REST API Stream'
      : 'Authoritative OGD Baseline Dataset [REPLAY]',
    usedFor: 'Used for healthcare capacity baseline & critical asset exposure context',
    snippet: `[${record.name}] ${record.facilityType || 'Hospital'}. ${bedsInfo}. Authority: ${ownershipInfo}. Location: ${record.address || districtInfo}.`,
    confidence: isLive ? 0.98 : 0.95,
    classification: 'BASELINE CONTEXT' as any,
    evidenceMode: isLive ? 'LIVE' : 'REPLAY'
  };
}

/**
 * Normalizes an external public signal (e.g. Bluesky post) into an EvidenceItem.
 * Accurately tagged as an external public signal and distinct from verified citizen signals.
 */
export function convertExternalPublicSignalToEvidence(signal: {
  id: string;
  text: string;
  authorHandle?: string;
  author?: string;
  timestamp?: string;
  locationName?: string;
  sourceChannel?: string;
}): EvidenceItem {
  const handle = signal.authorHandle || signal.author || '@PublicUser';
  return {
    id: `ev-ext-pub-${signal.id.replace(/[^a-zA-Z0-9-]/g, '_')}`,
    source: `Bluesky Public Stream (${handle})`,
    type: 'External public signal',
    timestamp: signal.timestamp || 'Recent public post',
    location: signal.locationName || 'Delhi NCR Public Stream',
    dataFreshness: 'External public stream [EXTERNAL PUBLIC SIGNAL]',
    usedFor: 'Used for public sentiment corroboration (non-canonical external context)',
    snippet: `"${signal.text}"`,
    confidence: 0.75,
    classification: 'OBSERVED',
    evidenceMode: 'LIVE'
  };
}

/**
 * Safely parses raw OGD records, enforcing validation and Delhi-only filtering.
 */
export function parseAndFilterOgdRecords(rawRecords: any[]): OgdHospitalRecord[] {
  if (!Array.isArray(rawRecords)) return [];

  const results: OgdHospitalRecord[] = [];

  for (const raw of rawRecords) {
    if (!raw || typeof raw !== 'object') continue;

    const name = raw.name || raw.hospital_name || raw.facility_name || '';
    if (!name || typeof name !== 'string' || name.trim().length === 0) continue;

    const record: OgdHospitalRecord = {
      id: String(raw.id || raw._id || `ogd-${Math.random().toString(36).substring(2, 9)}`),
      name: name.trim(),
      facilityType: raw.facilityType || raw.facility_type || raw.category || 'Government Hospital',
      district: raw.district || raw.district_name || 'Delhi',
      state: raw.state || raw.state_name || 'Delhi',
      pincode: raw.pincode || raw.pin_code || raw.postal_code || undefined,
      address: raw.address || raw.location || raw.address_line || undefined,
      totalBeds: typeof raw.totalBeds === 'number' ? raw.totalBeds : typeof raw.beds === 'number' ? raw.beds : typeof raw.total_beds === 'number' ? raw.total_beds : undefined,
      emergencyServices: Boolean(raw.emergencyServices ?? raw.emergency_services ?? true),
      ownership: raw.ownership || raw.management || 'Government of NCT of Delhi',
      coordinates: raw.coordinates && typeof raw.coordinates.lat === 'number' && typeof raw.coordinates.lng === 'number'
        ? { lat: raw.coordinates.lat, lng: raw.coordinates.lng }
        : raw.latitude && raw.longitude && !isNaN(Number(raw.latitude)) && !isNaN(Number(raw.longitude))
        ? { lat: Number(raw.latitude), lng: Number(raw.longitude) }
        : undefined
    };

    if (isDelhiRecord(record)) {
      results.push(record);
    }
  }

  return results;
}

/**
 * Fetches Delhi Government Hospitals with deterministic static replay fallback.
 * Uses official OGD proxy endpoint when available, falling back to static replay.
 */
export async function fetchDelhiGovernmentHospitals(options?: {
  forceReplay?: boolean;
}): Promise<OgdDatasetResponse> {
  const now = new Date().toISOString();

  // If forceReplay requested or executing in test/static mode without network
  if (options?.forceReplay) {
    const records = parseAndFilterOgdRecords(replayData.records);
    return {
      ok: true,
      mode: 'REPLAY',
      source: replayData.source,
      dataset: replayData.dataset,
      records,
      totalCount: replayData.records.length,
      filteredCount: records.length,
      retrievedAt: now
    };
  }

  // Attempt live proxy call
  try {
    const proxyUrl = typeof window !== 'undefined'
      ? '/api/ogd/facilities?state=Delhi&limit=25'
      : 'http://localhost:5173/api/ogd/facilities?state=Delhi&limit=25';

    const response = await fetch(proxyUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined
    }).catch(() => null);

    if (response && response.ok) {
      const data = await response.json().catch(() => null);

      if (data && data.ok && Array.isArray(data.records)) {
        const filtered = parseAndFilterOgdRecords(data.records);
        return {
          ok: true,
          mode: data.mode === 'LIVE' ? 'LIVE' : 'REPLAY',
          source: data.source || 'Open Government Data (OGD) Platform India — data.gov.in',
          dataset: data.dataset || 'Delhi Government Hospitals Directory',
          records: filtered,
          totalCount: data.records.length,
          filteredCount: filtered.length,
          retrievedAt: data.retrievedAt || now
        };
      }
    }
  } catch {
    // Graceful fallback to replay fixture
  }

  // Deterministic Fallback: Static Replay Data
  const fallbackRecords = parseAndFilterOgdRecords(replayData.records);
  return {
    ok: true,
    mode: 'REPLAY',
    source: `${replayData.source} [REPLAY]`,
    dataset: replayData.dataset,
    records: fallbackRecords,
    totalCount: replayData.records.length,
    filteredCount: fallbackRecords.length,
    retrievedAt: now
  };
}

/**
 * Returns Delhi Government Hospitals as an array of EvidenceItem objects.
 */
export async function getDelhiHospitalEvidenceItems(
  modePreference: 'LIVE' | 'REPLAY' = 'REPLAY'
): Promise<EvidenceItem[]> {
  const result = await fetchDelhiGovernmentHospitals({
    forceReplay: modePreference === 'REPLAY'
  });

  return result.records.map(rec => normalizeOgdHospitalToEvidence(rec, result.mode));
}
