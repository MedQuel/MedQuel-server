import { FieldPath } from 'firebase-admin/firestore';
import type { Firestore, DocumentReference } from 'firebase-admin/firestore';

import { NotOnboardedError } from '../utils/errors.js';
import { toISTDateKey, istDateKeyDaysAgo } from '../utils/istDate.js';
import { getContests, getPersonalizedContests } from './contestService.js';
import { buildDailyChallengeForUser, type DailyChallengeDTO } from './dailyChallengeService.js';


const TREND_WINDOW_DAYS = 7;
const CANDIDATE_POOL_SIZE = 20;
const HOME_ACTIVE_CONTESTS_LIMIT = 5;

export interface PerformanceTrendPointDTO {
  date: string;
  accuracy: number | null;
}
export interface HomeDataResult {
  dailyChallenge: DailyChallengeDTO | null;
  activeContests: Awaited<ReturnType<typeof getContests>>['contests'];
  performanceTrend: PerformanceTrendPointDTO[];
}

async function fetchActiveContestsForHome(db: Firestore, focusSubjects: string[]): Promise<HomeDataResult['activeContests']> {
  const filter = { status: 'active', limit: CANDIDATE_POOL_SIZE };

  const { contests } = focusSubjects.length > 0
    ? await getPersonalizedContests(filter, focusSubjects, db)
    : await getContests(filter, db);

  return contests
    .slice()
    .filter((contest) => new Date(contest.endsAt).getTime() > Date.now())
    .sort((a, b) => {
      const aPriority = a.contestType === 'live' ? 0 : 1;
      const bPriority = b.contestType === 'live' ? 0 : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;

      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    })
    .slice(0, HOME_ACTIVE_CONTESTS_LIMIT);
}

async function fetchLast7DaysTrend(userRef: DocumentReference, now: Date): Promise<PerformanceTrendPointDTO[]> {
  const dateKeys: string[] = [];
  for (let i=TREND_WINDOW_DAYS-1; i>=0; i--) {
    dateKeys.push(i === 0 ? toISTDateKey(now) : istDateKeyDaysAgo(now, i));
  }

  const startKey = dateKeys[0];
  const endKey = dateKeys[dateKeys.length - 1];

  const snap = await userRef
    .collection('activityLog')
    .orderBy(FieldPath.documentId())
    .startAt(startKey)
    .endAt(endKey)
    .get();

  const byDate = new Map<string, { attempted: number; correct: number }>();
  snap.docs.forEach((doc) => {
    const data = doc.data();
    byDate.set(doc.id, {
      attempted: data.questionsAttempted ?? 0,
      correct: data.questionsCorrect ?? 0,
    });
  });

  return dateKeys.map((date) => {
    const entry = byDate.get(date);
    if (!entry || entry.attempted <= 0) return { date, accuracy: null };

    return { date, accuracy: Math.round((entry.correct/entry.attempted)*10000) / 100 };
  });
}


export async function getHomeData(uid: string, db: Firestore): Promise<HomeDataResult> {
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) throw new NotOnboardedError();

  const userData = userSnap.data()!;
  const focusSubjects: string[] = userData.contentScope === 'focused'
    ? (userData.focusSubjects ?? [])
    : [];
  const now = new Date();

  const [activeContests, performanceTrend, dailyChallenge] = await Promise.all([
    fetchActiveContestsForHome(db, focusSubjects),
    fetchLast7DaysTrend(userRef, now),

    buildDailyChallengeForUser(uid, userData, db, now).catch((err) => {
      console.error('[home] daily challenge failed:', err);
      return null;
    }),
  ]);

  return {
    dailyChallenge,
    activeContests,
    performanceTrend,
  };
}
