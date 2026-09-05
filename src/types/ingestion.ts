import { CivicCategory, CivicSignal, DetectedLanguage, SeverityLevel, SignalChannel } from './civic';

export type IngestionMode = 'LIVE' | 'REPLAY' | 'SIMULATION';
export type ProviderType = 'simulation' | 'citizen_app' | 'social_x' | 'govt_grievance' | 'file_import';

export interface RawSignalPayload {
  id?: string;
  sourceChannel?: string | SignalChannel;
  text?: string;
  body?: string;
  message?: string;
  rawText?: string;
  timestamp?: string;
  time?: string;
  createdAt?: string;
  language?: string | DetectedLanguage;
  lat?: number | string;
  lng?: number | string;
  latitude?: number | string;
  longitude?: number | string;
  coordinates?: { lat: number; lng: number };
  location?: string;
  locationName?: string;
  ward?: string;
  author?: string;
  authorHandle?: string;
  category?: string | CivicCategory;
  severity?: string | SeverityLevel;
  mediaUrl?: string;
  imageUrl?: string;
  upvotes?: number;
  [key: string]: any;
}

export interface SourceMetadata {
  providerId: string;
  providerType: ProviderType;
  rawChannel: string;
  originalId?: string;
  ingestedAt: string;
  fingerprintHash: string;
  isMockOrReplay: boolean;
}

export interface IngestedCivicSignal extends CivicSignal {
  sourceMetadata: SourceMetadata;
  isCivicRelevant: boolean;
}

export interface NormalizationResult {
  success: boolean;
  signal?: IngestedCivicSignal;
  error?: string;
  isDuplicate?: boolean;
  isCivicRelevant?: boolean;
}

export interface IngestionStats {
  signalsReceived: number;
  accepted: number;
  rejected: number;
  duplicates: number;
  civicRelevant: number;
  analyzed: number;
  clustered: number;
}

export interface SignalProvider {
  id: string;
  name: string;
  type: ProviderType;
  mode: IngestionMode;
  isAvailable(): Promise<boolean>;
  fetchOrIngest(payload?: RawSignalPayload | RawSignalPayload[]): Promise<RawSignalPayload[]>;
}
