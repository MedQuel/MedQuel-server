import { FieldPath } from 'firebase-admin/firestore';
import type { Firestore, DocumentReference } from 'firebase-admin/firestore';

import { getContests } from './contestService.js';
import { NotOnboardedError } from '../utils/errors.js';
import { toISTDateKey, istDateKeyDaysAgo } from '../utils/istDate.js';
import { buildDailyChallengeForUser, type DailyChallengeDTO } from './dailyChallengeService.js';


const LIVE_LIMIT = 3;
const REGULAR_LIMIT = 5;
const TREND_WINDOW_DAYS = 7;
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
  const base = { status: 'active' };

  const regularQuery = async () => {
    if (focusSubjects.length === 0) {
      return (
        await getContests(
          { ...base, contestType: 'contest', limit: REGULAR_LIMIT },
          db
        )
      ).contests;
    }

    const personalized = (
      await getContests(
        { ...base, contestType: 'contest', subjects: focusSubjects, limit: REGULAR_LIMIT },
        db
      )
    ).contests;
    if (personalized.length >= REGULAR_LIMIT) return personalized;

    const general = (
      await getContests(
        { ...base, contestType: 'contest', limit: REGULAR_LIMIT },
        db
      )
    ).contests;

    const seen = new Set(personalized.map((c) => c.contestId));
    return [
      ...personalized,
      ...general.filter((c) => !seen.has(c.contestId)),
    ].slice(0, REGULAR_LIMIT);
  };

  const [live, weekly, regular] = await Promise.all([
    getContests({ ...base, contestType: 'live', limit: LIVE_LIMIT }, db).then(
      (r) => r.contests
    ),
    getContests({ ...base, contestType: 'weekly', limit: 1 }, db).then(
      (r) => r.contests
    ),
    regularQuery(),
  ]);

  const now = Date.now();
  const priority = (type: string) => type === 'live' ? 0 : type === 'weekly' ? 1 : 2;

  return [...live, ...weekly, ...regular]
    .filter((contest) => new Date(contest.endsAt).getTime() > now)
    .sort((a, b) => {
      if (priority(a.contestType) !== priority(b.contestType)) {
        return priority(a.contestType) - priority(b.contestType);
      }
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
