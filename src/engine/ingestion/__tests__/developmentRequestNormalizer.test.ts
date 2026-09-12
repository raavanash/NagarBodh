import { describe, expect, it } from 'vitest';
import { DevelopmentRequestNormalizer } from '../DevelopmentRequestNormalizer';

describe('DevelopmentRequestNormalizer (Multilingual & Multi-Channel)', () => {
  it('normalizes English text report from citizen app', () => {
    const rawPayload = {
      id: 'dev-req-eng-1',
      text: 'Need new primary health sub-center near Karol Bagh metro gate #2 due to overcrowded dispensary.',
      sourceChannel: 'citizen_app',
      authorHandle: '@KarolBaghResident',
      timestamp: '2026-09-10T10:00:00.000Z'
    };

    const req = DevelopmentRequestNormalizer.normalizeToDevelopmentRequest(rawPayload, 'provider-citizen-direct', 'LIVE');

    expect(req.id).toBe('dev-req-eng-1');
    expect(req.rawText).toBe(rawPayload.text);
    expect(req.language).toBe('en');
    expect(req.sourceChannel).toBe('TEXT');
    expect(req.category).toBe('HEALTHCARE');
    expect(req.location.district).toBe('Central Delhi');
    expect(req.location.latitude).toBeNull(); // No fake coordinates invented
    expect(req.evidence.length).toBe(4);
    expect(req.evidence[0].classification).toBe('OBSERVED');
  });

  it('normalizes Devanagari Hindi voice transcript', () => {
    const rawPayload = {
      text: 'हमारे गांव में अस्पताल बहुत दूर है।',
      sourceChannel: 'voice_call',
      authorHandle: '@HindiCaller',
      timestamp: '2026-09-10T10:15:00.000Z'
    };

    const req = DevelopmentRequestNormalizer.normalizeToDevelopmentRequest(rawPayload, 'provider-voice-app', 'LIVE');

    expect(req.language).toBe('hi');
    expect(req.sourceChannel).toBe('VOICE');
    expect(req.category).toBe('HEALTHCARE');
    expect(req.rawText).toBe('हमारे गांव में अस्पताल बहुत दूर है।');
    expect(req.evidence.some(e => e.classification === 'OBSERVED')).toBe(true);
  });

  it('normalizes English healthcare request', () => {
    const rawPayload = {
      text: 'Nearest hospital is 25 km away.',
      sourceChannel: 'citizen_app',
      authorHandle: '@EnglishCitizen',
      timestamp: '2026-09-10T10:20:00.000Z'
    };

    const req = DevelopmentRequestNormalizer.normalizeToDevelopmentRequest(rawPayload, 'provider-citizen-direct', 'LIVE');

    expect(req.language).toBe('en');
    expect(req.sourceChannel).toBe('TEXT');
    expect(req.category).toBe('HEALTHCARE');
    expect(req.rawText).toBe('Nearest hospital is 25 km away.');
  });

  it('normalizes Hinglish code-mixed request', () => {
    const rawPayload = {
      text: 'Yahan ambulance bahut late aati hai.',
      sourceChannel: 'whatsapp_msg',
      authorHandle: '@HinglishUser',
      timestamp: '2026-09-10T10:25:00.000Z'
    };

    const req = DevelopmentRequestNormalizer.normalizeToDevelopmentRequest(rawPayload, 'provider-whatsapp', 'LIVE');

    expect(req.language).toBe('hinglish');
    expect(req.sourceChannel).toBe('MESSAGING');
    expect(req.category).toBe('HEALTHCARE');
    expect(req.rawText).toBe('Yahan ambulance bahut late aati hai.');
  });

  it('normalizes Hinglish code-mixed social media post', () => {
    const rawPayload = {
      id: 'at://did:plc:test/app.bsky.feed.post/12345',
      text: 'Mayur Vihar Phase 1 Market me pani ki supply aur drainage system bilkul chok ho chuka hai. Need urgent pipeline upgrade!',
      sourceChannel: 'social_bluesky',
      authorHandle: '@MayurViharCitizen',
      timestamp: '2026-09-10T10:30:00.000Z'
    };

    const req = DevelopmentRequestNormalizer.normalizeToDevelopmentRequest(rawPayload, 'provider-social-bluesky', 'LIVE');

    expect(req.language).toBe('hinglish');
    expect(req.sourceChannel).toBe('SOCIAL');
    expect(req.category).toBe('WATER');
    expect(req.location.locationName).toContain('Mayur Vihar');
    expect(req.demandIntensity).toBeGreaterThan(0.5);
  });

  it('handles quality edge cases without inventing coordinates or dropping citizen wording', () => {
    const rawPayload = {
      text: 'Garbage dump accumulating near main road intersection',
      sourceChannel: 'grievance_portal'
    };

    const req = DevelopmentRequestNormalizer.normalizeToDevelopmentRequest(rawPayload, 'provider-govt-portal', 'REPLAY');

    expect(req.category).toBe('SANITATION');
    expect(req.sourceChannel).toBe('GOVERNMENT_PORTAL');
    expect(req.mode).toBe('REPLAY');
    expect(req.location.country).toBe('India');
    expect(req.location.latitude).toBeNull();
    expect(req.location.longitude).toBeNull();
    expect(req.rawText).toBe(rawPayload.text);
    expect(req.confidence).toBeGreaterThan(0);
  });

  it('normalizes WhatsApp messaging payload for electricity category', () => {
    const rawPayload = {
      text: 'Sector 15 me naya transformer chahiye, har shaam ko bijli aur light chali jati hai',
      sourceChannel: 'whatsapp_msg',
      timestamp: '2026-09-10T11:00:00.000Z'
    };

    const req = DevelopmentRequestNormalizer.normalizeToDevelopmentRequest(rawPayload, 'provider-whatsapp', 'LIVE');

    expect(req.sourceChannel).toBe('MESSAGING');
    expect(req.category).toBe('ELECTRICITY');
    expect(req.mode).toBe('LIVE');
    expect(req.rawText).toContain('transformer');
  });

  it('normalizes malformed or minimal payload gracefully without throwing', () => {
    const rawPayload = {
      text: '',
      channel: 'unknown_source'
    };

    const req = DevelopmentRequestNormalizer.normalizeToDevelopmentRequest(rawPayload as any, 'provider-unknown', 'SIMULATION');

    expect(req.category).toBe('OTHER');
    expect(req.sourceChannel).toBe('TEXT');
    expect(req.mode).toBe('SIMULATION');
    expect(req.location.country).toBe('India');
    expect(req.location.latitude).toBeNull();
    expect(req.location.longitude).toBeNull();
    expect(req.evidence.length).toBe(4);
  });
});

