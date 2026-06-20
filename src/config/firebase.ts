import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';


if (getApps().length === 0) {
  if (process.env.NODE_ENV === 'production') {
    // Cloud Run: no key file needed, uses the runtime service account
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } else {
    // Local dev: explicitly load the downloaded service account JSON
    const serviceAccount: ServiceAccount = JSON.parse(
      readFileSync(
        new URL('../../config/serviceAccountKey.json', import.meta.url),
        'utf-8'
      )
    );
    initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
}

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
