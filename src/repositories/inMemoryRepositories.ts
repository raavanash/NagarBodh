import type { CivicSignal } from '../types/civic';
import type {
  DevelopmentHotspot,
  DevelopmentImpact,
  DevelopmentProjectRecommendation,
  DevelopmentRequest,
} from '../types/development';
import type {
  IDevelopmentHotspotRepository,
  IDevelopmentRequestRepository,
  IImpactRepository,
  IProjectRepository,
  ISignalRepository,
  RepositoryStatus,
} from './types';

export class InMemorySignalRepository implements ISignalRepository {
  private store: Map<string, CivicSignal> = new Map();
  private mode: 'REPLAY' | 'SIMULATION';

  constructor(initialData: CivicSignal[] = [], mode: 'REPLAY' | 'SIMULATION' = 'SIMULATION') {
    this.mode = mode;
    initialData.forEach((s) => this.store.set(s.id, s));
  }

  async getAll(): Promise<CivicSignal[]> {
    return Array.from(this.store.values());
  }

  async save(signal: CivicSignal): Promise<CivicSignal> {
    this.store.set(signal.id, signal);
    return signal;
  }

  async saveBatch(signals: CivicSignal[]): Promise<CivicSignal[]> {
    signals.forEach((s) => this.store.set(s.id, s));
    return signals;
  }

  getStatus(): RepositoryStatus {
    return {
      mode: this.mode,
      isLive: false,
      provider: 'InMemoryFallback',
    };
  }
}

export class InMemoryDevelopmentRequestRepository implements IDevelopmentRequestRepository {
  private store: Map<string, DevelopmentRequest> = new Map();
  private mode: 'REPLAY' | 'SIMULATION';

  constructor(initialData: DevelopmentRequest[] = [], mode: 'REPLAY' | 'SIMULATION' = 'SIMULATION') {
    this.mode = mode;
    initialData.forEach((r) => this.store.set(r.id, r));
  }

  async getAll(): Promise<DevelopmentRequest[]> {
    return Array.from(this.store.values());
  }

  async getById(id: string): Promise<DevelopmentRequest | null> {
    return this.store.get(id) || null;
  }

  async save(request: DevelopmentRequest): Promise<DevelopmentRequest> {
    this.store.set(request.id, request);
    return request;
  }

  async saveBatch(requests: DevelopmentRequest[]): Promise<DevelopmentRequest[]> {
    requests.forEach((r) => this.store.set(r.id, r));
    return requests;
  }

  getStatus(): RepositoryStatus {
    return {
      mode: this.mode,
      isLive: false,
      provider: 'InMemoryFallback',
    };
  }
}

export class InMemoryHotspotRepository implements IDevelopmentHotspotRepository {
  private store: Map<string, DevelopmentHotspot> = new Map();
  private mode: 'REPLAY' | 'SIMULATION';

  constructor(initialData: DevelopmentHotspot[] = [], mode: 'REPLAY' | 'SIMULATION' = 'SIMULATION') {
    this.mode = mode;
    initialData.forEach((h) => this.store.set(h.id, h));
  }

  async getAll(): Promise<DevelopmentHotspot[]> {
    return Array.from(this.store.values());
  }

  async save(hotspot: DevelopmentHotspot): Promise<DevelopmentHotspot> {
    this.store.set(hotspot.id, hotspot);
    return hotspot;
  }

  async saveBatch(hotspots: DevelopmentHotspot[]): Promise<DevelopmentHotspot[]> {
    hotspots.forEach((h) => this.store.set(h.id, h));
    return hotspots;
  }

  getStatus(): RepositoryStatus {
    return {
      mode: this.mode,
      isLive: false,
      provider: 'InMemoryFallback',
    };
  }
}

export class InMemoryProjectRepository implements IProjectRepository {
  private store: Map<string, DevelopmentProjectRecommendation> = new Map();
  private mode: 'REPLAY' | 'SIMULATION';

  constructor(initialData: DevelopmentProjectRecommendation[] = [], mode: 'REPLAY' | 'SIMULATION' = 'SIMULATION') {
    this.mode = mode;
    initialData.forEach((p) => this.store.set(p.id, p));
  }

  async getAll(): Promise<DevelopmentProjectRecommendation[]> {
    return Array.from(this.store.values());
  }

  async save(project: DevelopmentProjectRecommendation): Promise<DevelopmentProjectRecommendation> {
    this.store.set(project.id, project);
    return project;
  }

  async updateStatus(id: string, status: string, details?: Record<string, unknown>): Promise<DevelopmentProjectRecommendation | null> {
    const existing = this.store.get(id);
    if (!existing) return null;

    const updated: DevelopmentProjectRecommendation = {
      ...existing,
      implementationConsiderations: [
        ...existing.implementationConsiderations,
        `Status updated to ${status}` + (details ? `: ${JSON.stringify(details)}` : ''),
      ],
    };
    this.store.set(id, updated);
    return updated;
  }

  getStatus(): RepositoryStatus {
    return {
      mode: this.mode,
      isLive: false,
      provider: 'InMemoryFallback',
    };
  }
}

export class InMemoryImpactRepository implements IImpactRepository {
  private store: Map<string, DevelopmentImpact> = new Map();
  private mode: 'REPLAY' | 'SIMULATION';

  constructor(initialData: DevelopmentImpact[] = [], mode: 'REPLAY' | 'SIMULATION' = 'SIMULATION') {
    this.mode = mode;
    initialData.forEach((imp) => this.store.set(imp.id, imp));
  }

  async getAll(): Promise<DevelopmentImpact[]> {
    return Array.from(this.store.values());
  }

  async save(impact: DevelopmentImpact): Promise<DevelopmentImpact> {
    this.store.set(impact.id, impact);
    return impact;
  }

  async saveBatch(impacts: DevelopmentImpact[]): Promise<DevelopmentImpact[]> {
    impacts.forEach((imp) => this.store.set(imp.id, imp));
    return impacts;
  }

  getStatus(): RepositoryStatus {
    return {
      mode: this.mode,
      isLive: false,
      provider: 'InMemoryFallback',
    };
  }
}
