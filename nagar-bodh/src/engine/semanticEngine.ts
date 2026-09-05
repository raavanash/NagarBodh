import { CivicCategory, CivicSignal } from '../types/civic';

/**
 * Category compatibility and semantic affinity matrix.
 * Reflects domain knowledge (e.g. storm waterlogging causing drainage overflow and road hazards).
 */
const CATEGORY_AFFINITY_MATRIX: Record<CivicCategory, Partial<Record<CivicCategory, number>>> = {
  waterlogging: { waterlogging: 1.0, drainage: 0.85, road_hazard: 0.70, traffic: 0.45 },
  drainage: { drainage: 1.0, waterlogging: 0.85, road_hazard: 0.65, garbage: 0.50 },
  road_hazard: { road_hazard: 1.0, waterlogging: 0.70, drainage: 0.65, traffic: 0.60 },
  garbage: { garbage: 1.0, drainage: 0.50 },
  traffic: { traffic: 1.0, road_hazard: 0.60, waterlogging: 0.45 },
  electricity: { electricity: 1.0 }
};

/**
 * Stop words for lightweight token extraction
 */
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'is', 'are', 'was',
  'were', 'been', 'be', 'near', 'with', 'by', 'from', 'this', 'that', 'there', 'here',
  'me', 'hai', 'par', 'ko', 'se', 'ke', 'ka', 'ki', 'bhi', 'ho', 'gaya', 'raha'
]);

/**
 * Tokenizes text into normalized term frequencies
 */
export function extractTermTokens(text: string): Map<string, number> {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));

  const tf = new Map<string, number>();
  tokens.forEach(t => tf.set(t, (tf.get(t) || 0) + 1));
  return tf;
}

/**
 * Calculates Cosine Similarity between term frequency vectors of two texts
 */
export function calculateTextCosineSimilarity(textA: string, textB: string): number {
  const tfA = extractTermTokens(textA);
  const tfB = extractTermTokens(textB);

  if (tfA.size === 0 || tfB.size === 0) return 0;

  let dotProduct = 0;
  let magASq = 0;
  let magBSq = 0;

  tfA.forEach((val, word) => {
    magASq += val * val;
    if (tfB.has(word)) {
      dotProduct += val * tfB.get(word)!;
    }
  });

  tfB.forEach(val => {
    magBSq += val * val;
  });

  if (magASq === 0 || magBSq === 0) return 0;
  return dotProduct / (Math.sqrt(magASq) * Math.sqrt(magBSq));
}

/**
 * Computes semantic similarity between two civic signals combining text embeddings and category taxonomy.
 */
export function computeSemanticSimilarity(sigA: CivicSignal, sigB: CivicSignal): number {
  // Category score
  const catScore =
    CATEGORY_AFFINITY_MATRIX[sigA.category]?.[sigB.category] ??
    CATEGORY_AFFINITY_MATRIX[sigB.category]?.[sigA.category] ??
    0.0;

  // Text cosine similarity across raw text and english translations
  const textSimRaw = calculateTextCosineSimilarity(sigA.rawText, sigB.rawText);
  const textSimTrans = calculateTextCosineSimilarity(
    sigA.englishTranslation || sigA.rawText,
    sigB.englishTranslation || sigB.rawText
  );
  const textSim = Math.max(textSimRaw, textSimTrans);

  // Key entities overlap score
  let entityOverlap = 0;
  if (sigA.keyEntities.length > 0 && sigB.keyEntities.length > 0) {
    const setB = new Set(sigB.keyEntities.map(e => e.toLowerCase()));
    const matches = sigA.keyEntities.filter(e => setB.has(e.toLowerCase())).length;
    entityOverlap = matches / Math.min(sigA.keyEntities.length, sigB.keyEntities.length);
  }

  // Combined weighted semantic similarity
  return parseFloat((catScore * 0.45 + textSim * 0.35 + entityOverlap * 0.20).toFixed(3));
}

/**
 * Calculates overall semantic cohesion percentage for a cluster of signals.
 */
export function computeClusterSemanticAffinity(signals: CivicSignal[]): number {
  if (signals.length <= 1) return 100;

  // Dominant category ratio
  const catCounts: Record<string, number> = {};
  signals.forEach(s => catCounts[s.category] = (catCounts[s.category] || 0) + 1);
  const maxCount = Math.max(...Object.values(catCounts));
  const dominantRatio = maxCount / signals.length;

  // Average pairwise semantic similarity
  let totalSim = 0;
  let count = 0;
  for (let i = 0; i < signals.length; i++) {
    for (let j = i + 1; j < signals.length; j++) {
      totalSim += computeSemanticSimilarity(signals[i], signals[j]);
      count++;
    }
  }

  const avgSim = count > 0 ? totalSim / count : 1.0;

  // Blend dominant category percentage with pairwise similarity
  const affinityPercent = Math.round((dominantRatio * 0.6 + avgSim * 0.4) * 100);
  return Math.min(100, Math.max(0, affinityPercent));
}
