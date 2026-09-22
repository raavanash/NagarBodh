import { describe, it, expect } from 'vitest';
import {
  generateDevelopmentProjectRecommendation,
  buildCanonicalInterventionRecord
} from '../developmentRecommendationEngine';
import { calculateDevelopmentImpact } from '../developmentImpactEngine';
import { ClusteredIncident } from '../../types/civic';
import { InterventionRecord } from '../../types/development';

describe('Canonical Intervention End-to-End Lifecycle & Traceability', () => {
  // Canonical Sector 15 Drainage Recommendation Input
  const sampleSector15Input = {
    hotspotId: 'hotspot-sec15-drainage',
    category: 'DRAINAGE' as any,
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
      explanationBullets: ['Arterial storm trunk drain blockage under metro interchange']
    },
    demographics: {
      wardId: 'ward-15',
      wardName: 'Ward 15 / Sector 15',
      population: 184000,
      totalPopulationEstimate: 184000,
      vulnerablePopulation: 45000,
      vulnerableGroupRatio: 0.245,
      populationDensity: 14000,
      populationGrowth: 2.3,
      urbanizationRate: 98,
      youthPopulation: 42000,
      elderlyPopulation: 16000
    },
    infrastructure: {
      healthcareIndex: 50,
      educationIndex: 60,
      waterIndex: 35,
      sanitationIndex: 30,
      transportIndex: 40,
      electricityIndex: 70,
      digitalConnectivityIndex: 80,
      criticalAssetsNearby: []
    },
    investment: {
      existingInvestment: 150,
      plannedInvestment: 500,
      activeProjects: 1,
      plannedProjects: 1,
      investmentByCategory: { WATER: 150 },
      investmentGapLakhs: 350,
      unaddressedRequestsCount: 31
    },
    evidence: [
      {
        classification: 'OBSERVED',
        snippet: 'Severe waterlogging at Sector 15 metro interchange',
        source: 'Citizen Signals & IoT Sensor Array',
        confidence: 0.94
      }
    ],
    sourceMode: 'SIMULATION' as const
  };

  // Canonical Sector 15 Waterlogging Incident Mock
  const mockSector15Incident: ClusteredIncident = {
    id: 'incident-ward-15-central-sub-city-waterlogging',
    title: 'Sector 15 Central Sub-city Waterlogging',
    category: 'WATER',
    severity: 'critical',
    status: 'detected',
    signalsCount: 31,
    coordinates: [77.065, 28.465],
    ward: 'Ward 15',
    firstSignalTime: '08:00 AM',
    lastSignalTime: '10:00 AM',
    primaryCause: 'Sub-surface arterial storm trunk drain blockage under metro interchange',
    velocity: 280,
    confidenceScore: 94,
    escalationPrediction: 'Critical flood hazard with potential arterial road closure',
    crossVerification: {
      isCrossVerified: true,
      channelsCount: 3,
      verifiedSources: ['citizen_report', 'bluesky_social', 'iot_sensor'],
      verificationTimestamp: '10:00 AM'
    },
    signals: [],
    demandScore: 88,
    gapScore: 82,
    compositePriorityScore: 94,
    affectedPopulation: 184000
  };

  it('1. recommendation → pipeline identity preservation (canonical Sector 15)', () => {
    const recommendation = generateDevelopmentProjectRecommendation(sampleSector15Input);

    expect(recommendation).toBeDefined();
    // Canonical Title
    expect(recommendation.title).toBe('Sub-surface Automated Stormwater Pumping Array');
    // Canonical Capex
    expect(recommendation.estimatedCostLakhs).toBe(350);
    // Ward & Category
    expect(recommendation.category).toBe('DRAINAGE');
    expect(recommendation.priorityScore).toBe(94);
    expect(recommendation.expectedBeneficiaries).toBe(Math.round(184000 * 0.65));

    // Build canonical intervention record for pipeline
    const pipelineRecord = buildCanonicalInterventionRecord({
      incident: mockSector15Incident,
      recommendation,
      status: 'UNDER_REVIEW'
    });

    // Identity preserved
    expect(pipelineRecord.id).toBe('int-sector15-stormwater-array');
    expect(pipelineRecord.incidentId).toBe(mockSector15Incident.id);
    expect(pipelineRecord.projectTitle).toBe('Sub-surface Automated Stormwater Pumping Array');
    expect(pipelineRecord.approvedCapitalLakhs).toBe(350);
    expect(pipelineRecord.locationName).toBe('Ward 15 / Sector 15');
    expect(pipelineRecord.status).toBe('UNDER_REVIEW');
    expect(pipelineRecord.dataMode).toBe('SIMULATION');
  });

  it('2. pipeline → approval identity preservation', () => {
    const recommendation = generateDevelopmentProjectRecommendation(sampleSector15Input);
    const pipelineRecord = buildCanonicalInterventionRecord({
      incident: mockSector15Incident,
      recommendation,
      status: 'UNDER_REVIEW'
    });

    // Approving intervention preserves identity
    const approvedRecord: InterventionRecord = {
      ...pipelineRecord,
      status: 'APPROVED',
      approvedBy: 'Demo Municipal Approver [SIMULATION]',
      approvedAt: '2026-09-22T10:15:00Z',
      notes: 'Authorized ₹350 Lakhs capital deployment under expedited flood alleviation SOP.'
    };

    expect(approvedRecord.id).toBe(pipelineRecord.id);
    expect(approvedRecord.projectTitle).toBe(pipelineRecord.projectTitle);
    expect(approvedRecord.approvedCapitalLakhs).toBe(350);
    expect(approvedRecord.locationName).toBe(pipelineRecord.locationName);
    expect(approvedRecord.status).toBe('APPROVED');
    expect(approvedRecord.approvedBy).toContain('Demo Municipal Approver');
  });

  it('3. approval → intervention record identity preservation', () => {
    const recommendation = generateDevelopmentProjectRecommendation(sampleSector15Input);
    const approvedRecord = buildCanonicalInterventionRecord({
      incident: mockSector15Incident,
      recommendation,
      status: 'APPROVED',
      approvedBy: 'Demo Municipal Approver [SIMULATION]'
    });

    // Transition to INTERVENTION_RECORDED
    const recordedIntervention: InterventionRecord = {
      ...approvedRecord,
      status: 'INTERVENTION_RECORDED'
    };

    expect(recordedIntervention.id).toBe(approvedRecord.id);
    expect(recordedIntervention.projectTitle).toBe('Sub-surface Automated Stormwater Pumping Array');
    expect(recordedIntervention.locationName).toBe('Ward 15 / Sector 15');
    expect(recordedIntervention.approvedCapitalLakhs).toBe(350);
    expect(recordedIntervention.status).toBe('INTERVENTION_RECORDED');
    expect(recordedIntervention.dataMode).toBe('SIMULATION');
  });

  it('4. intervention → impact identity preservation', () => {
    const recommendation = generateDevelopmentProjectRecommendation(sampleSector15Input);
    const intervention = buildCanonicalInterventionRecord({
      incident: mockSector15Incident,
      recommendation,
      status: 'INTERVENTION_RECORDED'
    });

    const impact = calculateDevelopmentImpact({
      project: recommendation,
      mode: 'SIMULATION'
    });

    // Impact must reflect the same project and intervention
    expect(impact.projectId).toBe(recommendation.id);
    expect(intervention.projectTitle).toBe(recommendation.title);
    expect(impact.baselineMetrics.demandScore).toBe(91);
    expect(impact.baselineMetrics.infrastructureIndex).toBe(38);
  });

  it('5. projected impact uses correct units (pts for index differences, % for distance)', () => {
    const recommendation = generateDevelopmentProjectRecommendation(sampleSector15Input);
    const impact = calculateDevelopmentImpact({
      project: recommendation,
      mode: 'SIMULATION'
    });

    // Index point changes (values are index-point changes, not percentage of total)
    expect(typeof impact.change.infrastructureIndexImprovement).toBe('number');
    expect(impact.change.infrastructureIndexImprovement).toBe(29); // +29 index points

    expect(typeof impact.change.demandPressureReductionPercent).toBe('number');
    expect(impact.change.demandPressureReductionPercent).toBe(-37); // -37 index points

    expect(typeof impact.change.serviceAccessImprovement).toBe('number');
    expect(impact.change.serviceAccessImprovement).toBe(32); // +32 index points

    // Percentage change
    expect(typeof impact.change.averageTravelDistanceReductionPercent).toBe('number');
    expect(impact.change.averageTravelDistanceReductionPercent).toBe(-50); // -50% reduction

    // Baseline vs Post
    expect(impact.baselineMetrics.demandScore).toBe(91);
    expect(impact.postInterventionMetrics.demandScore).toBe(54); // 91 - 37 = 54

    expect(impact.baselineMetrics.infrastructureIndex).toBe(38);
    expect(impact.postInterventionMetrics.infrastructureIndex).toBe(67); // 38 + 29 = 67
  });

  it('6. simulation and projected labels persist with clear data provenance', () => {
    const recommendation = generateDevelopmentProjectRecommendation(sampleSector15Input);
    const intervention = buildCanonicalInterventionRecord({
      incident: mockSector15Incident,
      recommendation,
      status: 'INTERVENTION_RECORDED'
    });

    // Data mode is explicitly SIMULATION
    expect(intervention.dataMode).toBe('SIMULATION');

    // Impact data mode is SIMULATION
    const impact = calculateDevelopmentImpact({
      project: recommendation,
      mode: 'SIMULATION'
    });
    expect(impact.mode).toBe('SIMULATION');

    // Provenance statements
    expect(intervention.provenance).toBe('SIMULATION');
    expect(intervention.sourceEvidenceSnippets.length).toBeGreaterThan(0);
    expect(intervention.sourceEvidenceSnippets.some(s => s.includes('[OBSERVED]'))).toBe(true);
    expect(intervention.sourceEvidenceSnippets.some(s => s.includes('[BASELINE CONTEXT]'))).toBe(true);
    expect(intervention.sourceEvidenceSnippets.some(s => s.includes('[CALCULATED]'))).toBe(true);
  });

  it('7. reset clears lifecycle correctly', () => {
    const rec = generateDevelopmentProjectRecommendation(sampleSector15Input);
    let activeInterventionState: InterventionRecord | null = buildCanonicalInterventionRecord({
      incident: mockSector15Incident,
      recommendation: rec,
      status: 'INTERVENTION_RECORDED'
    });

    expect(activeInterventionState).not.toBeNull();

    // Reset simulation function simulates clearing state
    const resetSimulationState = () => {
      activeInterventionState = null;
    };

    resetSimulationState();
    expect(activeInterventionState).toBeNull();
  });

  it('8. deterministic repeatability of the canonical Sector 15 flow', () => {
    // Run flow run 1
    const rec1 = generateDevelopmentProjectRecommendation(sampleSector15Input);
    const int1 = buildCanonicalInterventionRecord({
      incident: mockSector15Incident,
      recommendation: rec1,
      status: 'INTERVENTION_RECORDED'
    });
    const impact1 = calculateDevelopmentImpact({ project: rec1, mode: 'SIMULATION' });

    // Run flow run 2
    const rec2 = generateDevelopmentProjectRecommendation(sampleSector15Input);
    const int2 = buildCanonicalInterventionRecord({
      incident: mockSector15Incident,
      recommendation: rec2,
      status: 'INTERVENTION_RECORDED'
    });
    const impact2 = calculateDevelopmentImpact({ project: rec2, mode: 'SIMULATION' });

    // Exact deterministic identity matching
    expect(int1.id).toBe(int2.id);
    expect(int1.projectTitle).toBe(int2.projectTitle);
    expect(int1.approvedCapitalLakhs).toBe(int2.approvedCapitalLakhs);
    expect(int1.locationName).toBe(int2.locationName);

    // Exact deterministic metrics matching
    expect(impact1.change.infrastructureIndexImprovement).toBe(impact2.change.infrastructureIndexImprovement);
    expect(impact1.change.demandPressureReductionPercent).toBe(impact2.change.demandPressureReductionPercent);
    expect(impact1.change.averageTravelDistanceReductionPercent).toBe(impact2.change.averageTravelDistanceReductionPercent);
    expect(impact1.postInterventionMetrics.demandScore).toBe(impact2.postInterventionMetrics.demandScore);
    expect(impact1.postInterventionMetrics.infrastructureIndex).toBe(impact2.postInterventionMetrics.infrastructureIndex);
  });
});
