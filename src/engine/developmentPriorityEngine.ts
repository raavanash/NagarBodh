import {
  CanonicalDevelopmentCategory,
  DemographicContext,
  DevelopmentCategory,
  DevelopmentGap,
  DevelopmentPriority,
  DevelopmentPriorityBreakdown,
  DevelopmentRequestEvidence,
  DevelopmentUrgency,
  InfrastructureContext,
  InvestmentContext,
  StructuredPriorityFactor
} from '../types/development';

/**
 * Centralized, configurable weights for the deterministic Development Priority Engine.
 * Modifying these weights alters the relative influence of each context pillar.
 */
export interface PriorityWeightsConfig {
  demandIntensity: number;       // default 0.25 (25%)
  infrastructureDeficit: number; // default 0.25 (25%)
  populationImpact: number;      // default 0.20 (20%)
  vulnerablePopulation: number;  // default 0.15 (15%)
  investmentGap: number;         // default 0.15 (15%)
}

export const DEFAULT_PRIORITY_WEIGHTS: PriorityWeightsConfig = {
  demandIntensity: 0.25,
  infrastructureDeficit: 0.25,
  populationImpact: 0.20,
  vulnerablePopulation: 0.15,
  investmentGap: 0.15
};

export interface DemandScoreInput {
  requestCount: number;
  averageIntensity?: number; // 0.0 - 1.0
  velocityPerHour: number;
  surgeMultiplier?: number; // >1.0 indicates acceleration
  channelCount?: number; // source diversity count (1-6)
  hoursSinceLatest?: number;
}

/**
 * Calculates a multi-factor Demand Score (0 - 100).
 * Combines request volume, intensity, velocity, acceleration growth, channel diversity, and recency.
 */
export function calculateDemandScore(input: DemandScoreInput): number {
  const count = Math.max(0, input.requestCount);
  const intensity = Math.min(1.0, Math.max(0.1, input.averageIntensity ?? 0.6));
  const velocity = Math.max(0, input.velocityPerHour);
  const surge = Math.max(1.0, input.surgeMultiplier ?? 1.0);
  const channels = Math.min(6, Math.max(1, input.channelCount ?? 1));
  const hoursElapsed = Math.max(0, input.hoursSinceLatest ?? 0);

  // 1. Volume Factor (max 30 pts)
  const volumePts = Math.min(30, Math.round(Math.sqrt(count) * 4.5));

  // 2. Intensity Factor (max 25 pts)
  const intensityPts = Math.round(intensity * 25);

  // 3. Velocity & Acceleration Factor (max 25 pts)
  const baseVelocityPts = Math.min(15, Math.round(velocity * 2.0));
  const accelerationPts = Math.min(10, Math.round((surge - 1.0) * 10));
  const velocityPts = Math.min(25, baseVelocityPts + accelerationPts);

  // 4. Source Diversity (max 10 pts)
  const diversityPts = Math.min(10, Math.round(channels * 2.5));

  // 5. Recency Decay (0.0 to 1.0 multiplier)
  const recencyMultiplier = Math.max(0.5, 1.0 - (hoursElapsed * 0.02));

  const rawScore = (volumePts + intensityPts + velocityPts + diversityPts) * recencyMultiplier;
  return Math.min(100, Math.max(0, Math.round(rawScore)));
}

/**
 * Primary Entry Point: Calculates the deterministic Development Priority (0 - 100)
 * and generates structured factor-level explainability without relying on LLMs.
 */
