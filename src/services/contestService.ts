import { Timestamp } from 'firebase-admin/firestore';
import type { Firestore, Query, DocumentData } from 'firebase-admin/firestore';

import { ContestNotFoundError } from '../utils/errors.js';


const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;
const MAX_SUBJECTS_IN_FILTER = 20;

export interface GetContestsFilter {
  status?: string | null;
  contestType?: string | null;
  subject?: string | null;
  subjects?: string[] | null;
  difficulty?: string | null;
  isPremium?: boolean | null;
  limit?: number | null;
  cursor?: string | null;
}

function mapContestDoc(id: string, data: DocumentData) {
  return {
    contestId: id,
    title: data.title,
    subject: data.subject,
    topics: data.topics ?? [],
    contestType: data.contestType,
    difficulty: data.difficulty,
    isPremium: data.isPremium ?? false,
    totalQuestions: data.totalQuestions ?? 0,
    timeLimitSecs: data.timeLimitSecs ?? 0,
    markingScheme: data.markingScheme ?? { correct: 4, wrong: -1, skipped: 0 },
    epReward: data.epReward ?? 0,
    passPercent: data.passPercent ?? 0,
    recommendedLevel: data.recommendedLevel ?? null,
    status: data.status,
    startsAt: (data.startsAt as Timestamp).toDate().toISOString(),
    endsAt: (data.endsAt as Timestamp).toDate().toISOString(),
    participantCount: data.participantCount ?? 0,
  };
}


export async function getContests(filter: GetContestsFilter, db: Firestore) {
  let query: Query = db.collection('contests');

  if (filter.status) query = query.where('status', '==', filter.status);
  if (filter.contestType) query = query.where('contestType', '==', filter.contestType);

  if (filter.subjects && filter.subjects.length > 0) {
    query = query.where('subject', 'in', filter.subjects.slice(0, MAX_SUBJECTS_IN_FILTER));
  } else if (filter.subject) {
    query = query.where('subject', '==', filter.subject);
  }

  if (filter.difficulty) query = query.where('difficulty', '==', filter.difficulty);
  if (filter.isPremium !== undefined && filter.isPremium !== null) {
    query = query.where('isPremium', '==', filter.isPremium);
  }

  query = query.orderBy('startsAt', 'desc');

  const limit = Math.min(Math.max(filter.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

  if (filter.cursor) {
    const cursorDate = new Date(filter.cursor);
    if (!isNaN(cursorDate.getTime())) {
      query = query.startAfter(Timestamp.fromDate(cursorDate));
    }
  }

  const snap = await query.limit(limit).get();
  const contests = snap.docs.map((doc) => mapContestDoc(doc.id, doc.data()));

  const lastDoc = snap.docs[snap.docs.length - 1];
  const nextCursor = snap.docs.length === limit && lastDoc
    ? (lastDoc.data().startsAt as Timestamp).toDate().toISOString()
    : null;

  return { contests, nextCursor };
}

export async function getContest(contestId: string, db: Firestore) {
  const doc = await db.collection('contests').doc(contestId).get();
  if (!doc.exists) return null;

  return mapContestDoc(doc.id, doc.data()!);
}


export async function assertContestExists(contestId: string, db: Firestore): Promise<{ contestType: string }> {
  const doc = await db.collection('contests').doc(contestId).get();
  if (!doc.exists) throw new ContestNotFoundError();

  return { contestType: doc.data()!.contestType };
}

export async function getPersonalizedContests(filter: GetContestsFilter, focusSubjects: string[], db: Firestore): Promise<{
  contests: ReturnType<typeof mapContestDoc>[];
  nextCursor: string | null;
}> {
  const limit = Math.min(Math.max(filter.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const baseFilter: GetContestsFilter = {
    ...filter,
    subject: null,
    subjects: null,
    cursor: null,
  };

  const { contests: personalized } = await getContests(
    { ...baseFilter, subjects: focusSubjects, limit }, db
  );

  if (personalized.length >= limit) {
    return { contests: personalized.slice(0, limit), nextCursor: null };
  }

  const { contests: globalPool } = await getContests(
    { ...baseFilter, limit: MAX_LIMIT }, db
  );
  const seen = new Set(personalized.map((c) => c.contestId));
  const backfill = globalPool.filter((c) => !seen.has(c.contestId));

  return {
    contests: [...personalized, ...backfill].slice(0, limit),
    nextCursor: null,
  };
}
