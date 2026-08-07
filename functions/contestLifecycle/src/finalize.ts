import type { Firestore } from 'firebase-admin/firestore';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

import type { ContestDoc, ContestLeaderboardEntry } from './types.js';


const TOP_N_RANK = 100;
const BONUS_TIERS: ReadonlyArray<{ rank: number; multiplier: number }> = [
  { rank: 1, multiplier: 0.5 },
  { rank: 2, multiplier: 0.3 },
  { rank: 3, multiplier: 0.15 },
];

export type FinalizeOutcome = 'finalized' | 'skipped_already_finalized' | 'skipped_not_found';

const IST_OFFSET_MS = (5*60 + 30) * 60*1000;
function getIsoWeekKey(date: Date): string {
  const istShifted = new Date(date.getTime() + IST_OFFSET_MS);
  const d = new Date(
    Date.UTC(
      istShifted.getUTCFullYear(),
      istShifted.getUTCMonth(),
      istShifted.getUTCDate()
    )
  );

  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate()+4 - dayNum);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime()-yearStart.getTime()) / 86400000+1) / 7);

  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getMonthKey(date: Date): string {
  const istShifted = new Date(date.getTime() + IST_OFFSET_MS);
  return `${istShifted.getUTCFullYear()}-${String(istShifted.getUTCMonth()+1).padStart(2, '0')}`;
}

function buildPeriodKeys(now: Date): string[] {
  return [
    `weekly_${getIsoWeekKey(now)}`,
    `monthly_${getMonthKey(now)}`,
    'allTime',
  ];
}

async function fetchUserSnapshot(db: Firestore, userId: string) {
  const doc = await db.collection('users').doc(userId).get();
  if (!doc.exists) return null;

  const data = doc.data()!;

  return {
    displayName: data.displayName ?? 'Unknown',
    photoURL: data.photoURL ?? null,
    specialization: data.targetExam ?? '',
  };
}


async function awardBonusEp(db: Firestore, userId: string, bonusEp: number, contestId: string, rank: number): Promise<void> {
  if (bonusEp <= 0) return;

  const userSnapshot = await fetchUserSnapshot(db, userId);
  if (!userSnapshot) {
    console.error(`[contestLifecycle] contest ${contestId}: winner ${userId} (rank ${rank}) not found — skipping bonus.`);
    return;
  }

  const now = new Date();
  const periodKeys = buildPeriodKeys(now);
  const userRef = db.collection('users').doc(userId);
  const entryRefs = periodKeys.map((p) => db.collection('leaderboard').doc(p).collection('entries').doc(userId));

  await db.runTransaction(async (tx) => {
    const [userSnap, ...entrySnaps] = await Promise.all([
      tx.get(userRef),
      ...entryRefs.map((r) => tx.get(r)),
    ]);
    if (!userSnap.exists) return;

    const nowTs = Timestamp.now();
    tx.update(userRef, {
      epPoints: FieldValue.increment(bonusEp),
      updatedAt: nowTs,
    });

    entrySnaps.forEach((snap, i) => {
      const ref = entryRefs[i];
      if (snap.exists) {
        tx.update(ref, {
          epPoints: FieldValue.increment(bonusEp),
          updatedAt: nowTs,
        });
      } else {
        tx.set(ref, {
          userId,
          displayName: userSnapshot.displayName,
          photoURL: userSnapshot.photoURL,
          specialization: userSnapshot.specialization,
          epPoints: bonusEp,
          rank: 0,
          prevRank: 0,
          weeklyChange: 0,
          updatedAt: nowTs,
        });
      }
    });
  });

  console.log(`[contestLifecycle] contest ${contestId}: awarded +${bonusEp} EP bonus to rank ${rank} (${userId}).`);
}


export async function finalizeContest(contestId: string, db: Firestore): Promise<FinalizeOutcome> {
  const contestRef = db.collection('contests').doc(contestId);
  const finalizationRef = db.collection('contestFinalizations').doc(contestId);

  const claimed = await db.runTransaction(async (tx) => {
    const [contestSnap, finalizationSnap] = await Promise.all([
      tx.get(contestRef),
      tx.get(finalizationRef),
    ]);
    if (!contestSnap.exists) return false;
    if (finalizationSnap.exists) return false;

    const data = contestSnap.data() as ContestDoc;
    if (data.status === 'completed') return false;

    const now = Timestamp.now();
    tx.update(contestRef, { status: 'completed', updatedAt: now });
    tx.set(finalizationRef, { contestId, status: 'ranking', startedAt: now });
    return true;
  });

  if (!claimed) return contestId ? 'skipped_already_finalized' : 'skipped_not_found';

  const contestSnap = await contestRef.get();
  const contest = contestSnap.data() as ContestDoc;

  const leaderboardRef = contestRef.collection('leaderboard');
  const rankSnap = await leaderboardRef.orderBy('score', 'desc').limit(TOP_N_RANK).get();

  if (!rankSnap.empty) {
    const batch = db.batch();
    rankSnap.docs.forEach((doc, i) => batch.update(doc.ref, { rank: i+1 }));
    await batch.commit();
  }

  for (const tier of BONUS_TIERS) {
    const winnerDoc = rankSnap.docs[tier.rank-1];
    if (!winnerDoc) continue;

    const entry = winnerDoc.data() as ContestLeaderboardEntry;
    const bonusEp = Math.round(contest.epReward * tier.multiplier);
    await awardBonusEp(db, entry.userId, bonusEp, contestId, tier.rank);
  }

  await finalizationRef.update({
    status: 'completed',
    completedAt: Timestamp.now(),
    rankedCount: rankSnap.size,
  });
  console.log(`[contestLifecycle] contest ${contestId}: finalized, ranked ${rankSnap.size} entries.`);

  return 'finalized';
}
