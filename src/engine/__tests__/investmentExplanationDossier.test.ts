import { describe, expect, it } from 'vitest';
import { buildInvestmentExplanationDossier, deriveInvestmentBoardMetrics } from '../developmentGapEngine';
import { calculateDevelopmentPriority } from '../developmentPriorityEngine';
import { clusterSignals } from '../clusteringEngine';
import { BASELINE_SIGNALS } from '../../data/initialData';
import { ClusteredIncident } from '../../types/civic';

describe('Explainable Investment Dossier & Provenance Validation', () => {
  const initialIncidents: ClusteredIncident[] = clusterSignals(BASELINE_SIGNALS).incidents;

  it('verifies strict provenance mapping across all dossier sections', () => {
    const dossier = buildInvestmentExplanationDossier('WATER', initialIncidents);
    console.log('BASELINE WATER PRIORITY OBJECT:', JSON.stringify(dossier.priorityCalculation, null, 2));

    // 1. Problem Signal -> [OBSERVED]
    expect(dossier.problemSignal.provenance).toBe('OBSERVED');
    expect(dossier.problemSignal.requestCount).toBeGreaterThan(0);
    expect(dossier.problemSignal.signalChannels.length).toBeGreaterThan(0);
    expect(dossier.problemSignal.representativeSignals.length).toBeGreaterThan(0);

    // 2. Infrastructure Context -> [BASELINE CONTEXT]
    expect(dossier.infrastructureContext.provenance).toBe('BASELINE CONTEXT');
    expect(dossier.infrastructureContext.infrastructureIndex).toBeGreaterThan(0);
    expect(dossier.infrastructureContext.capacityUtilizationPercent).toBeGreaterThan(0);

    // 3. Affected Population -> [BASELINE CONTEXT]
    expect(dossier.affectedPopulation.provenance).toBe('BASELINE CONTEXT');
    expect(dossier.affectedPopulation.totalEstimate).toBeGreaterThan(0);
    expect(dossier.affectedPopulation.vulnerableEstimate).toBeGreaterThan(0);
    expect(dossier.affectedPopulation.sourceContext).toContain('Municipal Demographic Census');

    // 4. Priority Calculation -> [CALCULATED]
    expect(dossier.priorityCalculation.provenance).toBe('CALCULATED');
    expect(dossier.priorityCalculation.factors).toHaveLength(5);
    dossier.priorityCalculation.factors.forEach(factor => {
      expect(factor.provenance).toBe('CALCULATED');
      expect(factor.score).toBeGreaterThanOrEqual(0);
      expect(factor.contribution).toBeGreaterThanOrEqual(0);
      expect(factor.evidence).toBeDefined();
      expect(factor.source).toBeDefined();
    });

    // 5. Capital Requirement -> [RECOMMENDED]
    expect(dossier.capitalRequirement.provenance).toBe('RECOMMENDED');
    expect(dossier.capitalRequirement.estimatedCostLakhs).toBeGreaterThan(0);
    expect(dossier.capitalRequirement.recommendedIntervention).toBeDefined();

    // 6. Projected Outcome -> [PROJECTED]
    expect(dossier.projectedOutcome.provenance).toBe('PROJECTED');
    expect(dossier.projectedOutcome.scenarioMode).toBe('SIMULATION');
    expect(dossier.projectedOutcome.infrastructureIndexGain).toBeGreaterThan(0);
    expect(dossier.projectedOutcome.travelDistanceReductionPercent).toBeLessThan(0); // e.g. -50%

    // 7. Traceable Evidence Chain
    expect(dossier.evidenceChain).toHaveLength(6);
    expect(dossier.evidenceChain[0].classification).toBe('OBSERVED');
    expect(dossier.evidenceChain[1].classification).toBe('OBSERVED');
    expect(dossier.evidenceChain[2].classification).toBe('BASELINE CONTEXT');
    expect(dossier.evidenceChain[3].classification).toBe('CALCULATED');
    expect(dossier.evidenceChain[4].classification).toBe('RECOMMENDED');
    expect(dossier.evidenceChain[5].classification).toBe('PROJECTED');
  });

  it('validates deterministic 5-factor priority calculation breakdown and weights', () => {
    const dossier = buildInvestmentExplanationDossier('WATER', initialIncidents);
    const { factors, overallScore, priorityLevel } = dossier.priorityCalculation;

    expect(factors).toHaveLength(5);

    const demandFactor = factors.find(f => f.factor === 'Citizen Demand')!;
    const infraFactor = factors.find(f => f.factor === 'Infrastructure Deficit')!;
    const popFactor = factors.find(f => f.factor === 'Population Impact')!;
    const vulnFactor = factors.find(f => f.factor === 'Vulnerable Population')!;
    const investFactor = factors.find(f => f.factor === 'Investment Gap')!;

    expect(demandFactor.weightPercent).toBe(25);
    expect(infraFactor.weightPercent).toBe(25);
    expect(popFactor.weightPercent).toBe(20);
    expect(vulnFactor.weightPercent).toBe(15);
    expect(investFactor.weightPercent).toBe(15);

    const totalWeight = demandFactor.weightPercent + infraFactor.weightPercent + popFactor.weightPercent + vulnFactor.weightPercent + investFactor.weightPercent;
    expect(totalWeight).toBe(100);

    // Contribution matches weight formula
    expect(demandFactor.contribution).toBe(parseFloat((demandFactor.score * 0.25).toFixed(1)));
    expect(infraFactor.contribution).toBe(parseFloat((infraFactor.score * 0.25).toFixed(1)));
    expect(popFactor.contribution).toBe(parseFloat((popFactor.score * 0.20).toFixed(1)));
    expect(vulnFactor.contribution).toBe(parseFloat((vulnFactor.score * 0.15).toFixed(1)));
    expect(investFactor.contribution).toBe(parseFloat((investFactor.score * 0.15).toFixed(1)));

    expect(overallScore).toBeGreaterThanOrEqual(0);
    expect(overallScore).toBeLessThanOrEqual(100);
    expect(['P1', 'P2', 'P3']).toContain(priorityLevel);
  });

  it('reconciles factor-weight contributions mathematically to the overall deterministic score', () => {
    // Test both baseline WATER (44) and surging WATER (94)
    const baselineDossier = buildInvestmentExplanationDossier('WATER', initialIncidents);
    const baselineFactors = baselineDossier.priorityCalculation.factors;
    const baselineContributionSum = baselineFactors.reduce((sum, f) => sum + f.contribution, 0);

    // Each contribution = raw * weight / 100
    baselineFactors.forEach(f => {
      const expectedContrib = parseFloat((f.score * (f.weightPercent / 100)).toFixed(1));
      expect(f.contribution).toBe(expectedContrib);
    });
    expect(Math.round(baselineContributionSum)).toBe(baselineDossier.priorityCalculation.overallScore);
    expect(baselineDossier.priorityCalculation.overallScore).toBe(44);
    expect(baselineDossier.priorityCalculation.priorityLevel).toBe('P3');

    // Surging Sector 15 scenario
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
    const surgeDossier = buildInvestmentExplanationDossier('WATER', advancedIncidents);
    const surgeFactors = surgeDossier.priorityCalculation.factors;
    const surgeContributionSum = surgeFactors.reduce((sum, f) => sum + f.contribution, 0);

    surgeFactors.forEach(f => {
      const expectedContrib = parseFloat((f.score * (f.weightPercent / 100)).toFixed(1));
      expect(f.contribution).toBe(expectedContrib);
    });
    expect(Math.round(surgeContributionSum)).toBe(surgeDossier.priorityCalculation.overallScore);
    expect(surgeDossier.priorityCalculation.overallScore).toBe(94);
    expect(surgeDossier.priorityCalculation.priorityLevel).toBe('P1');
  });

  it('asserts single engine-derived authoritative priority score consistency across all dossier outputs', () => {
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
    const dossier = buildInvestmentExplanationDossier('WATER', advancedIncidents);
    const authoritativeScore = dossier.priorityCalculation.overallScore;

    // 1. Authoritative score must be exactly 94
    expect(authoritativeScore).toBe(94);

    // 2. Dossier priorityCalculation overallScore
    expect(dossier.priorityCalculation.overallScore).toBe(94);
    expect(dossier.priorityCalculation.priorityLevel).toBe('P1');

    // 3. Evidence chain Step 4
    expect(dossier.evidenceChain[3].title).toBe('Deterministic Priority: 94/100 (P1)');

    // 4. Executive rationale plainLanguageWhy
    expect(dossier.plainLanguageWhy).toContain('(Priority 94/100)');

    // 5. Investment board metrics gap row
    const board = deriveInvestmentBoardMetrics(advancedIncidents);
    const waterRow = board.gapRows.find(r => r.category === 'WATER')!;
    expect(waterRow.explanationDossier?.priorityCalculation.overallScore).toBe(94);

    // Zero occurrences of contradictory 96 in priority scores
    expect(dossier.priorityCalculation.overallScore).not.toBe(96);
    expect(dossier.evidenceChain[3].title).not.toContain('96/100');
    expect(dossier.plainLanguageWhy).not.toContain('Priority 96/100');
  });

  it('audits provenance source names and terminology (no unbacked institutional or verified claims)', () => {
    const dossier = buildInvestmentExplanationDossier('WATER', initialIncidents);

    // Factors source check
    dossier.priorityCalculation.factors.forEach(f => {
      // Must not claim unbacked National Infrastructure Registry or raw unclassified stream
      expect(f.source).not.toBe('National Infrastructure Registry');
      expect(f.source).not.toBe('Signal Ingestion Stream & Normalizer');
      expect(f.source).not.toBe('Demographic Context Layer');
      expect(f.source).not.toBe('Demographic Census & Social Vulnerability Index');
      expect(f.source).not.toBe('Public Expenditure & Capital Plan');

      // Must have honest provenance classification in name or badge
      expect(
        f.source.includes('[OBSERVED]') ||
        f.source.includes('[BASELINE CONTEXT]') ||
        f.source.includes('[CALCULATED]')
      ).toBe(true);
    });

    // Language audit: no unverified "Verified Citizen Signals"
    dossier.evidenceChain.forEach(step => {
      expect(step.title).not.toContain('Verified Citizen Signals');
    });
    expect(dossier.evidenceChain[0].title).toContain('Citizen Signals [OBSERVED]');
    expect(dossier.plainLanguageWhy).not.toContain('verified signals');
    expect(dossier.plainLanguageWhy).toContain('citizen signals [OBSERVED]');
  });

  it('traces projected impact numbers back to developmentImpactEngine', () => {
    const dossier = buildInvestmentExplanationDossier('WATER', initialIncidents);
    const { projectedOutcome, evidenceChain, plainLanguageWhy } = dossier;

    // Projected outcome numbers for WATER (1800m facility distance)
    expect(projectedOutcome.infrastructureIndexGain).toBe(29);
    expect(projectedOutcome.travelDistanceReductionPercent).toBe(-40);
    expect(projectedOutcome.demandPressureDrop).toBe(-37);
    expect(projectedOutcome.serviceAccessGain).toBe(32);
    expect(projectedOutcome.impactScore).toBeGreaterThan(0);

    // Reconciled in evidence chain step 6
    expect(evidenceChain[5].detail).toContain('+29 infra index gain');
    expect(evidenceChain[5].detail).toContain('40% travel distance reduction');
    expect(evidenceChain[5].detail).toContain('37 pt drop in recurring demand pressure');

    // Also verify HEALTHCARE (28000m facility distance) produces exactly -50%
    const healthcareDossier = buildInvestmentExplanationDossier('HEALTHCARE', initialIncidents);
    expect(healthcareDossier.projectedOutcome.travelDistanceReductionPercent).toBe(-50);
    expect(healthcareDossier.evidenceChain[5].detail).toContain('50% travel distance reduction');

    // Reconciled in executive rationale
    expect(plainLanguageWhy).toContain('+29 point infrastructure index improvement');
    expect(plainLanguageWhy).toContain('37 point drop in recurring demand pressure');
    expect(plainLanguageWhy).not.toContain('37% drop');
  });

  it('answers "Why this recommendation?" in concise, plain language with underlying evidence', () => {
    const dossier = buildInvestmentExplanationDossier('HEALTHCARE', initialIncidents);
    const plainWhy = dossier.plainLanguageWhy;

    expect(plainWhy).toBeDefined();
    expect(plainWhy).toContain('NagarBodh recommends');
    expect(plainWhy).toContain(dossier.capitalRequirement.recommendedIntervention);
    expect(plainWhy).toContain(dossier.ward);
    expect(plainWhy).toContain('citizen demand pressure');
    expect(plainWhy).toContain('infrastructure index improvement');
  });

  it('dynamically reacts to Sector 15 flood emergency surge and deterministically reverts on reset', async () => {
    // 1. Initial State
    const baselineDossier = buildInvestmentExplanationDossier('WATER', initialIncidents);
    const initialDemand = baselineDossier.problemSignal.requestCount;
    const initialScore = baselineDossier.priorityCalculation.overallScore;
    expect(initialScore).toBe(44);

    // 2. Advance Simulation: Sector 15 Flash Flood Emergency Surges
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

    const surgedDossier = buildInvestmentExplanationDossier('WATER', advancedIncidents);

    // Verify dynamic reaction in dossier
    expect(surgedDossier.problemSignal.requestCount).toBe(32);
    expect(surgedDossier.problemSignal.velocityPerHour).toBe(11.5);
    expect(surgedDossier.problemSignal.surgeMultiplier).toBe(4.5); // 1 + 350%
    expect(surgedDossier.priorityCalculation.overallScore).toBe(94);
    expect(surgedDossier.priorityCalculation.priorityLevel).toBe('P1');
    expect(surgedDossier.evidenceChain[0].title).toContain('32 Citizen Signals [OBSERVED]');
    expect(surgedDossier.plainLanguageWhy).toContain('32 citizen signals [OBSERVED]');

    // Verify leaderboard row also includes the updated dossier
    const board = deriveInvestmentBoardMetrics(advancedIncidents);
    const waterRow = board.gapRows.find(r => r.category === 'WATER')!;
    expect(waterRow.explanationDossier).toBeDefined();
    expect(waterRow.explanationDossier?.problemSignal.requestCount).toBe(32);
    expect(waterRow.explanationDossier?.priorityCalculation.overallScore).toBe(94);

    // 3. Reset Demo: Reverts deterministically to baseline
    const resetDossier = buildInvestmentExplanationDossier('WATER', initialIncidents);
    expect(resetDossier.problemSignal.requestCount).toBe(initialDemand);
    expect(resetDossier.priorityCalculation.overallScore).toBe(initialScore);

    // Verify deterministic equality of metrics and calculations
    expect(resetDossier.problemSignal).toEqual(baselineDossier.problemSignal);
    expect(resetDossier.infrastructureContext).toEqual(baselineDossier.infrastructureContext);
    expect(resetDossier.affectedPopulation).toEqual(baselineDossier.affectedPopulation);
    expect(resetDossier.priorityCalculation).toEqual(baselineDossier.priorityCalculation);
    expect(resetDossier.capitalRequirement.recommendedProjectTitle).toEqual(baselineDossier.capitalRequirement.recommendedProjectTitle);
    expect(resetDossier.capitalRequirement.estimatedCostLakhs).toEqual(baselineDossier.capitalRequirement.estimatedCostLakhs);
    expect(resetDossier.projectedOutcome).toEqual(baselineDossier.projectedOutcome);
  });

  it('strictly validates vulnerability semantics (distinguishing count, ratio, and vulnerability index)', () => {
    // Mock surging Sector 15 scenario
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
    const dossier = buildInvestmentExplanationDossier('WATER', advancedIncidents);

    // 1. Vulnerable population count [BASELINE CONTEXT]
    expect(dossier.affectedPopulation.vulnerableEstimate).toBe(45000);
    expect(dossier.affectedPopulation.totalEstimate).toBe(184000);
    expect(dossier.affectedPopulation.provenance).toBe('BASELINE CONTEXT');

    // 2. Demographic Ratio: 45000 / 184000 ≈ 24.5% [CALCULATED]
    expect(dossier.affectedPopulation.vulnerabilityRatio).toBeCloseTo(0.245, 3);
    const calculatedRatioPercent = (dossier.affectedPopulation.vulnerableEstimate / dossier.affectedPopulation.totalEstimate) * 100;
    expect(calculatedRatioPercent).toBeCloseTo(24.456, 1);

    // 3. Vulnerability Score / Index: 91 / 100 [CALCULATED]
    expect(dossier.affectedPopulation.vulnerabilityScore).toBe(91);
    const vulnFactor = dossier.priorityCalculation.factors.find(f => f.factor === 'Vulnerable Population')!;
    expect(vulnFactor.score).toBe(91);
    expect(vulnFactor.weightPercent).toBe(15);
    expect(vulnFactor.contribution).toBe(13.7);

    // 4. Zero conflation: UI/Evidence never says "91% ratio" or "91% vulnerable"
    expect(vulnFactor.evidence).toContain('Vulnerability Index 91/100');
    expect(vulnFactor.evidence).toContain('45,000 vulnerable residents');
    expect(vulnFactor.evidence).toContain('24.5% demographic ratio');
    expect(vulnFactor.evidence).not.toContain('91% vulnerable group ratio');
    expect(vulnFactor.evidence).not.toContain('91% vulnerable residents');

    // 5. Impact unit semantics: points vs percentage
    expect(dossier.projectedOutcome.demandPressureDrop).toBe(-37); // points
    expect(dossier.plainLanguageWhy).toContain('37 point drop in recurring demand pressure');
    expect(dossier.plainLanguageWhy).not.toContain('37% drop');
    expect(dossier.evidenceChain[5].detail).toContain('37 pt drop');
    expect(dossier.evidenceChain[5].detail).toContain('40% travel distance reduction'); // true percentage
  });
});
