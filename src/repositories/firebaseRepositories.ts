import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  type Firestore,
} from 'firebase/firestore';
import { getDb, isFirebaseAvailable } from '../lib/firebase';
import type { CivicSignal } from '../types/civic';
import type {
  DevelopmentHotspot,
  DevelopmentImpact,
  DevelopmentProjectRecommendation,
  DevelopmentRequest,
} from '../types/development';
import {
  InMemoryDevelopmentRequestRepository,
  InMemoryHotspotRepository,
  InMemoryImpactRepository,
  InMemoryProjectRepository,
  InMemorySignalRepository,
} from './inMemoryRepositories';
import type {
  IDevelopmentHotspotRepository,
  IDevelopmentRequestRepository,
  IImpactRepository,
  IProjectRepository,
  ISignalRepository,
  RepositoryStatus,
} from './types';

// Collection constants
export const COLLECTIONS = {
  SIGNALS: 'signals',
  DEVELOPMENT_REQUESTS: 'developmentRequests',
  DEVELOPMENT_HOTSPOTS: 'developmentHotspots',
  PROJECTS: 'projects',
  IMPACTS: 'impacts',
} as const;

export class FirebaseSignalRepository implements ISignalRepository {
  private fallback: InMemorySignalRepository;

  constructor(initialFallbackData: CivicSignal[] = [], private dbOverride?: Firestore) {
    this.fallback = new InMemorySignalRepository(initialFallbackData, 'SIMULATION');
  }

  private get db(): Firestore | null {
    return this.dbOverride || getDb();
  }

  getStatus(): RepositoryStatus {
    const live = Boolean(this.db && isFirebaseAvailable());
    return {
      mode: live ? 'FIREBASE_LIVE' : 'SIMULATION',
      isLive: live,
      provider: live ? 'Firestore' : 'InMemoryFallback',
    };
  }

  async getAll(): Promise<CivicSignal[]> {
    if (!this.db) {
      return this.fallback.getAll();
    }
    try {
      const snap = await getDocs(collection(this.db, COLLECTIONS.SIGNALS));
      if (snap.empty) {
        return this.fallback.getAll();
      }
      const signals: CivicSignal[] = [];
      snap.forEach((d) => {
        signals.push({ id: d.id, ...d.data() } as CivicSignal);
      });
      return signals;
    } catch (err) {
      console.warn('[FirebaseSignalRepository] Firestore read error, falling back to in-memory store:', err);
      return this.fallback.getAll();
    }
  }

  async save(signal: CivicSignal): Promise<CivicSignal> {
    await this.fallback.save(signal);
    if (!this.db) {
      return signal;
    }
    try {
      const ref = doc(this.db, COLLECTIONS.SIGNALS, signal.id);
      await setDoc(ref, signal, { merge: true });
    } catch (err) {
      console.warn('[FirebaseSignalRepository] Firestore write error, saved to in-memory fallback:', err);
    }
    return signal;
  }

  async saveBatch(signals: CivicSignal[]): Promise<CivicSignal[]> {
    await this.fallback.saveBatch(signals);
    if (!this.db) {
      return signals;
    }
    try {
      await Promise.all(
        signals.map((s) => {
          const ref = doc(this.db!, COLLECTIONS.SIGNALS, s.id);
          return setDoc(ref, s, { merge: true });
        })
      );
    } catch (err) {
      console.warn('[FirebaseSignalRepository] Firestore batch write error:', err);
    }
    return signals;
  }
}

export class FirebaseDevelopmentRequestRepository implements IDevelopmentRequestRepository {
  private fallback: InMemoryDevelopmentRequestRepository;

  constructor(initialFallbackData: DevelopmentRequest[] = [], private dbOverride?: Firestore) {
    this.fallback = new InMemoryDevelopmentRequestRepository(initialFallbackData, 'SIMULATION');
  }

  private get db(): Firestore | null {
    return this.dbOverride || getDb();
  }

  getStatus(): RepositoryStatus {
    const live = Boolean(this.db && isFirebaseAvailable());
    return {
      mode: live ? 'FIREBASE_LIVE' : 'SIMULATION',
      isLive: live,
      provider: live ? 'Firestore' : 'InMemoryFallback',
    };
  }

  async getAll(): Promise<DevelopmentRequest[]> {
    if (!this.db) {
      return this.fallback.getAll();
    }
    try {
      const snap = await getDocs(collection(this.db, COLLECTIONS.DEVELOPMENT_REQUESTS));
      if (snap.empty) {
        return this.fallback.getAll();
      }
      const requests: DevelopmentRequest[] = [];
      snap.forEach((d) => {
        requests.push({ id: d.id, ...d.data() } as DevelopmentRequest);
      });
      return requests;
    } catch (err) {
      console.warn('[FirebaseDevelopmentRequestRepository] Firestore read error:', err);
      return this.fallback.getAll();
    }
  }

