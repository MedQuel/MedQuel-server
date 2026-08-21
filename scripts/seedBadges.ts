import 'dotenv/config';
import { readFileSync } from 'fs';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';

import { BADGE_CATALOG } from './badgeCatalog.js';


if (getApps().length === 0) {
  if (process.env.NODE_ENV === 'production') {
    initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
  } else {
    const serviceAccount: ServiceAccount = JSON.parse(readFileSync(
      new URL('../config/serviceAccountKey.json', import.meta.url),
      'utf-8'
    ));
    initializeApp({ credential: cert(serviceAccount), projectId: process.env.FIREBASE_PROJECT_ID });
  }
}
const db = getFirestore();


async function seedBadges(): Promise<void> {
  const CHUNK_SIZE = 400;

  for (let i=0; i<BADGE_CATALOG.length; i+=CHUNK_SIZE) {
    const chunk = BADGE_CATALOG.slice(i, i+CHUNK_SIZE);
    const batch = db.batch();

    for (const badge of chunk) {
      const ref = db.collection('badges').doc(badge.badgeId);
      batch.set(
        ref,
        { ...badge, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
    }

    await batch.commit();
    console.log(`Seeded badges ${i+1}-${Math.min(i+CHUNK_SIZE, BADGE_CATALOG.length)} of ${BADGE_CATALOG.length}`);
  }

  console.log(`Done. ${BADGE_CATALOG.length} badge definitions written to badges/{badgeId}.`);
}

seedBadges().catch((err) => {
  console.error('seedBadges failed:', err);
  process.exit(1);
});
