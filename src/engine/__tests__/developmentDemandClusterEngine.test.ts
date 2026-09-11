import { describe, expect, it } from 'vitest';
import { clusterDevelopmentRequests } from '../developmentDemandClusterEngine';
import { DevelopmentRequest } from '../../types/development';
import { DevelopmentContextDataLayer } from '../context/DevelopmentContextDataLayer';

describe('Development Demand Cluster Engine', () => {
  const contextLayer = new DevelopmentContextDataLayer('sample');

  const sampleHealthcareRequests: DevelopmentRequest[] = [
    {
      id: 'dev-req-1',
      rawText: 'Need new primary health sub-center near Karol Bagh metro gate #2 due to overcrowded dispensary.',
      language: 'en',
      sourceChannel: 'TEXT',
      source: 'provider-citizen-app',
      mode: 'LIVE',
      timestamp: '2026-09-11T10:00:00.000Z',
      location: {
        country: 'India',
        state: 'Delhi NCR',
        district: 'Central Delhi',
        subDistrict: 'Karol Bagh Zone',
        latitude: 28.6515,
        longitude: 77.1905,
        locationName: 'Karol Bagh'
      },
      category: 'HEALTHCARE',
      extractedEntities: ['Karol Bagh', 'dispensary'],
      demandIntensity: 0.85,
      affectedPopulation: 12000,
      urgency: 'urgent',
      vulnerableGroups: ['elderly', 'children'],
      evidence: [
        { classification: 'OBSERVED', snippet: 'Need new primary health sub-center', source: 'Citizen App' }
      ],
      confidence: 0.92,
      status: 'pending'
    },
    {
      id: 'dev-req-2',
      rawText: 'हमारे वार्ड में डिस्पेंसरी बहुत छोटी है और एम्बुलेंस आने में देर लगती है, नया अस्पताल चाहिए।',
      language: 'hi',
      sourceChannel: 'VOICE',
      source: 'provider-voice-call',
      mode: 'LIVE',
      timestamp: '2026-09-11T10:15:00.000Z',
      location: {
        country: 'India',
        state: 'Delhi NCR',
        district: 'Central Delhi',
        subDistrict: 'Karol Bagh Zone',
        latitude: 28.6520,
        longitude: 77.1912,
        locationName: 'Karol Bagh'
      },
      category: 'HEALTHCARE',
      extractedEntities: ['डिस्पेंसरी', 'अस्पताल'],
      demandIntensity: 0.90,
      affectedPopulation: 15000,
      urgency: 'critical',
      vulnerableGroups: ['low_income'],
      evidence: [
        { classification: 'OBSERVED', snippet: 'नया अस्पताल चाहिए', source: 'Voice Call' }
      ],
      confidence: 0.95,
      status: 'pending'
    },
    {
      id: 'dev-req-3',
      rawText: 'Karol Bagh area me clinic capacity full rehti hai. Need urgent sub-center upgrade!',
      language: 'hinglish',
      sourceChannel: 'MESSAGING',
      source: 'provider-whatsapp',
      mode: 'LIVE',
      timestamp: '2026-09-11T10:30:00.000Z',
      location: {
        country: 'India',
        state: 'Delhi NCR',
        district: 'Central Delhi',
        subDistrict: 'Karol Bagh Zone',
        latitude: 28.6510,
        longitude: 77.1898,
        locationName: 'Karol Bagh'
      },
      category: 'HEALTHCARE',
      extractedEntities: ['Karol Bagh', 'clinic'],
      demandIntensity: 0.80,
      affectedPopulation: 10000,
      urgency: 'high',
      vulnerableGroups: ['commuters'],
      evidence: [
        { classification: 'OBSERVED', snippet: 'Need urgent sub-center upgrade', source: 'WhatsApp' }
      ],
      confidence: 0.88,
      status: 'pending'
    }
  ];

  const sampleWaterRequests: DevelopmentRequest[] = [
    {
      id: 'dev-req-4',
      rawText: 'Mayur Vihar Phase 1 market me drinking water supply aur pipeline issue.',
      language: 'hinglish',
      sourceChannel: 'SOCIAL',
      source: 'provider-bluesky',
      mode: 'LIVE',
      timestamp: '2026-09-11T10:40:00.000Z',
      location: {
        country: 'India',
        state: 'Delhi NCR',
        district: 'East Delhi',
        subDistrict: 'Mayur Vihar',
        latitude: 28.6080,
        longitude: 77.2950,
        locationName: 'Mayur Vihar'
      },
      category: 'WATER',
      extractedEntities: ['Mayur Vihar', 'drinking water'],
      demandIntensity: 0.70,
      affectedPopulation: 8000,
      urgency: 'high',
      vulnerableGroups: ['residents'],
      evidence: [
        { classification: 'OBSERVED', snippet: 'drinking water supply issue', source: 'Bluesky' }
      ],
      confidence: 0.85,
      status: 'pending'
    }
  ];

  it('clusters requests into DevelopmentDemandHotspots by spatial proximity and category', async () => {
    const allReqs = [...sampleHealthcareRequests, ...sampleWaterRequests];
    const hotspots = await clusterDevelopmentRequests(allReqs, contextLayer);

    expect(hotspots.length).toBe(2); // Healthcare & Water

    const healthcareHotspot = hotspots.find(h => h.category === 'HEALTHCARE');
    expect(healthcareHotspot).toBeDefined();
    expect(healthcareHotspot?.title).toContain('Healthcare Access');
    expect(healthcareHotspot?.requestCount).toBe(3);
    expect(healthcareHotspot?.languages).toContain('hi');
    expect(healthcareHotspot?.languages).toContain('hinglish');
    expect(healthcareHotspot?.languages).toContain('en');
    expect(healthcareHotspot?.sourceChannels).toContain('VOICE');
    expect(healthcareHotspot?.sourceChannels).toContain('MESSAGING');
    expect(healthcareHotspot?.sourceChannels).toContain('TEXT');
  });

  it('calculates centroid, radius, demand score, and deterministic priority score for hotspot', async () => {
    const hotspots = await clusterDevelopmentRequests(sampleHealthcareRequests, contextLayer);
    expect(hotspots.length).toBe(1);

    const h = hotspots[0];
    expect(h.geographicArea.centroid.lat).toBeCloseTo(28.6515, 3);
    expect(h.geographicArea.centroid.lng).toBeCloseTo(77.1905, 3);
    expect(h.radiusMeters).toBeGreaterThanOrEqual(300);
    expect(h.demandScore).toBeGreaterThan(0);
    expect(h.priorityScore.priorityScore).toBeGreaterThan(0);
    expect(h.projectRecommendation).toBeDefined();
  });

  it('enforces objective framing without claiming government failure', async () => {
    const hotspots = await clusterDevelopmentRequests(sampleHealthcareRequests, contextLayer);
    const h = hotspots[0];

    const evidenceText = h.evidence.map(e => e.snippet).join(' ');
    expect(evidenceText).toContain('Citizen demand indicates');
    expect(evidenceText).not.toContain('government failure');
  });

  it('sorts hotspots by priority score descending (P1 highest priority first)', async () => {
    const allReqs = [...sampleHealthcareRequests, ...sampleWaterRequests];
    const hotspots = await clusterDevelopmentRequests(allReqs, contextLayer);

    expect(hotspots[0].priorityScore.priorityScore).toBeGreaterThanOrEqual(hotspots[1].priorityScore.priorityScore);
  });
});
