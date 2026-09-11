import { describe, expect, it } from 'vitest';
import { generateDevelopmentProjectRecommendation } from '../developmentRecommendationEngine';
import { DemographicContext, DevelopmentGap, InfrastructureContext, InvestmentContext } from '../../types/development';

describe('Development Project Recommendation Engine', () => {
  const sampleDemographics: DemographicContext = {
    wardId: 'ward-karol-bagh',
    wardName: 'Karol Bagh',
    population: 100000,
    totalPopulationEstimate: 100000,
    vulnerablePopulation: 35000,
    vulnerableGroupRatio: 0.35,
    populationDensity: 12000,
    populationGrowth: 2.1,
    urbanizationRate: 95,
    youthPopulation: 30000,
    elderlyPopulation: 12000
  };

  const sampleInfrastructure: InfrastructureContext = {
    healthcareIndex: 30,
    educationIndex: 40,
    waterIndex: 25,
    sanitationIndex: 35,
    transportIndex: 50,
    electricityIndex: 60,
    digitalConnectivityIndex: 65,
    criticalAssetsNearby: [
      { id: 'asset-1', name: 'Karol Bagh Primary Clinic', type: 'HEALTHCARE', location: { lat: 28.65, lng: 77.19 } }
    ]
  };

  const sampleInvestment: InvestmentContext = {
    existingInvestment: 200,
    plannedInvestment: 600,
    activeProjects: 2,
    plannedProjects: 1,
    investmentByCategory: { HEALTHCARE: 200 },
    investmentGapLakhs: 400,
    unaddressedRequestsCount: 22
  };

  const sampleGap: DevelopmentGap = {
    overallGapIndex: 72,
    demandGapScore: 24,
    infrastructureDeficitScore: 20,
    demographicVulnerabilityScore: 14,
    investmentDeficitScore: 10,
    environmentalRiskScore: 4,
    explanationBullets: [
      'High citizen healthcare access requests',
      'Low healthcare infrastructure index (30/100)',
      'Substantial vulnerable population ratio (35%)',
      'Unfunded investment gap of ₹400 Lakhs'
    ]
  };

  it('generates Healthcare project recommendation with strict numerical alignment', () => {
    const rec = generateDevelopmentProjectRecommendation({
      hotspotId: 'hotspot-hc-1',
      category: 'HEALTHCARE',
      geography: {
        country: 'India',
        state: 'Delhi NCR',
        district: 'Central Delhi',
        wardOrDistrict: 'Karol Bagh',
        locationName: 'Karol Bagh'
      },
      priorityScoreVal: 84,
      developmentGap: sampleGap,
      demographics: sampleDemographics,
      infrastructure: sampleInfrastructure,
      investment: sampleInvestment,
      evidence: [
        {
          classification: 'OBSERVED',
          snippet: 'Nearest hospital 25 km away, need emergency clinic',
          source: 'Citizen Portal',
          confidence: 0.95
        }
      ],
      sourceMode: 'LIVE'
    });

    expect(rec.id).toBeDefined();
    expect(rec.title).toBe('District Healthcare Access Programme');
    expect(rec.category).toBe('HEALTHCARE');
    expect(rec.priorityScore).toBe(84);
    expect(rec.priorityLevel).toBe('P1_NATIONAL_HIGH_PRIORITY');
    expect(rec.expectedBeneficiaries).toBe(65000); // 65% of 100,000
    expect(rec.estimatedImpact.beneficiaryCount).toBe(65000);
    expect(rec.estimatedImpact.infrastructureIndexImprovement).toBe(61); // Math.round(72 * 0.85)
    expect(rec.estimatedCostLakhs).toBe(400);
    expect(rec.status).toBe('pending_policy_review');
    expect(rec.sourceMode).toBe('LIVE');
    expect(rec.implementationConsiderations.length).toBeGreaterThan(0);
  });

  it('generates Education project recommendation for Education category', () => {
    const rec = generateDevelopmentProjectRecommendation({
      hotspotId: 'hotspot-edu-1',
      category: 'EDUCATION',
      geography: {
        country: 'India',
        state: 'Delhi NCR',
        district: 'East Delhi',
        wardOrDistrict: 'Mayur Vihar'
      },
      priorityScoreVal: 65,
      developmentGap: { ...sampleGap, overallGapIndex: 55 },
      demographics: sampleDemographics,
      infrastructure: sampleInfrastructure,
      investment: sampleInvestment,
      evidence: [],
      sourceMode: 'SIMULATION'
    });

    expect(rec.title).toBe('District Secondary Education Capacity Programme');
    expect(rec.category).toBe('EDUCATION');
    expect(rec.priorityLevel).toBe('P2_STATE_PRIORITY');
    expect(rec.recommendedIntervention).toContain('secondary school');
  });

  it('generates Water project recommendation for Water category', () => {
    const rec = generateDevelopmentProjectRecommendation({
      hotspotId: 'hotspot-water-1',
      category: 'WATER',
      geography: {
        country: 'India',
        state: 'Delhi NCR',
        district: 'North Delhi',
        wardOrDistrict: 'Rohini'
      },
      priorityScoreVal: 90,
      developmentGap: { ...sampleGap, overallGapIndex: 82 },
      demographics: sampleDemographics,
      infrastructure: sampleInfrastructure,
      investment: sampleInvestment,
      evidence: [],
      sourceMode: 'SIMULATION'
    });

    expect(rec.title).toBe('Regional Drinking Water Reliability Programme');
    expect(rec.category).toBe('WATER');
    expect(rec.priorityLevel).toBe('P1_NATIONAL_HIGH_PRIORITY');
    expect(rec.recommendedIntervention).toContain('bulk water distribution pipeline');
  });
});
