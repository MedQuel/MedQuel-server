import { Timestamp } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';

import { toISTDateKey } from '../utils/istDate.js';
import { MIN_ATTEMPTS_FOR_SUBJECT_HIGHLIGHT, computeSubjectPerformance } from './analyticsService.js';


const IST_OFFSET_MS = (5*60 + 30) * 60*1000;
const HOUR_MS = 60*60*1000;
const PREFERRED_MIN_REMAINING_MS = 12 * HOUR_MS;
const FALLBACK_MIN_REMAINING_MS = 3 * HOUR_MS;
const POOL_QUERY_LIMIT = 60;
const MAX_CANDIDATES = 8;
const EMPTY_RETRY_MS = 5 * 60*1000;
const FIRESTORE_ALREADY_EXISTS = 6;

export interface DailyCandidate {
  contestId: string;
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  epReward: number;
  totalQuestions: number;
  timeLimitSecs: number;
  endsAt: Timestamp;
}
export interface DailyChallengeDoc {
  date: string;
  expiresAt: Timestamp;
  candidates: DailyCandidate[];
  generatedAt: Timestamp;
}
export interface DailyChallengeDTO {
  date: string;
  contestId: string;
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  epReward: number;
  totalQuestions: number;
  timeLimitSecs: number;
  expiresAt: string;
  completed: boolean;
}

let cached: { dateKey: string; doc: DailyChallengeDoc } | null = null;
let lastEmptyAttempt: { dateKey: string; at: number } | null = null;
const inFlight = new Map<string, Promise<DailyChallengeDoc | null>>();

function endOfISTDay(now: Date): Date {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS);
  const startUtcMs = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate()
  ) - IST_OFFSET_MS;

  return new Date(startUtcMs+24 * HOUR_MS);
}

async function queryPool(db: Firestore, now: Date, minRemainingMs: number) {
  const snap = await db
    .collection('contests')
    .where('contestType', '==', 'daily')
    .where('status', '==', 'active')
    .where('endsAt', '>', Timestamp.fromMillis(now.getTime() + minRemainingMs))
    .limit(POOL_QUERY_LIMIT)
    .get();

  return snap.docs.filter((doc) => doc.data().isPremium !== true);
}

async function buildDailyChallenge(db: Firestore, dateKey: string, now: Date): Promise<DailyChallengeDoc | null> {
  let pool = await queryPool(db, now, PREFERRED_MIN_REMAINING_MS);
  if (pool.length === 0) pool = await queryPool(db, now, FALLBACK_MIN_REMAINING_MS);
  if (pool.length === 0) return null;

  const bySubject = new Map<string, DailyCandidate>();
  for (const doc of pool) {
    const data = doc.data();
    const candidate: DailyCandidate = {
      contestId: doc.id,
      title: data.title,
      subject: data.subject,
      difficulty: data.difficulty,
      epReward: data.epReward ?? 0,
      totalQuestions: data.totalQuestions ?? 0,
      timeLimitSecs: data.timeLimitSecs ?? 0,
      endsAt: data.endsAt as Timestamp,
    };

    const existing = bySubject.get(candidate.subject);
    if (!existing || candidate.endsAt.toMillis() > existing.endsAt.toMillis()) {
      bySubject.set(candidate.subject, candidate);
    }
  }

  const candidates = [...bySubject.values()]
    .sort((a, b) => b.endsAt.toMillis() - a.endsAt.toMillis())
    .slice(0, MAX_CANDIDATES);

  return {
    date: dateKey,
    expiresAt: Timestamp.fromDate(endOfISTDay(now)),
    candidates,
    generatedAt: Timestamp.now(),
  };
}


export async function getOrCreateDailyChallenge(db: Firestore, now: Date = new Date()): Promise<DailyChallengeDoc | null> {
  const dateKey = toISTDateKey(now);
  if (cached?.dateKey === dateKey) return cached.doc;
  if (lastEmptyAttempt?.dateKey === dateKey && Date.now()-lastEmptyAttempt.at < EMPTY_RETRY_MS) return null;

  const existing = inFlight.get(dateKey);
  if (existing) return existing;

  const task = (async (): Promise<DailyChallengeDoc | null> => {
    const ref = db.collection('dailyChallenges').doc(dateKey);

    const snap = await ref.get();
    if (snap.exists) {
      cached = { dateKey, doc: snap.data() as DailyChallengeDoc };
      return cached.doc;
    }

    const built = await buildDailyChallenge(db, dateKey, now);
    if (!built) {
      console.warn(`[dailyChallenge] no eligible daily contest for ${dateKey}.`);
      lastEmptyAttempt = { dateKey, at: Date.now() };
      return null;
    }

    try {
      await ref.create(built);
      cached = { dateKey, doc: built };
    } catch (err) {
      if ((err as { code?: number }).code !== FIRESTORE_ALREADY_EXISTS) throw err;

      const winner = await ref.get();
      cached = { dateKey, doc: winner.data() as DailyChallengeDoc };
    }

    return cached.doc;
  })().finally(() => inFlight.delete(dateKey));

  inFlight.set(dateKey, task);
  return task;
}

export function pickCandidateForUser(candidates: DailyCandidate[], user: FirebaseFirestore.DocumentData, now: Date = new Date()): DailyCandidate | null {
  const live = candidates.filter((c) => c.endsAt.toMillis() > now.getTime());
  if (live.length === 0) return null;

  const weakestFirst = computeSubjectPerformance(user.stats?.subjectStats ?? {})
    .filter((s) => s.totalAttempted >= MIN_ATTEMPTS_FOR_SUBJECT_HIGHLIGHT)
    .reverse()
    .map((s) => s.subject);

  const preferred: string[] = [
    ...(user.contentScope === 'focused' ? (user.focusSubjects ?? []) : []),
    ...(user.specialties ?? []),
    ...weakestFirst,
  ];

  for (const subject of preferred) {
    const match = live.find((c) => c.subject === subject);
    if (match) return match;
  }

  return live[0] ?? null;
}


export async function buildDailyChallengeForUser(
  uid: string,
  userData: FirebaseFirestore.DocumentData,
  db: Firestore,
  now: Date = new Date()
): Promise<DailyChallengeDTO | null> {
  const doc = await getOrCreateDailyChallenge(db, now);
  if (!doc) return null;

  const candidate = pickCandidateForUser(doc.candidates, userData, now);
  if (!candidate) return null;

  const completedSnap = await db
    .collection('contests')
    .doc(candidate.contestId)
    .collection('leaderboard')
    .doc(uid)
    .get();
  const expiresAtMs = Math.min(doc.expiresAt.toMillis(), candidate.endsAt.toMillis());

  return {
    date: doc.date,
    contestId: candidate.contestId,
    title: candidate.title,
    subject: candidate.subject,
    difficulty: candidate.difficulty,
    epReward: candidate.epReward,
    totalQuestions: candidate.totalQuestions,
    timeLimitSecs: candidate.timeLimitSecs,
    expiresAt: new Date(expiresAtMs).toISOString(),
    completed: completedSnap.exists,
  };
}
