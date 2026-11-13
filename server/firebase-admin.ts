import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };
import { createRequire } from 'node:module';

const require = createRequire(process.cwd() + '/package.json');

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
    // getAuth() eagerly pulls jwks-rsa -> jose, an ESM-only package that
    // older Node runtimes refuse to require() (ERR_REQUIRE_ESM), which used
    // to take the whole server down at boot for an export nothing reads
    // synchronously. Load it in the background instead; if it cannot load,
    // we log and degrade gracefully instead of failing every request.
    try {
      require.resolve('firebase-admin/auth'); // trace-only: keep it in the lambda
    } catch {
      // not resolvable here — the import below reports it if it matters
    }
    import('firebase-admin/auth')
      .then(({ getAuth }) => {
        adminAuth = getAuth(app);
        console.log('[Firebase Admin] Auth initialized');
      })
      .catch((err: any) => {
        console.warn('[Firebase Admin] Auth init skipped:', err && err.message);
      });
    const dbId = (firebaseConfig as any).firestoreDatabaseId;
    firestore = dbId ? getFirestore(app, dbId) : getFirestore(app);
    console.log(`[Firebase Admin] Firestore initialized with databaseId: ${dbId || '(default)'}`);
  }
} catch (error: any) {
  console.error('[Firebase Admin] Failed to initialize Firebase Admin SDK:', error.message || error);
}

export { adminAuth, firestore };
