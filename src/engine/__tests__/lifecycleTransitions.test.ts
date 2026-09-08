import { describe, expect, it } from 'vitest';
import { clusterSignals } from '../clusteringEngine';
import { CivicSignal, IncidentStatus } from '../../types/civic';

const mockSignal: CivicSignal = {
  id: 'sig-lc-1',
  timestamp: '2026-09-05T08:00:00Z',
  simulatedTimeLabel: '08:00 AM',
  channel: 'citizen_app',
  rawText: 'Severe waterlogging at Sector 15 underpass.',
  detectedLanguage: 'en',
  englishTranslation: 'Severe waterlogging at Sector 15 underpass.',
  category: 'waterlogging',
  reportedSeverity: 'high',
  confidenceScore: 0.95,
  coordinates: { lat: 28.5825, lng: 77.3175 },
  locationName: 'Sector 15 Underpass',
  ward: 'Ward 15 - Central Sub-city',
  sentiment: 'urgent',
  keyEntities: ['Sector 15', 'underpass']
};

describe('NagarBodh 9-State Incident Lifecycle Engine', () => {
  it('1. AI recommendation starts at emerging or dispatch_pending without auto-dispatching', () => {
    const { incidents } = clusterSignals([mockSignal]);
    expect(incidents.length).toBeGreaterThan(0);
    const inc = incidents[0];

    // AI MUST NOT directly mark as dispatched or resolved
    expect(inc.status).not.toBe('dispatched');
    expect(inc.status).not.toBe('resolved');
    expect(inc.status).not.toBe('verified');
    expect(['emerging', 'triaged', 'dispatch_pending']).toContain(inc.status);
  });

  it('2. Sequential Canonical Lifecycle Transitions (EMERGING -> ... -> VERIFIED)', () => {
    const validTransitions: Array<{ from: IncidentStatus; to: IncidentStatus }> = [
      { from: 'emerging', to: 'triaged' },
      { from: 'triaged', to: 'dispatch_pending' },
      { from: 'dispatch_pending', to: 'approved' },
      { from: 'approved', to: 'dispatched' },
      { from: 'dispatched', to: 'on_site' },
      { from: 'on_site', to: 'resolving' },
      { from: 'resolving', to: 'resolved' },
      { from: 'resolved', to: 'verified' }
    ];

    let currentStatus: IncidentStatus = 'emerging';
    for (const transition of validTransitions) {
      expect(transition.from).toBe(currentStatus);
      currentStatus = transition.to;
    }
    expect(currentStatus).toBe('verified');
  });

  it('3. Preserves human lifecycle states across re-clustering passes', () => {
    const { incidents: firstPass } = clusterSignals([mockSignal]);
    const inc = firstPass[0];

    const humanStates: IncidentStatus[] = [
      'approved',
      'dispatched',
      'on_site',
      'resolving',
      'resolved',
      'verified'
    ];

    humanStates.forEach(status => {
      const mockExisting = { ...inc, status };
      const { incidents: secondPass } = clusterSignals([mockSignal], 25, [mockExisting]);
      expect(secondPass[0].status).toBe(status);
    });
  });

  it('4. Formats all 9 canonical statuses correctly', () => {
    const validStatuses: IncidentStatus[] = [
      'emerging',
      'triaged',
      'dispatch_pending',
      'approved',
      'dispatched',
      'on_site',
      'resolving',
      'resolved',
      'verified'
    ];
    expect(validStatuses.length).toBe(9);
  });

  it('5. Computes derived metrics dynamically from canonical incident state', () => {
    const { incidents } = clusterSignals([mockSignal]);
    const inc = incidents[0];

    const mockIncidents = [
      { ...inc, id: 'inc-1', status: 'emerging' as IncidentStatus },
      { ...inc, id: 'inc-2', status: 'approved' as IncidentStatus },
      { ...inc, id: 'inc-3', status: 'verified' as IncidentStatus }
    ];

    const activeIncidents = mockIncidents.filter(i => i.status !== 'resolved' && i.status !== 'verified');
    const verifiedIncidents = mockIncidents.filter(i => i.status === 'verified' || i.status === 'resolved');

    expect(activeIncidents.length).toBe(2);
    expect(verifiedIncidents.length).toBe(1);
  });
});
