/**
 * NagarBodh — Scenario Lab Types (Pass 1 Foundation)
 *
 * Defines the typed structures for isolated, non-mutating what-if scenario analysis.
 */

export type ScenarioChangeType =
  | 'POPULATION_PERCENT'
  | 'VULNERABLE_POPULATION_PERCENT'
  | 'SIGNAL_VOLUME_PERCENT'
  | 'INFRASTRUCTURE_INDEX_POINTS';

export interface ScenarioChange {
  type: ScenarioChangeType;
  value: number; // e.g. +15 for percentage, -10 for points
}

export interface SimulationScenario {
  id: string;
  targetSectorId: string; // e.g. "WATER" (Sector 15), "HEALTHCARE", "TRANSPORT", "EDUCATION"
  title?: string;
  description?: string;
  changes: ScenarioChange[];
  timestamp?: string;
}

export interface ScenarioValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface MetricComparisonItem {
  id: string;
  label: string;
  baseline: number;
  scenario: number;
  delta: number;
  unit: string;
  provenance: '[SIMULATION]' | '[CALCULATED]' | '[PROJECTED]' | '[LIVE]';
  isImprovement?: boolean;
}

export interface ScenarioAnalysisResult {
  scenario: SimulationScenario;
  mode: 'LIVE' | 'REPLAY' | 'SIMULATION';
  targetSectorId: string;
  targetSectorLabel: string;
  wardName: string;

  // Authoritative Baseline metrics
  baseline: {
    population: number;
    vulnerablePopulation: number;
    vulnerableRatioPercent: number;
    vulnerabilityIndex: number;
    requestCount: number;
    velocityPerHour: number;
    infraIndex: number;
    demandScore: number;
    infrastructureDeficitScore: number;
    demographicVulnerabilityScore: number;
    investmentDeficitScore: number;
    priorityScore: number;
    priorityLevel: string;
    investmentGapLakhs: number;
    projectedImpactScore: number;
  };

  // Temporary Scenario Overlay metrics
  scenarioResult: {
    population: number;
    vulnerablePopulation: number;
    vulnerableRatioPercent: number;
    vulnerabilityIndex: number;
    requestCount: number;
    velocityPerHour: number;
    infraIndex: number;
    demandScore: number;
    infrastructureDeficitScore: number;
    demographicVulnerabilityScore: number;
    investmentDeficitScore: number;
    priorityScore: number;
    priorityLevel: string;
    investmentGapLakhs: number;
    projectedImpactScore: number;
  };

  // Deltas
  deltas: {
    populationDelta: number;
    vulnerablePopulationDelta: number;
    requestCountDelta: number;
    infraIndexDelta: number;
    priorityScoreDelta: number;
    investmentGapDeltaLakhs: number;
    projectedImpactScoreDelta: number;
  };

  comparisonItems: MetricComparisonItem[];

  provenance: {
    source: string;
    overlay: '[SIMULATION]' | '[LIVE_OVERLAY]';
    engine: '[CALCULATED]';
    projection: '[PROJECTED]';
  };
}
