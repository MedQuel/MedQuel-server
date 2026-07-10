import React, { createContext, useCallback, useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { api } from '../api/api';
import type { User } from '../types/types';
import { ApiError, AuthenticationError, NotOnboardedError } from '../api/api.errors';
import { auth, subscribeToAuthChanges, signOut as firebaseSignOut } from '../firebase/firebase';


const USER_CACHE_KEY = 'medquel:lastKnownUser';

export type AuthStatus =
  | 'checking'
  | 'needsEmailVerification'
  | 'authenticated'
  | 'needsOnboarding'
  | 'unauthenticated';

export interface AppContextValue {
  authStatus: AuthStatus;
  user: User | null;
  isPremium: boolean;
  userLoading: boolean;
  userError: ApiError | null;
  refreshUser: () => Promise<void>;
  recheckEmailVerification: () => Promise<boolean>;
  completeOnboarding: (
    input: Parameters<typeof api.user.completeOnboarding>[0]
  ) => Promise<void>;
  logout: () => Promise<void>;
}
const DEFAULT_CONTEXT: AppContextValue = {
  authStatus: 'checking',
  user: null,
  isPremium: false,
  userLoading: false,
  userError: null,
  refreshUser: async () => {},
  recheckEmailVerification: async () => false,
  completeOnboarding: async () => {},
  logout: async () => {},
};
export const AppContext = createContext<AppContextValue>(DEFAULT_CONTEXT);


export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<ApiError | null>(null);

  const persistUser = useCallback(async (nextUser: User | null) => {
    try {
      if (nextUser) await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(nextUser));
      else await AsyncStorage.removeItem(USER_CACHE_KEY);
    } catch {
      // Cache is a nice-to-have for instant cold-start UI — never block on it.
    }
  }, []);

  const fetchUser = useCallback(async () => {
    setUserLoading(true);
    setUserError(null);
    try {
      const me = await api.user.getMe();
      setUser(me);
      setAuthStatus('authenticated');
      await persistUser(me);
    } catch (err) {
      const apiErr = err instanceof ApiError
        ? err
        : new ApiError('UNKNOWN', 'Failed to load profile');

      if (apiErr instanceof NotOnboardedError) {
        // Expected state for a brand-new signup,
        // clear any stale cached profile from a previous account and route to onboarding.
        setUser(null);
        await persistUser(null);
        setAuthStatus('needsOnboarding');
        return;
      }

      setUserError(apiErr);
      // Token is no longer valid server-side, force a clean sign-out.
      if (apiErr instanceof AuthenticationError) await firebaseSignOut().catch(() => {});
    } finally {
      setUserLoading(false);
    }
  }, [persistUser]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(USER_CACHE_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {
        // ignore — falls through to a normal fetch once auth resolves
      }
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.emailVerified) {
          setAuthStatus('needsEmailVerification');
          setUser(null);
          setUserError(null);
          persistUser(null);
          return;
        }
        fetchUser();
      } else {
        setAuthStatus('unauthenticated');
        setUser(null);
        setUserError(null);
        persistUser(null);
      }
    });

    return unsubscribe;
  }, [fetchUser, persistUser]);

  const recheckEmailVerification = useCallback(async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    
    if (auth.currentUser.emailVerified) {
      await fetchUser();
      return true;
    }
    return false;
  }, [fetchUser]);

  const completeOnboardingFn = useCallback(
    async (input: Parameters<typeof api.user.completeOnboarding>[0]) => {
      setUserLoading(true);
      setUserError(null);
      try {
        const me = await api.user.completeOnboarding(input);
        setUser(me);
        setAuthStatus('authenticated');
        await persistUser(me);
      } catch (err) {
        const apiErr = err instanceof ApiError
          ? err
          : new ApiError('UNKNOWN', 'Failed to complete onboarding');
        setUserError(apiErr);
        throw apiErr;
      } finally {
        setUserLoading(false);
      }
    },
    [persistUser]
  );

  const logout = useCallback(async () => { await firebaseSignOut() }, []);

  const isPremium = !!user?.isPremium;

  const value = useMemo<AppContextValue>(
    () => ({
      authStatus,
      user,
      isPremium,
      userLoading,
      userError,
      refreshUser: fetchUser,
      recheckEmailVerification,
      completeOnboarding: completeOnboardingFn,
      logout,
    }),
    [
      authStatus,
      user,
      isPremium,
      userLoading,
      userError,
      fetchUser,
      recheckEmailVerification,
      completeOnboardingFn,
      logout,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export { auth };
