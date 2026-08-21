import { Timestamp, FieldValue } from 'firebase-admin/firestore';

import type { GraphQLContext } from '../context.js';
import { AuthenticationError } from '../../utils/errors.js';
import { DEFAULT_NOTIF_PREFS, DEFAULT_QUIZ_PREFS } from './user.js';
import { type CompleteOnboardingInput } from '../../services/onboardingValidation.js';
import { validateOnboardingInput, assertNotAlreadyOnboarded } from '../../services/onboardingValidation.js';


function buildUserDocument(uid: string, email: string, data: ReturnType<typeof validateOnboardingInput>) {
  return {
    uid,
    displayName: data.displayName,
    email,
    photoURL: null,
    role: 'student' as const,
    targetExam: data.targetExam,
    studyLevel: data.studyLevel,
    yearOfStudy: data.yearOfStudy,
    institution: data.institution,
    isPremium: false,
    subscriptionId: null,
    xpPoints: 0,
    epPoints: 0,
    currentLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: Timestamp.now(),
    totalQuestions: 0,
    totalCorrect: 0,
    studyHours: 0,
    stats: {
      contestsPlayed: 0,
      contests90Plus: 0,
      hardContestsDone: 0,
      perfectQuizzes: 0,
      fastCompletions: 0,
      top3Finishes: 0,
      masteredSubjects: [] as string[],
      subjectStats: {} as Record<string, { attempted: number; correct: number }>,
    },
    badges: [] as string[],
    badgeProgress: {},
    notifTokens: [] as string[],
    notifPrefs: DEFAULT_NOTIF_PREFS,
    quizPrefs: DEFAULT_QUIZ_PREFS,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}


export async function completeOnboardingResolver(_parent: unknown, args: { input: CompleteOnboardingInput }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();

  const uid = context.user.uid;
  const email = context.user.email ?? '';

  const validated = validateOnboardingInput(args.input);

  const userRef = context.db.collection('users').doc(uid);
  const existingDoc = await userRef.get();
  assertNotAlreadyOnboarded(existingDoc);

  const userDoc = buildUserDocument(uid, email, validated);
  await userRef.set(userDoc);

  return {
    displayName: userDoc.displayName,
    describesYou: args.input.describesYou,
    yearOfStudy: userDoc.yearOfStudy,
    targetExam: userDoc.targetExam,
    institution: userDoc.institution,
  };
}
