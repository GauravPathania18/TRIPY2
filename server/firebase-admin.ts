import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json';

let adminAuth: any = null;
let firestore: any = null;

try {
  if (!getApps().length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const hasCredsFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const isGoogleCloud = process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT;

    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: firebaseConfig.projectId,
      });
      console.log('[Firebase Admin] Initialized with FIREBASE_SERVICE_ACCOUNT_JSON');
    } else if (hasCredsFile) {
      initializeApp({
        projectId: firebaseConfig.projectId,
      });
      console.log('[Firebase Admin] Initialized with GOOGLE_APPLICATION_CREDENTIALS file');
    } else if (isGoogleCloud) {
      initializeApp({
        projectId: firebaseConfig.projectId,
      });
      console.log('[Firebase Admin] Initialized with ambient Google Cloud credentials');
    } else {
      // Running on external hosting (e.g. Railway) without credentials configured.
      // Fallback gracefully without crashing module load.
      console.warn('[Firebase Admin] No service account or Google Cloud environment detected. Operating in offline local JSON database mode.');
    }
  }

  if (getApps().length) {
    const app = getApps()[0];
    adminAuth = getAuth(app);
    const dbId = (firebaseConfig as any).firestoreDatabaseId;
    firestore = dbId ? getFirestore(app, dbId) : getFirestore(app);
    console.log(`[Firebase Admin] Firestore initialized with databaseId: ${dbId || '(default)'}`);
  }
} catch (error: any) {
  console.error('[Firebase Admin] Failed to initialize Firebase Admin SDK:', error.message || error);
}

export { adminAuth, firestore };