  async getById(id: string): Promise<DevelopmentRequest | null> {
    if (!this.db) {
      return this.fallback.getById(id);
    }
    try {
      const snap = await getDoc(doc(this.db, COLLECTIONS.DEVELOPMENT_REQUESTS, id));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as DevelopmentRequest;
      }
      return this.fallback.getById(id);
    } catch (err) {
      console.warn('[FirebaseDevelopmentRequestRepository] Firestore getById error:', err);
      return this.fallback.getById(id);
    }
  }

  async save(request: DevelopmentRequest): Promise<DevelopmentRequest> {
    await this.fallback.save(request);
    if (!this.db) {
      return request;
    }
    try {
      const ref = doc(this.db, COLLECTIONS.DEVELOPMENT_REQUESTS, request.id);
      await setDoc(ref, request, { merge: true });
    } catch (err) {
      console.warn('[FirebaseDevelopmentRequestRepository] Firestore write error:', err);
    }
    return request;
  }

  async saveBatch(requests: DevelopmentRequest[]): Promise<DevelopmentRequest[]> {
    await this.fallback.saveBatch(requests);
    if (!this.db) {
      return requests;
    }
    try {
      await Promise.all(
        requests.map((r) => {
          const ref = doc(this.db!, COLLECTIONS.DEVELOPMENT_REQUESTS, r.id);
          return setDoc(ref, r, { merge: true });
        })
      );
    } catch (err) {
      console.warn('[FirebaseDevelopmentRequestRepository] Firestore batch error:', err);
    }
    return requests;
  }
}

export class FirebaseHotspotRepository implements IDevelopmentHotspotRepository {
  private fallback: InMemoryHotspotRepository;

  constructor(initialFallbackData: DevelopmentHotspot[] = [], private dbOverride?: Firestore) {
    this.fallback = new InMemoryHotspotRepository(initialFallbackData, 'SIMULATION');
  }

  private get db(): Firestore | null {
    return this.dbOverride || getDb();
  }

  getStatus(): RepositoryStatus {
    const live = Boolean(this.db && isFirebaseAvailable());
    return {
      mode: live ? 'FIREBASE_LIVE' : 'SIMULATION',
      isLive: live,
      provider: live ? 'Firestore' : 'InMemoryFallback',
    };
  }

  async getAll(): Promise<DevelopmentHotspot[]> {
    if (!this.db) {
      return this.fallback.getAll();
    }
    try {
      const snap = await getDocs(collection(this.db, COLLECTIONS.DEVELOPMENT_HOTSPOTS));
      if (snap.empty) {
        return this.fallback.getAll();
      }
      const hotspots: DevelopmentHotspot[] = [];
      snap.forEach((d) => {
        hotspots.push({ id: d.id, ...d.data() } as DevelopmentHotspot);
      });
      return hotspots;
    } catch (err) {
      console.warn('[FirebaseHotspotRepository] Firestore read error:', err);
      return this.fallback.getAll();
    }
  }

  async save(hotspot: DevelopmentHotspot): Promise<DevelopmentHotspot> {
    await this.fallback.save(hotspot);
    if (!this.db) {
      return hotspot;
    }
    try {
      const ref = doc(this.db, COLLECTIONS.DEVELOPMENT_HOTSPOTS, hotspot.id);
      await setDoc(ref, hotspot, { merge: true });
    } catch (err) {
      console.warn('[FirebaseHotspotRepository] Firestore write error:', err);
    }
    return hotspot;
  }

  async saveBatch(hotspots: DevelopmentHotspot[]): Promise<DevelopmentHotspot[]> {
    await this.fallback.saveBatch(hotspots);
    if (!this.db) {
      return hotspots;
    }
    try {
      await Promise.all(
        hotspots.map((h) => {
          const ref = doc(this.db!, COLLECTIONS.DEVELOPMENT_HOTSPOTS, h.id);
          return setDoc(ref, h, { merge: true });
        })
      );
    } catch (err) {
      console.warn('[FirebaseHotspotRepository] Firestore batch write error:', err);
    }
    return hotspots;
  }
}

export class FirebaseProjectRepository implements IProjectRepository {
  private fallback: InMemoryProjectRepository;

