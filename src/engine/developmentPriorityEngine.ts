import { DemographicContext, DevelopmentCategory, DevelopmentGap, DevelopmentPriorityBreakdown, DevelopmentUrgency, InfrastructureContext, InvestmentContext } from '../types/development';

export function calculateDeterministicDevelopmentPriority(
  category: DevelopmentCategory,
  requestCount: number,
  velocityPerHour: number,
  demographics: DemographicContext,
  infrastructure: InfrastructureContext,
  investment: InvestmentContext,
  developmentGap: DevelopmentGap
): DevelopmentPriorityBreakdown {
  // 1. Citizen Demand Score (30%)
  const citizenDemandScore = Math.min(30, Math.round(developmentGap.demandGapScore));

  // 2. Infrastructure Deficit Score (25%)
  const infrastructureDeficitScore = Math.min(25, Math.round(developmentGap.infrastructureDeficitScore));

  // 3. Demographic Impact Score (20%)
  const demographicImpactScore = Math.min(20, Math.round(developmentGap.demographicVulnerabilityScore));

  // 4. Public Investment Gap Score (15%)
  const publicInvestmentGapScore = Math.min(15, Math.round(developmentGap.investmentDeficitScore));

  // 5. Environmental & Recurrence Risk Score (10%)
  const environmentalRiskScore = Math.min(10, Math.round(developmentGap.environmentalRiskScore));

  // Overall Score (0 - 100)
  const overallScore = Math.min(
    100,
    citizenDemandScore + infrastructureDeficitScore + demographicImpactScore + publicInvestmentGapScore + environmentalRiskScore
  );

  let level: DevelopmentUrgency = 'standard';
  if (overallScore >= 85) level = 'critical';
  else if (overallScore >= 70) level = 'urgent';
  else if (overallScore >= 50) level = 'high';

  const nearestDist = infrastructure.nearestFacilityDistanceMeters ?? 1000;
  const popDensity = demographics.populationDensityPerSqKm ?? demographics.populationDensity ?? 10000;
  const vulnRatio = demographics.vulnerableGroupRatio ?? (demographics.population > 0 ? demographics.vulnerablePopulation / demographics.population : 0.25);
  const investGap = investment.investmentGapLakhs ?? (investment.plannedInvestment - investment.existingInvestment);
  const unaddressedCount = investment.unaddressedRequestsCount ?? 20;

  const whyPrioritizedBullets = [
    {
      reasonText: `High Citizen Demand: ${requestCount} requests logged (${velocityPerHour.toFixed(1)} req/hr velocity).`,
      evidenceSource: 'Citizen Request Stream & Multilingual Voice/Text Ingestion'
    },
    {
      reasonText: `Infrastructure Deficit Index: ${infrastructure.infrastructureDeficitIndex ?? 50}/100. Nearest facility ${infrastructure.nearestFacilityName || 'facility'} at ${nearestDist}m distance.`,
      evidenceSource: 'National Infrastructure Registry & Spatial Proximity Data'
    },
    {
      reasonText: `Demographic Exposure: ${demographics.wardName || 'Region'} population density ${popDensity}/km² (${Math.round(vulnRatio * 100)}% vulnerable demographics).`,
      evidenceSource: 'National Census & Demographic Data Layer'
    },
    {
      reasonText: `Public Investment Gap: Unfunded budget gap of ₹${investGap} Lakhs across ${unaddressedCount} pending requests.`,
      evidenceSource: 'Public Expenditure & Capital Investment Plan Registry'
    }
  ];

  const formulaExplanation =
    `Priority Score (${overallScore}/100) = Citizen Demand (30%: ${citizenDemandScore}) + Infrastructure Deficit (25%: ${infrastructureDeficitScore}) + Demographic Impact (20%: ${demographicImpactScore}) + Public Investment Gap (15%: ${publicInvestmentGapScore}) + Environmental/Recurrence Risk (10%: ${environmentalRiskScore}).`;

  return {
    overallScore,
    level,
    factors: {
      citizenDemandScore,
      infrastructureDeficitScore,
      demographicImpactScore,
      publicInvestmentGapScore,
      environmentalRiskScore
    },
    whyPrioritizedBullets,
    formulaExplanation
  };
}
