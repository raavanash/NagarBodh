import { describe, it, expect } from 'vitest';
import {
  extractAllowedNumbers,
  validateDecisionBriefOutput,
  buildDeterministicDecisionBrief,
  buildGroundedInputFromDossier,
  generateDecisionBrief
} from '../decisionBriefEngine';
import { GroundedDecisionBriefInput } from '../../types/decisionBrief';
import { buildInvestmentExplanationDossier } from '../developmentGapEngine';
import { calculateDevelopmentImpact } from '../developmentImpactEngine';
import { generateDevelopmentProjectRecommendation } from '../developmentRecommendationEngine';
import { clusterSignals } from '../clusteringEngine';
import { BASELINE_SIGNALS } from '../../data/initialData';
import { ClusteredIncident } from '../../types/civic';

describe('Grounded Executive Decision Brief Engine & Data-Contract Gate', () => {
  const initialIncidents: ClusteredIncident[] = clusterSignals(BASELINE_SIGNALS).incidents;

  const mockSurgeIncident: ClusteredIncident = {
    id: 'inc-sector15-surge',
    title: 'Sector 15 Flash Flood Emergency',
    category: 'waterlogging',
    ward: 'Ward 15 — Sector 15 / Laxmi Nagar Dip',
    signalIds: Array.from({ length: 32 }, (_, i) => `sig-flood-s15-${i}`),
    signalsCount: 32,
    velocityPerHour: 11.5,
    velocitySurgePercent: 350,
    priority: { overallScore: 94, severity: 'p1', urgency: 'critical', confidence: 0.98 },
    status: 'triaged',
    location: { lat: 28.5830, lng: 77.3182, address: 'Sector 15 Underpass Incline' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const advancedIncidents: ClusteredIncident[] = [
    ...initialIncidents.filter(i => i.id !== 'inc-sector15-surge'),
    mockSurgeIncident
  ];

  const mockGroundedInput: GroundedDecisionBriefInput = {
    incidentId: 'incident-ward-15-central-sub-city-waterlogging',
    gapId: 'gap-water',
    signalEvidence: {
      requestCount: 32,
      velocityPerHour: 11.5,
      surgeMultiplier: 4.5,
      channels: ['citizen_report', 'bluesky_social', 'iot_sensor'],
      locationName: 'Ward 15 / Sector 15',
      ward: 'Ward 15',
      district: 'East Delhi'
    },
    infrastructure: {
      infrastructureDeficitIndex: 94,
      nearestFacilityName: 'Ward 15 Pumping Station',
      nearestFacilityDistanceMeters: 1200,
      capacityUtilizationPercent: 92
    },
    demographics: {
      totalPopulation: 184000,
      vulnerablePopulation: 45000,
      vulnerableGroupRatio: 0.245,
      vulnerabilityIndex: 91
    },
    priority: {
      overallScore: 94,
      priorityLevel: 'Level P1 (Score 94)',
      formulaExplanation: 'Deterministic 5-factor weighted calculation: 25% Demand + 25% Infrastructure + 20% Population + 15% Vulnerability + 15% Investment Gap',
      factors: [
        { name: 'Citizen Demand', rawScore: 95, weightPercent: 25, contributionPoints: 23.8, evidence: '32 citizen requests (11.5 req/hr)' },
        { name: 'Infrastructure Deficit', rawScore: 94, weightPercent: 25, contributionPoints: 23.5, evidence: 'Deficit Index 94/100, 92% capacity' },
        { name: 'Population Impact', rawScore: 95, weightPercent: 20, contributionPoints: 19.0, evidence: '184,000 area population' },
        { name: 'Vulnerable Population', rawScore: 91, weightPercent: 15, contributionPoints: 13.7, evidence: 'Vulnerability Index 91/100, 45,000 residents (24.5%)' },
        { name: 'Investment Gap', rawScore: 93, weightPercent: 15, contributionPoints: 14.0, evidence: 'Unfunded gap of ₹350 Lakhs' }
      ]
    },
    investment: {
      projectTitle: 'Sub-surface Automated Stormwater Pumping Array',
      category: 'DRAINAGE',
      categoryLabel: 'Urban Drainage & Flood Mitigation',
      recommendedIntervention: 'Install high-capacity sub-surface stormwater retention array with automated telemetry pumping to prevent underpass submersion.',
      estimatedCostLakhs: 350,
      investmentGapLakhs: 350,
      leadDepartment: 'Department of Public Works (PWD)',
      implementationConsiderations: ['Underground utility mapping required']
    },
    impact: {
      demandPressureChangePoints: -37,
      infrastructureIndexChangePoints: 29,
      serviceAccessChangePoints: 30,
      travelDistanceReductionPercent: -40,
      impactScore: 84
    },
    dataMode: 'SIMULATION',
    provenance: {
      dataSource: 'NagarBodh Civic Intelligence & Deterministic Scoring Engine',
      isSimulated: true,
      evidenceSnippets: [
        '32 multi-channel citizen signals with 11.5/hr surge velocity [OBSERVED]',
        '45cm underpass inundation telemetry at NH-48 feeder junction [OBSERVED]',
        'Trunk Drain #4 outfall capacity at 92% utilization [BASELINE CONTEXT]',
        'Priority 94/100 calculated by 5-factor deterministic model [CALCULATED]'
      ]
    },
    // Direct Semantic Shortcuts
    category: 'DRAINAGE',
    categoryLabel: 'Urban Drainage & Flood Mitigation',
    locationName: 'Ward 15 / Sector 15',
    ward: 'Ward 15',
    district: 'East Delhi',
    citizenSignalCount: 32,
    signalVelocityPerHour: 11.5,
    infrastructureDeficitIndex: 94,
    populationContext: 184000,
    vulnerablePopulationCount: 45000,
    vulnerableGroupRatio: 0.245,
    vulnerabilityIndex: 91,
    investmentGapLakhs: 350,
    priorityScore: 94,
    priorityLevel: 'Level P1 (Score 94)',
    projectTitle: 'Sub-surface Automated Stormwater Pumping Array',
    estimatedCostLakhs: 350,
    recommendedIntervention: 'Install high-capacity sub-surface stormwater retention array with automated telemetry pumping to prevent underpass submersion.',
    projectedImpact: {
      demandPressureChangePoints: -37,
      infrastructureIndexChangePoints: 29,
      serviceAccessChangePoints: 30,
      travelDistanceReductionPercent: -40,
      impactScore: 84
    }
  };

  it('1. semantic field names distinguish index points from percentages', () => {
    // Points-based fields
    expect(mockGroundedInput.impact.demandPressureChangePoints).toBe(-37);
    expect(mockGroundedInput.impact.infrastructureIndexChangePoints).toBe(29);
    expect(mockGroundedInput.impact.serviceAccessChangePoints).toBe(30);
    expect(mockGroundedInput.impact.impactScore).toBe(84);

    // Percentage fields
    expect(mockGroundedInput.impact.travelDistanceReductionPercent).toBe(-40);
    expect(mockGroundedInput.demographics.vulnerableGroupRatio).toBe(0.245); // 24.5%

    // Verify deterministic brief uses correct units
    const brief = buildDeterministicDecisionBrief(mockGroundedInput);
    expect(brief.expectedOutcome).toContain('-37 pts');
    expect(brief.expectedOutcome).toContain('+29 pts');
    expect(brief.expectedOutcome).toContain('+30 pts');
    expect(brief.expectedOutcome).toContain('40%');
    expect(brief.expectedOutcome).toContain('84/100');
  });

  it('2. raw score vs weighted contribution distinction is explicitly maintained', () => {
    const factors = mockGroundedInput.priority.factors;
    expect(factors).toHaveLength(5);

    // Factor 1: Citizen Demand
    const demandFactor = factors.find(f => f.name.includes('Demand'));
    expect(demandFactor).toBeDefined();
    expect(demandFactor!.rawScore).toBe(95); // 0-100 raw score
    expect(demandFactor!.weightPercent).toBe(25); // 25% weight
    expect(demandFactor!.contributionPoints).toBe(23.8); // 23.8 points

    // Factor 2: Infrastructure Deficit
    const infraFactor = factors.find(f => f.name.includes('Infrastructure'));
    expect(infraFactor).toBeDefined();
    expect(infraFactor!.rawScore).toBe(94);
    expect(infraFactor!.weightPercent).toBe(25);
    expect(infraFactor!.contributionPoints).toBe(23.5);

    // Factor 3: Population Impact
    const popFactor = factors.find(f => f.name.includes('Population Impact'));
    expect(popFactor).toBeDefined();
    expect(popFactor!.rawScore).toBe(95);
    expect(popFactor!.weightPercent).toBe(20);
    expect(popFactor!.contributionPoints).toBe(19.0);

    // Factor 4: Vulnerable Population
    const vulnFactor = factors.find(f => f.name.includes('Vulnerable'));
    expect(vulnFactor).toBeDefined();
    expect(vulnFactor!.rawScore).toBe(91);
    expect(vulnFactor!.weightPercent).toBe(15);
    expect(vulnFactor!.contributionPoints).toBe(13.7);

    // Factor 5: Investment Gap
    const investFactor = factors.find(f => f.name.includes('Investment'));
    expect(investFactor).toBeDefined();
    expect(investFactor!.rawScore).toBe(93);
    expect(investFactor!.weightPercent).toBe(15);
    expect(investFactor!.contributionPoints).toBe(14.0);

    // Total points sum to overall priority score
    const sumContributions = Math.round(factors.reduce((acc, f) => acc + f.contributionPoints, 0));
    expect(sumContributions).toBe(94);
    expect(mockGroundedInput.priority.overallScore).toBe(94);
  });

  it('3. canonical impact score consistency (84 across engine, dossier, and brief)', () => {
    const demographics = {
      population: 184000,
      totalPopulationEstimate: 184000,
      vulnerablePopulation: 45000,
      vulnerableGroupRatio: 0.245,
      populationDensity: 14000,
      populationGrowth: 2.3,
      urbanizationRate: 98,
      youthPopulation: 42000,
      elderlyPopulation: 16000
    };

    const infrastructure = {
      healthcareIndex: 50,
      educationIndex: 60,
      waterIndex: 35,
      sanitationIndex: 30,
      transportIndex: 40,
      electricityIndex: 70,
      digitalConnectivityIndex: 80,
      nearestFacilityDistanceMeters: 5000,
      criticalAssetsNearby: []
    };

    const rec = generateDevelopmentProjectRecommendation({
      hotspotId: 'hotspot-sec15-drainage',
      category: 'DRAINAGE',
      geography: {
        country: 'India',
        state: 'Delhi NCR',
        district: 'Ward 15 / Sector 15',
        wardOrDistrict: 'Ward 15 / Sector 15',
        locationName: 'Ward 15 / Sector 15'
      },
      priorityScoreVal: 94,
      developmentGap: {
        overallGapIndex: 82,
        demandGapScore: 28,
        infrastructureDeficitScore: 24,
        demographicVulnerabilityScore: 16,
        investmentDeficitScore: 10,
        environmentalRiskScore: 4,
        explanationBullets: []
      },
      demographics,
      infrastructure,
      investment: {
        existingInvestment: 150,
        plannedInvestment: 500,
        activeProjects: 1,
        plannedProjects: 1,
        investmentByCategory: { WATER: 150 },
        investmentGapLakhs: 350,
        unaddressedRequestsCount: 32
      },
      evidence: [],
      sourceMode: 'SIMULATION'
    });

    const calculatedImpact = calculateDevelopmentImpact({
      project: rec,
      context: {
        demographic: demographics,
        infrastructure,
        investment: {
          existingInvestment: 150,
          plannedInvestment: 500,
          activeProjects: 1,
          plannedProjects: 1,
          investmentByCategory: { WATER: 150 },
          investmentGapLakhs: 350,
          unaddressedRequestsCount: 32
        },
        source: 'Civic Context Registry',
        mode: 'SIMULATION'
      } as any,
      mode: 'SIMULATION'
    });

    // 1. Engine output with context
    expect(calculatedImpact.impactScore).toBe(84);

    // 2. Dossier output
    const dossier = buildInvestmentExplanationDossier('WATER', advancedIncidents);
    expect(dossier.projectedOutcome.impactScore).toBe(84);

    // 3. Grounded Decision Brief input
    const groundedInput = buildGroundedInputFromDossier(dossier);
    expect(groundedInput.impact.impactScore).toBe(84);
    expect(groundedInput.projectedImpact.impactScore).toBe(84);

    // 4. Fallback Decision Brief output
    const brief = buildDeterministicDecisionBrief(groundedInput);
    expect(brief.expectedOutcome).toContain('84/100');
  });

  it('4. canonical signal count consistency (32 for Sector 15 Surge)', () => {
    const dossier = buildInvestmentExplanationDossier('WATER', advancedIncidents);

    // In Sector 15 flash flood surge, observed count is 32
    expect(dossier.problemSignal.requestCount).toBe(32);

    const groundedInput = buildGroundedInputFromDossier(dossier);
    expect(groundedInput.signalEvidence.requestCount).toBe(32);
    expect(groundedInput.citizenSignalCount).toBe(32);

    const brief = buildDeterministicDecisionBrief(groundedInput);
    expect(brief.problem).toContain('32');
  });

  it('5. dossier → Gemini grounding payload consistency (strict non-lossy mapping)', () => {
    const dossier = buildInvestmentExplanationDossier('WATER', advancedIncidents);
    const groundedInput = buildGroundedInputFromDossier(dossier);

    expect(groundedInput.gapId).toBe(dossier.gapId);
    expect(groundedInput.category).toBe(dossier.category);
    expect(groundedInput.categoryLabel).toBe(dossier.categoryLabel);
    expect(groundedInput.ward).toBe(dossier.ward);
    expect(groundedInput.priorityScore).toBe(dossier.priorityCalculation.overallScore);
    expect(groundedInput.estimatedCostLakhs).toBe(dossier.capitalRequirement.estimatedCostLakhs);
    expect(groundedInput.projectTitle).toBe(dossier.capitalRequirement.recommendedProjectTitle);
    expect(groundedInput.populationContext).toBe(dossier.affectedPopulation.totalEstimate);
    expect(groundedInput.vulnerablePopulationCount).toBe(dossier.affectedPopulation.vulnerableEstimate);
    expect(groundedInput.vulnerabilityIndex).toBe(dossier.affectedPopulation.vulnerabilityScore);
    expect(groundedInput.impact.demandPressureChangePoints).toBe(dossier.projectedOutcome.demandPressureDrop);
    expect(groundedInput.impact.infrastructureIndexChangePoints).toBe(dossier.projectedOutcome.infrastructureIndexGain);
    expect(groundedInput.impact.travelDistanceReductionPercent).toBe(dossier.projectedOutcome.travelDistanceReductionPercent);
    expect(groundedInput.impact.serviceAccessChangePoints).toBe(dossier.projectedOutcome.serviceAccessGain);
    expect(groundedInput.impact.impactScore).toBe(dossier.projectedOutcome.impactScore);
  });

  it('6. Gemini and fallback consume the exact same GroundedDecisionBriefInput contract', async () => {
    const brief = buildDeterministicDecisionBrief(mockGroundedInput);

    expect(brief.model).toBe('DETERMINISTIC FALLBACK');
    expect(brief.sections).toHaveLength(8);
    expect(brief.problem).toContain('Ward 15');
    expect(brief.problem).toContain('32');
    expect(brief.whyItMatters).toContain(mockGroundedInput.populationContext.toLocaleString());
    expect(brief.whyItMatters).toContain(mockGroundedInput.vulnerablePopulationCount.toLocaleString());
    expect(brief.evidence).toContain('94/100');
    expect(brief.recommendation).toContain('Sub-surface Automated Stormwater Pumping Array');
    expect(brief.capitalRequirement).toContain('₹350 Lakhs');
    expect(brief.expectedOutcome).toContain('-37 pts');
    expect(brief.expectedOutcome).toContain('+29 pts');
    expect(brief.expectedOutcome).toContain('+30 pts');
    expect(brief.expectedOutcome).toContain('40%');
    expect(brief.expectedOutcome).toContain('84/100');

    // Calling async generator without API key uses deterministic fallback
    const asyncBrief = await generateDecisionBrief(mockGroundedInput);
    expect(asyncBrief.model).toBe('DETERMINISTIC FALLBACK');
    expect(asyncBrief.problem).toBe(brief.problem);
    expect(asyncBrief.expectedOutcome).toBe(brief.expectedOutcome);
  });

  it('7. unit validator catches point vs percentage violations', () => {
    const badBrief1 = {
      problem: 'Waterlogging in Ward 15',
      whyItMatters: '91% vulnerable population in area',
      evidence: 'Priority 94/100',
      recommendation: 'Sub-surface Automated Stormwater Pumping Array',
      capitalRequirement: '₹350 Lakhs',
      expectedOutcome: '37% reduction in demand pressure and 29% gain in infrastructure',
      caveats: 'Simulation data',
      decision: 'Approve'
    };

    const res1 = validateDecisionBriefOutput(badBrief1, mockGroundedInput);
    expect(res1.valid).toBe(false);
    expect(res1.violations.some(v => v.includes('37% instead of -37 index points'))).toBe(true);
    expect(res1.violations.some(v => v.includes('29% instead of +29 index points'))).toBe(true);
    expect(res1.violations.some(v => v.includes('91% vulnerable population ratio'))).toBe(true);
  });

  it('8. brief generation causes zero side-effects on underlying domain state', async () => {
    const inputSnapshot = JSON.parse(JSON.stringify(mockGroundedInput));
    
    // Generate brief
    const output = await generateDecisionBrief(mockGroundedInput);
    expect(output).toBeDefined();

    // Verify input object was never mutated
    expect(mockGroundedInput).toEqual(inputSnapshot);
  });
});