  constructor(initialFallbackData: DevelopmentProjectRecommendation[] = [], private dbOverride?: Firestore) {
    this.fallback = new InMemoryProjectRepository(initialFallbackData, 'SIMULATION');
  }

  private get db(): Firestore | null {
    return this.dbOverride || getDb();
  }

  getStatus(): RepositoryStatus {
    const live = Boolean(this.db && isFirebaseAvailable());
    return {
      mode: live ? 'FIREBASE_LIVE' : 'SIMULATION',
      isLive: live,
      provider: live ? 'Firestore' : 'InMemoryFallback',
    };
  }

  async getAll(): Promise<DevelopmentProjectRecommendation[]> {
    if (!this.db) {
      return this.fallback.getAll();
    }
    try {
      const snap = await getDocs(collection(this.db, COLLECTIONS.PROJECTS));
      if (snap.empty) {
        return this.fallback.getAll();
      }
      const projects: DevelopmentProjectRecommendation[] = [];
      snap.forEach((d) => {
        projects.push({ id: d.id, ...d.data() } as DevelopmentProjectRecommendation);
      });
      return projects;
    } catch (err) {
      console.warn('[FirebaseProjectRepository] Firestore read error:', err);
      return this.fallback.getAll();
    }
  }

  async save(project: DevelopmentProjectRecommendation): Promise<DevelopmentProjectRecommendation> {
    await this.fallback.save(project);
    if (!this.db) {
      return project;
    }
    try {
      const ref = doc(this.db, COLLECTIONS.PROJECTS, project.id);
      await setDoc(ref, project, { merge: true });
    } catch (err) {
      console.warn('[FirebaseProjectRepository] Firestore write error:', err);
    }
    return project;
  }

  async updateStatus(id: string, status: string, details?: Record<string, unknown>): Promise<DevelopmentProjectRecommendation | null> {
    const updatedFallback = await this.fallback.updateStatus(id, status, details);
    if (!this.db) {
      return updatedFallback;
    }
    try {
      const ref = doc(this.db, COLLECTIONS.PROJECTS, id);
      await updateDoc(ref, {
        status,
        lastUpdated: new Date().toISOString(),
        ...(details ? { statusDetails: details } : {}),
      });
    } catch (err) {
      console.warn('[FirebaseProjectRepository] Firestore update error:', err);
    }
    return updatedFallback;
  }
}

export class FirebaseImpactRepository implements IImpactRepository {
  private fallback: InMemoryImpactRepository;

  constructor(initialFallbackData: DevelopmentImpact[] = [], private dbOverride?: Firestore) {
    this.fallback = new InMemoryImpactRepository(initialFallbackData, 'SIMULATION');
  }

  private get db(): Firestore | null {
    return this.dbOverride || getDb();
  }

  getStatus(): RepositoryStatus {
    const live = Boolean(this.db && isFirebaseAvailable());
    return {
      mode: live ? 'FIREBASE_LIVE' : 'SIMULATION',
      isLive: live,
      provider: live ? 'Firestore' : 'InMemoryFallback',
    };
  }

  async getAll(): Promise<DevelopmentImpact[]> {
    if (!this.db) {
      return this.fallback.getAll();
    }
    try {
      const snap = await getDocs(collection(this.db, COLLECTIONS.IMPACTS));
      if (snap.empty) {
        return this.fallback.getAll();
      }
      const impacts: DevelopmentImpact[] = [];
      snap.forEach((d) => {
        impacts.push({ id: d.id, ...d.data() } as DevelopmentImpact);
      });
      return impacts;
    } catch (err) {
      console.warn('[FirebaseImpactRepository] Firestore read error:', err);
      return this.fallback.getAll();
    }
  }

  async save(impact: DevelopmentImpact): Promise<DevelopmentImpact> {
    await this.fallback.save(impact);
    if (!this.db) {
      return impact;
    }
    try {
      const ref = doc(this.db, COLLECTIONS.IMPACTS, impact.id);
      await setDoc(ref, impact, { merge: true });
    } catch (err) {
      console.warn('[FirebaseImpactRepository] Firestore write error:', err);
    }
    return impact;
  }

  async saveBatch(impacts: DevelopmentImpact[]): Promise<DevelopmentImpact[]> {
    await this.fallback.saveBatch(impacts);
    if (!this.db) {
      return impacts;
    }
    try {
      await Promise.all(
        impacts.map((imp) => {
          const ref = doc(this.db!, COLLECTIONS.IMPACTS, imp.id);
          return setDoc(ref, imp, { merge: true });
        })
      );
    } catch (err) {
      console.warn('[FirebaseImpactRepository] Firestore batch write error:', err);
    }
    return impacts;
  }
}
