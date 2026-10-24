import { FieldValue, Timestamp } from 'firebase-admin/firestore';

import type { GraphQLContext } from '../context.js';
import { isPremiumActive } from '../../utils/premium.js';
import { AuthenticationError, NotOnboardedError } from '../../utils/errors.js';
import { deriveDescribesYouFromStudyLevel } from '../../validators/onboardingValidation.js';
import { validateQuizPrefsInput, validateNotifPrefsInput, validateUpdateProfileInput } from '../../validators/profileValidation.js';
import type { CurrentProfileForUpdate, QuizPrefsInput, NotifPrefsInput, UpdateProfileInput } from '../../validators/profileValidation.js';


export const DEFAULT_NOTIF_PREFS = {
  pushEnabled: true,
  emailDigest: false,
  rankAlerts: true,
  contestReminders: false,
  achievementAlerts: true,
};
export const DEFAULT_QUIZ_PREFS = {
  defaultDifficulty: 'medium' as const,
  timerSound: true,
  autoSubmit: true,
};

function toISOString(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  return new Date().toISOString();
}

export function mapUserDoc(uid: string, data: FirebaseFirestore.DocumentData) {
  const describesYou = data.describesYou ?? deriveDescribesYouFromStudyLevel(data.studyLevel);

  return {
    uid,
    displayName: data.displayName,
    email: data.email,
    photoURL: data.photoURL ?? null,
    role: data.role,
    describesYou,
    targetExam: data.targetExam,
    studyLevel: data.studyLevel,
    yearOfStudy: data.yearOfStudy ?? null,
    specialties: data.specialties ?? [],
    institution: data.institution ?? null,
    isPremium: isPremiumActive(data),
    subscriptionId: data.subscriptionId ?? null,
    premiumExpiresAt: data.premiumExpiresAt instanceof Timestamp
      ? data.premiumExpiresAt.toDate().toISOString()
      : null,
    premiumPlanId: data.premiumPlanId ?? null,
    xpPoints: data.xpPoints ?? 0,
    epPoints: data.epPoints ?? 0,
    currentLevel: data.currentLevel ?? 1,
    currentStreak: data.currentStreak ?? 0,
    longestStreak: data.longestStreak ?? 0,
    lastActiveDate: toISOString(data.lastActiveDate),
    totalQuestions: data.totalQuestions ?? 0,
    totalCorrect: data.totalCorrect ?? 0,
    studyHours: data.studyHours ?? 0,
    stats: {
      contestsPlayed: data.stats?.contestsPlayed ?? 0,
      contests90Plus: data.stats?.contests90Plus ?? 0,
      hardContestsDone: data.stats?.hardContestsDone ?? 0,
      perfectQuizzes: data.stats?.perfectQuizzes ?? 0,
      fastCompletions: data.stats?.fastCompletions ?? 0,
      top3Finishes: data.stats?.top3Finishes ?? 0,
      subjects70Plus: data.stats?.masteredSubjects?.length ?? 0,
    },
    badges: data.badges ?? [],
    notifPrefs: { ...DEFAULT_NOTIF_PREFS, ...(data.notifPrefs ?? {}) },
    quizPrefs: { ...DEFAULT_QUIZ_PREFS, ...(data.quizPrefs ?? {}) },
    contentScope: data.contentScope ?? 'all',
    focusSubjects: data.focusSubjects ?? [],
    createdAt: toISOString(data.createdAt),
    updatedAt: toISOString(data.updatedAt),
  };
}


export async function meResolver(_parent: unknown, _args: unknown, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();

  const uid = context.user.uid;
  const doc = await context.db.collection('users').doc(uid).get();
  if (!doc.exists) throw new NotOnboardedError();

  return mapUserDoc(uid, doc.data()!);
}

export async function updateProfileResolver(_parent: unknown, args: { input: UpdateProfileInput }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();

  const uid = context.user.uid;
  const userRef = context.db.collection('users').doc(uid);
  const doc = await userRef.get();
  if (!doc.exists) throw new NotOnboardedError();

  const data = doc.data()!;
  const current: CurrentProfileForUpdate = {
    describesYou: data.describesYou ?? deriveDescribesYouFromStudyLevel(data.studyLevel),
    yearOfStudy: data.yearOfStudy ?? null,
    specialties: data.specialties ?? [],
    targetExam: data.targetExam,
    contentScope: data.contentScope ?? 'all',
    focusSubjects: data.focusSubjects ?? [],
  };

  const validated = validateUpdateProfileInput(args.input, current);
  if (validated.displayName) {
    (validated).displayNameLower = validated.displayName.toLowerCase();
  }
  if (Object.keys(validated).length === 0) return mapUserDoc(uid, data);

  await userRef.update({
    ...validated,
    updatedAt: FieldValue.serverTimestamp(),
  });
  const updatedDoc = await userRef.get();

  return mapUserDoc(uid, updatedDoc.data()!);
}

export async function updateNotifPrefsResolver(_parent: unknown, args: { input: NotifPrefsInput }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();

  const uid = context.user.uid;
  const userRef = context.db.collection('users').doc(uid);
  const doc = await userRef.get();
  if (!doc.exists) throw new NotOnboardedError();

  const validated = validateNotifPrefsInput(args.input);
  const currentPrefs = { ...DEFAULT_NOTIF_PREFS, ...(doc.data()!.notifPrefs ?? {}) };
  const mergedPrefs = { ...currentPrefs, ...validated };

  if (Object.keys(validated).length > 0) {
    await userRef.update({
      notifPrefs: mergedPrefs,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  return mergedPrefs;
}

export async function updateQuizPrefsResolver(_parent: unknown, args: { input: QuizPrefsInput }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();

  const uid = context.user.uid;
  const userRef = context.db.collection('users').doc(uid);
  const doc = await userRef.get();
  if (!doc.exists) throw new NotOnboardedError();

  const validated = validateQuizPrefsInput(args.input);
  const currentPrefs = {...DEFAULT_QUIZ_PREFS, ...(doc.data()!.quizPrefs ?? {}) };
  const mergedPrefs = { ...currentPrefs, ...validated };

  if (Object.keys(validated).length > 0) {
    await userRef.update({
      quizPrefs: mergedPrefs,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  return mergedPrefs;
}
