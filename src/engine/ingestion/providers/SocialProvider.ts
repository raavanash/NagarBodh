import { DevelopmentRequest, DevelopmentRequestChannel, DevelopmentRequestMode } from '../../../types/development';
import { RawSignalPayload } from '../../../types/ingestion';
import { DevelopmentRequestNormalizer } from '../DevelopmentRequestNormalizer';
import { CitizenChannelProvider } from './CitizenChannelProvider';

export interface XSocialFixture {
  id: string;
  rawText: string;
  authorHandle: string;
  locationName: string;
  language: 'hi' | 'en' | 'hinglish';
  category: string;
  lat?: number;
  lng?: number;
}

export class SocialProvider implements CitizenChannelProvider {
  public readonly id = 'provider-citizen-social';
  public readonly name = 'Public Social Stream (X / Twitter API)';
  public readonly channelType: DevelopmentRequestChannel = 'SOCIAL';
  public readonly mode: DevelopmentRequestMode;

  public static readonly SAMPLE_X_FIXTURES: XSocialFixture[] = [
    {
      id: 'x-sig-501',
      rawText: 'हमारे इलाके में सरकारी अस्पताल नहीं है। Nearest hospital is 25 km away.',
      authorHandle: '@gramin_nagarik_x',
      locationName: 'Ward 18 - Sub-urban District',
      language: 'hi',
      category: 'HEALTHCARE',
      lat: 28.5200,
      lng: 77.2100
    },
    {
      id: 'x-sig-502',
      rawText: 'School is there but no teachers. Children losing study time for 6 months.',
      authorHandle: '@education_watch_x',
      locationName: 'Ward 12 - North Sub-district',
      language: 'en',
      category: 'EDUCATION',
      lat: 28.6900,
      lng: 77.1200
    },
    {
      id: 'x-sig-503',
      rawText: 'Drinking water supply has been irregular for months. Pipeline construction incomplete.',
      authorHandle: '@ncr_water_voice',
      locationName: 'Ward 07 - West Colony',
      language: 'en',
      category: 'WATER',
      lat: 28.6100,
      lng: 77.0500
    }
  ];

  constructor(mode: DevelopmentRequestMode = 'REPLAY') {
    this.mode = mode;
  }

  public async ingestRequest(input: string | RawSignalPayload | XSocialFixture): Promise<DevelopmentRequest> {
    const rawPayload: RawSignalPayload =
      typeof input === 'string'
        ? {
            id: `x-sig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            rawText: input,
            sourceChannel: 'SOCIAL',
            authorHandle: '@x_citizen',
            timestamp: new Date().toISOString()
          }
        : {
            ...input,
            sourceChannel: 'SOCIAL'
          };

    // Ensure source is explicitly set to X
    rawPayload.source = 'X';

    const req = DevelopmentRequestNormalizer.normalizeToDevelopmentRequest(
      rawPayload,
      'X',
      this.mode
    );

    req.source = 'X';
    req.evidence[0].source = `X / ${this.mode} (Signal ID: ${rawPayload.id || 'x-sig-live'})`;

    return req;
  }
}

