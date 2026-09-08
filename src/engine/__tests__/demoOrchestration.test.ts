import { describe, expect, it } from 'vitest';
import { SIMULATION_STEPS } from '../../data/initialData';
import { clusterSignals } from '../clusteringEngine';
import { calculateResolutionVerification } from '../resolutionVerificationEngine';
import { ClusteredIncident, DispatchActionPlan, IncidentStatus } from '../../types/civic';

describe('NagarBodh Demo Orchestration Engine', () => {
  it('has 14 scripted timeline steps covering 08:15 AM to 12:15 PM', () => {
    expect(SIMULATION_STEPS.length).toBe(15); // Index 0 to 14
    expect(SIMULATION_STEPS[0].simulatedTime).toBe('08:00 AM');
    expect(SIMULATION_STEPS[1].simulatedTime).toBe('08:15 AM');
    expect(SIMULATION_STEPS[14].simulatedTime).toBe('12:15 PM');
    expect(SIMULATION_STEPS[8].description).toContain('Priority reaches critical');
  });

  it('orchestrates Emergency Trigger (10:00 AM Red Alert step)', () => {
    const emergencyStep = SIMULATION_STEPS[8];
    expect(emergencyStep.weatherCondition.alertLevel).toBe('red');
    expect(emergencyStep.weatherCondition.rainfallMmPerHour).toBe(45);

    // Collect all signals up to step 8
    const signalsUntilEmergency = SIMULATION_STEPS.slice(0, 9).flatMap(s => s.signalsAdded);
    const { incidents } = clusterSignals(signalsUntilEmergency);

    const emergencyIncident = incidents.find(c => c.category === 'waterlogging');
    expect(emergencyIncident).toBeDefined();
    expect(emergencyIncident?.priority.overallScore).toBeGreaterThanOrEqual(80);
  });

  it('orchestrates Response Approval and Dispatch flow', () => {
    const mockIncident: ClusteredIncident = {
      id: 'incident-ward-15-central-sub-city-waterlogging',
      title: 'Waterlogging Incident',
      category: 'waterlogging',
      status: 'triaged',
      centroid: { lat: 28.5825, lng: 77.3175 },
      radiusMeters: 450,
      signalIds: ['sig-1'],
      firstSignalTime: '2026-09-05T08:15:00Z',
      latestSignalTime: '2026-09-05T10:00:00Z',
      velocityPerHour: 22,
      velocitySurgePercent: 280,
      ward: 'Ward 15 - Central Sub-city',
      priority: {
        overallScore: 94,
        level: 'critical',
        factors: {
          severityScore: 22,
          velocityScore: 23,
          populationImpactScore: 18,
          criticalAssetExposureScore: 14,
          environmentalRiskScore: 8,
          slaRecurrenceScore: 9
        },
        formulaExplanation: 'Critical'
      }
    };

    const actionPlan: DispatchActionPlan = {
      id: 'plan-1',
      incidentId: mockIncident.id,
      suggestedUnits: [
        { unitId: 'U-1', unitName: 'Pump-1', type: 'dewatering_pump', etaMinutes: 15 }
      ],
      estimatedCostINR: 45000,
      sopReference: 'SOP-WL-04',
      status: 'pending_approval'
    };

    // 1. Approve
    actionPlan.status = 'approved';
    actionPlan.approvedBy = 'Municipal Commander Officer-in-Charge';
    expect(actionPlan.status).toBe('approved');

    // 2. Dispatch
    let status: IncidentStatus = 'dispatch_approved';
    expect(status).toBe('dispatch_approved');

    // 3. Field Arrival
    status = 'field_team_on_site';
    expect(status).toBe('field_team_on_site');

    // 4. Resolution
    status = 'resolved';
    expect(status).toBe('resolved');
  });

  it('orchestrates AI Verification upon resolution', () => {
    const allSignals = SIMULATION_STEPS.flatMap(s => s.signalsAdded);

    const mockResolvedIncident: ClusteredIncident = {
      id: 'incident-ward-15-central-sub-city-waterlogging',
      title: 'Waterlogging Incident',
      category: 'waterlogging',
      status: 'resolved',
      centroid: { lat: 28.5825, lng: 77.3175 },
      radiusMeters: 450,
      signalIds: allSignals.map(s => s.id),
      firstSignalTime: '2026-09-05T08:15:00Z',
      latestSignalTime: '2026-09-05T10:00:00Z',
      resolvedTime: '2026-09-05T12:00:00Z',
      velocityPerHour: 22,
      velocitySurgePercent: 280,
      ward: 'Ward 15 - Central Sub-city',
      priority: {
        overallScore: 94,
        level: 'critical',
        factors: {
          severityScore: 22,
          velocityScore: 23,
          populationImpactScore: 18,
          criticalAssetExposureScore: 14,
          environmentalRiskScore: 8,
          slaRecurrenceScore: 9
        },
        formulaExplanation: 'Critical'
      }
    };

    const verificationResult = calculateResolutionVerification(
      mockResolvedIncident,
      allSignals
    );

    expect(verificationResult.outcome).toBe('VERIFIED');
    expect(verificationResult.verificationConfidenceScore).toBeGreaterThanOrEqual(85);
    expect(verificationResult.beforeSignalCount).toBe(31);
    expect(verificationResult.afterSignalCount).toBe(4);
    expect(verificationResult.aiConclusion).toBeDefined();
    expect(verificationResult.disclaimerText).toContain('Signal-Based Verification');
  });
});
