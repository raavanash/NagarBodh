import { describe, expect, it } from 'vitest';
import { calculateDevelopmentGap, deriveInvestmentBoardMetrics } from '../developmentGapEngine';
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

  it('deriveInvestmentBoardMetrics derives 4 core sectors dynamically from incident state', () => {
    // 1. Initial / empty state
    const initial = deriveInvestmentBoardMetrics([]);
    expect(initial.sectorMetrics).toHaveLength(4);
    expect(initial.gapRows).toHaveLength(4);

    const waterInitial = initial.sectorMetrics.find(s => s.category === 'WATER')!;
    expect(waterInitial.demandScore).toBeGreaterThan(0);
    expect(waterInitial.gapLakhs).toBe(350);

    // 2. Active incident state with surging demand
    const mockWaterIncident: any = {
      id: 'inc-surge-water',
      title: 'Sector 15 Flash Flood Emergency',
      category: 'waterlogging',
      ward: 'Ward 15 — Sector 15',
      signalIds: Array.from({ length: 25 }, (_, i) => `sig-${i}`),
      velocityPerHour: 8.5,
      velocitySurgePercent: 280,
      priority: { overallScore: 94 }
    };

    const dynamicBoard = deriveInvestmentBoardMetrics([mockWaterIncident]);
    const waterDynamic = dynamicBoard.sectorMetrics.find(s => s.category === 'WATER')!;
    const waterRow = dynamicBoard.gapRows.find(r => r.category === 'WATER')!;

    // Demand score and status react to surging request velocity
    expect(waterDynamic.demandScore).toBeGreaterThanOrEqual(waterInitial.demandScore);
    expect(waterDynamic.status).toBe('CRITICAL DEFICIT');
    expect(waterRow.incidentId).toBe('inc-surge-water');
    expect(waterRow.aiExplanation).toContain('25 signals');
  });
});
