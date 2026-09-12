import { describe, expect, it } from 'vitest';
import { calculateDevelopmentImpact } from '../developmentImpactEngine';
import { DevelopmentProjectRecommendation } from '../../types/development';

describe('Development Impact Measurement Engine', () => {
  const sampleProject: DevelopmentProjectRecommendation = {
    id: 'proj-health-001',
    title: 'Primary Health Sub-Center & Mobile Diagnostic Unit',
    category: 'HEALTHCARE',
    geography: {
      state: 'Delhi NCR',
      district: 'North East Delhi',
      subDivision: 'Seelampur'
    },
    targetLocation: 'North East Delhi',
    problemStatement: 'Severe shortage of primary healthcare sub-centers',
    recommendedIntervention: 'Establish a community health center with maternal and emergency care',
    priorityScore: 88,
    expectedBeneficiaries: 148000,
    estimatedImpact: 'High Access Improvement',
    supportingEvidence: [],
    rationale: 'High demand pressure and distance to hospital',
    implementationConsiderations: 'Requires land allocation',
    confidence: 0.95,
    sourceMode: 'REPLAY'
  };

  it('computes exact deterministic baseline and post-intervention metrics matching challenge example', () => {
    const impact = calculateDevelopmentImpact({
      project: sampleProject,
      mode: 'REPLAY'
    });

    // BEFORE METRICS
    expect(impact.baselineMetrics.demandScore).toBe(91); // Demand pressure
    expect(impact.baselineMetrics.infrastructureIndex).toBe(38); // Infrastructure index
    expect(impact.baselineMetrics.serviceAccessScore).toBe(35); // Service access
    expect(impact.baselineMetrics.affectedPopulation).toBe(148000); // Affected population

    // PROJECT INTERVENTION METRICS
    expect(impact.projectId).toBe('proj-health-001');

    // AFTER METRICS
    expect(impact.postInterventionMetrics.demandScore).toBe(54); // Demand pressure
    expect(impact.postInterventionMetrics.infrastructureIndex).toBe(67); // Infrastructure index
    expect(impact.postInterventionMetrics.serviceAccessScore).toBe(67); // Service access

    // MEASURED IMPACT
    expect(impact.change.infrastructureIndexImprovement).toBe(29); // +29 pts improvement
    expect(impact.change.demandPressureReductionPercent).toBe(-37); // -37 pts reduction
    expect(impact.change.serviceAccessImprovement).toBe(32); // +32 pts improvement
    expect(impact.impactScore).toBeGreaterThan(0);
    expect(impact.mode).toBe('REPLAY');
  });

  it('formats Gemini AI narrative summary bounded strictly by deterministic numbers', () => {
    const impact = calculateDevelopmentImpact({
      project: sampleProject,
      mode: 'SIMULATION'
    });

    expect(impact.aiSummary).toContain('The intervention appears to have reduced the identified healthcare access gap');
    expect(impact.aiSummary).toContain('+29');
    expect(impact.aiSummary).toContain('50%');
    // Ensure numerical metrics are deterministic and not fabricated by AI
    expect(typeof impact.change.infrastructureIndexImprovement).toBe('number');
    expect(typeof impact.change.demandPressureReductionPercent).toBe('number');
  });

  it('enforces data honesty with explicit mode metadata (SIMULATION / REPLAY)', () => {
    const simImpact = calculateDevelopmentImpact({
      project: sampleProject,
      mode: 'SIMULATION'
    });
    expect(simImpact.mode).toBe('SIMULATION');

    const replayImpact = calculateDevelopmentImpact({
      project: sampleProject,
      mode: 'REPLAY'
    });
    expect(replayImpact.mode).toBe('REPLAY');
  });

  it('attaches evidence provenance metadata', () => {
    const impact = calculateDevelopmentImpact({
      project: sampleProject,
      mode: 'REPLAY'
    });

    expect(impact.evidence).toHaveLength(2);
    expect(impact.evidence[0].classification).toBe('OBSERVED');
    expect(impact.evidence[1].classification).toBe('CALCULATED');
  });
});

