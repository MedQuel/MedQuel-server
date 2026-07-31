import type { Firestore } from 'firebase-admin/firestore';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

import {
  ForbiddenError,
  NotOnboardedError,
  AuthenticationError,
  SessionNotFoundError,
  ContestNotFoundError,
  ContestNotActiveError,
  InsufficientQuestionsError,
  SessionAlreadyCompletedError,
} from '../utils/errors.js';
import type { GraphQLContext } from '../graphql/context.js';
import type { QuestionForQuiz } from './bigqueryService.js';
import { gradeQuizSession, type QuestionGradeResult } from './gradingService.js';
import type { ValidatedStartQuizSession, ValidatedSubmitQuizSession } from './quizValidation.js';
import { updateStreak, computeXpEarned, computeEpEarned, computeLevelFromXp } from './xpEpService.js';


interface OnboardedUser {
  uid: string;
  isPremium: boolean;
}
export async function fetchOnboardedUser(context: GraphQLContext): Promise<OnboardedUser> {
  if (!context.user) throw new AuthenticationError();

  const uid = context.user.uid;
  const doc = await context.db.collection('users').doc(uid).get();
  if (!doc.exists) throw new NotOnboardedError();

  const data = doc.data()!;
  return { uid, isPremium: data.isPremium === true };
}

function reorderByIds(ids: string[], questions: QuestionForQuiz[]): QuestionForQuiz[] {
  const byId = new Map(questions.map((q) => [q.questionId, q]));
  return ids.map((id) => byId.get(id)).filter((q): q is QuestionForQuiz => Boolean(q));
}


interface ActiveContest {
  contestId: string;
  subject: string;
  difficulty: string;
  isPremium: boolean;
  questionIds: string[];
  wrongPenalty: number;
  epBaseReward: number;
  passPercent: number;
}
async function fetchActiveContest(contestId: string, db: Firestore): Promise<ActiveContest> {
  const doc = await db.collection('contests').doc(contestId).get();
  if (!doc.exists) throw new ContestNotFoundError();

  const data = doc.data()!;
  const now = Timestamp.now().toMillis();

  if (data.status !== 'active')
    throw new ContestNotActiveError(`This contest is "${data.status}", not active.`);
  if (data.endsAt && data.endsAt.toMillis() < now)
    throw new ContestNotActiveError('This contest has already ended.');
  if (data.startsAt && data.startsAt.toMillis() > now)
    throw new ContestNotActiveError('This contest has not started yet.');

  return {
    contestId: doc.id,
    subject: data.subject,
    difficulty: data.difficulty,
    isPremium: data.isPremium === true,
    questionIds: data.questionIds ?? [],
    wrongPenalty: Math.abs(data.markingScheme?.wrong ?? 0),
    epBaseReward: data.epReward ?? 0,
    passPercent: data.passPercent ?? 0,
  };
}


