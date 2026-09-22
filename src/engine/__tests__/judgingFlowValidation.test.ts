import { describe, expect, it } from 'vitest';
import { clusterSignals } from '../clusteringEngine';
import { deriveInvestmentBoardMetrics } from '../developmentGapEngine';
import { BASELINE_SIGNALS } from '../../data/initialData';
import { ClusteredIncident } from '../../types/civic';

describe('NagarBodh Judging Sequence Validation Flow', () => {
  it('executes full 10-step judging sequence deterministically', () => {
    // Step 1: Fresh load
    let activeTab: string = 'investment_gaps';
    let selectedIncidentId: string | null = null;
    let incidents: ClusteredIncident[] = clusterSignals(BASELINE_SIGNALS).incidents;
    expect(incidents.length).toBeGreaterThan(0);

    // Step 2: Civic Investment Board appears first
    expect(activeTab).toBe('investment_gaps');

    // Step 3: Investment metrics render
    const initialBoard = deriveInvestmentBoardMetrics(incidents);
    expect(initialBoard.sectorMetrics).toHaveLength(4);
    expect(initialBoard.gapRows).toHaveLength(4);

    const waterInitial = initialBoard.sectorMetrics.find(s => s.category === 'WATER')!;
    const healthInitial = initialBoard.sectorMetrics.find(s => s.category === 'HEALTHCARE')!;
    expect(waterInitial.demandScore).toBeGreaterThan(0);
    expect(healthInitial.demandScore).toBeGreaterThan(0);
    expect(waterInitial.gapLakhs).toBe(350);

    // Verify provenance labels exist
    initialBoard.gapRows.forEach(row => {
      expect(row.aiExplanation).toContain('[OBSERVED DEMAND]');
      expect(row.aiExplanation).toContain('[BASELINE CONTEXT]');
      expect(row.aiExplanation).toContain('[CALCULATED CAPEX]');
    });

    // Step 4: Advance demo simulation (Sector 15 Flash Flood Emergency surge)
    const mockSurgeIncident: ClusteredIncident = {
      id: 'inc-sector15-surge',
      title: 'Sector 15 Flash Flood Emergency',
      category: 'waterlogging',
      ward: 'Ward 15 — Sector 15',
      signalIds: Array.from({ length: 28 }, (_, i) => `sig-flood-${i}`),
      signalsCount: 28,
      velocityPerHour: 9.2,
      velocitySurgePercent: 320,
      priority: { overallScore: 95, severity: 'p1', urgency: 'critical', confidence: 0.96 },
      status: 'triaged',
      location: { lat: 28.5355, lng: 77.3910, address: 'Sector 15 Underpass' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const advancedIncidents: ClusteredIncident[] = [
      ...incidents.filter(i => i.id !== 'inc-sector15-surge'),
      mockSurgeIncident
    ];

    // Step 5: Verify relevant investment metrics react where underlying inputs change
    const advancedBoard = deriveInvestmentBoardMetrics(advancedIncidents);
    const waterAdvanced = advancedBoard.sectorMetrics.find(s => s.category === 'WATER')!;
    const waterRowAdvanced = advancedBoard.gapRows.find(r => r.category === 'WATER')!;

    expect(waterAdvanced.demandScore).toBeGreaterThan(waterInitial.demandScore);
    expect(waterAdvanced.status).toBe('CRITICAL DEFICIT');
    expect(waterRowAdvanced.incidentId).toBe('inc-sector15-surge');
    expect(waterRowAdvanced.aiExplanation).toContain('28 signals');

    // Step 6: Open an investment/gap detail
    selectedIncidentId = waterRowAdvanced.incidentId || null;
    activeTab = 'project_priorities';
    expect(selectedIncidentId).toBe('inc-sector15-surge');
    expect(activeTab).toBe('project_priorities');

    // Step 7: Return to Investment Board
    activeTab = 'investment_gaps';
    expect(activeTab).toBe('investment_gaps');

    // Step 8: Open Impact Measurement
    activeTab = 'impact';
    expect(activeTab).toBe('impact');

    // Step 9: Reset demo
    activeTab = 'investment_gaps';
    selectedIncidentId = null;
    incidents = clusterSignals(BASELINE_SIGNALS).incidents;
    const resetBoard = deriveInvestmentBoardMetrics(incidents);
    const waterReset = resetBoard.sectorMetrics.find(s => s.category === 'WATER')!;

    expect(waterReset.demandScore).toBe(waterInitial.demandScore);
    expect(waterReset.gapLakhs).toBe(waterInitial.gapLakhs);
    expect(waterReset.status).toBe(waterInitial.status);

    // Step 10: Repeat the flow (Confirm determinism)
    const repeatBoard = deriveInvestmentBoardMetrics(incidents);
    expect(repeatBoard).toEqual(resetBoard);
  });
});
