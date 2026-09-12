import { DevelopmentRequest } from '../../types/development';
import { IngestedCivicSignal } from '../../types/ingestion';
import { calculateHaversineDistance } from '../contextAgent';

type DeduplicatableItem = IngestedCivicSignal | DevelopmentRequest;

export class DuplicateDetector {
  private seenHashes = new Set<string>();
  private existingItems: DeduplicatableItem[] = [];

  constructor(initialItems: DeduplicatableItem[] = []) {
    initialItems.forEach(item => this.register(item));
  }

  /**
   * Register a processed signal or development request into the deduplication cache
   */
  public register(item: DeduplicatableItem): void {
    if ('sourceMetadata' in item && item.sourceMetadata?.fingerprintHash) {
      this.seenHashes.add(item.sourceMetadata.fingerprintHash);
    } else if (item.id) {
      this.seenHashes.add(item.id);
    }
    this.existingItems.push(item);
  }

  /**
   * Check if an incoming signal or request is a duplicate
   */
  public isDuplicate(candidate: DeduplicatableItem): { isDuplicate: boolean; matchedId?: string; reason?: string } {
    // 1. Strict Fingerprint Hash or ID Collision Check
    if ('sourceMetadata' in candidate && candidate.sourceMetadata?.fingerprintHash && this.seenHashes.has(candidate.sourceMetadata.fingerprintHash)) {
      return {
        isDuplicate: true,
        reason: `Exact fingerprint hash collision (${candidate.sourceMetadata.fingerprintHash})`
      };
    }

    const candidateTime = new Date(candidate.timestamp).getTime();
    const candidateCleanText = candidate.rawText.toLowerCase().trim();
    const candidateCategory = candidate.category;

    for (const existing of this.existingItems) {
      // Ignore self-comparison if same object
      if (existing === candidate) continue;

      const existingCleanText = existing.rawText.toLowerCase().trim();
      const isExactTextMatch = candidateCleanText === existingCleanText;

      // 2. Exact repost text match check
      if (isExactTextMatch) {
        return {
          isDuplicate: true,
          matchedId: existing.id,
          reason: `Exact repost content match: "${candidateCleanText.slice(0, 45)}..."`
        };
      }

      // 3. Spatial-Temporal & Category Proximity Check
      let candidateLat: number | undefined;
      let candidateLng: number | undefined;
      let existingLat: number | undefined;
      let existingLng: number | undefined;

      if ('coordinates' in candidate) {
        candidateLat = candidate.coordinates.lat;
        candidateLng = candidate.coordinates.lng;
      } else if ('location' in candidate) {
        candidateLat = candidate.location.latitude ?? undefined;
        candidateLng = candidate.location.longitude ?? undefined;
      }

      if ('coordinates' in existing) {
        existingLat = existing.coordinates.lat;
        existingLng = existing.coordinates.lng;
      } else if ('location' in existing) {
        existingLat = existing.location.latitude ?? undefined;
        existingLng = existing.location.longitude ?? undefined;
      }

      if (candidateCategory === existing.category && candidateLat != null && candidateLng != null && existingLat != null && existingLng != null) {
        const distMeters = calculateHaversineDistance({ lat: candidateLat, lng: candidateLng }, { lat: existingLat, lng: existingLng });
        const existingTime = new Date(existing.timestamp).getTime();
        const timeDiffMins = Math.abs(candidateTime - existingTime) / (1000 * 60);

        if (distMeters <= 100 && timeDiffMins <= 15) {
          return {
            isDuplicate: true,
            matchedId: existing.id,
            reason: `Spatial-temporal duplicate within ${Math.round(distMeters)}m and ${Math.round(timeDiffMins)}m.`
          };
        }
      }
    }

    return { isDuplicate: false };
  }

  /**
   * Reset deduplication cache
   */
  public clear(): void {
    this.seenHashes.clear();
    this.existingItems = [];
  }
}

