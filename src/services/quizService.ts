import type { Firestore } from 'firebase-admin/firestore';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

import type { GraphQLContext } from '../graphql/context.js';
import type { QuestionForQuiz } from './bigqueryService.js';
import { checkRateLimit } from '../middleware/rateLimiter.js';
import { publishQuizCompleted } from '../pubsub/publisher.js';
import { gradeQuizSession, type QuestionGradeResult } from './gradingService.js';
import { recordChallengeResult, type ChallengeOutcome } from './challenge/challengeResolution.js';
import { updateStreak, computeXpEarned, computeEpEarned, computeLevelFromXp } from './xpEpService.js';
import type { ValidatedStartQuizSession, ValidatedSubmitQuizSession } from '../validators/quizValidation.js';

import { ContestNotActiveError, ChallengeNotActiveError } from '../utils/errors.js';
import { ForbiddenError, NotOnboardedError, AuthenticationError } from '../utils/errors.js';
import { InsufficientQuestionsError, SessionAlreadyCompletedError } from '../utils/errors.js';
import { NotChallengeParticipantError, ChallengeSessionAlreadyStartedError } from '../utils/errors.js';
import { SessionNotFoundError, ContestNotFoundError, ChallengeNotFoundError } from '../utils/errors.js';


const MIN_QUESTIONS_FOR_PERFECT_BADGE = 5;
const FAST_COMPLETION_RATIO = 0.5;
const MIN_QUESTIONS_FOR_SUBJECT_MASTERY = 20;
const SUBJECT_MASTERY_THRESHOLD = 0.7;

const TOPIC_CACHE_TTL_MS = 60*60*1000;
const topicCache = new Map<string, TopicCacheEntry>();

interface OnboardedUser {
  uid: string;
  isPremium: boolean;
}
interface TopicCacheEntry {
  topics: string[];
  expiresAt: number;
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
  timeLimitSecs: number;
}
interface ActiveChallenge {
  subject: string;
  difficulty: string;
  questionIds: string[];
  timeLimitSecs: number;
}

interface QuizSessionForGrading {
  sessionId: string;
  userId: string;
  quizType: string;
  subject: string;
  difficulty: string;
  contestId: string | null;
  challengeId: string | null;
  questionIds: string[];
  wrongPenalty: number;
  epBaseReward: number;
  passPercent: number;
  timeLimitSecs: number | null;
  startedAt: Timestamp;
}

export interface StartQuizSessionResult {
  sessionId: string;
  quizType: string;
  subject: string;
  difficulty: string;
  topic: string | null;
  timeLimitSecs: number | null;
  totalQuestions: number;
  questions: QuestionForQuiz[];
  startedAt: string;
}
export interface SubmitQuizSessionResult {
  sessionId: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  score: number;
  scorePercent: number;
  timeTaken: number;
  epEarned: number;
  xpEarned: number;
  updatedXpPoints: number;
  updatedEpPoints: number;
  updatedCurrentLevel: number;
  updatedCurrentStreak: number;
  leveledUp: boolean;
  isNewLongestStreak: boolean;
  results: QuestionGradeResult[];
  challengeId: string | null;
  challengeStatus: string | null;
  challengeWinnerUid: string | null;
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
    timeLimitSecs: data.timeLimitSecs ?? 0,
  };
}

async function claimContestParticipation(contestId: string, uid: string, db: Firestore): Promise<void> {
  const participantRef = db.collection('contests').doc(contestId).collection('participants').doc(uid);
  const contestRef = db.collection('contests').doc(contestId);

  await db.runTransaction(async (tx) => {
    const participantSnap = await tx.get(participantRef);
    if (participantSnap.exists) return;

    tx.set(participantRef, { userId: uid, joinedAt: Timestamp.now() });
    tx.update(contestRef, { participantCount: FieldValue.increment(1) });
  });
}

