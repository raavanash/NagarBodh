import { DevelopmentRequest, DevelopmentRequestChannel, DevelopmentRequestMode } from '../../../types/development';
import { RawSignalPayload } from '../../../types/ingestion';
import { DevelopmentRequestNormalizer } from '../DevelopmentRequestNormalizer';
import { CitizenChannelProvider } from './CitizenChannelProvider';

export interface MessagingPayload {
  messageText: string;
  senderPhoneOrHandle?: string;
  locationName?: string;
  district?: string;
  isReplayFixture?: boolean;
}

export class MessagingReplayProvider implements CitizenChannelProvider {
  public readonly id = 'provider-citizen-messaging';
  public readonly name = 'WhatsApp / Messaging App Replay Provider';
  public readonly channelType: DevelopmentRequestChannel = 'MESSAGING';
  public readonly mode: DevelopmentRequestMode = 'REPLAY';

  // Realistic sample WhatsApp / messaging conversation fixtures
  public static readonly SAMPLE_MESSAGING_FIXTURES = [
    {
      id: 'msg-fixture-1',
      sender: '+91 98765 43210 (Citizen)',
      rawText: 'Sir hamare area me school hai but teachers nahi hain.',
      language: 'hinglish',
      location: 'District X',
      category: 'EDUCATION',
      demandTheme: 'Teacher capacity'
    },
    {
      id: 'msg-fixture-2',
      sender: '+91 98123 45678 (Citizen)',
      rawText: 'हमारे गांव में अस्पताल बहुत दूर है, एम्बुलेंस भी समय पर नहीं आती।',
      language: 'hi',
      location: 'Karol Bagh Ward 14',
      category: 'HEALTHCARE',
      demandTheme: 'Healthcare access & emergency transit'
    },
    {
      id: 'msg-fixture-3',
      sender: '+91 99555 12345 (Citizen)',
      rawText: 'Yahan drinking water ka proper arrangement nahi hai, clean water supply is irregular.',
      language: 'hinglish',
      location: 'Mayur Vihar Sector 2',
      category: 'WATER',
      demandTheme: 'Drinking water reliability'
    }
  ];

  public async ingestRequest(input: string | MessagingPayload | RawSignalPayload): Promise<DevelopmentRequest> {
    let text = '';
    let sender = '+91-MessagingUser';
    let locationName = 'Regional Sector';

    if (typeof input === 'string') {
      text = input;
    } else if ('messageText' in input && input.messageText) {
      text = input.messageText;
      sender = input.senderPhoneOrHandle || sender;
      locationName = input.locationName || locationName;
    } else if ('rawText' in input && input.rawText) {
      text = input.rawText;
      sender = input.authorHandle || sender;
    } else {
      text = MessagingReplayProvider.SAMPLE_MESSAGING_FIXTURES[0].rawText;
    }

    const payloadObj: RawSignalPayload = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      rawText: text,
      sourceChannel: 'MESSAGING',
      authorHandle: sender,
      locationName,
      timestamp: new Date().toISOString()
    };

    const request = DevelopmentRequestNormalizer.normalizeToDevelopmentRequest(
      payloadObj,
      this.id,
      'REPLAY'
    );

    // Label with explicit MESSAGING — REPLAY tag
    request.evidence.unshift({
      classification: 'OBSERVED',
      snippet: `[MESSAGING — REPLAY] "${text}"`,
      source: `WhatsApp/Messaging Replay Channel (${sender})`,
      confidence: 0.95
    });

    return request;
  }

  public async fetchBatchRequests(): Promise<DevelopmentRequest[]> {
    const list: DevelopmentRequest[] = [];
    for (const fixture of MessagingReplayProvider.SAMPLE_MESSAGING_FIXTURES) {
      const req = await this.ingestRequest({
        messageText: fixture.rawText,
        senderPhoneOrHandle: fixture.sender,
        locationName: fixture.location,
        isReplayFixture: true
      });
      list.push(req);
    }
    return list;
  }
}
