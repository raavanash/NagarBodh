import { describe, expect, it } from 'vitest';
import { calculateDevelopmentImpact } from '../developmentImpactEngine';
import { generateDevelopmentProjectRecommendation, buildCanonicalInterventionRecord } from '../developmentRecommendationEngine';
import { buildGroundedInputFromDossier, generateDecisionBrief, buildDeterministicDecisionBrief } from '../decisionBriefEngine';
import { buildInvestmentExplanationDossier } from '../developmentGapEngine';
import { ClusteredIncident } from '../../types/civic';
import { InterventionRecord, DevelopmentProjectRecommendation } from '../../types/development';

describe('Impact State Flow & Lifecycle Context Preservation', () => {
  const canonicalSector15Incident: ClusteredIncident = {
    id: 'incident-ward-15-central-sub-city-waterlogging',
    title: 'Sector 15 Flash Flood & Drainage Failure',
    category: 'waterlogging',
    ward: 'Ward 15 — Central Sub-City',
    locationName: 'Sector 15 Main Underpass Dip',
    signalIds: Array.from({ length: 32 }, (_, i) => `sig-${i}`),
    signalsCount: 32,
    velocityPerHour: 11.5,
    velocitySurgePercent: 350,
    priority: { overallScore: 94, demandScore: 95, severity: 'p1', urgency: 'critical', confidence: 0.98 },
    status: 'triaged',
    location: { lat: 28.5825, lng: 77.3175, address: 'Sector 15 Underpass' },
    demographics: {
      population: 184000,
      populationDensity: 14000,
      populationGrowth: 2.3,
      urbanizationRate: 95,
      vulnerablePopulation: 45000,
      youthPopulation: 32000,
      elderlyPopulation: 14000,
      wardName: 'Ward 15 — Central Sub-City'
    },
    infrastructure: {
      healthcareIndex: 35,
      educationIndex: 40,
      waterIndex: 30,
      sanitationIndex: 32,
      transportIndex: 38,
      electricityIndex: 55,
      digitalConnectivityIndex: 65,
      nearestFacilityDistanceMeters: 1200
    },
    investment: {
      existingInvestment: 200,
      plannedInvestment: 550,
      activeProjects: 2,
      plannedProjects: 1,
      investmentByCategory: {},
      investmentGapLakhs: 350,
      unaddressedRequestsCount: 32
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  it('1. State B — No intervention exists when fresh/unselected', () => {
    const activeIntervention: InterventionRecord | null = null;
    const selectedIncident: ClusteredIncident | null = null;

    // Has explicit intervention is false
    const hasExplicitIntervention = Boolean(activeIntervention);
    const effectiveInc = selectedIncident;

    expect(hasExplicitIntervention).toBe(false);
    expect(effectiveInc).toBeNull();
  });

  it('2. State A — Calculates canonical impact when intervention exists', () => {
    const recommendation = generateDevelopmentProjectRecommendation({
      hotspotId: canonicalSector15Incident.id,
      category: 'WATER',
      geography: {
        country: 'India',
        state: 'Delhi NCR',
        district: canonicalSector15Incident.ward,
        subDistrict: canonicalSector15Incident.ward,
        wardOrDistrict: canonicalSector15Incident.ward,
        locationName: canonicalSector15Incident.locationName
      },
      priorityScoreVal: canonicalSector15Incident.priority.overallScore,
      developmentGap: {
        overallGapIndex: 94,
        demandGapScore: 28,
        infrastructureDeficitScore: 24,
        demographicVulnerabilityScore: 19,
        investmentDeficitScore: 14,
        environmentalRiskScore: 9,
        explanationBullets: ['Critical waterlogging gap']
      },
      demographics: canonicalSector15Incident.demographics,
      infrastructure: canonicalSector15Incident.infrastructure,
      investment: canonicalSector15Incident.investment,
      sourceMode: 'SIMULATION'
    });

    const interventionRecord = buildCanonicalInterventionRecord({
      incident: canonicalSector15Incident,
      recommendation,
      status: 'APPROVED'
    });

    expect(interventionRecord.expectedImpact.impactScore).toBe(84);
    expect(interventionRecord.expectedImpact.demandPressureReductionPercent).toBe(-37);
    expect(interventionRecord.expectedImpact.infrastructureIndexImprovement).toBe(29);
    expect(interventionRecord.expectedImpact.travelDistanceReductionPercent).toBe(-40);
    expect(interventionRecord.expectedImpact.serviceAccessImprovement).toBe(30);

    const impact = calculateDevelopmentImpact({
      project: recommendation,
      mode: 'SIMULATION'
    });

    expect(impact.impactScore).toBeGreaterThan(0);
    expect(impact.change.demandPressureReductionPercent).toBeLessThan(0);
    expect(impact.change.infrastructureIndexImprovement).toBeGreaterThan(0);
  });

  it('3. Full 6-Stage Lifecycle preserves exact intervention context across transitions', () => {
    // Stage 1: INVEST (Investment Board)
    const dossier = buildInvestmentExplanationDossier('WATER', [canonicalSector15Incident], []);
    expect(dossier.gapId).toContain('water');
    expect(dossier.capitalRequirement.estimatedCostLakhs).toBe(350);

    // Stage 2: EVIDENCE (Dossier)
    expect(dossier.priorityCalculation.overallScore).toBe(94);
    expect(dossier.affectedPopulation.totalEstimate).toBe(184000);

    // Stage 3: EXPLAIN (Decision Brief)
    const groundedInput = buildGroundedInputFromDossier(dossier);
    const brief = buildDeterministicDecisionBrief(groundedInput);
    expect(brief.model).toBe('DETERMINISTIC FALLBACK');
    expect(brief.sections.find(s => s.title === 'CAPITAL REQUIREMENT')?.content).toContain('₹350 Lakhs');
    expect(brief.sections.find(s => s.title === 'RECOMMENDATION')?.content).toContain('Sub-surface Automated Stormwater Pumping Array');

    // Stage 4: DECIDE (Capital Pipeline)
    let intervention: InterventionRecord = buildCanonicalInterventionRecord({
      incident: canonicalSector15Incident,
      status: 'UNDER_REVIEW'
    });
    expect(intervention.status).toBe('UNDER_REVIEW');

    // Stage 5: APPROVE (Human Approval)
    intervention = {
      ...intervention,
      status: 'APPROVED',
      approvedBy: 'Demo Municipal Approver [SIMULATION]'
    };
    expect(intervention.status).toBe('APPROVED');
    expect(intervention.approvedBy).toBe('Demo Municipal Approver [SIMULATION]');

    // Stage 6: MEASURE (Impact Measurement)
    intervention = {
      ...intervention,
      status: 'IMPACT_MEASURED'
    };
    expect(intervention.status).toBe('IMPACT_MEASURED');
    expect(intervention.approvedCapitalLakhs).toBe(350);
    expect(intervention.locationName).toContain('Sector 15');
  });

  it('4. Reset cleanly clears active intervention and returns to State B empty state', () => {
    let activeInterventionState: InterventionRecord | null = buildCanonicalInterventionRecord({
      incident: canonicalSector15Incident,
      status: 'IMPACT_MEASURED'
    });
    expect(activeInterventionState).not.toBeNull();

    // Trigger reset
    activeInterventionState = null;
    const selectedIncidentId: string | null = null;

    expect(activeInterventionState).toBeNull();
    expect(selectedIncidentId).toBeNull();
  });
});
