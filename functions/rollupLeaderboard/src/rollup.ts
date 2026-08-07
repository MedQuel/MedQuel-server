import { Timestamp } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';


const TOP_N = 100;

export interface RollupOutcome {
  periodKey: string;
  entriesConsidered: number;
  entriesUpdated: number;
}

export async function rollupPeriod(db: Firestore, periodKey: string): Promise<RollupOutcome> {
  const entriesRef = db.collection('leaderboard').doc(periodKey).collection('entries');
  const snap = await entriesRef.orderBy('epPoints', 'desc').limit(TOP_N).get();

  if (snap.empty) return { periodKey, entriesConsidered: 0, entriesUpdated: 0 };

  const batch = db.batch();
  const now = Timestamp.now();
  let updated = 0;

  snap.docs.forEach((doc, index) => {
    const newRank = index + 1;
    const oldRank: number = doc.data().rank ?? 0;

    if (oldRank === newRank) return;

    batch.update(doc.ref, { rank: newRank, prevRank: oldRank, updatedAt: now });
    updated += 1;
  });

  if (updated > 0) await batch.commit();

  return { periodKey, entriesConsidered: snap.size, entriesUpdated: updated };
}
