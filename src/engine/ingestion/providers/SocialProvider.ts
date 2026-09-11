import { DevelopmentRequest, DevelopmentRequestChannel, DevelopmentRequestMode } from '../../../types/development';
import { RawSignalPayload } from '../../../types/ingestion';
import { DevelopmentRequestNormalizer } from '../DevelopmentRequestNormalizer';
import { CitizenChannelProvider } from './CitizenChannelProvider';

export class SocialProvider implements CitizenChannelProvider {
  public readonly id = 'provider-citizen-social';
  public readonly name = 'Bluesky & Public Social Media Provider';
  public readonly channelType: DevelopmentRequestChannel = 'SOCIAL';
  public readonly mode: DevelopmentRequestMode;

  constructor(mode: DevelopmentRequestMode = 'LIVE') {
    this.mode = mode;
  }

  public async ingestRequest(input: string | RawSignalPayload): Promise<DevelopmentRequest> {
    const rawPayload: RawSignalPayload =
      typeof input === 'string'
        ? {
            id: `social-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            rawText: input,
            sourceChannel: 'SOCIAL',
            authorHandle: '@social_citizen',
            timestamp: new Date().toISOString()
          }
        : {
            ...input,
            sourceChannel: 'SOCIAL'
          };

    return DevelopmentRequestNormalizer.normalizeToDevelopmentRequest(
      rawPayload,
      this.id,
      this.mode
    );
  }
}
