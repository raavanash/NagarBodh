import { describe, expect, it } from 'vitest';
import {
  calculateDemandScore,
  calculateDevelopmentPriority,
  DEFAULT_PRIORITY_WEIGHTS
} from '../developmentPriorityEngine';
import { DemographicContext, InfrastructureContext, InvestmentContext } from '../../types/development';

describe('Deterministic Development Priority Engine', () => {
  const sampleDemographics: DemographicContext = {
    population: 580000,
    populationDensity: 23150,
    populationGrowth: 1.4,
    urbanizationRate: 100,
    vulnerablePopulation: 145000,
    youthPopulation: 210000,
    elderlyPopulation: 65000,
    wardId: 'WARD-DEL-14',
    wardName: 'Karol Bagh',
    totalPopulationEstimate: 580000,
    populationDensityPerSqKm: 23150,
    vulnerableGroupRatio: 0.25
  };

  const sampleInfrastructure: InfrastructureContext = {
    healthcareIndex: 65,
    educationIndex: 78,
    waterIndex: 42,
    sanitationIndex: 50,
    transportIndex: 82,
    electricityIndex: 88,
    digitalConnectivityIndex: 92,
    existingFacilitiesCount: 14,
    nearestFacilityName: 'RML Hospital Sub-centre',
    nearestFacilityDistanceMeters: 2400,
    capacityUtilizationPercent: 94,
    infrastructureDeficitIndex: 78
  };

  const sampleInvestment: InvestmentContext = {
    existingInvestment: 4500,
    plannedInvestment: 1200,
    activeProjects: 3,
    plannedProjects: 2,
    investmentByCategory: { HEALTHCARE: 800 },
    approvedBudgetLakhs: 4500,
    allocatedFundingLakhs: 3300,
    investmentGapLakhs: 3200,
    unaddressedRequestsCount: 45
  };

  it('1. High demand & high gap yields P1 priority score (>=80)', () => {
    const highGapDemographics: DemographicContext = {
      ...sampleDemographics,
      vulnerableGroupRatio: 0.75,
      vulnerablePopulation: 435000
    };
    const highGapInvestment: InvestmentContext = {
      ...sampleInvestment,
      existingInvestment: 500,
      plannedInvestment: 5000,
      investmentGapLakhs: 4500
    };

    const res = calculateDevelopmentPriority(
      'hotspot-high-gap',
      'HEALTHCARE',
      {
        requestCount: 48,
        averageIntensity: 0.9,
        velocityPerHour: 14.5,
        surgeMultiplier: 2.2,
        channelCount: 4
      },
      highGapDemographics,
      sampleInfrastructure,
      highGapInvestment
    );

    expect(res.priorityLevel).toBe('P1');
    expect(res.priorityScore).toBeGreaterThanOrEqual(80);
    expect(res.factors.length).toBe(5);
    expect(res.evidence.length).toBe(4);
    expect(res.factors.find(f => f.factor === 'Citizen Demand')?.score).toBeGreaterThan(70);
  });

  it('2. Low demand & high investment coverage yields low priority (P3)', () => {
    const highInvestContext: InvestmentContext = {
      existingInvestment: 12000,
      plannedInvestment: 10000,
      activeProjects: 8,
      plannedProjects: 6,
      investmentByCategory: { ROADS: 10000 },
      investmentGapLakhs: 0,
      unaddressedRequestsCount: 2
    };

    const res = calculateDevelopmentPriority(
      'hotspot-low-gap',
      'ROADS',
      {
        requestCount: 3,
        averageIntensity: 0.2,
        velocityPerHour: 0.5,
        surgeMultiplier: 1.0,
        channelCount: 1
      },
      sampleDemographics,
      { ...sampleInfrastructure, infrastructureDeficitIndex: 15, nearestFacilityDistanceMeters: 200, capacityUtilizationPercent: 40 },
      highInvestContext
    );

    expect(res.priorityLevel).toBe('P3');
    expect(res.priorityScore).toBeLessThan(55);
    expect(res.investmentGap).toBeLessThan(20);
  });

  it('3. High demand with strong infrastructure yields moderate priority (P2)', () => {
    const res = calculateDevelopmentPriority(
      'hotspot-high-demand-good-infra',
      'DIGITAL_CONNECTIVITY',
      {
        requestCount: 35,
        averageIntensity: 0.75,
        velocityPerHour: 8.0,
        surgeMultiplier: 1.2,
        channelCount: 3
      },
      sampleDemographics,
      { ...sampleInfrastructure, infrastructureDeficitIndex: 20, nearestFacilityDistanceMeters: 300, capacityUtilizationPercent: 45 },
      sampleInvestment
    );

    expect(res.priorityLevel).toBe('P2');
    expect(res.priorityScore).toBeGreaterThanOrEqual(55);
    expect(res.priorityScore).toBeLessThan(80);
  });

  it('4. Vulnerable population spike increases vulnerability contribution', () => {
    const vulnerableSpikeDemographics: DemographicContext = {
      ...sampleDemographics,
      vulnerablePopulation: 450000,
      vulnerableGroupRatio: 0.78
    };

    const resNormal = calculateDevelopmentPriority(
      'hotspot-normal-vuln',
      'WATER',
      { requestCount: 15, velocityPerHour: 4.0 },
      sampleDemographics,
      sampleInfrastructure,
      sampleInvestment
    );

    const resSpike = calculateDevelopmentPriority(
      'hotspot-spike-vuln',
      'WATER',
      { requestCount: 15, velocityPerHour: 4.0 },
      vulnerableSpikeDemographics,
      sampleInfrastructure,
      sampleInvestment
    );

    expect(resSpike.vulnerabilityScore).toBeGreaterThan(resNormal.vulnerabilityScore);
    expect(resSpike.priorityScore).toBeGreaterThan(resNormal.priorityScore);
  });

  it('5. Rapidly growing demand (surge multiplier) boosts demand score', () => {
    const steadyDemand = calculateDemandScore({
      requestCount: 20,
      velocityPerHour: 5.0,
      surgeMultiplier: 1.0
    });

    const surgingDemand = calculateDemandScore({
      requestCount: 20,
      velocityPerHour: 5.0,
      surgeMultiplier: 2.5
    });

    expect(surgingDemand).toBeGreaterThan(steadyDemand);
  });

  it('6. Guaranteed 100% determinism given identical inputs', () => {
    const run1 = calculateDevelopmentPriority(
      'hotspot-det-1',
      'HEALTHCARE',
      { requestCount: 25, velocityPerHour: 6.0, averageIntensity: 0.8 },
      sampleDemographics,
      sampleInfrastructure,
      sampleInvestment
    );

    const run2 = calculateDevelopmentPriority(
      'hotspot-det-1',
      'HEALTHCARE',
      { requestCount: 25, velocityPerHour: 6.0, averageIntensity: 0.8 },
      sampleDemographics,
      sampleInfrastructure,
      sampleInvestment
    );

    expect(run1.priorityScore).toBe(run2.priorityScore);
    expect(run1.priorityLevel).toBe(run2.priorityLevel);
    expect(run1.demandScore).toBe(run2.demandScore);
    expect(run1.factors).toEqual(run2.factors);
  });

  it('7. Supports customized weight configuration', () => {
    const customWeights = {
      ...DEFAULT_PRIORITY_WEIGHTS,
      demandIntensity: 0.50, // Increase demand weight to 50%
      infrastructureDeficit: 0.10
    };

    const resCustom = calculateDevelopmentPriority(
      'hotspot-weight-test',
      'HEALTHCARE',
      { requestCount: 50, averageIntensity: 0.95, velocityPerHour: 15.0 },
      sampleDemographics,
      sampleInfrastructure,
      sampleInvestment,
      customWeights
    );

    const demandFactor = resCustom.factors.find(f => f.factor === 'Citizen Demand');
    expect(demandFactor?.contribution).toBeGreaterThan(20);
  });
});
