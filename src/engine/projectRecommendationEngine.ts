import { CivicCategory } from '../types/civic';
import {
  DemographicContext,
  DevelopmentCategory,
  DevelopmentGap,
  DevelopmentProjectRecommendation,
  InfrastructureContext,
  InvestmentContext
} from '../types/development';
import { generateDevelopmentProjectRecommendation } from './developmentRecommendationEngine';

export function generateProjectRecommendation(
  hotspotId: string,
  category: DevelopmentCategory | CivicCategory | string,
  wardName: string,
  locationName: string,
  priorityScore: number,
  developmentGap: DevelopmentGap,
  demographics: DemographicContext,
  infrastructure: InfrastructureContext,
  investment: InvestmentContext
): DevelopmentProjectRecommendation {
  const geography = {
    country: 'India',
    state: 'Delhi NCR',
    district: locationName || wardName || 'Regional District',
    subDistrict: wardName,
    wardOrDistrict: wardName,
    locationName: locationName || wardName
  };

  return generateDevelopmentProjectRecommendation({
    hotspotId,
    category,
    geography,
    priorityScoreVal: priorityScore,
    developmentGap,
    demographics,
    infrastructure,
    investment,
    evidence: [
      {
        classification: 'CALCULATED',
        snippet: `Deterministic priority score ${priorityScore}/100 in ${wardName || locationName}`,
        source: 'NagarBodh Recommendation Engine',
        confidence: 1.0
      }
    ],
    sourceMode: 'SIMULATION'
  });
}