async function fetchActiveChallengeForPlay(challengeId: string, uid: string, db: Firestore): Promise<ActiveChallenge> {
  const doc = await db.collection('challenges').doc(challengeId).get();
  if (!doc.exists) throw new ChallengeNotFoundError();

  const data = doc.data()!;
  if (!data.participants.includes(uid)) throw new NotChallengeParticipantError();
  if (data.status !== 'active') throw new ChallengeNotActiveError();

  const myState = data.participantStatus[uid];
  if (myState?.quizSessionId) throw new ChallengeSessionAlreadyStartedError();
  if (!data.questionIds || data.questionIds.length === 0) {
    throw new InsufficientQuestionsError('This challenge has no questions configured.');
  }

  return {
    subject: data.subject,
    difficulty: data.difficulty,
    questionIds: data.questionIds,
    timeLimitSecs: data.timeLimitSecs,
  };
}

async function claimChallengeSessionStart(uid: string, challengeId: string, sessionId: string, db: Firestore): Promise<void> {
  const ref = db.collection('challenges').doc(challengeId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ChallengeNotFoundError();

    const data = snap.data()!;
    if (data.status !== 'active') throw new ChallengeNotActiveError();
    if (data.participantStatus[uid]?.quizSessionId) throw new ChallengeSessionAlreadyStartedError();

    tx.update(ref, {
      [`participantStatus.${uid}.quizSessionId`]: sessionId,
      updatedAt: Timestamp.now(),
    });
  });
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
    subject: data.subject,
    difficulty: data.difficulty,
    contestId: data.contestId ?? null,
    challengeId: data.challengeId ?? null,
    questionIds: data.questionIds ?? [],
    wrongPenalty: data.wrongPenalty ?? 0,
    epBaseReward: data.epBaseReward ?? 0,
    passPercent: data.passPercent ?? 0,
    timeLimitSecs: data.timeLimitSecs ?? null,
    startedAt: data.startedAt,
  };
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
  let topic: string | null;
  let timeLimitSecs: number | null;

  const sessionRef = db.collection('quizSessions').doc();

  if (input.mode === 'contest') {
    const contest = await fetchActiveContest(input.contestId, db);
    if (contest.isPremium && !user.isPremium) {
      throw new ForbiddenError('This contest requires an active premium subscription.');
    }

    subject = contest.subject;
    topic = null;
    difficulty = contest.difficulty;
    questionIds = contest.questionIds;
    wrongPenalty = contest.wrongPenalty;
    epBaseReward = contest.epBaseReward;
    passPercent = contest.passPercent;
    timeLimitSecs = contest.timeLimitSecs;

    if (questionIds.length === 0) {
      throw new InsufficientQuestionsError('This contest has no questions configured.');
    }

    const fetched = await bigqueryService.fetchQuestionsByIds(questionIds);
    questions = reorderByIds(questionIds, fetched);
    if (questions.length < questionIds.length) {
      throw new InsufficientQuestionsError(`Contest question set is incomplete: expected ${questionIds.length}, found ${questions.length}.`);
    }

    await claimContestParticipation(input.contestId, user.uid, db);
  } else if (input.mode === 'challenge') {
    const challenge = await fetchActiveChallengeForPlay(input.challengeId, user.uid, db);

    subject = challenge.subject;
    topic = null;
    difficulty = challenge.difficulty;
    questionIds = challenge.questionIds;
    wrongPenalty = 0;
    epBaseReward = 0;
    passPercent = 0;
    timeLimitSecs = challenge.timeLimitSecs;

    const fetched = await bigqueryService.fetchQuestionsByIds(questionIds);
    questions = reorderByIds(questionIds, fetched);
    if (questions.length < questionIds.length) {
      throw new InsufficientQuestionsError(`Challenge question set is incomplete: expected ${questionIds.length}, found ${questions.length}.`);
    }

    await claimChallengeSessionStart(input.challengeId, user.uid, sessionRef.id, db);
  } else {
    subject = input.subject;
    difficulty = input.difficulty;
    wrongPenalty = 0;
    epBaseReward = 0;
    passPercent = 0;
    topic = input.topic;
    timeLimitSecs = input.timeLimitSecs;

    questions = await bigqueryService.fetchQuestions({
      subject: input.subject,
      difficulty: input.difficulty,
      questionCount: input.questionCount,
      includePremium: user.isPremium,
      topic,
    });

    if (questions.length < input.questionCount) {
      const topicNote = topic ? ` for topic "${topic}"` : '';
      throw new InsufficientQuestionsError(`Not enough ${difficulty} questions available for ${subject}${topicNote}. Found only ${questions.length}.`);
    }

    questionIds = questions.map((q) => q.questionId);
  }

  const startedAt = Timestamp.now();

  await sessionRef.set({
    sessionId: sessionRef.id,
    userId: user.uid,
    contestId: input.mode === 'contest' ? input.contestId : null,
    challengeId: input.mode === 'challenge' ? input.challengeId : null,
    quizType: input.quizType,
    subject,
    difficulty,
    topic,
    timeLimitSecs,
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
    topic,
    timeLimitSecs,
    totalQuestions: questionIds.length,
    questions,
    startedAt: startedAt.toDate().toISOString(),
  };
}


