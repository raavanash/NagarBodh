import { DevelopmentRequest, DevelopmentRequestChannel, DevelopmentRequestMode } from '../../../types/development';
import { RawSignalPayload } from '../../../types/ingestion';
import { DevelopmentRequestNormalizer } from '../DevelopmentRequestNormalizer';
import { CitizenChannelProvider } from './CitizenChannelProvider';

export class ReplayProvider implements CitizenChannelProvider {
  public readonly id = 'provider-citizen-replay';
  public readonly name = 'Historical Citizen Demand Dataset Replay Provider';
  public readonly channelType: DevelopmentRequestChannel = 'REPLAY';
  public readonly mode: DevelopmentRequestMode = 'REPLAY';

  public static readonly HISTORICAL_REPLAY_FIXTURES = [
    {
      rawText: 'हमारे गांव में अस्पताल बहुत दूर है, प्राथमिक स्वास्थ्य केंद्र (PHC) अपग्रेड करें।',
      authorHandle: 'replay_dataset_in_01',
      locationName: 'Karol Bagh Ward 14'
    },
    {
      rawText: 'Nearest hospital is 25 km away, need emergency sub-center and transit ambulance.',
      authorHandle: 'replay_dataset_in_02',
      locationName: 'Mayur Vihar Phase 1'
    },
    {
      rawText: 'Yahan drinking water ka proper arrangement nahi hai, clean pipeline supply required.',
      authorHandle: 'replay_dataset_in_03',
      locationName: 'Rohini Sector 7'
    },
    {
      rawText: 'Sir hamare area me school hai but teachers nahi hain, secondary classroom extension needed.',
      authorHandle: 'replay_dataset_in_04',
      locationName: 'East Delhi Sector 4'
    }
  ];

  public async ingestRequest(input: string | RawSignalPayload): Promise<DevelopmentRequest> {
    const rawPayload: RawSignalPayload =
      typeof input === 'string'
        ? {
            id: `replay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            rawText: input,
            sourceChannel: 'REPLAY',
            authorHandle: 'replay_system',
            timestamp: new Date().toISOString()
          }
        : {
            ...input,
            sourceChannel: 'REPLAY'
          };

    return DevelopmentRequestNormalizer.normalizeToDevelopmentRequest(
      rawPayload,
      this.id,
      'REPLAY'
    );
  }

  public async fetchBatchRequests(): Promise<DevelopmentRequest[]> {
    const list: DevelopmentRequest[] = [];
    for (const fixture of ReplayProvider.HISTORICAL_REPLAY_FIXTURES) {
      const req = await this.ingestRequest(fixture);
      list.push(req);
    }
    return list;
  }
}
