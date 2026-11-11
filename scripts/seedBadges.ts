import 'dotenv/config';
import { readFileSync } from 'fs';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';

import { BADGE_CATALOG, validateBadgeCatalog } from './badgeCatalog.js';


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

const DRY_RUN = process.argv.includes('--dry-run');

async function seedBadges(): Promise<void> {
  const problems = validateBadgeCatalog();
  if (problems.length > 0) {
    console.error('Badge catalog has problems, nothing was written:\n - ' + problems.join('\n - '));
    process.exit(1);
  }

  const existingSnap = await db.collection('badges').get();
  const existing = new Map(existingSnap.docs.map((d) => [d.id, d.data()]));

  const catalogIds = new Set(BADGE_CATALOG.map((b) => b.badgeId));
  const orphans = [...existing.entries()]
    .filter(([id, data]) => !catalogIds.has(id) && data.isActive === true)
    .map(([id]) => id);

  if (orphans.length > 0) {
    console.warn(`WARNING: active badge docs not in the catalog (still evaluated and rewarded!): ${orphans.join(', ')}. Set isActive=false on them manually if they were retired.`);
  }

  let created = 0;
  for (const badge of BADGE_CATALOG) {
    const prev = existing.get(badge.badgeId);

    if (!prev) {
      created++;
    } else if ((prev.rewardPremiumDays ?? 0) !== badge.rewardPremiumDays) {
      console.log(`reward ${badge.badgeId}: ${prev.rewardPremiumDays ?? '(none)'} -> ${badge.rewardPremiumDays}`);
    }
  }

  const active = BADGE_CATALOG.filter((b) => b.isActive);
  const byRarity: Record<string, { badges: number; days: number }> = {};

  for (const b of active) {
    const row = (byRarity[b.rarity] ??= { badges: 0, days: 0 });
    row.badges += 1;
    row.days += b.rewardPremiumDays;
  }
  console.table(byRarity);
  console.log(`Active badges: ${active.length} | rewarding: ${active.filter((b) => b.rewardPremiumDays > 0).length} | total reward days across catalog: ${active.reduce((s, b) => s + b.rewardPremiumDays, 0)} | new docs: ${created}`);

  if (DRY_RUN) {
    console.log('Dry run, nothing written.');
    return;
  }

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
