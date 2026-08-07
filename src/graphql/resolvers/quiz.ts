import {
  type StartQuizSessionInput,
  type SubmitQuizSessionInput,
  validateStartQuizSessionInput,
  validateSubmitQuizSessionInput,
  validateGetTopicsForSubjectInput,
} from '../../services/quizValidation.js';
import type { GraphQLContext } from '../context.js';
import { AuthenticationError } from '../../utils/errors.js';
import { startQuizSession, submitQuizSession, getTopicsForSubject } from '../../services/quizService.js';


function mapQuizSessionDoc(id: string, data: FirebaseFirestore.DocumentData) {
  return {
    sessionId: id,
    userId: data.userId,
    contestId: data.contestId ?? null,
    quizType: data.quizType,
    subject: data.subject,
    totalQuestions: data.totalQuestions ?? 0,
    correctCount: data.correctCount ?? 0,
    wrongCount: data.wrongCount ?? 0,
    score: data.score ?? 0,
    scorePercent: data.scorePercent ?? 0,
    epEarned: data.epEarned ?? 0,
    xpEarned: data.xpEarned ?? 0,
    timeTaken: data.timeTaken ?? 0,
    status: data.status,
    startedAt: data.startedAt.toDate().toISOString(),
    completedAt: data.completedAt ? data.completedAt.toDate().toISOString() : null,
  };
}

export async function startQuizSessionResolver(_parent: unknown, args: { input: StartQuizSessionInput }, context: GraphQLContext) {
  const validated = validateStartQuizSessionInput(args.input);
  return startQuizSession(validated, context);
}

export async function submitQuizSessionResolver(_parent: unknown, args: { input: SubmitQuizSessionInput }, context: GraphQLContext) {
  const validated = validateSubmitQuizSessionInput(args.input);
  return submitQuizSession(validated, context);
}

export async function getQuizSessionResolver(_parent: unknown, args: { sessionId: string }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();

  const doc = await context.db.collection('quizSessions').doc(args.sessionId).get();
  if (!doc.exists) return null;

  const data = doc.data()!;
  if (data.userId !== context.user.uid) return null;

  return mapQuizSessionDoc(doc.id, data);
}

export async function getTopicsForSubjectResolver(_parent: unknown, args: { subject: string }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  const subject = validateGetTopicsForSubjectInput(args.subject);
  return getTopicsForSubject(subject, context);
}
