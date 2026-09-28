/**
 * NagarBodh — Scenario Engine (Pass 1 Isolated What-If Foundation)
 *
 * Provides isolated, immutable what-if scenario calculations by constructing temporary
 * input overlays and executing NagarBodh's existing deterministic engines:
 * - developmentGapEngine
 * - developmentPriorityEngine
 * - developmentRecommendationEngine
 * - developmentImpactEngine
 *
 * CRITICAL RULE: This engine NEVER mutates underlying context, canonical incidents,
 * simulation state, or Firebase data.
 */

import { ClusteredIncident } from '../types/civic';
import {
  DemographicContext,
  InfrastructureContext,
  InvestmentContext
} from '../types/development';
import {
  MetricComparisonItem,
  ScenarioAnalysisResult,
  ScenarioValidationResult,
  SimulationScenario
} from '../types/simulationScenario';
import { calculateDevelopmentGap } from './developmentGapEngine';
import { calculateDevelopmentPriority, DemandScoreInput } from './developmentPriorityEngine';
import { generateDevelopmentProjectRecommendation } from './developmentRecommendationEngine';
import { calculateDevelopmentImpact } from './developmentImpactEngine';

/**
 * Validates a SimulationScenario object before execution.
 */
export function validateSimulationScenario(scenario: SimulationScenario): ScenarioValidationResult {
  const errors: string[] = [];

  if (!scenario) {
    return { isValid: false, errors: ['Scenario definition is missing'] };
  }

  if (!scenario.id || typeof scenario.id !== 'string') {
    errors.push('Scenario id must be a valid non-empty string');
  }

  if (!scenario.targetSectorId || typeof scenario.targetSectorId !== 'string') {
    errors.push('Scenario targetSectorId is required');
  }

  if (!Array.isArray(scenario.changes)) {
    errors.push('Scenario changes must be an array');
  } else {
    scenario.changes.forEach((change, index) => {
      const validTypes = [
        'POPULATION_PERCENT',
        'VULNERABLE_POPULATION_PERCENT',
        'SIGNAL_VOLUME_PERCENT',
        'INFRASTRUCTURE_INDEX_POINTS'
      ];

      if (!validTypes.includes(change.type)) {
        errors.push(`Change #${index + 1}: Unsupported change type '${change.type}'`);
      }

      if (typeof change.value !== 'number' || isNaN(change.value) || !isFinite(change.value)) {
        errors.push(`Change #${index + 1}: Numeric value is invalid`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Returns baseline sector context (Sector 15 default) matching canonical NagarBodh baseline.
 */
export function getBaselineSectorContext(
  targetSectorId: string = 'WATER',
  _incidents: ClusteredIncident[] = []
): {
  category: 'HEALTHCARE' | 'WATER' | 'TRANSPORT' | 'EDUCATION';
  label: string;
  wardName: string;
  demographics: DemographicContext;
  infrastructure: InfrastructureContext;
  investment: InvestmentContext;
  demandInput: DemandScoreInput;
} {
  const sectorUpper = (targetSectorId || 'WATER').toUpperCase();

  if (sectorUpper.includes('HEALTHCARE')) {
    return {
      category: 'HEALTHCARE',
      label: 'Healthcare Infrastructure',
      wardName: 'Ward 15 — Seelampur / Mayur Enclave',
      demographics: {
        population: 148000,
        populationDensity: 14200,
        populationGrowth: 1.5,
        urbanizationRate: 94,
        vulnerablePopulation: 38000,
        youthPopulation: 52000,
        elderlyPopulation: 18000,
        vulnerableGroupRatio: 0.256,
        vulnerabilityIndex: 85,
        wardName: 'Ward 15 — Seelampur / Mayur Enclave'
      },
      infrastructure: {
        healthcareIndex: 38,
        educationIndex: 45,
        waterIndex: 35,
        sanitationIndex: 40,
        transportIndex: 48,
        electricityIndex: 75,
        digitalConnectivityIndex: 85,
        infrastructureDeficitIndex: 62,
        nearestFacilityName: 'Government Secondary Hospital',
        nearestFacilityDistanceMeters: 28000,
        capacityUtilizationPercent: 88
      },
      investment: {
        existingInvestment: 250,
        plannedInvestment: 700,
        activeProjects: 2,
        plannedProjects: 1,
        investmentByCategory: { HEALTHCARE: 700 },
        investmentGapLakhs: 450,
        unaddressedRequestsCount: 18
      },
      demandInput: {
        requestCount: 14,
        velocityPerHour: 3.2,
        surgeMultiplier: 1.2
      }
    };
  }

  if (sectorUpper.includes('TRANSPORT')) {
    return {
      category: 'TRANSPORT',
      label: 'Public Transit & Arterials',
      wardName: 'Ward 08 — Rohini Sector 16',
      demographics: {
        population: 210000,
        populationDensity: 16800,
        populationGrowth: 1.8,
        urbanizationRate: 96,
        vulnerablePopulation: 42000,
        youthPopulation: 75000,
        elderlyPopulation: 26000,
        vulnerableGroupRatio: 0.20,
        vulnerabilityIndex: 72,
        wardName: 'Ward 08 — Rohini Sector 16'
      },
      infrastructure: {
        healthcareIndex: 75,
        educationIndex: 78,
        waterIndex: 60,
        sanitationIndex: 55,
        transportIndex: 48,
        electricityIndex: 82,
        digitalConnectivityIndex: 88,
        infrastructureDeficitIndex: 52,
        nearestFacilityName: 'Rohini West Feeder Terminal',
        nearestFacilityDistanceMeters: 2400,
        capacityUtilizationPercent: 85
      },
      investment: {
        existingInvestment: 320,
        plannedInvestment: 600,
        activeProjects: 2,
        plannedProjects: 2,
        investmentByCategory: { TRANSPORT: 600 },
        investmentGapLakhs: 280,
        unaddressedRequestsCount: 16
      },
      demandInput: {
        requestCount: 10,
        velocityPerHour: 2.8,
        surgeMultiplier: 1.1
      }
    };
  }

  if (sectorUpper.includes('EDUCATION')) {
    return {
      category: 'EDUCATION',
      label: 'Primary School Infrastructure',
      wardName: 'Ward 24 — Dwarka Sector 12',
      demographics: {
        population: 92000,
        populationDensity: 12000,
        populationGrowth: 1.4,
        urbanizationRate: 92,
        vulnerablePopulation: 22000,
        youthPopulation: 38000,
        elderlyPopulation: 12000,
        vulnerableGroupRatio: 0.239,
        vulnerabilityIndex: 68,
        wardName: 'Ward 24 — Dwarka Sector 12'
      },
      infrastructure: {
        healthcareIndex: 80,
        educationIndex: 55,
        waterIndex: 65,
        sanitationIndex: 60,
        transportIndex: 70,
        electricityIndex: 78,
        digitalConnectivityIndex: 92,
        infrastructureDeficitIndex: 45,
        nearestFacilityName: 'Primary School Annex',
        nearestFacilityDistanceMeters: 1400,
        capacityUtilizationPercent: 78
      },
      investment: {
        existingInvestment: 170,
        plannedInvestment: 350,
        activeProjects: 1,
        plannedProjects: 1,
        investmentByCategory: { EDUCATION: 350 },
        investmentGapLakhs: 180,
        unaddressedRequestsCount: 12
      },
      demandInput: {
        requestCount: 6,
        velocityPerHour: 1.5,
        surgeMultiplier: 1.0
      }
    };
  }

  // Default: Sector 15 Water & Urban Drainage (Canonical Sector 15 baseline)
  return {
    category: 'WATER',
    label: 'Water & Urban Drainage',
    wardName: 'Ward 15 — Sector 15 / Laxmi Nagar Dip',
    demographics: {
      population: 184000,
      populationDensity: 18400,
      populationGrowth: 1.6,
      urbanizationRate: 98,
      vulnerablePopulation: 45000,
      youthPopulation: 64000,
      elderlyPopulation: 22000,
      populationImpactIndex: 95,
      vulnerabilityIndex: 91,
      vulnerableGroupRatio: 0.244565, // ~24.5%
      wardName: 'Ward 15 — Sector 15 / Laxmi Nagar Dip'
    },
    infrastructure: {
      healthcareIndex: 70,
      educationIndex: 80,
      waterIndex: 35,
      sanitationIndex: 45,
      transportIndex: 75,
      electricityIndex: 80,
      digitalConnectivityIndex: 90,
      infrastructureDeficitIndex: 94,
      nearestFacilityName: 'Trunk Drain Outfall #4',
      nearestFacilityDistanceMeters: 1800,
      capacityUtilizationPercent: 98
    },
    investment: {
      existingInvestment: 200,
      plannedInvestment: 550,
      activeProjects: 1,
      plannedProjects: 1,
      investmentByCategory: { WATER: 550 },
      investmentGapIndex: 93,
      investmentGapLakhs: 350,
      unaddressedRequestsCount: 22
    },
    demandInput: {
      requestCount: 32,
      velocityPerHour: 11.5,
      surgeMultiplier: 4.5,
      channelCount: 4,
      averageIntensity: 0.96
    }
  };
}

/**
 * Runs a Scenario Analysis without modifying any baseline context or canonical objects.
 */
export function runSimulationScenario(
  scenario: SimulationScenario,
  mode: 'LIVE' | 'REPLAY' | 'SIMULATION' = 'SIMULATION',
  incidents: ClusteredIncident[] = []
): ScenarioAnalysisResult {
  const validation = validateSimulationScenario(scenario);
  if (!validation.isValid) {
    throw new Error(`Invalid Simulation Scenario: ${validation.errors.join('; ')}`);
  }

  // 1. Resolve immutable baseline context
  const baselineContext = getBaselineSectorContext(scenario.targetSectorId, incidents);
  const { category, label: targetSectorLabel, wardName } = baselineContext;

  // 2. Calculate BASELINE using authoritative deterministic engines
  const baseGap = calculateDevelopmentGap(
    category.toLowerCase() as any,
    baselineContext.demandInput.requestCount,
    baselineContext.demandInput.velocityPerHour,
    baselineContext.demographics,
    baselineContext.infrastructure,
    baselineContext.investment
  );

  const basePriority = calculateDevelopmentPriority(
    `baseline-${category.toLowerCase()}`,
    category,
    baselineContext.demandInput,
    baselineContext.demographics,
    baselineContext.infrastructure,
    baselineContext.investment
  );

  const baseRec = generateDevelopmentProjectRecommendation({
    hotspotId: `baseline-hotspot-${category.toLowerCase()}`,
    category,
    geography: {
      country: 'India',
      state: 'Delhi NCR',
      district: wardName,
      wardOrDistrict: wardName,
      locationName: wardName
    },
    priorityScoreVal: basePriority.priorityScore,
    developmentGap: baseGap,
    demographics: baselineContext.demographics,
    infrastructure: baselineContext.infrastructure,
    investment: baselineContext.investment,
    evidence: []
  });

  const baseDevContext = {
    id: `context-baseline-${category.toLowerCase()}`,
    hierarchy: {
      countryCode: 'IN',
      country: 'India',
      state: 'Delhi NCR',
      district: wardName
    },
    demographic: baselineContext.demographics,
    infrastructure: baselineContext.infrastructure,
    investment: baselineContext.investment,
    provenance: {
      source: `NagarBodh Baseline (${wardName})`,
      mode,
      timestamp: new Date().toISOString(),
      freshness: 'Baseline',
      coverage: 'Ward Level',
      confidence: 1.0
    }
  };

  const baseImpact = calculateDevelopmentImpact({
    project: baseRec,
    context: baseDevContext,
    mode
  });

  const baselineInfraIndex = category === 'HEALTHCARE'
    ? (baselineContext.infrastructure.healthcareIndex ?? 38)
    : category === 'WATER'
    ? (baselineContext.infrastructure.waterIndex ?? 35)
    : category === 'TRANSPORT'
    ? (baselineContext.infrastructure.transportIndex ?? 48)
    : (baselineContext.infrastructure.educationIndex ?? 55);

  const baselineVulnRatioPercent = Number(
    ((baselineContext.demographics.vulnerablePopulation / baselineContext.demographics.population) * 100).toFixed(1)
  );

  const baselineSummary = {
    population: baselineContext.demographics.population,
    vulnerablePopulation: baselineContext.demographics.vulnerablePopulation,
    vulnerableRatioPercent: baselineVulnRatioPercent,
    vulnerabilityIndex: baselineContext.demographics.vulnerabilityIndex ?? 91,
    requestCount: baselineContext.demandInput.requestCount,
    velocityPerHour: baselineContext.demandInput.velocityPerHour,
    infraIndex: baselineInfraIndex,
    demandScore: basePriority.demandScore,
    infrastructureDeficitScore: baseGap.infrastructureDeficitScore,
    demographicVulnerabilityScore: baseGap.demographicVulnerabilityScore,
    investmentDeficitScore: baseGap.investmentDeficitScore,
    priorityScore: basePriority.priorityScore,
    priorityLevel: basePriority.priorityLevel,
    investmentGapLakhs: baseRec.estimatedCostLakhs || baselineContext.investment.investmentGapLakhs || 350,
    projectedImpactScore: baseImpact.impactScore
  };

  // 3. Create isolated TEMPORARY OVERLAY data copies (Deep Copy)
  const tempDemographics: DemographicContext = { ...baselineContext.demographics };
  const tempInfrastructure: InfrastructureContext = { ...baselineContext.infrastructure };
  const tempInvestment: InvestmentContext = { ...baselineContext.investment };
  const tempDemandInput: DemandScoreInput = { ...baselineContext.demandInput };

  // 4. Apply temporary scenario changes to overlay
  scenario.changes.forEach(change => {
    if (change.type === 'POPULATION_PERCENT') {
      const mult = 1 + change.value / 100;
      const newPop = Math.max(100, Math.round(baselineContext.demographics.population * mult));
      const ratio = baselineContext.demographics.vulnerableGroupRatio ??
        (baselineContext.demographics.vulnerablePopulation / baselineContext.demographics.population);
      tempDemographics.population = newPop;
      tempDemographics.vulnerablePopulation = Math.min(newPop, Math.round(newPop * ratio));
    } else if (change.type === 'VULNERABLE_POPULATION_PERCENT') {
      const mult = 1 + change.value / 100;
      const newVuln = Math.min(
        tempDemographics.population,
        Math.max(0, Math.round(baselineContext.demographics.vulnerablePopulation * mult))
      );
      tempDemographics.vulnerablePopulation = newVuln;
      tempDemographics.vulnerableGroupRatio = tempDemographics.population > 0
        ? newVuln / tempDemographics.population
        : 0.25;
      tempDemographics.vulnerabilityIndex = Math.min(
        100,
        Math.max(10, Math.round((newVuln / tempDemographics.population) * 100 * 3.7))
      );
    } else if (change.type === 'SIGNAL_VOLUME_PERCENT') {
      const mult = 1 + change.value / 100;
      const newCount = Math.max(0, Math.round(baselineContext.demandInput.requestCount * mult));
      const newVelocity = Math.max(0, Number((baselineContext.demandInput.velocityPerHour * mult).toFixed(1)));
      tempDemandInput.requestCount = newCount;
      tempDemandInput.velocityPerHour = newVelocity;
    } else if (change.type === 'INFRASTRUCTURE_INDEX_POINTS') {
      const ptChange = change.value; // e.g. -10
      if (category === 'WATER') {
        tempInfrastructure.waterIndex = Math.min(100, Math.max(0, (tempInfrastructure.waterIndex ?? 35) + ptChange));
      } else if (category === 'HEALTHCARE') {
        tempInfrastructure.healthcareIndex = Math.min(100, Math.max(0, (tempInfrastructure.healthcareIndex ?? 38) + ptChange));
      } else if (category === 'TRANSPORT') {
        tempInfrastructure.transportIndex = Math.min(100, Math.max(0, (tempInfrastructure.transportIndex ?? 48) + ptChange));
      } else if (category === 'EDUCATION') {
        tempInfrastructure.educationIndex = Math.min(100, Math.max(0, (tempInfrastructure.educationIndex ?? 55) + ptChange));
      }

      const currentDeficit = tempInfrastructure.infrastructureDeficitIndex ?? 65;
      tempInfrastructure.infrastructureDeficitIndex = Math.min(100, Math.max(0, currentDeficit - ptChange));
    }
  });

  // 5. Run authoritative deterministic engines on TEMPORARY OVERLAY
  const scenGap = calculateDevelopmentGap(
    category.toLowerCase() as any,
    tempDemandInput.requestCount,
    tempDemandInput.velocityPerHour,
    tempDemographics,
    tempInfrastructure,
    tempInvestment
  );

  const scenPriority = calculateDevelopmentPriority(
    `scenario-${category.toLowerCase()}`,
    category,
    tempDemandInput,
    tempDemographics,
    tempInfrastructure,
    tempInvestment
  );

  const scenRec = generateDevelopmentProjectRecommendation({
    hotspotId: `scenario-hotspot-${category.toLowerCase()}`,
    category,
    geography: {
      country: 'India',
      state: 'Delhi NCR',
      district: wardName,
      wardOrDistrict: wardName,
      locationName: wardName
    },
    priorityScoreVal: scenPriority.priorityScore,
    developmentGap: scenGap,
    demographics: tempDemographics,
    infrastructure: tempInfrastructure,
    investment: tempInvestment,
    evidence: []
  });

  const scenDevContext = {
    id: `context-scenario-${category.toLowerCase()}`,
    hierarchy: {
      countryCode: 'IN',
      country: 'India',
      state: 'Delhi NCR',
      district: wardName
    },
    demographic: tempDemographics,
    infrastructure: tempInfrastructure,
    investment: tempInvestment,
    provenance: {
      source: `NagarBodh Scenario Overlay (${wardName})`,
      mode,
      timestamp: new Date().toISOString(),
      freshness: 'Scenario Overlay',
      coverage: 'Ward Level',
      confidence: 1.0
    }
  };

  const scenImpact = calculateDevelopmentImpact({
    project: scenRec,
    context: scenDevContext,
    mode
  });

  const scenInfraIndex = category === 'HEALTHCARE'
    ? (tempInfrastructure.healthcareIndex ?? 38)
    : category === 'WATER'
    ? (tempInfrastructure.waterIndex ?? 35)
    : category === 'TRANSPORT'
    ? (tempInfrastructure.transportIndex ?? 48)
    : (tempInfrastructure.educationIndex ?? 55);

  const scenVulnRatioPercent = Number(
    ((tempDemographics.vulnerablePopulation / tempDemographics.population) * 100).toFixed(1)
  );

  const scenarioSummary = {
    population: tempDemographics.population,
    vulnerablePopulation: tempDemographics.vulnerablePopulation,
    vulnerableRatioPercent: scenVulnRatioPercent,
    vulnerabilityIndex: tempDemographics.vulnerabilityIndex ?? 91,
    requestCount: tempDemandInput.requestCount,
    velocityPerHour: tempDemandInput.velocityPerHour,
    infraIndex: scenInfraIndex,
    demandScore: scenPriority.demandScore,
    infrastructureDeficitScore: scenGap.infrastructureDeficitScore,
    demographicVulnerabilityScore: scenGap.demographicVulnerabilityScore,
    investmentDeficitScore: scenGap.investmentDeficitScore,
    priorityScore: scenPriority.priorityScore,
    priorityLevel: scenPriority.priorityLevel,
    investmentGapLakhs: scenRec.estimatedCostLakhs || tempInvestment.investmentGapLakhs || 350,
    projectedImpactScore: scenImpact.impactScore
  };

  // 6. Calculate deltas
  const deltas = {
    populationDelta: scenarioSummary.population - baselineSummary.population,
    vulnerablePopulationDelta: scenarioSummary.vulnerablePopulation - baselineSummary.vulnerablePopulation,
    requestCountDelta: scenarioSummary.requestCount - baselineSummary.requestCount,
    infraIndexDelta: scenarioSummary.infraIndex - baselineSummary.infraIndex,
    priorityScoreDelta: scenarioSummary.priorityScore - baselineSummary.priorityScore,
    investmentGapDeltaLakhs: scenarioSummary.investmentGapLakhs - baselineSummary.investmentGapLakhs,
    projectedImpactScoreDelta: scenarioSummary.projectedImpactScore - baselineSummary.projectedImpactScore
  };

  // 7. Structured Comparison Items with explicit provenance
  const comparisonItems: MetricComparisonItem[] = [
    {
      id: 'priority_score',
      label: 'Development Priority Score',
      baseline: baselineSummary.priorityScore,
      scenario: scenarioSummary.priorityScore,
      delta: deltas.priorityScoreDelta,
      unit: '/100',
      provenance: '[CALCULATED]',
      isImprovement: deltas.priorityScoreDelta <= 0
    },
    {
      id: 'population',
      label: 'Total Sector Population',
      baseline: baselineSummary.population,
      scenario: scenarioSummary.population,
      delta: deltas.populationDelta,
      unit: ' citizens',
      provenance: '[SIMULATION]'
    },
    {
      id: 'vulnerable_population',
      label: 'Vulnerable Population',
      baseline: baselineSummary.vulnerablePopulation,
      scenario: scenarioSummary.vulnerablePopulation,
      delta: deltas.vulnerablePopulationDelta,
      unit: ' citizens',
      provenance: '[SIMULATION]'
    },
    {
      id: 'request_count',
      label: 'Demand Signal Volume',
      baseline: baselineSummary.requestCount,
      scenario: scenarioSummary.requestCount,
      delta: deltas.requestCountDelta,
      unit: ' signals',
      provenance: '[SIMULATION]'
    },
    {
      id: 'infra_index',
      label: 'Infrastructure Adequacy Index',
      baseline: baselineSummary.infraIndex,
      scenario: scenarioSummary.infraIndex,
      delta: deltas.infraIndexDelta,
      unit: '/100',
      provenance: '[SIMULATION]',
      isImprovement: deltas.infraIndexDelta > 0
    },
    {
      id: 'investment_gap',
      label: 'Required CapEx Investment',
      baseline: baselineSummary.investmentGapLakhs,
      scenario: scenarioSummary.investmentGapLakhs,
      delta: deltas.investmentGapDeltaLakhs,
      unit: ' Lakhs',
      provenance: '[CALCULATED]'
    },
    {
      id: 'projected_impact',
      label: 'Projected Post-Intervention Impact',
      baseline: baselineSummary.projectedImpactScore,
      scenario: scenarioSummary.projectedImpactScore,
      delta: deltas.projectedImpactScoreDelta,
      unit: '/100',
      provenance: '[PROJECTED]',
      isImprovement: deltas.projectedImpactScoreDelta > 0
    }
  ];

  return {
    scenario,
    mode,
    targetSectorId: scenario.targetSectorId,
    targetSectorLabel,
    wardName,
    baseline: baselineSummary,
    scenarioResult: scenarioSummary,
    deltas,
    comparisonItems,
    provenance: {
      source: `NagarBodh Authoritative Baseline (${wardName})`,
      overlay: mode === 'LIVE' ? '[LIVE_OVERLAY]' : '[SIMULATION]',
      engine: '[CALCULATED]',
      projection: '[PROJECTED]'
    }
  };
}
