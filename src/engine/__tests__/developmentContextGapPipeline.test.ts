import { describe, expect, it } from 'vitest';
import { calculateDevelopmentGap } from '../developmentGapEngine';
import { calculateDevelopmentPriority } from '../developmentPriorityEngine';
import { DemographicContext, InfrastructureContext, InvestmentContext } from '../../types/development';

describe('Phase 06 — Development Context -> Gap -> Investment Intelligence Pipeline', () => {
  const sampleDemographics: DemographicContext = {
    population: 150000,
    populationDensity: 12000,
    populationGrowth: 2.1,
    urbanizationRate: 92,
    vulnerablePopulation: 45000,
    youthPopulation: 35000,
    elderlyPopulation: 15000,
    wardName: 'Ward 15 — Sector 15'
  };

  const sampleInfrastructure: InfrastructureContext = {
    healthcareIndex: 35,
    educationIndex: 42,
    waterIndex: 30,
    sanitationIndex: 38,
    transportIndex: 50,
    nearestFacilityName: 'Government Secondary Health Sub-center',
    nearestFacilityDistanceMeters: 1200,
    capacityUtilizationPercent: 90
  };

  const sampleInvestment: InvestmentContext = {
    existingInvestment: 200,
    plannedInvestment: 600,
    activeProjects: 2,
    plannedProjects: 1,
    investmentByCategory: { HEALTHCARE: 200, WATER: 100 },
    investmentGapLakhs: 400,
    unaddressedRequestsCount: 22
  };

  it('1. Calculates category-aware development gap index correctly', () => {
    const gap = calculateDevelopmentGap(
      'HEALTHCARE',
      25,
      4.5,
      sampleDemographics,
      sampleInfrastructure,
      sampleInvestment
    );

    expect(gap.overallGapIndex).toBeGreaterThan(0);
    expect(gap.overallGapIndex).toBeLessThanOrEqual(100);
    expect(gap.demandGapScore).toBe(26); // volumeFactor (15) + velocityFactor (11) = 26
    expect(gap.infrastructureDeficitScore).toBeGreaterThan(0);
    expect(gap.explanationBullets).toHaveLength(4);
    expect(gap.explanationBullets[0]).toContain('25 citizen requests');
  });

  it('2. Dynamically prioritizes domain-specific infrastructure indices in calculateDevelopmentPriority', () => {
    // HEALTHCARE priority
    const healthPriority = calculateDevelopmentPriority(
      'hotspot-h1',
      'HEALTHCARE',
      { requestCount: 20, velocityPerHour: 3.0 },
      sampleDemographics,
      sampleInfrastructure,
      sampleInvestment
    );

    // EDUCATION priority
    const eduPriority = calculateDevelopmentPriority(
      'hotspot-e1',
      'EDUCATION',
      { requestCount: 20, velocityPerHour: 3.0 },
      sampleDemographics,
      sampleInfrastructure,
      sampleInvestment
    );

    expect(healthPriority.priorityScore).toBeGreaterThan(0);
    expect(eduPriority.priorityScore).toBeGreaterThan(0);

    // Healthcare infrastructure gap uses 100 - healthcareIndex (100 - 35 = 65)
    expect(healthPriority.infrastructureGap).toBe(65);
    // Education infrastructure gap uses 100 - educationIndex (100 - 42 = 58)
    expect(eduPriority.infrastructureGap).toBe(58);
  });

  it('3. Generates 5 factor contribution scores out of 100 deterministically', () => {
    const priority = calculateDevelopmentPriority(
      'hotspot-p1',
      'WATERLOGGING',
      { requestCount: 30, velocityPerHour: 5.0, surgeMultiplier: 1.8 },
      sampleDemographics,
      sampleInfrastructure,
      sampleInvestment
    );

    expect(priority.factors).toHaveLength(5);
    const factorNames = priority.factors.map(f => f.factor);
    expect(factorNames).toContain('Citizen Demand');
    expect(factorNames).toContain('Infrastructure Deficit');
    expect(factorNames).toContain('Population Impact');
    expect(factorNames).toContain('Vulnerable Population');
    expect(factorNames).toContain('Investment Gap');

    // Total score equals sum of factor contributions
    const sumContributions = priority.factors.reduce((sum, f) => sum + f.contribution, 0);
    expect(Math.round(sumContributions)).toBe(priority.priorityScore);
  });

  it('4. Attaches structured evidence provenance chain with classification tags', () => {
    const priority = calculateDevelopmentPriority(
      'hotspot-ev1',
      'ROADS',
      { requestCount: 12, velocityPerHour: 2.0 },
      sampleDemographics,
      sampleInfrastructure,
      sampleInvestment
    );

    expect(priority.evidence).toHaveLength(4);
    const classifications = priority.evidence.map(e => e.classification);
    expect(classifications).toContain('OBSERVED');
    expect(classifications).toContain('CALCULATED');
    expect(classifications).toContain('INFERRED');
    expect(classifications).toContain('RECOMMENDED');
  });
});
