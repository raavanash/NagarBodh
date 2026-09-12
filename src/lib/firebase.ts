import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

const getEnv = (key: string): string | undefined => {
  const metaEnv = import.meta.env ? (import.meta.env[key] as string | undefined) : undefined;
  if (metaEnv) return metaEnv;
  const globalProc = (globalThis as unknown as { process?: { env?: Record<string, string> } }).process;
  if (globalProc && globalProc.env) {
    return globalProc.env[key];
  }
  return undefined;
};

export function getFirebaseConfig(): FirebaseConfig {
  return {
    apiKey: getEnv('VITE_FIREBASE_API_KEY'),
    authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || getEnv('FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('VITE_FIREBASE_APP_ID'),
  };
}

export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.projectId);
}

export function initFirebase(): { app: FirebaseApp | null; db: Firestore | null } {
  if (firestoreDb && firebaseApp) {
    return { app: firebaseApp, db: firestoreDb };
  }

  const config = getFirebaseConfig();

  if (!isFirebaseConfigured()) {
    console.info('[Firebase] Config missing or incomplete. Fallback to REPLAY / SIMULATION mode.');
    return { app: null, db: null };
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
    } else {
      firebaseApp = initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
      });
    }

    firestoreDb = getFirestore(firebaseApp);
    return { app: firebaseApp, db: firestoreDb };
  } catch (error) {
    console.warn('[Firebase] Initialization error:', error);
    firebaseApp = null;
    firestoreDb = null;
    return { app: null, db: null };
  }
}

export function getDb(): Firestore | null {
  return firestoreDb || initFirebase().db;
}

export function isFirebaseAvailable(): boolean {
  return Boolean(getDb());
}
