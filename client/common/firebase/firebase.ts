// Firebase client SDK setup — Auth only for now (Firestore direct listeners
// for chat/leaderboard can be added the same way later, per Backend
// Architecture).
//
// This is intentionally the ONLY file that talks to the Firebase SDK directly
// - http.ts and AppContext.tsx both go through the functions exported here,
// so swapping auth providers later only touches this file.

import {
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { Platform } from 'react-native';
// @ts-expect-error
import { getReactNativePersistence } from 'firebase/auth';
// KNOWN UPSTREAM TYPING GAP: `getReactNativePersistence`
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

export type { FirebaseUser };
