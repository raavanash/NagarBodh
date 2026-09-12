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

    // Before metrics
    expect(impact.baselineMetrics.infrastructureIndex).toBe(38);
    expect(impact.baselineMetrics.averageTravelDistanceKm).toBe(28);
    expect(impact.baselineMetrics.demandScore).toBe(91);

    // After metrics
    expect(impact.postInterventionMetrics.infrastructureIndex).toBe(67);
    expect(impact.postInterventionMetrics.averageTravelDistanceKm).toBe(14);
    expect(impact.postInterventionMetrics.demandScore).toBe(54);

    // Change percentages and score
    expect(impact.change.infrastructureIndexImprovement).toBe(29); // +29
    expect(impact.change.averageTravelDistanceReductionPercent).toBe(-50); // -50%
    expect(impact.change.demandPressureReductionPercent).toBe(-37); // -37%
    expect(impact.impactScore).toBeGreaterThan(0);
    expect(impact.mode).toBe('REPLAY');
  });

  it('formats Gemini AI summary bounded strictly by deterministic numbers', () => {
    const impact = calculateDevelopmentImpact({
      project: sampleProject,
      mode: 'SIMULATION'
    });

    expect(impact.aiSummary).toContain('The intervention appears to have reduced the identified healthcare access gap');
    expect(impact.aiSummary).toContain('+29');
    expect(impact.aiSummary).toContain('50%');
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
