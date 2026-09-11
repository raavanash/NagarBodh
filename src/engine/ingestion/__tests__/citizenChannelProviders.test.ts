import { describe, expect, it } from 'vitest';
import { TextProvider } from '../providers/TextProvider';
import { VoiceProvider } from '../providers/VoiceProvider';
import { MessagingReplayProvider } from '../providers/MessagingReplayProvider';
import { SocialProvider } from '../providers/SocialProvider';
import { ReplayProvider } from '../providers/ReplayProvider';

describe('Citizen Channel Ingestion Providers', () => {
  it('TextProvider correctly normalizes Hindi, English, and Hinglish citizen requests', async () => {
    const provider = new TextProvider('LIVE');

    const hindiReq = await provider.ingestRequest('हमारे गांव में अस्पताल बहुत दूर है');
    expect(hindiReq.id).toBeDefined();
    expect(hindiReq.language).toBe('hi');
    expect(hindiReq.category).toBe('HEALTHCARE');
    expect(hindiReq.sourceChannel).toBe('TEXT');

    const engReq = await provider.ingestRequest('Nearest hospital is 25 km away.');
    expect(engReq.language).toBe('en');
    expect(engReq.category).toBe('HEALTHCARE');

    const hinglishReq = await provider.ingestRequest('Yahan drinking water ka proper arrangement nahi hai.');
    expect(hinglishReq.language).toBe('hinglish');
    expect(hinglishReq.category).toBe('WATER');
  });

  it('VoiceProvider creates DevelopmentRequest with VOICE — REPLAY provenance', async () => {
    const provider = new VoiceProvider('LIVE');

    const voiceReq = await provider.ingestRequest({
      transcriptText: 'हमारे गांव में अस्पताल बहुत दूर है, 25 km travel is required.',
      authorHandle: '+91-VoiceUser',
      location: 'Karol Bagh',
      isReplayFixture: true
    });

    expect(voiceReq.sourceChannel).toBe('VOICE');
    expect(voiceReq.evidence[0].snippet).toContain('VOICE — REPLAY');
    expect(voiceReq.category).toBe('HEALTHCARE');
  });

  it('MessagingReplayProvider creates WhatsApp-style request with MESSAGING — REPLAY tag', async () => {
    const provider = new MessagingReplayProvider();

    const msgReq = await provider.ingestRequest({
      messageText: 'Sir hamare area me school hai but teachers nahi hain.',
      senderPhoneOrHandle: '+91 98765 43210 (Citizen)',
      locationName: 'District X'
    });

    expect(msgReq.sourceChannel).toBe('MESSAGING');
    expect(msgReq.category).toBe('EDUCATION');
    expect(msgReq.evidence[0].snippet).toContain('MESSAGING — REPLAY');
  });

  it('SocialProvider creates canonical DevelopmentRequest from social feeds', async () => {
    const provider = new SocialProvider('LIVE');

    const socialReq = await provider.ingestRequest('Waterlogging flooded major subway underpass near Karol Bagh.');
    expect(socialReq.sourceChannel).toBe('SOCIAL');
    expect(socialReq.category).toBe('WATER');
  });

  it('ReplayProvider fetches batch historical dataset requests', async () => {
    const provider = new ReplayProvider();

    const batch = await provider.fetchBatchRequests();
    expect(batch.length).toBeGreaterThan(0);
    expect(batch[0].sourceChannel).toBe('REPLAY');
    expect(batch[0].mode).toBe('REPLAY');
  });
});
