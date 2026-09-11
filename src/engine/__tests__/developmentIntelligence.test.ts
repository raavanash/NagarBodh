import { describe, expect, it } from 'vitest';
import { calculateDevelopmentGap } from '../developmentGapEngine';
import { calculateDeterministicDevelopmentPriority } from '../developmentPriorityEngine';
import { generateProjectRecommendation } from '../projectRecommendationEngine';
import { DemographicContext, InfrastructureContext, InvestmentContext } from '../../types/development';

describe('Development Intelligence Foundation Engines', () => {
  const sampleDemographics: DemographicContext = {
    wardId: 'ward-14',
    wardName: 'Ward 14 - Karol Bagh',
    populationDensityPerSqKm: 14500,
    totalPopulationEstimate: 85000,
    vulnerableGroupRatio: 0.42,
    primaryLivelihoodZone: 'Commercial & Mixed Residential',
    literacyPercent: 88
  };

  const sampleInfrastructure: InfrastructureContext = {
    existingFacilitiesCount: 2,
    nearestFacilityName: 'Karol Bagh Primary Health Sub-Center',
    nearestFacilityDistanceMeters: 1200,
    capacityUtilizationPercent: 92,
    infrastructureDeficitIndex: 68,
    criticalAssetsNearby: []
  };

  const sampleInvestment: InvestmentContext = {
    approvedBudgetLakhs: 500,
    allocatedFundingLakhs: 200,
    investmentGapLakhs: 300,
    historicalProjectsCompleted: 4,
    unaddressedRequestsCount: 18
  };

  it('computes Development Gap with multi-dimensional scores', () => {
    const gap = calculateDevelopmentGap(
      'healthcare',
      24,
      5.2,
      sampleDemographics,
      sampleInfrastructure,
      sampleInvestment
    );

    expect(gap.overallGapIndex).toBeGreaterThan(0);
    expect(gap.overallGapIndex).toBeLessThanOrEqual(100);
    expect(gap.explanationBullets.length).toBe(4);
    expect(gap.demandGapScore).toBeGreaterThan(0);
    expect(gap.infrastructureDeficitScore).toBeGreaterThan(0);
  });

  it('calculates deterministic 5-factor priority score', () => {
    const gap = calculateDevelopmentGap(
      'healthcare',
      24,
      5.2,
      sampleDemographics,
      sampleInfrastructure,
      sampleInvestment
    );

    const priority = calculateDeterministicDevelopmentPriority(
      'healthcare',
      24,
      5.2,
      sampleDemographics,
      sampleInfrastructure,
      sampleInvestment,
      gap
    );

    expect(priority.overallScore).toBeGreaterThanOrEqual(0);
    expect(priority.overallScore).toBeLessThanOrEqual(100);
    expect(priority.whyPrioritizedBullets.length).toBe(5);
    expect(priority.formulaExplanation).toContain('Priority Score');
  });

  it('generates actionable project recommendations for policy review', () => {
    const gap = calculateDevelopmentGap(
      'healthcare',
      24,
      5.2,
      sampleDemographics,
      sampleInfrastructure,
      sampleInvestment
    );

    const priority = calculateDeterministicDevelopmentPriority(
      'healthcare',
      24,
      5.2,
      sampleDemographics,
      sampleInfrastructure,
      sampleInvestment,
      gap
    );

    const project = generateProjectRecommendation(
      'hotspot-karol-bagh-healthcare',
      'healthcare',
      sampleDemographics.wardName,
      'Karol Bagh Medical Hub',
      priority.overallScore,
      gap,
      sampleDemographics,
      sampleInfrastructure,
      sampleInvestment
    );

    expect(project.id).toBeDefined();
    expect(project.title).toContain('Healthcare Access Programme');
    expect(project.status).toBe('pending_policy_review');
    expect(project.recommendedActions?.length).toBeGreaterThan(0);
    expect(project.expectedBeneficiaries).toBeGreaterThan(0);
  });
});
