import { DevelopmentRequest, DevelopmentRequestChannel, DevelopmentRequestMode } from '../../../types/development';
import { RawSignalPayload } from '../../../types/ingestion';
import { DevelopmentRequestNormalizer } from '../DevelopmentRequestNormalizer';
import { CitizenChannelProvider } from './CitizenChannelProvider';

export class TextProvider implements CitizenChannelProvider {
  public readonly id = 'provider-citizen-text';
  public readonly name = 'Multilingual Text Ingestion Provider';
  public readonly channelType: DevelopmentRequestChannel = 'TEXT';
  public readonly mode: DevelopmentRequestMode;

  constructor(mode: DevelopmentRequestMode = 'LIVE') {
    this.mode = mode;
  }

  public async ingestRequest(rawPayload: string | RawSignalPayload): Promise<DevelopmentRequest> {
    const payloadObj: RawSignalPayload =
      typeof rawPayload === 'string'
        ? {
            id: `text-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            rawText: rawPayload,
            sourceChannel: 'TEXT',
            timestamp: new Date().toISOString()
          }
        : {
            ...rawPayload,
            sourceChannel: rawPayload.sourceChannel || 'TEXT'
          };

    return DevelopmentRequestNormalizer.normalizeToDevelopmentRequest(
      payloadObj,
      this.id,
      this.mode
    );
  }
}
