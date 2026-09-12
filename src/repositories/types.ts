import type { CivicSignal } from '../types/civic';
import type {
  DevelopmentHotspot,
  DevelopmentImpact,
  DevelopmentProjectRecommendation,
  DevelopmentRequest,
} from '../types/development';

export type PersistenceMode = 'FIREBASE_LIVE' | 'REPLAY' | 'SIMULATION';

export interface RepositoryStatus {
  mode: PersistenceMode;
  isLive: boolean;
  provider: 'Firestore' | 'InMemoryFallback';
}

export interface ISignalRepository {
  getAll(): Promise<CivicSignal[]>;
  save(signal: CivicSignal): Promise<CivicSignal>;
  saveBatch(signals: CivicSignal[]): Promise<CivicSignal[]>;
  getStatus(): RepositoryStatus;
}

export interface IDevelopmentRequestRepository {
  getAll(): Promise<DevelopmentRequest[]>;
  getById(id: string): Promise<DevelopmentRequest | null>;
  save(request: DevelopmentRequest): Promise<DevelopmentRequest>;
  saveBatch(requests: DevelopmentRequest[]): Promise<DevelopmentRequest[]>;
  getStatus(): RepositoryStatus;
}

export interface IDevelopmentHotspotRepository {
  getAll(): Promise<DevelopmentHotspot[]>;
  save(hotspot: DevelopmentHotspot): Promise<DevelopmentHotspot>;
  saveBatch(hotspots: DevelopmentHotspot[]): Promise<DevelopmentHotspot[]>;
  getStatus(): RepositoryStatus;
}

export interface IProjectRepository {
  getAll(): Promise<DevelopmentProjectRecommendation[]>;
  save(project: DevelopmentProjectRecommendation): Promise<DevelopmentProjectRecommendation>;
  updateStatus(id: string, status: string, details?: Record<string, unknown>): Promise<DevelopmentProjectRecommendation | null>;
  getStatus(): RepositoryStatus;
}

export interface IImpactRepository {
  getAll(): Promise<DevelopmentImpact[]>;
  save(impact: DevelopmentImpact): Promise<DevelopmentImpact>;
  saveBatch(impacts: DevelopmentImpact[]): Promise<DevelopmentImpact[]>;
  getStatus(): RepositoryStatus;
}
