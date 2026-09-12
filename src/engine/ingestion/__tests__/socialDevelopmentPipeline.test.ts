import { describe, expect, it } from 'vitest';
import { SocialProvider } from '../providers/SocialProvider';
import { DevelopmentRequestNormalizer } from '../DevelopmentRequestNormalizer';
import { DuplicateDetector } from '../DuplicateDetector';
import { clusterDevelopmentRequests } from '../../developmentDemandClusterEngine';
import { DevelopmentContextDataLayer } from '../../context/DevelopmentContextDataLayer';

describe('Phase 08: Social/X Signals → Development Demand Pipeline', () => {
  const contextLayer = new DevelopmentContextDataLayer('sample');

  it('transforms Hindi social signal on X into canonical DevelopmentRequest with source honesty (X / REPLAY)', async () => {
    const socialProvider = new SocialProvider('REPLAY');

    const fixture = SocialProvider.SAMPLE_X_FIXTURES[0]; // "हमारे इलाके में सरकारी अस्पताल नहीं है। Nearest hospital is 25 km away."
    const devReq = await socialProvider.ingestRequest(fixture);

    expect(devReq.id).toBe('x-sig-501');
    expect(devReq.rawText).toContain('सरकारी अस्पताल');
    expect(devReq.language).toBe('hi');
    expect(devReq.category).toBe('HEALTHCARE');
    expect(devReq.sourceChannel).toBe('SOCIAL');
    expect(devReq.source).toBe('X');
    expect(devReq.mode).toBe('REPLAY');
    expect(devReq.evidence[0].source).toContain('X / REPLAY');
    expect(devReq.confidence).toBeGreaterThan(0.80);
  });

  it('transforms English social signal on X into canonical DevelopmentRequest for education category', async () => {
    const socialProvider = new SocialProvider('REPLAY');

    const fixture = SocialProvider.SAMPLE_X_FIXTURES[1]; // "School is there but no teachers."
    const devReq = await socialProvider.ingestRequest(fixture);

    expect(devReq.id).toBe('x-sig-502');
    expect(devReq.language).toBe('en');
    expect(devReq.category).toBe('EDUCATION');
    expect(devReq.source).toBe('X');
    expect(devReq.evidence[0].snippet).toContain('School is there but no teachers');
  });

  it('transforms Hinglish social signal on X into canonical DevelopmentRequest for water category', async () => {
    const socialProvider = new SocialProvider('REPLAY');

    const fixture = SocialProvider.SAMPLE_X_FIXTURES[2]; // "Drinking water supply has been irregular for months."
    const devReq = await socialProvider.ingestRequest(fixture);

    expect(devReq.id).toBe('x-sig-503');
    expect(devReq.category).toBe('WATER');
    expect(devReq.source).toBe('X');
    expect(devReq.mode).toBe('REPLAY');
  });

  it('deduplicates identical social reposts without inflating demand count unnecessarily', async () => {
    const detector = new DuplicateDetector();
    const socialProvider = new SocialProvider('REPLAY');

    const req1 = await socialProvider.ingestRequest(SocialProvider.SAMPLE_X_FIXTURES[0]);
    const check1 = detector.isDuplicate(req1);
    expect(check1.isDuplicate).toBe(false);
    detector.register(req1);

    // Identical repost attempt
    const req2 = await socialProvider.ingestRequest(SocialProvider.SAMPLE_X_FIXTURES[0]);
    const check2 = detector.isDuplicate(req2);
    expect(check2.isDuplicate).toBe(true);
    expect(check2.reason).toContain('repost content match');
  });

  it('clusters social development requests end-to-end into DevelopmentDemandHotspots', async () => {
    const socialProvider = new SocialProvider('REPLAY');

    const req1 = await socialProvider.ingestRequest(SocialProvider.SAMPLE_X_FIXTURES[0]); // Healthcare
    const req2 = await socialProvider.ingestRequest(SocialProvider.SAMPLE_X_FIXTURES[1]); // Education
    const req3 = await socialProvider.ingestRequest(SocialProvider.SAMPLE_X_FIXTURES[2]); // Water

    const hotspots = await clusterDevelopmentRequests([req1, req2, req3], contextLayer);

    expect(hotspots.length).toBe(3); // 3 categories
    const categories = hotspots.map(h => h.category);
    expect(categories).toContain('HEALTHCARE');
    expect(categories).toContain('EDUCATION');
    expect(categories).toContain('WATER');

    const healthcareHotspot = hotspots.find(h => h.category === 'HEALTHCARE');
    expect(healthcareHotspot).toBeDefined();
    expect(healthcareHotspot?.sourceChannels).toContain('SOCIAL');
    expect(healthcareHotspot?.evidence.some(e => e.snippet.includes('Citizen report'))).toBe(true);
    expect(healthcareHotspot?.priorityScore.priorityScore).toBeGreaterThan(0);
    expect(healthcareHotspot?.projectRecommendation).toBeDefined();
  });
});

