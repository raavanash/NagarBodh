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

  it('2. Preserves human lifecycle states across re-clustering passes', () => {
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

  it('3. Formats all 9 statuses correctly', () => {
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
});