export function calculateDevelopmentPriority(
  hotspotId: string,
  category: CanonicalDevelopmentCategory | DevelopmentCategory | string,
  demandInput: DemandScoreInput,
  demographics: DemographicContext,
  infrastructure: InfrastructureContext,
  investment: InvestmentContext,
  weights: PriorityWeightsConfig = DEFAULT_PRIORITY_WEIGHTS
): DevelopmentPriority {
  // 1. Component Scores (all normalized to 0 - 100)
  const demandScore = calculateDemandScore(demandInput);

  // Infrastructure Deficit (0 - 100, Category-Aware)
  const nearestDist = infrastructure.nearestFacilityDistanceMeters ?? 1000;
  const capUtil = infrastructure.capacityUtilizationPercent ?? 75;
  const catUpper = (category || 'OTHER').toString().toUpperCase();

  let categorySpecificDeficit: number | undefined;
  if (catUpper === 'HEALTHCARE' && infrastructure.healthcareIndex !== undefined) {
    categorySpecificDeficit = 100 - infrastructure.healthcareIndex;
  } else if (catUpper === 'EDUCATION' && infrastructure.educationIndex !== undefined) {
    categorySpecificDeficit = 100 - infrastructure.educationIndex;
  } else if ((catUpper === 'WATER' || catUpper === 'WATERLOGGING' || catUpper === 'DRAINAGE') && infrastructure.waterIndex !== undefined) {
    categorySpecificDeficit = 100 - infrastructure.waterIndex;
  } else if ((catUpper === 'TRANSPORT' || catUpper === 'ROADS' || catUpper === 'TRAFFIC') && infrastructure.transportIndex !== undefined) {
    categorySpecificDeficit = 100 - infrastructure.transportIndex;
  }

  const defaultCalculated = Math.min(100, Math.round((nearestDist / 50) + Math.max(0, capUtil - 50)));
  const specifiedDeficit = Math.max(
    categorySpecificDeficit ?? 0,
    infrastructure.infrastructureDeficitIndex ?? 0
  );
  const infraDeficitRaw = specifiedDeficit > 0 ? specifiedDeficit : defaultCalculated;
  const infrastructureGap = Math.min(100, Math.max(0, Math.round(infraDeficitRaw)));

  // Population Impact (0 - 100)
  const popEst = demographics.totalPopulationEstimate ?? demographics.population ?? 500000;
  const popDensity = demographics.populationDensityPerSqKm ?? demographics.populationDensity ?? 10000;
  const popImpactRaw = Math.min(100, Math.round((popEst / 10000) + (popDensity / 500)));
  const populationImpact = Math.min(100, Math.max(0, Math.round(popImpactRaw)));

  // Vulnerability Score (0 - 100)
  const vulnRatio = demographics.vulnerableGroupRatio ??
    (demographics.population > 0 ? demographics.vulnerablePopulation / demographics.population : 0.25);
  const vulnerabilityScore = Math.min(100, Math.max(0, Math.round(vulnRatio * 100)));

  // Investment Gap Score (0 - 100)
  const existingInv = investment.existingInvestment ?? 1000;
  const plannedInv = investment.plannedInvestment ?? 500;
  const gapLakhs = investment.investmentGapLakhs ?? Math.max(0, plannedInv - existingInv);
  const totalBudget = Math.max(1, existingInv + plannedInv);
  const investGapRatio = Math.min(1.0, gapLakhs / totalBudget);
  const investmentGap = Math.min(100, Math.max(0, Math.round(investGapRatio * 100)));

  // 2. Weighted Sum (Deterministic 0 - 100)
  const demandContrib = demandScore * weights.demandIntensity;
  const infraContrib = infrastructureGap * weights.infrastructureDeficit;
  const popContrib = populationImpact * weights.populationImpact;
  const vulnContrib = vulnerabilityScore * weights.vulnerablePopulation;
  const investContrib = investmentGap * weights.investmentGap;

  const rawPriority = demandContrib + infraContrib + popContrib + vulnContrib + investContrib;
  const priorityScore = Math.min(100, Math.max(0, Math.round(rawPriority)));

  // 3. Priority Level Classification (P1 / P2 / P3)
  let priorityLevel: 'P1' | 'P2' | 'P3' = 'P3';
  if (priorityScore >= 80) priorityLevel = 'P1';
  else if (priorityScore >= 55) priorityLevel = 'P2';

  // 4. Structured Factor Explainability
  const factors: StructuredPriorityFactor[] = [
    {
      factor: 'Citizen Demand',
      score: demandScore,
      contribution: parseFloat(demandContrib.toFixed(2)),
      evidence: `${demandInput.requestCount} requests logged (${demandInput.velocityPerHour.toFixed(1)} req/hr velocity across ${demandInput.channelCount ?? 1} channels)`,
      source: 'Signal Ingestion Stream & Normalizer'
    },
    {
      factor: 'Infrastructure Deficit',
      score: infrastructureGap,
      contribution: parseFloat(infraContrib.toFixed(2)),
      evidence: `Deficit Index ${infrastructureGap}/100. Nearest facility ${infrastructure.nearestFacilityName || 'facility'} at ${nearestDist}m (${capUtil}% capacity)`,
      source: 'National Infrastructure Registry'
    },
    {
      factor: 'Population Impact',
      score: populationImpact,
      contribution: parseFloat(popContrib.toFixed(2)),
      evidence: `${popEst.toLocaleString()} area population with density ${popDensity.toLocaleString()}/km²`,
      source: 'Demographic Context Layer'
    },
    {
      factor: 'Vulnerable Population',
      score: vulnerabilityScore,
      contribution: parseFloat(vulnContrib.toFixed(2)),
      evidence: `${Math.round(vulnRatio * 100)}% vulnerable group ratio (${(demographics.vulnerablePopulation ?? 0).toLocaleString()} residents)`,
      source: 'Demographic Census & Social Vulnerability Index'
    },
    {
      factor: 'Investment Gap',
      score: investmentGap,
      contribution: parseFloat(investContrib.toFixed(2)),
      evidence: `Unfunded gap of ₹${gapLakhs.toLocaleString()} Lakhs (${investment.unaddressedRequestsCount ?? 0} historical unaddressed requests)`,
      source: 'Public Expenditure & Capital Plan'
    }
  ];

  // 5. Evidence Provenance Chain
  const evidenceChain: DevelopmentRequestEvidence[] = [
    {
      classification: 'OBSERVED',
      snippet: `High citizen demand recorded for ${category} in hotspot ${hotspotId}.`,
      source: 'Multi-channel Citizen Signal Stream',
      confidence: 1.0
    },
    {
      classification: 'CALCULATED',
      snippet: `Deterministic priority calculated at ${priorityScore}/100 (Level ${priorityLevel}).`,
      source: 'Deterministic Priority Engine',
      confidence: 1.0
    },
    {
      classification: 'INFERRED',
      snippet: `Demographic vulnerability and infrastructure deficit drive ${priorityLevel === 'P1' ? 'critical' : 'high'} policy urgency.`,
      source: 'Development Intelligence Foundation',
      confidence: 0.92
    },
    {
      classification: 'RECOMMENDED',
      snippet: `Flagged for Policymaker Review under Level ${priorityLevel} priority workflow.`,
      source: 'Project Recommendation Engine',
      confidence: 0.88
    }
  ];

  return {
    hotspotId,
    category,
    priorityScore,
    priorityLevel,
    demandScore,
    infrastructureGap,
    investmentGap,
    populationImpact,
    vulnerabilityScore,
    factors,
    evidence: evidenceChain
  };
}

