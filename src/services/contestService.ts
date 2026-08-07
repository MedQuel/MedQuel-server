import { Timestamp } from 'firebase-admin/firestore';
import type { Firestore, Query, DocumentData } from 'firebase-admin/firestore';

import { ContestNotFoundError } from '../utils/errors.js';


const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;

export interface GetContestsFilter {
  status?: string | null;
  contestType?: string | null;
  subject?: string | null;
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
  if (filter.subject) query = query.where('subject', '==', filter.subject);
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
