import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let app: any = null;
let db: any = null;
let auth: any = null;
const googleProvider = new GoogleAuthProvider();

export async function getFirebaseClient() {
  if (app) {
    return { app, db, auth, googleProvider };
  }

  try {
    const res = await fetch('/api/firebase-config');
    if (!res.ok) {
      throw new Error(`Failed to fetch Firebase configuration: ${res.statusText}`);
    }
    const config = await res.json();

    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }

    db = getFirestore(app, config.firestoreDatabaseId);
    auth = getAuth(app);

    return { app, db, auth, googleProvider };
  } catch (err) {
    console.error('Failed to initialize Firebase client:', err);
    throw err;
  }
}

export const signInWithGoogle = async () => {
  try {
    const { auth, googleProvider } = await getFirebaseClient();
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};
