import { Timestamp } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';

import {
  ForbiddenError,
  NotOnboardedError,
  AuthenticationError,
  ContestNotFoundError,
  ContestNotActiveError,
  InsufficientQuestionsError,
} from '../utils/errors.js';
import type { GraphQLContext } from '../graphql/context.js';
import type { QuestionForQuiz } from './bigqueryService.js';
import type { ValidatedStartQuizSession } from './quizValidation.js';


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
}
async function fetchActiveContest(contestId: string, db: Firestore): Promise<ActiveContest> {
  const doc = await db.collection('contests').doc(contestId).get();
  if (!doc.exists) throw new ContestNotFoundError();

  const data = doc.data()!;
  const now = Timestamp.now().toMillis();

  if (data.status !== 'active') throw new ContestNotActiveError(`This contest is "${data.status}", not active.`);
  if (data.endsAt && data.endsAt.toMillis() < now) throw new ContestNotActiveError('This contest has already ended.');
  if (data.startsAt && data.startsAt.toMillis() > now) throw new ContestNotActiveError('This contest has not started yet.');

  return {
    contestId: doc.id,
    subject: data.subject,
    difficulty: data.difficulty,
    isPremium: data.isPremium === true,
    questionIds: data.questionIds ?? [],
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

  if (input.mode === 'contest') {
    const contest = await fetchActiveContest(input.contestId, db);
    if (contest.isPremium && !user.isPremium) {
      throw new ForbiddenError('This contest requires an active premium subscription.');
    }

    subject = contest.subject;
    difficulty = contest.difficulty;
    questionIds = contest.questionIds;
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
