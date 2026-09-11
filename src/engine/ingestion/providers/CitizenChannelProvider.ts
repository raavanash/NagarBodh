import { DevelopmentRequest, DevelopmentRequestChannel, DevelopmentRequestMode } from '../../../types/development';

export interface CitizenChannelProvider {
  readonly id: string;
  readonly name: string;
  readonly channelType: DevelopmentRequestChannel;
  readonly mode: DevelopmentRequestMode;

  /**
   * Ingests a raw citizen input payload and normalizes it into a canonical DevelopmentRequest.
   */
  ingestRequest(rawPayload: any): Promise<DevelopmentRequest>;

  /**
   * Optional method to fetch or poll a batch of incoming citizen requests.
   */
  fetchBatchRequests?(): Promise<DevelopmentRequest[]>;
}