export interface StartQuizSessionResult {
  sessionId: string;
  quizType: string;
  subject: string;
  difficulty: string;
  totalQuestions: number;
  questions: QuestionForQuiz[];
  startedAt: string;
}
export async function startQuizSession(input: ValidatedStartQuizSession, context: GraphQLContext): Promise<StartQuizSessionResult> {
  const { db, bigqueryService } = context;
  const user = await fetchOnboardedUser(context);

  let subject: string;
  let difficulty: string;
  let questionIds: string[];
  let questions: QuestionForQuiz[];
  let wrongPenalty: number;
  let epBaseReward: number;
  let passPercent: number;

  if (input.mode === 'contest') {
    const contest = await fetchActiveContest(input.contestId, db);
    if (contest.isPremium && !user.isPremium) {
      throw new ForbiddenError('This contest requires an active premium subscription.');
    }

    subject = contest.subject;
    difficulty = contest.difficulty;
    questionIds = contest.questionIds;
    wrongPenalty = contest.wrongPenalty;
    epBaseReward = contest.epBaseReward;
    passPercent = contest.passPercent;

    if (questionIds.length === 0) {
      throw new InsufficientQuestionsError('This contest has no questions configured.');
    }

    const fetched = await bigqueryService.fetchQuestionsByIds(questionIds);
    questions = reorderByIds(questionIds, fetched);
    if (questions.length < questionIds.length) {
      throw new InsufficientQuestionsError(`Contest question set is incomplete: expected ${questionIds.length}, found ${questions.length}.`);
    }
  } else {
    subject = input.subject;
    difficulty = input.difficulty;
    wrongPenalty = 0;
    epBaseReward = 0;
    passPercent = 0;

    questions = await bigqueryService.fetchQuestions({
      subject: input.subject,
      difficulty: input.difficulty,
      questionCount: input.questionCount,
      includePremium: user.isPremium,
    });

    if (questions.length < input.questionCount) {
      throw new InsufficientQuestionsError(`Not enough ${difficulty} questions available for ${subject}. Requested ${input.questionCount}, found ${questions.length}.`);
    }

    questionIds = questions.map((q) => q.questionId);
  }

  const sessionRef = db.collection('quizSessions').doc();
  const startedAt = Timestamp.now();

  await sessionRef.set({
    sessionId: sessionRef.id,
    userId: user.uid,
    contestId: input.mode === 'contest' ? input.contestId : null,
    quizType: input.quizType,
    subject,
    difficulty,
    questionIds,
    wrongPenalty,
    epBaseReward,
    passPercent,
    answers: {},
    totalQuestions: questionIds.length,
    correctCount: 0,
    wrongCount: 0,
    score: 0,
    scorePercent: 0,
    epEarned: 0,
    xpEarned: 0,
    timeTaken: 0,
    status: 'in_progress',
    startedAt,
    completedAt: null,
  });

  return {
    sessionId: sessionRef.id,
    quizType: input.quizType,
    subject,
    difficulty,
    totalQuestions: questionIds.length,
    questions,
    startedAt: startedAt.toDate().toISOString(),
  };
}


interface QuizSessionForGrading {
  sessionId: string;
  userId: string;
  quizType: string;
  contestId: string | null;
  questionIds: string[];
  wrongPenalty: number;
  epBaseReward: number;
  passPercent: number;
  startedAt: Timestamp;
}
async function fetchSessionForSubmission(sessionId: string, uid: string, db: Firestore): Promise<QuizSessionForGrading> {
  const ref = db.collection('quizSessions').doc(sessionId);
  const doc = await ref.get();
  if (!doc.exists) throw new SessionNotFoundError();

  const data = doc.data()!;
  if (data.userId !== uid) throw new SessionNotFoundError();
  if (data.status !== 'in_progress') throw new SessionAlreadyCompletedError();

  return {
    sessionId: doc.id,
    userId: data.userId,
    quizType: data.quizType,
    contestId: data.contestId ?? null,
    questionIds: data.questionIds ?? [],
    wrongPenalty: data.wrongPenalty ?? 0,
    epBaseReward: data.epBaseReward ?? 0,
    passPercent: data.passPercent ?? 0,
    startedAt: data.startedAt,
  };
}


