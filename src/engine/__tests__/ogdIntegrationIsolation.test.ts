import { describe, expect, it } from 'vitest';
import { SIMULATION_STEPS } from '../../data/initialData';
import { buildInvestmentExplanationDossier } from '../developmentGapEngine';
import { runSimulationScenario } from '../simulationScenarioEngine';
import { fetchDelhiGovernmentHospitals, getDelhiHospitalEvidenceItems } from '../externalEvidenceAdapter';
import { ClusteredIncident } from '../../types/civic';
import { SimulationScenario } from '../../types/simulationScenario';

describe('OGD Integration Isolation & Canonical Invariance Verification', () => {
  const canonicalSector15Incident: ClusteredIncident = {
    id: 'inc-sector-15-surge',
    title: 'Severe Sector 15 Underpass Inundation & Subway Flooding',
    category: 'waterlogging',
    severity: 'critical',
    status: 'investigating',
    location: { lat: 28.583, lng: 77.318, name: 'Sector 15 Underpass' },
    locationName: 'Sector 15 Underpass',
    ward: 'Ward 15 — Sector 15 / Laxmi Nagar Dip',
    signalIds: Array.from({ length: 32 }, (_, i) => `sig-s15-${String(i + 1).padStart(2, '0')}`),
    velocityPerHour: 11.5,
    velocitySurgePercent: 350,
    firstReported: '2026-09-08T09:30:00.000Z',
    lastReported: '2026-09-08T10:14:00.000Z',
    demographics: {
      totalPopulationEstimate: 184000,
      vulnerablePopulation: 45000,
      vulnerableGroupRatio: 0.245,
      populationDensityPerSqKm: 18500,
      vulnerabilityIndex: 91,
      primaryLivelihoodZone: 'Mixed Industrial & High-Density Residential'
    },
    infrastructure: {
      waterIndex: 35,
      drainageCapacityLps: 450,
      capacityUtilizationPercent: 98,
      infrastructureDeficitIndex: 94,
      nearestFacilityName: 'Mayur Vihar Stormwater Pumping Station',
      nearestFacilityDistanceMeters: 1400
    },
    investment: {
      investmentGapLakhs: 350,
      investmentGapIndex: 93,
      existingInvestmentLakhs: 75,
      plannedInvestmentLakhs: 425
    },
    priority: {
      overallScore: 94,
      level: 'critical',
      factors: {
        severityScore: 24,
        velocityScore: 25,
        populationImpactScore: 19,
        criticalAssetExposureScore: 14,
        environmentalRiskScore: 9,
        slaRecurrenceScore: 3
      },
      formulaExplanation: 'Deterministic 5-factor weighted calculation'
    }
  };

  it('preserves exact canonical Sector 15 baseline metrics without mutation', () => {
    // Dossier derivation for Sector 15 Water sector
    const dossier = buildInvestmentExplanationDossier('WATER', [canonicalSector15Incident]);

    // Hard canonical acceptance assertions:
    expect(dossier.priorityCalculation.overallScore).toBe(94);
    expect(dossier.priorityCalculation.priorityLevel).toBe('P1');
    expect(dossier.affectedPopulation.totalEstimate).toBe(184000);
    expect(dossier.affectedPopulation.vulnerableEstimate).toBe(45000);
    expect(dossier.affectedPopulation.vulnerabilityRatio).toBe(0.245);
    expect(dossier.affectedPopulation.vulnerabilityScore).toBe(91);
    expect(dossier.problemSignal.requestCount).toBe(32);
    expect(dossier.capitalRequirement.estimatedCostLakhs).toBe(350);
    expect(dossier.projectedOutcome.impactScore).toBe(84);
  });

  it('external OGD evidence retrieval operates as a pure read-only sidecar and does not mutate SIMULATION_STEPS', async () => {
    const initialStepsCount = SIMULATION_STEPS.length;
    const initialStep0Title = SIMULATION_STEPS[0].title;

    // Load OGD evidence
    const ogdEvidence = await getDelhiHospitalEvidenceItems('REPLAY');
    expect(ogdEvidence.length).toBeGreaterThan(0);

    // Verify SIMULATION_STEPS remains untouched
    expect(SIMULATION_STEPS.length).toBe(initialStepsCount);
    expect(SIMULATION_STEPS[0].title).toBe(initialStep0Title);
  });

  it('Scenario Lab simulation engine produces deterministic outputs unaffected by OGD evidence calls', async () => {
    // Fetch OGD data first
    await fetchDelhiGovernmentHospitals({ forceReplay: true });

    // Run test scenario
    const testScenario: SimulationScenario = {
      id: 'scenario-test-surge',
      targetSectorId: 'WATER',
      changes: [
        { type: 'SIGNAL_VOLUME_PERCENT', value: 25 },
        { type: 'INFRASTRUCTURE_INDEX_POINTS', value: -10 }
      ]
    };
    const scenarioResult = runSimulationScenario(testScenario, 'SIMULATION', [canonicalSector15Incident]);

    expect(scenarioResult).toBeDefined();
    expect(scenarioResult.scenario.id).toBe(testScenario.id);
    expect(scenarioResult.targetSectorId).toBe('WATER');
    expect(typeof scenarioResult.scenarioResult.priorityScore).toBe('number');
    expect(typeof scenarioResult.deltas.priorityScoreDelta).toBe('number');
  });
});
