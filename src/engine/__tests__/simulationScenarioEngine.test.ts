import { describe, expect, it } from 'vitest';
import {
  getBaselineSectorContext,
  runSimulationScenario,
  validateSimulationScenario
} from '../simulationScenarioEngine';
import { SimulationScenario } from '../../types/simulationScenario';
import { BASELINE_SIGNALS, SECTOR_15_SIMULATION_SIGNALS, SIMULATION_STEPS } from '../../data/initialData';
import { calculateDevelopmentGap } from '../developmentGapEngine';
import { calculateDevelopmentPriority } from '../developmentPriorityEngine';
import { calculateDevelopmentImpact } from '../developmentImpactEngine';

describe('Scenario Lab: Pass 1 — Isolated What-If Foundation Engine', () => {

  describe('1. Scenario Definition Validation', () => {
    it('validates correct POPULATION_PERCENT scenario', () => {
      const scenario: SimulationScenario = {
        id: 'test-pop-1',
        targetSectorId: 'WATER',
        changes: [{ type: 'POPULATION_PERCENT', value: 15 }]
      };
      const result = validateSimulationScenario(scenario);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates correct VULNERABLE_POPULATION_PERCENT scenario', () => {
      const scenario: SimulationScenario = {
        id: 'test-vuln-1',
        targetSectorId: 'WATER',
        changes: [{ type: 'VULNERABLE_POPULATION_PERCENT', value: 10 }]
      };
      const result = validateSimulationScenario(scenario);
      expect(result.isValid).toBe(true);
    });

    it('validates correct SIGNAL_VOLUME_PERCENT scenario', () => {
      const scenario: SimulationScenario = {
        id: 'test-sig-1',
        targetSectorId: 'WATER',
        changes: [{ type: 'SIGNAL_VOLUME_PERCENT', value: 25 }]
      };
      const result = validateSimulationScenario(scenario);
      expect(result.isValid).toBe(true);
    });

    it('validates correct INFRASTRUCTURE_INDEX_POINTS scenario', () => {
      const scenario: SimulationScenario = {
        id: 'test-infra-1',
        targetSectorId: 'WATER',
        changes: [{ type: 'INFRASTRUCTURE_INDEX_POINTS', value: -10 }]
      };
      const result = validateSimulationScenario(scenario);
      expect(result.isValid).toBe(true);
    });

    it('validates multi-change scenario', () => {
      const scenario: SimulationScenario = {
        id: 'test-multi-1',
        targetSectorId: 'WATER',
        changes: [
          { type: 'POPULATION_PERCENT', value: 15 },
          { type: 'VULNERABLE_POPULATION_PERCENT', value: 10 },
          { type: 'SIGNAL_VOLUME_PERCENT', value: 25 },
          { type: 'INFRASTRUCTURE_INDEX_POINTS', value: -10 }
        ]
      };
      const result = validateSimulationScenario(scenario);
      expect(result.isValid).toBe(true);
    });

    it('rejects unsupported change types', () => {
      const scenario: any = {
        id: 'test-invalid-type',
        targetSectorId: 'WATER',
        changes: [{ type: 'UNSUPPORTED_MUTATION', value: 50 }]
      };
      const result = validateSimulationScenario(scenario);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Unsupported change type'))).toBe(true);
    });

    it('rejects invalid numeric values (NaN and Infinity)', () => {
      const scenario: SimulationScenario = {
        id: 'test-nan',
        targetSectorId: 'WATER',
        changes: [{ type: 'POPULATION_PERCENT', value: NaN }]
      };
      const result = validateSimulationScenario(scenario);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Numeric value is invalid'))).toBe(true);
    });
  });

  describe('2. Canonical Sector 15 Baseline Preservation', () => {
    it('returns exact canonical Sector 15 baseline metrics', () => {
      const baseline = getBaselineSectorContext('WATER');

      expect(baseline.demographics.population).toBe(184000);
      expect(baseline.demographics.vulnerablePopulation).toBe(45000);
      expect(baseline.demographics.vulnerabilityIndex).toBe(91);
      expect(baseline.demandInput.requestCount).toBe(32);
      expect(baseline.investment.investmentGapLakhs).toBe(350);

      // Run baseline calculation with authoritative engines
      const analysis = runSimulationScenario({
        id: 'baseline-verify',
        targetSectorId: 'WATER',
        changes: []
      });

      expect(analysis.baseline.priorityScore).toBe(94);
      expect(analysis.baseline.priorityLevel).toBe('P1');
      expect(analysis.baseline.population).toBe(184000);
      expect(analysis.baseline.vulnerablePopulation).toBe(45000);
      expect(analysis.baseline.vulnerableRatioPercent).toBe(24.5);
      expect(analysis.baseline.vulnerabilityIndex).toBe(91);
      expect(analysis.baseline.requestCount).toBe(32);
      expect(analysis.baseline.investmentGapLakhs).toBe(350);
      expect(analysis.baseline.projectedImpactScore).toBe(84);
    });
  });

  describe('3. Engine Reuse Verification', () => {
    it('uses existing deterministic calculation boundaries to derive scenario outcomes', () => {
      const scenario: SimulationScenario = {
        id: 'engine-reuse-test',
        targetSectorId: 'WATER',
        changes: [{ type: 'SIGNAL_VOLUME_PERCENT', value: 50 }]
      };

      const analysis = runSimulationScenario(scenario);

      // Verify that request count scaled to 48 signals
      expect(analysis.scenarioResult.requestCount).toBe(48);

      // Verify that calling calculateDevelopmentPriority directly yields identical score
      const baseContext = getBaselineSectorContext('WATER');
      const tempDemand = {
        ...baseContext.demandInput,
        requestCount: 48,
        velocityPerHour: 17.3
      };

      const directPriority = calculateDevelopmentPriority(
        'direct-test',
        'WATER',
        tempDemand,
        baseContext.demographics,
        baseContext.infrastructure,
        baseContext.investment
      );

      expect(analysis.scenarioResult.priorityScore).toBe(directPriority.priorityScore);
    });
  });

  describe('4. Hard Isolation & Immutability Safeguard', () => {
    it('guarantees running scenario analysis does NOT mutate canonical objects or simulation data', () => {
      // Record snapshots of canonical data
      const initialBaselineSignalsCount = BASELINE_SIGNALS.length;
      const initialStepsCount = SIMULATION_STEPS.length;
      const initialSector15Population = 184000;
      const initialSector15VulnPop = 45000;

      const baselineBefore = getBaselineSectorContext('WATER');

      // Execute aggressive scenario (+50% population, +50% signals, -30 infra pts)
      const scenario: SimulationScenario = {
        id: 'extreme-stress-test',
        targetSectorId: 'WATER',
        changes: [
          { type: 'POPULATION_PERCENT', value: 50 },
          { type: 'VULNERABLE_POPULATION_PERCENT', value: 50 },
          { type: 'SIGNAL_VOLUME_PERCENT', value: 50 },
          { type: 'INFRASTRUCTURE_INDEX_POINTS', value: -30 }
        ]
      };

      const result = runSimulationScenario(scenario, 'SIMULATION');

      // Check that scenario produced different temporary results
      expect(result.scenarioResult.population).toBe(276000); // 184,000 * 1.5
      expect(result.deltas.populationDelta).toBe(92000);
      expect(result.scenarioResult.priorityScore).toBeGreaterThanOrEqual(94);

      // Check canonical global data immutability
      expect(BASELINE_SIGNALS.length).toBe(initialBaselineSignalsCount);
      expect(SIMULATION_STEPS.length).toBe(initialStepsCount);

      // Check baseline context immutability after scenario run
      const baselineAfter = getBaselineSectorContext('WATER');

      expect(baselineAfter.demographics.population).toBe(initialSector15Population);
      expect(baselineAfter.demographics.vulnerablePopulation).toBe(initialSector15VulnPop);
      expect(baselineAfter.demandInput.requestCount).toBe(32);
      expect(baselineBefore).toEqual(baselineAfter);
    });

    it('proves resetting scenario restores original baseline analysis unchanged', () => {
      const emptyScenario: SimulationScenario = {
        id: 'empty-reset',
        targetSectorId: 'WATER',
        changes: []
      };

      const result = runSimulationScenario(emptyScenario);

      expect(result.deltas.populationDelta).toBe(0);
      expect(result.deltas.priorityScoreDelta).toBe(0);
      expect(result.deltas.investmentGapDeltaLakhs).toBe(0);
      expect(result.deltas.projectedImpactScoreDelta).toBe(0);

      expect(result.scenarioResult.priorityScore).toBe(94);
      expect(result.scenarioResult.projectedImpactScore).toBe(84);
    });
  });

  describe('5. Pass 3 Sandboxed Lifecycle: Before -> Scenario -> Reset', () => {
    it('executes full analytical cycle with zero mutation to baseline state', () => {
      // Step 1: Baseline Before
      const baselineBefore = getBaselineSectorContext('WATER');
      expect(baselineBefore.demographics.population).toBe(184000);
      expect(baselineBefore.demographics.vulnerablePopulation).toBe(45000);
      expect(baselineBefore.demographics.vulnerabilityIndex).toBe(91);
      expect(baselineBefore.demandInput.requestCount).toBe(32);
      expect(baselineBefore.investment.investmentGapLakhs).toBe(350);

      // Step 2: Apply Scenario (+15% Population, +10% Vulnerable Pop, +25% Signals, -10 pts Infra)
      const activeScenario: SimulationScenario = {
        id: 'pass3-full-cycle',
        targetSectorId: 'WATER',
        changes: [
          { type: 'POPULATION_PERCENT', value: 15 },
          { type: 'VULNERABLE_POPULATION_PERCENT', value: 10 },
          { type: 'SIGNAL_VOLUME_PERCENT', value: 25 },
          { type: 'INFRASTRUCTURE_INDEX_POINTS', value: -10 }
        ]
      };

      const scenarioRun = runSimulationScenario(activeScenario, 'SIMULATION');

      // Verify scenario computed temporary changes
      expect(scenarioRun.scenarioResult.population).toBe(211600); // 184,000 * 1.15
      expect(scenarioRun.scenarioResult.requestCount).toBe(40); // 32 * 1.25
      expect(scenarioRun.scenarioResult.infraIndex).toBe(25); // 35 - 10
      expect(scenarioRun.deltas.populationDelta).toBe(27600);
      expect(scenarioRun.deltas.requestCountDelta).toBe(8);

      // Step 3: Baseline After Scenario Run remains strictly equal to baseline before
      const baselineAfterRun = getBaselineSectorContext('WATER');
      expect(baselineAfterRun.demographics.population).toBe(184000);
      expect(baselineAfterRun.demographics.vulnerablePopulation).toBe(45000);
      expect(baselineAfterRun.demographics.vulnerabilityIndex).toBe(91);
      expect(baselineAfterRun.demandInput.requestCount).toBe(32);
      expect(baselineAfterRun.investment.investmentGapLakhs).toBe(350);
      expect(baselineAfterRun).toEqual(baselineBefore);

      // Step 4: Reset Scenario
      const resetScenario: SimulationScenario = {
        id: 'pass3-reset',
        targetSectorId: 'WATER',
        changes: []
      };

      const resetRun = runSimulationScenario(resetScenario, 'SIMULATION');

      // Verify reset state equals baseline exactly
      expect(resetRun.scenarioResult.population).toBe(184000);
      expect(resetRun.scenarioResult.vulnerablePopulation).toBe(45000);
      expect(resetRun.scenarioResult.priorityScore).toBe(94);
      expect(resetRun.scenarioResult.investmentGapLakhs).toBe(350);
      expect(resetRun.scenarioResult.projectedImpactScore).toBe(84);
      expect(resetRun.deltas.populationDelta).toBe(0);
      expect(resetRun.deltas.priorityScoreDelta).toBe(0);
    });

    it('works seamlessly across LIVE and SIMULATION modes without leaking state', () => {
      const scenario: SimulationScenario = {
        id: 'mode-invariance-test',
        targetSectorId: 'WATER',
        changes: [{ type: 'SIGNAL_VOLUME_PERCENT', value: 20 }]
      };

      const liveResult = runSimulationScenario(scenario, 'LIVE');
      const simResult = runSimulationScenario(scenario, 'SIMULATION');

      expect(liveResult.mode).toBe('LIVE');
      expect(simResult.mode).toBe('SIMULATION');
      expect(liveResult.scenarioResult.priorityScore).toBe(simResult.scenarioResult.priorityScore);
      expect(liveResult.baseline.priorityScore).toBe(94);
      expect(simResult.baseline.priorityScore).toBe(94);
    });
  });

});
