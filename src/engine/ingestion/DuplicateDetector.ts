import { IngestedCivicSignal } from '../../types/ingestion';
import { calculateHaversineDistance } from '../contextAgent';

export class DuplicateDetector {
  private seenHashes = new Set<string>();
  private existingSignals: IngestedCivicSignal[] = [];

  constructor(initialSignals: IngestedCivicSignal[] = []) {
    initialSignals.forEach(s => this.register(s));
  }

  /**
   * Register a processed signal into the deduplication cache
   */
  public register(signal: IngestedCivicSignal): void {
    if (signal.sourceMetadata?.fingerprintHash) {
      this.seenHashes.add(signal.sourceMetadata.fingerprintHash);
    }
    this.existingSignals.push(signal);
  }

  /**
   * Check if an incoming normalized signal is a duplicate
   */
  public isDuplicate(candidate: IngestedCivicSignal): { isDuplicate: boolean; matchedId?: string; reason?: string } {
    // 1. Strict Fingerprint Hash Check (O(1))
    if (candidate.sourceMetadata?.fingerprintHash && this.seenHashes.has(candidate.sourceMetadata.fingerprintHash)) {
      return {
        isDuplicate: true,
        reason: `Exact fingerprint hash collision (${candidate.sourceMetadata.fingerprintHash})`
      };
    }

    // 2. Spatial-Temporal & Content Proximity Check
    const candidateTime = new Date(candidate.timestamp).getTime();
    const candidateCleanText = candidate.rawText.toLowerCase().trim();

    for (const existing of this.existingSignals) {
      // Must be same category or identical text snippet
      const existingCleanText = existing.rawText.toLowerCase().trim();
      const isTextMatch = candidateCleanText === existingCleanText || candidateCleanText.includes(existingCleanText) || existingCleanText.includes(candidateCleanText);

      if (isTextMatch && candidate.category === existing.category) {
        // Distance check (< 100m)
        const distMeters = calculateHaversineDistance(candidate.coordinates, existing.coordinates);

        // Time window check (< 15 mins)
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
    this.existingSignals = [];
  }
}