/**
 * Legacy compatibility wrapper for calculateDeterministicDevelopmentPriority
 */
export function calculateDeterministicDevelopmentPriority(
  category: DevelopmentCategory,
  requestCount: number,
  velocityPerHour: number,
  demographics: DemographicContext,
  infrastructure: InfrastructureContext,
  investment: InvestmentContext,
  developmentGap: DevelopmentGap
): DevelopmentPriorityBreakdown {
  const result = calculateDevelopmentPriority(
    'hotspot-legacy',
    category,
    { requestCount, velocityPerHour },
    demographics,
    infrastructure,
    investment
  );

  let level: DevelopmentUrgency = 'standard';
  if (result.priorityScore >= 80) level = 'critical';
  else if (result.priorityScore >= 60) level = 'urgent';
  else if (result.priorityScore >= 45) level = 'high';

  return {
    overallScore: result.priorityScore,
    level,
    factors: {
      citizenDemandScore: result.demandScore,
      infrastructureDeficitScore: result.infrastructureGap,
      demographicImpactScore: result.populationImpact,
      publicInvestmentGapScore: result.investmentGap,
      environmentalRiskScore: developmentGap.environmentalRiskScore
    },
    whyPrioritizedBullets: result.factors.map(f => ({
      reasonText: `${f.factor}: Score ${f.score}/100 (+${f.contribution} pts) — ${f.evidence}`,
      evidenceSource: f.source
    })),
    formulaExplanation: `Priority Score (${result.priorityScore}/100) calculated deterministically via weighted multi-factor engine.`
  };
}
