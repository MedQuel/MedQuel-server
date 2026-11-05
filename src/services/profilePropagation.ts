import type { Firestore } from 'firebase-admin/firestore';
import { buildPeriodKey } from '../utils/leaderboardPeriod.js';


const FIRESTORE_NOT_FOUND = 5;
const LIVE_PERIODS = ['weekly', 'monthly', 'allTime'] as const;

export interface ProfileIdentityChange {
  displayName?: string;
  photoURL?: string | null;
}

export async function propagateProfileIdentity(uid: string, change: ProfileIdentityChange, db: Firestore): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (change.displayName !== undefined) patch.displayName = change.displayName;
  if (change.photoURL !== undefined) patch.photoURL = change.photoURL;
  if (Object.keys(patch).length === 0) return;

  const now = new Date();
  const refs = LIVE_PERIODS.map((period) =>
    db.collection('leaderboard').doc(buildPeriodKey(period, now)).collection('entries').doc(uid)
  );

  const results = await Promise.allSettled(
    refs.map((ref) => ref.update(patch))
  );

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') return;
    if ((result.reason as { code?: number })?.code === FIRESTORE_NOT_FOUND) return;
    console.error(`[profile] failed to sync ${refs[i]!.path}:`, result.reason);
  });
}
