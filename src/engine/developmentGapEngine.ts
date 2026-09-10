import { DemographicContext, DevelopmentCategory, DevelopmentGap, InfrastructureContext, InvestmentContext } from '../types/development';

export function calculateDevelopmentGap(
  category: DevelopmentCategory,
  requestCount: number,
  velocityPerHour: number,
  demographics: DemographicContext,
  infrastructure: InfrastructureContext,
  investment: InvestmentContext
): DevelopmentGap {
  // 1. Demand Gap Score (out of 30)
  const volumeFactor = Math.min(15, Math.round(requestCount * 1.5));
  const velocityFactor = Math.min(15, Math.round(velocityPerHour * 2.5));
  const demandGapScore = Math.min(30, volumeFactor + velocityFactor);

  // 2. Infrastructure Deficit Score (out of 25)
  const distancePenalty = Math.min(15, Math.round(infrastructure.nearestFacilityDistanceMeters / 100));
  const capacityPenalty = Math.min(10, Math.round((infrastructure.capacityUtilizationPercent - 50) / 5));
  const infrastructureDeficitScore = Math.min(25, Math.max(5, distancePenalty + Math.max(0, capacityPenalty)));

  // 3. Demographic Vulnerability Score (out of 20)
  const densityScore = Math.min(10, Math.round(demographics.populationDensityPerSqKm / 2000));
  const vulnerabilityScore = Math.round(demographics.vulnerableGroupRatio * 10);
  const demographicVulnerabilityScore = Math.min(20, densityScore + vulnerabilityScore);

  // 4. Investment Deficit Score (out of 15)
  const gapRatio = investment.approvedBudgetLakhs > 0
    ? investment.investmentGapLakhs / investment.approvedBudgetLakhs
    : 1.0;
  const investmentDeficitScore = Math.min(15, Math.round(gapRatio * 15));

  // 5. Environmental & Recurrence Risk Score (out of 10)
  const unaddressedPenalty = Math.min(10, Math.round(investment.unaddressedRequestsCount * 2));
  const environmentalRiskScore = Math.min(10, unaddressedPenalty);

  // Overall Gap Index (0 - 100)
  const overallGapIndex = Math.min(
    100,
    demandGapScore + infrastructureDeficitScore + demographicVulnerabilityScore + investmentDeficitScore + environmentalRiskScore
  );

  const explanationBullets: string[] = [
    `Citizen Demand Gap: Aggregated ${requestCount} citizen requests (${velocityPerHour.toFixed(1)} req/hr velocity).`,
    `Infrastructure Deficit: Nearest ${infrastructure.nearestFacilityName || 'facility'} is ${infrastructure.nearestFacilityDistanceMeters}m away with ${infrastructure.capacityUtilizationPercent}% utilization.`,
    `Demographic Vulnerability: ${demographics.wardName} density ${demographics.populationDensityPerSqKm}/km² (${Math.round(demographics.vulnerableGroupRatio * 100)}% vulnerable population).`,
    `Investment Deficit: Unfunded gap of ₹${investment.investmentGapLakhs} Lakhs across ${investment.unaddressedRequestsCount} historical unaddressed requests.`
  ];

  return {
    overallGapIndex,
    demandGapScore,
    infrastructureDeficitScore,
    demographicVulnerabilityScore,
    investmentDeficitScore,
    environmentalRiskScore,
    explanationBullets
  };
}
