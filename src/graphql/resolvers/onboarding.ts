import type { Firestore } from 'firebase-admin/firestore';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

import {
  validateOnboardingInput,
  assertNotAlreadyOnboarded,
  type CompleteOnboardingInput,
} from '../../services/onboardingValidation.js';
import type { GraphQLContext } from '../context.js';
import { AuthenticationError } from '../../utils/errors.js';


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
    badges: [] as string[],
    badgeProgress: {},
    notifTokens: [] as string[],
    notifPrefs: { pushEnabled: true, emailDigest: true, rankAlerts: true, contestReminders: true },
    quizPrefs: { defaultDifficulty: 'medium', timerSound: true, autoSubmit: false },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}


export async function completeOnboardingResolver(
  _parent: unknown,
  args: { input: CompleteOnboardingInput },
  context: GraphQLContext,
  db: Firestore
) {
  if (!context.user) throw new AuthenticationError();

  const uid = context.user.uid;
  const email = context.user.email ?? '';

  const validated = validateOnboardingInput(args.input);

  const userRef = db.collection('users').doc(uid);
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
