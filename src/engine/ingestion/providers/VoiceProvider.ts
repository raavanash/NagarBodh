import { DevelopmentRequest, DevelopmentRequestChannel, DevelopmentRequestMode } from '../../../types/development';
import { RawSignalPayload } from '../../../types/ingestion';
import { DevelopmentRequestNormalizer } from '../DevelopmentRequestNormalizer';
import { CitizenChannelProvider } from './CitizenChannelProvider';

export interface VoiceInputPayload {
  transcriptText?: string;
  audioBlobUrl?: string;
  audioFileName?: string;
  durationSeconds?: number;
  isReplayFixture?: boolean;
  authorHandle?: string;
  location?: string;
  lat?: number;
  lng?: number;
}

export class VoiceProvider implements CitizenChannelProvider {
  public readonly id = 'provider-citizen-voice';
  public readonly name = 'Multilingual Voice & Audio Ingestion Provider';
  public readonly channelType: DevelopmentRequestChannel = 'VOICE';
  public readonly mode: DevelopmentRequestMode;

  // Realistic sample voice replay fixtures
  public static readonly SAMPLE_VOICE_FIXTURES = [
    {
      id: 'voice-fixture-1',
      rawText: 'हमारे गांव में अस्पताल बहुत दूर है, आपातकालीन स्थिति में 25 किलोमीटर जाना पड़ता है।',
      language: 'hi',
      authorHandle: 'voice_call_98101',
      location: 'Karol Bagh Medical Hub',
      category: 'HEALTHCARE'
    },
    {
      id: 'voice-fixture-2',
      rawText: 'Nearest secondary school is 25 km away, children have no safe transit option.',
      language: 'en',
      authorHandle: 'voice_call_98102',
      location: 'Mayur Vihar Sector 1',
      category: 'EDUCATION'
    },
    {
      id: 'voice-fixture-3',
      rawText: 'Yahan drinking water ka proper arrangement nahi hai, paani ki pipeline toot chuki hai.',
      language: 'hinglish',
      authorHandle: 'voice_call_98103',
      location: 'Rohini Sector 7',
      category: 'WATER'
    }
  ];

  constructor(mode: DevelopmentRequestMode = 'LIVE') {
    this.mode = mode;
  }

  public async ingestRequest(input: string | VoiceInputPayload | RawSignalPayload): Promise<DevelopmentRequest> {
    let transcriptText = '';
    let authorHandle = 'voice_citizen';
    let locationStr = 'District Sub-region';
    let isReplay = false;

    if (typeof input === 'string') {
      transcriptText = input;
    } else if ('transcriptText' in input && input.transcriptText) {
      transcriptText = input.transcriptText;
      authorHandle = input.authorHandle || authorHandle;
      locationStr = input.location || locationStr;
      isReplay = !!input.isReplayFixture;
    } else if ('rawText' in input && input.rawText) {
      transcriptText = input.rawText;
      authorHandle = input.authorHandle || authorHandle;
    } else {
      // Default to sample fixture if audio only
      const sample = VoiceProvider.SAMPLE_VOICE_FIXTURES[0];
      transcriptText = sample.rawText;
      isReplay = true;
    }

    const rawPayload: RawSignalPayload = {
      id: `voice-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      rawText: transcriptText,
      sourceChannel: 'VOICE',
      authorHandle,
      locationName: locationStr,
      timestamp: new Date().toISOString()
    };

    const request = DevelopmentRequestNormalizer.normalizeToDevelopmentRequest(
      rawPayload,
      this.id,
      isReplay ? 'REPLAY' : this.mode
    );

    // Attach Voice evidence metadata
    request.evidence.unshift({
      classification: 'OBSERVED',
      snippet: `[VOICE — ${isReplay ? 'REPLAY' : 'LIVE TRANSCRIPT'}] "${transcriptText}"`,
      source: `Voice Channel Provider (${isReplay ? 'Replay Fixture' : 'Speech-to-Text'})`,
      confidence: 0.92
    });

    return request;
  }

  public async fetchBatchRequests(): Promise<DevelopmentRequest[]> {
    const results: DevelopmentRequest[] = [];
    for (const fixture of VoiceProvider.SAMPLE_VOICE_FIXTURES) {
      const req = await this.ingestRequest({
        transcriptText: fixture.rawText,
        authorHandle: fixture.authorHandle,
        location: fixture.location,
        isReplayFixture: true
      });
      results.push(req);
    }
    return results;
  }
}
