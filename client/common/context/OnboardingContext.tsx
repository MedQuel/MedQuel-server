import { useMemo, useState, useContext, useCallback, createContext } from 'react';

import { auth } from '../firebase/firebase';
import { useAppContext } from './AppContext';
import { ApiError } from '../api/api.errors';
import type { DescribesYou, TargetExam, YearOfStudy } from '../types/types';


export const ROLE_HAS_YEAR: Record<DescribesYou, boolean> = {
  'MBBS Student': true,
  Postgraduate: false,
  'Practicing Doctor': false,
  'Nursing / Allied': false,
};
interface OnboardingDraft {
  displayName: string;
  role: DescribesYou | null;
  yearOfStudy: YearOfStudy | null;
  targetExam: TargetExam | null;
  institution: string;
}
interface OnboardingContextValue {
  draft: OnboardingDraft;
  setDisplayName: (v: string) => void;
  setRole: (v: DescribesYou) => void;
  setYearOfStudy: (v: YearOfStudy | null) => void;
  setTargetExam: (v: TargetExam) => void;
  setInstitution: (v: string) => void;
  submitting: boolean;
  submitError: string | null;
  submit: () => Promise<boolean>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { completeOnboarding } = useAppContext();

  const [draft, setDraft] = useState<OnboardingDraft>({
    displayName: auth.currentUser?.displayName ?? '',
    role: null,
    yearOfStudy: null,
    targetExam: null,
    institution: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setDisplayName = useCallback(
    (v: string) => setDraft((d) => ({ ...d, displayName: v })),
    []
  );
  const setRole = useCallback(
    (v: DescribesYou) =>
      setDraft((d) => ({
        ...d,
        role: v,
        yearOfStudy: ROLE_HAS_YEAR[v] ? d.yearOfStudy : null,
      })),
    []
  );
  const setYearOfStudy = useCallback(
    (v: YearOfStudy | null) => setDraft((d) => ({ ...d, yearOfStudy: v })),
    []
  );
  const setTargetExam = useCallback(
    (v: TargetExam) => setDraft((d) => ({ ...d, targetExam: v })),
    []
  );
  const setInstitution = useCallback(
    (v: string) => setDraft((d) => ({ ...d, institution: v })),
    []
  );

  const submit = useCallback(async (): Promise<boolean> => {
    if (!draft.role || !draft.targetExam) {
      setSubmitError('Please complete every step before continuing.');
      return false;
    }
    if (draft.displayName.trim().length < 5) {
      setSubmitError('Display name must be at least 5 characters.');
      return false;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await completeOnboarding({
        displayName: draft.displayName.trim(),
        describesYou: draft.role,
        yearOfStudy: draft.yearOfStudy ?? undefined,
        targetExam: draft.targetExam,
        institution: draft.institution.trim() || undefined,
      });
      return true;
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.'
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [draft, completeOnboarding]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      draft,
      setDisplayName,
      setRole,
      setYearOfStudy,
      setTargetExam,
      setInstitution,
      submitting,
      submitError,
      submit,
    }),
    [
      draft,
      setDisplayName,
      setRole,
      setYearOfStudy,
      setTargetExam,
      setInstitution,
      submitting,
      submitError,
      submit,
    ]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
