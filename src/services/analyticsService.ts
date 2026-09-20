import { FieldPath, Timestamp } from 'firebase-admin/firestore';
import type { Firestore, DocumentReference } from 'firebase-admin/firestore';

import { NotOnboardedError } from '../utils/errors.js';
import { toISTDateKey, istDateKeyDaysAgo } from '../utils/istDate.js';


export const MIN_ATTEMPTS_FOR_SUBJECT_HIGHLIGHT = 5;
const DEFAULT_PASS_THRESHOLD_PERCENT = 60;
const HEATMAP_LOOKBACK_DAYS = 30;
const RECENT_ATTEMPTS_LIMIT = 15;
const CONTEST_QUIZ_TYPES = new Set(['contest', 'daily']);

interface SubjectStatsEntry {
  attempted: number;
  correct: number;
}
export interface SubjectPerformanceDTO {
  subject: string;
  accuracy: number;
  totalAttempted: number;
  totalCorrect: number;
}
export interface HeatmapEntryDTO {
  date: string;
  questionsAttempted: number;
  minutesStudied: number;
}
export interface RecentAttemptDTO {
  sessionId: string;
  title: string;
  subject: string;
  quizType: string;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  passed: boolean;
  completedAt: string;
}
export interface AnalyticsResult {
  overallAccuracy: number;
  avgScore: number;
  bestSubject: string | null;
  weakSubject: string | null;
  subjectPerformance: SubjectPerformanceDTO[];
  heatmap: HeatmapEntryDTO[];
  recentAttempts: RecentAttemptDTO[];
}

export function computeSubjectPerformance(subjectStats: Record<string, SubjectStatsEntry>): SubjectPerformanceDTO[] {
  return Object.entries(subjectStats)
    .filter(([, s]) => (s?.attempted ?? 0) > 0)
    .map(([subject, s]) => ({
      subject,
      accuracy: Math.round((s.correct/s.attempted)*10000) / 100,
      totalAttempted: s.attempted,
      totalCorrect: s.correct,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);
}

function pickBestAndWeakSubject(subjectPerformance: SubjectPerformanceDTO[]): { best: string | null; weak: string | null; } {
  const eligible = subjectPerformance.filter((s) => s.totalAttempted >= MIN_ATTEMPTS_FOR_SUBJECT_HIGHLIGHT);
  if (eligible.length === 0) return { best: null, weak: null };

  const bestSubject = eligible[0];
  const weakSubject = eligible[eligible.length - 1];
  if (!bestSubject || !weakSubject) return { best: null, weak: null };

  return { best: bestSubject.subject, weak: weakSubject.subject };
}

function computeAttemptTitle(data: FirebaseFirestore.DocumentData): string {
  if (data.contestTitle) return data.contestTitle;
  if (data.challengeId) return `Challenge: ${data.subject}`;
  if (CONTEST_QUIZ_TYPES.has(data.quizType)) return `${data.subject} Contest`;

  return `Quiz on ${data.subject}`;
}

async function fetchHeatmap(userRef: DocumentReference, now: Date): Promise<HeatmapEntryDTO[]> {
  const todayKey = toISTDateKey(now);
  const startKey = istDateKeyDaysAgo(now, HEATMAP_LOOKBACK_DAYS);

  const snap = await userRef
    .collection('activityLog')
    .orderBy(FieldPath.documentId())
    .startAt(startKey)
    .endAt(todayKey)
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      date: doc.id,
      questionsAttempted: data.questionsAttempted ?? 0,
      minutesStudied: Math.round((data.minutesStudied ?? 0)*10) / 10,
    };
  });
}

async function fetchRecentAttempts(uid: string, db: Firestore): Promise<RecentAttemptDTO[]> {
  const snap = await db
    .collection('quizSessions')
    .where('userId', '==', uid)
    .orderBy('completedAt', 'desc')
    .limit(RECENT_ATTEMPTS_LIMIT)
    .get();

  return snap.docs
    .filter((doc) => doc.data().completedAt != null)
    .map((doc) => {
      const data = doc.data();
      const isContestMode = CONTEST_QUIZ_TYPES.has(data.quizType);
      const passThreshold = isContestMode
        ? (data.passPercent ?? DEFAULT_PASS_THRESHOLD_PERCENT)
        : DEFAULT_PASS_THRESHOLD_PERCENT;
      const scorePercent = data.scorePercent ?? 0;

      return {
        sessionId: doc.id,
        title: computeAttemptTitle(data),
        subject: data.subject,
        quizType: data.quizType,
        scorePercent,
        correctCount: data.correctCount ?? 0,
        totalQuestions: data.totalQuestions ?? 0,
        timeTaken: data.timeTaken ?? 0,
        passed: scorePercent >= passThreshold,
        completedAt: (data.completedAt as Timestamp).toDate().toISOString(),
      };
    });
}


export async function getAnalytics(uid: string, db: Firestore): Promise<AnalyticsResult> {
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) throw new NotOnboardedError();

  const userData = userSnap.data()!;
  const stats = userData.stats ?? {};
  const subjectStats: Record<string, SubjectStatsEntry> = stats.subjectStats ?? {};

  const totalQuestions = userData.totalQuestions ?? 0;
  const totalCorrect = userData.totalCorrect ?? 0;
  const overallAccuracy = totalQuestions > 0
    ? Math.round((totalCorrect/totalQuestions)*10000) / 100
    : 0;

  const completedSessions = stats.completedSessions ?? 0;
  const scorePercentSum = stats.scorePercentSum ?? 0;
  const avgScore = completedSessions > 0
    ? Math.round((scorePercentSum/completedSessions)*100) / 100
    : 0;

  const subjectPerformance = computeSubjectPerformance(subjectStats);
  const { best, weak } = pickBestAndWeakSubject(subjectPerformance);

  const now = new Date();
  const [heatmap, recentAttempts] = await Promise.all([
    fetchHeatmap(userRef, now),
    fetchRecentAttempts(uid, db),
  ]);

  return {
    overallAccuracy,
    avgScore,
    bestSubject: best,
    weakSubject: weak,
    subjectPerformance,
    heatmap,
    recentAttempts,
  };
}
