// Firebase client SDK setup — Auth only for now (Firestore direct listeners
// for chat/leaderboard can be added the same way later, per Backend Architecture).

import {
  getAuth,
  updateProfile,
  initializeAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import { Platform } from 'react-native';
// @ts-expect-error
import { getReactNativePersistence } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { config } from '../api/config';


export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(config.firebase);

export const auth = Platform.OS === 'web'
  ? getAuth(firebaseApp)
  : initializeAuth(firebaseApp, { persistence: getReactNativePersistence(AsyncStorage) });

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getCurrentIdToken(forceRefresh = false): Promise<string | null> {
  const current = auth.currentUser;
  if (!current) return null;

  try {
    return await current.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signUpWithEmail(email: string, password: string, displayName: string): Promise<FirebaseUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  return credential.user;
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}
export async function sendVerificationEmail(): Promise<void> {
  if (!auth.currentUser) throw new Error('No signed-in user to verify.');
  // TODO: same ActionCodeSettings question as sendPasswordReset above —
  // once we have the confirmed domain/Android config, this should send a
  // deep link into /auth/action instead of Firebase's default confirmation
  // page, so tapping the email link opens the app directly.
  await sendEmailVerification(auth.currentUser);
}

// -----> Google <-----
// This function only wraps the FINAL step — exchanging an already-obtained
// Google ID token for a Firebase session. The actual OAuth request itself
// happens via the `useIdTokenAuthRequest` hook inside the login screen.
export async function signInWithGoogleCredential(idToken: string): Promise<FirebaseUser> {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

export type { FirebaseUser };
