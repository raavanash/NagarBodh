import { isFirebaseAvailable } from '../lib/firebase';
import type { CivicSignal } from '../types/civic';
import type {
  DevelopmentHotspot,
  DevelopmentImpact,
  DevelopmentProjectRecommendation,
  DevelopmentRequest,
} from '../types/development';
import {
  FirebaseDevelopmentRequestRepository,
  FirebaseHotspotRepository,
  FirebaseImpactRepository,
  FirebaseProjectRepository,
  FirebaseSignalRepository,
} from './firebaseRepositories';
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
  PersistenceMode,
  RepositoryStatus,
} from './types';

export * from './types';
export * from './inMemoryRepositories';
export * from './firebaseRepositories';

export interface RepositoryRegistry {
  signals: ISignalRepository;
  requests: IDevelopmentRequestRepository;
  hotspots: IDevelopmentHotspotRepository;
  projects: IProjectRepository;
  impacts: IImpactRepository;
  status: RepositoryStatus;
}

export function createRepositories(initialData?: {
  signals?: CivicSignal[];
  requests?: DevelopmentRequest[];
  hotspots?: DevelopmentHotspot[];
  projects?: DevelopmentProjectRecommendation[];
  impacts?: DevelopmentImpact[];
}): RepositoryRegistry {
  const isLive = isFirebaseAvailable();
  const mode: PersistenceMode = isLive ? 'FIREBASE_LIVE' : 'SIMULATION';

  if (isLive) {
    const signals = new FirebaseSignalRepository(initialData?.signals || []);
    const requests = new FirebaseDevelopmentRequestRepository(initialData?.requests || []);
    const hotspots = new FirebaseHotspotRepository(initialData?.hotspots || []);
    const projects = new FirebaseProjectRepository(initialData?.projects || []);
    const impacts = new FirebaseImpactRepository(initialData?.impacts || []);

    return {
      signals,
      requests,
      hotspots,
      projects,
      impacts,
      status: {
        mode: 'FIREBASE_LIVE',
        isLive: true,
        provider: 'Firestore',
      },
    };
  }

  const signals = new InMemorySignalRepository(initialData?.signals || [], 'SIMULATION');
  const requests = new InMemoryDevelopmentRequestRepository(initialData?.requests || [], 'SIMULATION');
  const hotspots = new InMemoryHotspotRepository(initialData?.hotspots || [], 'SIMULATION');
  const projects = new InMemoryProjectRepository(initialData?.projects || [], 'SIMULATION');
  const impacts = new InMemoryImpactRepository(initialData?.impacts || [], 'SIMULATION');

  return {
    signals,
    requests,
    hotspots,
    projects,
    impacts,
    status: {
      mode,
      isLive: false,
      provider: 'InMemoryFallback',
    },
  };
}
