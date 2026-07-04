import { Timestamp } from 'firebase-admin/firestore';

import type { GraphQLContext } from '../context.js';
import { AuthenticationError, NotOnboardedError } from '../../utils/errors.js';


function toISOString(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return new Date().toISOString();
}

// Maps a raw users/{uid} Firestore doc to the GraphQL User shape.
export function mapUserDoc(uid: string, data: FirebaseFirestore.DocumentData) {
  return {
    uid,
    displayName: data.displayName,
    email: data.email,
    photoURL: data.photoURL ?? null,
    role: data.role,
    targetExam: data.targetExam,
    studyLevel: data.studyLevel,
    yearOfStudy: data.yearOfStudy ?? null,
    institution: data.institution ?? null,
    isPremium: data.isPremium ?? false,
    xpPoints: data.xpPoints ?? 0,
    epPoints: data.epPoints ?? 0,
    currentLevel: data.currentLevel ?? 1,
    currentStreak: data.currentStreak ?? 0,
    longestStreak: data.longestStreak ?? 0,
    totalQuestions: data.totalQuestions ?? 0,
    totalCorrect: data.totalCorrect ?? 0,
    studyHours: data.studyHours ?? 0,
    badges: data.badges ?? [],
    createdAt: toISOString(data.createdAt),
    updatedAt: toISOString(data.updatedAt),
  };
}


export async function meResolver( _parent: unknown, _args: unknown, context: GraphQLContext ) {
  if (!context.user) throw new AuthenticationError();

  const uid = context.user.uid;
  const doc = await context.db.collection('users').doc(uid).get();

  if (!doc.exists) {
    // Valid Firebase token, but no Firestore profile
    // - the frontend's needsOnboarding AuthStatus routes on exactly this signal.
    throw new NotOnboardedError();
  }

  return mapUserDoc(uid, doc.data()!);
}
