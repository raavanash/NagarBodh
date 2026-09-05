import { CivicSignal } from '../types/civic';
import { calculateHaversineDistance } from './contextAgent';
import { calculateTextCosineSimilarity } from './semanticEngine';

export interface DeduplicationResult {
  canonicalSignals: CivicSignal[];
  duplicateMap: Map<string, string[]>; // canonicalId -> array of duplicate signalIds
  duplicateCount: number;
}

/**
 * Detects duplicate or near-identical signals based on spatial, temporal, and textual similarity.
 */
export function detectDuplicateSignals(
  signals: CivicSignal[],
  distanceThresholdMeters: number = 50,
  timeThresholdMinutes: number = 15,
  textSimThreshold: number = 0.82
): DeduplicationResult {
  const canonicalSignals: CivicSignal[] = [];
  const duplicateMap = new Map<string, string[]>();
  let duplicateCount = 0;

  for (const signal of signals) {
    let isDuplicate = false;

    for (const canonical of canonicalSignals) {
      // 1. Spatial check
      const dist = calculateHaversineDistance(signal.coordinates, canonical.coordinates);

      // 2. Temporal check
      const timeDiffMs = Math.abs(
        new Date(signal.timestamp).getTime() - new Date(canonical.timestamp).getTime()
      );
      const timeDiffMins = timeDiffMs / (1000 * 60);

      // 3. Textual check
      const textSim = calculateTextCosineSimilarity(
        signal.englishTranslation || signal.rawText,
        canonical.englishTranslation || canonical.rawText
      );

      // 4. Author check
      const sameAuthor =
        signal.authorHandle &&
        canonical.authorHandle &&
        signal.authorHandle.toLowerCase() === canonical.authorHandle.toLowerCase();

      // Decision rule: duplicate if same author within short time/distance OR text is almost identical in close proximity
      if (
        (dist <= distanceThresholdMeters && timeDiffMins <= timeThresholdMinutes && textSim >= textSimThreshold) ||
        (sameAuthor && dist <= distanceThresholdMeters && timeDiffMins <= timeThresholdMinutes)
      ) {
        isDuplicate = true;
        duplicateCount++;
        const existingDups = duplicateMap.get(canonical.id) || [];
        existingDups.push(signal.id);
        duplicateMap.set(canonical.id, existingDups);
        break;
      }
    }

    if (!isDuplicate) {
      canonicalSignals.push(signal);
      duplicateMap.set(signal.id, []);
    }
  }

  return {
    canonicalSignals,
    duplicateMap,
    duplicateCount
  };
}