export interface SubmitQuizSessionResult {
  sessionId: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  score: number;
  scorePercent: number;
  epEarned: number;
  xpEarned: number;
  updatedXpPoints: number;
  updatedEpPoints: number;
  updatedCurrentLevel: number;
  updatedCurrentStreak: number;
  leveledUp: boolean;
  isNewLongestStreak: boolean;
  results: QuestionGradeResult[];
}
export async function submitQuizSession(input: ValidatedSubmitQuizSession, context: GraphQLContext): Promise<SubmitQuizSessionResult> {
  const { db, bigqueryService } = context;
  const user = await fetchOnboardedUser(context);

  const session = await fetchSessionForSubmission(input.sessionId, user.uid, db);

  const grading = await gradeQuizSession(
    session.questionIds,
    input.answers,
    session.wrongPenalty,
    bigqueryService
  );

  const isContestMode = session.quizType === 'contest' || session.quizType === 'daily';

  const sessionRef = db.collection('quizSessions').doc(session.sessionId);
  const userRef = db.collection('users').doc(user.uid);

  const txResult = await db.runTransaction(async (tx) => {
    const [sessionSnap, userSnap] = await Promise.all([
      tx.get(sessionRef),
      tx.get(userRef),
    ]);

    if (!sessionSnap.exists) throw new SessionNotFoundError();

    const sessionData = sessionSnap.data()!;
    if (sessionData.status !== 'in_progress')throw new SessionAlreadyCompletedError();

    if (!userSnap.exists) throw new NotOnboardedError();
    const userData = userSnap.data()!;

    const now = Timestamp.now();
    const previousLevel = userData.currentLevel ?? 1;
    const previousLongestStreak = userData.longestStreak ?? 0;

    const streak = updateStreak(
      userData.lastActiveDate instanceof Timestamp ? userData.lastActiveDate.toDate() : null,
      now.toDate(),
      userData.currentStreak ?? 0,
      previousLongestStreak
    );

    const xpEarned = computeXpEarned({
      totalQuestions: grading.results.length,
      correctCount: grading.correctCount,
      skippedCount: grading.skippedCount,
      scorePercent: grading.scorePercent,
      isFirstActivityToday: streak.isFirstActivityToday,
    });

    const epEarned = computeEpEarned({
      isContestMode,
      scorePercent: grading.scorePercent,
      passPercent: session.passPercent,
      epBaseReward: session.epBaseReward,
    });

    const updatedXpPoints = (userData.xpPoints ?? 0) + xpEarned;
    const updatedEpPoints = (userData.epPoints ?? 0) + epEarned;
    const updatedCurrentLevel = computeLevelFromXp(updatedXpPoints);
    const updatedTotalQuestions = (userData.totalQuestions ?? 0) + grading.results.length;
    const updatedTotalCorrect = (userData.totalCorrect ?? 0) + grading.correctCount;

    const timeTaken = Math.max(0, Math.round((now.toMillis()-session.startedAt.toMillis()) / 1000));

    const answersMap = Object.fromEntries(
      grading.results.map((r) => [
        r.questionId,
        { selected: r.selectedOption, isCorrect: r.isCorrect, timeSpent: null },
      ])
    );

    tx.update(sessionRef, {
      status: 'completed',
      answers: answersMap,
      correctCount: grading.correctCount,
      wrongCount: grading.wrongCount,
      score: grading.score,
      scorePercent: grading.scorePercent,
      epEarned,
      xpEarned,
      timeTaken,
      completedAt: now,
    });

    tx.update(userRef, {
      xpPoints: updatedXpPoints,
      epPoints: updatedEpPoints,
      currentLevel: updatedCurrentLevel,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: now,
      totalQuestions: updatedTotalQuestions,
      totalCorrect: updatedTotalCorrect,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      xpEarned,
      epEarned,
      updatedXpPoints,
      updatedEpPoints,
      updatedCurrentLevel,
      updatedCurrentStreak: streak.currentStreak,
      leveledUp: updatedCurrentLevel > previousLevel,
      isNewLongestStreak: streak.longestStreak > previousLongestStreak,
    };
  });

  return {
    sessionId: session.sessionId,
    totalQuestions: grading.results.length,
    correctCount: grading.correctCount,
    wrongCount: grading.wrongCount,
    skippedCount: grading.skippedCount,
    score: grading.score,
    scorePercent: grading.scorePercent,
    epEarned: txResult.epEarned,
    xpEarned: txResult.xpEarned,
    updatedXpPoints: txResult.updatedXpPoints,
    updatedEpPoints: txResult.updatedEpPoints,
    updatedCurrentLevel: txResult.updatedCurrentLevel,
    updatedCurrentStreak: txResult.updatedCurrentStreak,
    leveledUp: txResult.leveledUp,
    isNewLongestStreak: txResult.isNewLongestStreak,
    results: grading.results,
  };
}