export async function submitQuizSession(input: ValidatedSubmitQuizSession, context: GraphQLContext): Promise<SubmitQuizSessionResult> {
  const { db, bigqueryService } = context;
  const user = await fetchOnboardedUser(context);

  checkRateLimit(`submitQuizSession:${user.uid}`, { limit: 10, windowMs: 60_000 });

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
  const contestLeaderboardRef = session.contestId
    ? db.collection('contests').doc(session.contestId).collection('leaderboard').doc(user.uid)
    : null;

  const txResult = await db.runTransaction(async (tx) => {
    const [sessionSnap, userSnap, contestLeaderboardSnap] = await Promise.all([
      tx.get(sessionRef),
      tx.get(userRef),
      contestLeaderboardRef ? tx.get(contestLeaderboardRef) : Promise.resolve(null),
    ]);

    if (!sessionSnap.exists) throw new SessionNotFoundError();

    const sessionData = sessionSnap.data()!;
    if (sessionData.status !== 'in_progress') throw new SessionAlreadyCompletedError();

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
    const updatedStudyHours = (userData.studyHours ?? 0) + timeTaken/3600;

    const currentStats = userData.stats ?? {};

    const isHighContestScore = isContestMode && grading.scorePercent >= 90;
    const isHardContest = isContestMode && session.difficulty === 'hard';
    const isPerfectQuiz = grading.scorePercent === 100 && grading.results.length >= MIN_QUESTIONS_FOR_PERFECT_BADGE;
    const isFastCompletion = session.timeLimitSecs !== null && session.timeLimitSecs > 0 && timeTaken <= session.timeLimitSecs*FAST_COMPLETION_RATIO;

    const updatedContestsPlayed = (currentStats.contestsPlayed ?? 0) + (isContestMode ? 1 : 0);
    const updatedContests90Plus = (currentStats.contests90Plus ?? 0) + (isHighContestScore ? 1 : 0);
    const updatedHardContestsDone = (currentStats.hardContestsDone ?? 0) + (isHardContest ? 1 : 0);
    const updatedPerfectQuizzes = (currentStats.perfectQuizzes ?? 0) + (isPerfectQuiz ? 1 : 0);
    const updatedFastCompletions = (currentStats.fastCompletions ?? 0) + (isFastCompletion ? 1 : 0);

    const subjectStats = { ...(currentStats.subjectStats ?? {}) };
    const prevSubjectStat = subjectStats[session.subject] ?? { attempted: 0, correct: 0 };
    const newSubjectStat = {
      attempted: prevSubjectStat.attempted + grading.results.length,
      correct: prevSubjectStat.correct + grading.correctCount,
    };
    subjectStats[session.subject] = newSubjectStat;

    const masteredSubjects: string[] = currentStats.masteredSubjects ?? [];
    const newSubjectAccuracy = newSubjectStat.attempted > 0 ? newSubjectStat.correct/newSubjectStat.attempted : 0;
    const justMasteredSubject = 
      newSubjectStat.attempted >= MIN_QUESTIONS_FOR_SUBJECT_MASTERY &&
      newSubjectAccuracy >= SUBJECT_MASTERY_THRESHOLD &&
      !masteredSubjects.includes(session.subject);
    const updatedMasteredSubjects = justMasteredSubject ? [...masteredSubjects, session.subject] : masteredSubjects;

    const timeTakenSecsFinal = timeTaken;

    const answersMap = Object.fromEntries(
      grading.results.map((r) => [
        r.questionId,
        { selected: r.selectedOption, isCorrect: r.isCorrect },
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
      timeTaken: timeTakenSecsFinal,
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
      studyHours: updatedStudyHours,
      stats: {
        contestsPlayed: updatedContestsPlayed,
        contests90Plus: updatedContests90Plus,
        hardContestsDone: updatedHardContestsDone,
        perfectQuizzes: updatedPerfectQuizzes,
        fastCompletions: updatedFastCompletions,
        top3Finishes: currentStats.top3Finishes ?? 0,
        subjectStats,
        masteredSubjects: updatedMasteredSubjects,
      },
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (contestLeaderboardRef) {
      const existingScore = contestLeaderboardSnap?.exists ? (contestLeaderboardSnap.data()!.score ?? -Infinity) : -Infinity;
      const bestScore = Math.max(existingScore, grading.score);

      tx.set(contestLeaderboardRef, {
        userId: user.uid,
        displayName: userData.displayName ?? 'Unknown',
        score: bestScore,
        rank: 0,
        completedAt: now,
      });
    }

    return {
      timeTaken: timeTakenSecsFinal,
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

  let challengeOutcome: ChallengeOutcome | null = null;
  if (session.challengeId) {
    try {
      challengeOutcome = await recordChallengeResult(
        session.challengeId,
        user.uid,
        { score: grading.score, correctCount: grading.correctCount, quizSessionId: session.sessionId },
        db
      );
    } catch (err) {
      console.error('[challenge] Failed to record challenge result:', err);
    }
  }

  publishQuizCompleted({
    sessionId: session.sessionId,
    userId: user.uid,
    quizType: session.quizType,
    contestId: session.contestId,
    subject: session.subject,
    totalQuestions: grading.results.length,
    correctCount: grading.correctCount,
    wrongCount: grading.wrongCount,
    skippedCount: grading.skippedCount,
    score: grading.score,
    scorePercent: grading.scorePercent,
    timeTaken: txResult.timeTaken,
    epEarned: txResult.epEarned,
    xpEarned: txResult.xpEarned,
    completedAt: new Date().toISOString(),
  }).catch((err) => console.error('[pubsub] unexpected publish error:', err));

  return {
    sessionId: session.sessionId,
    totalQuestions: grading.results.length,
    correctCount: grading.correctCount,
    wrongCount: grading.wrongCount,
    skippedCount: grading.skippedCount,
    score: grading.score,
    scorePercent: grading.scorePercent,
    timeTaken: txResult.timeTaken,
    epEarned: txResult.epEarned,
    xpEarned: txResult.xpEarned,
    updatedXpPoints: txResult.updatedXpPoints,
    updatedEpPoints: txResult.updatedEpPoints,
    updatedCurrentLevel: txResult.updatedCurrentLevel,
    updatedCurrentStreak: txResult.updatedCurrentStreak,
    leveledUp: txResult.leveledUp,
    isNewLongestStreak: txResult.isNewLongestStreak,
    results: grading.results,
    challengeId: session.challengeId,
    challengeStatus: challengeOutcome?.status ?? null,
    challengeWinnerUid: challengeOutcome?.winnerUid ?? null,
  };
}

export async function getTopicsForSubject(subject: string, context: GraphQLContext): Promise<string[]> {
  const cached = topicCache.get(subject);
  if (cached && cached.expiresAt > Date.now()) return cached.topics;

  const topics = await context.bigqueryService.fetchTopicsForSubject(subject);
  topicCache.set(subject, { topics, expiresAt: Date.now() + TOPIC_CACHE_TTL_MS });

  return topics;
}
