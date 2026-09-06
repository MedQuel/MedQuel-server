import { useMemo, useState, useContext, useCallback, createContext } from 'react';

import { auth } from '../firebase/firebase';
import { useAppContext } from './AppContext';
import { ApiError } from '../api/api.errors';
import { subjectCatalog } from '../constants/subject';
import type { DescribesYou, TargetExam, YearOfStudy, Specialty, ContentScope } from '../types/types';


export const ROLE_HAS_YEAR: Record<DescribesYou, boolean> = {
  'MBBS Student': true,
  Postgraduate: false,
  'Practicing Doctor': false,
  'Nursing / Allied': false,
};
export const ROLE_HAS_SPECIALTY: Record<DescribesYou, boolean> = {
  'MBBS Student': false,
  Postgraduate: true,
  'Practicing Doctor': true,
  'Nursing / Allied': false,
};

export const UNDERGRAD_TARGET_EXAMS: TargetExam[] = ['USMLE', 'NEET-PG', 'INI-CET', 'PLAB', 'MRCP', 'FMGE', 'Clinical Mastery'];
export const SPECIALTY_TARGET_EXAMS: TargetExam[] = ['DM', 'MCH', 'Fellowship Exams', 'Clinical Mastery'];

export function targetExamsFor(role: DescribesYou | null): TargetExam[] {
  if (!role) return [];
  return ROLE_HAS_SPECIALTY[role] ? SPECIALTY_TARGET_EXAMS : UNDERGRAD_TARGET_EXAMS;
}

export const MAX_SPECIALTIES = 3;
export const MIN_FOCUS_SUBJECTS = 1;
export const MAX_FOCUS_SUBJECTS = 5;
export const SPECIALTY_OPTIONS: Specialty[] = Object.values(subjectCatalog).map((s) => s.title) as Specialty[];


interface OnboardingDraft {
  displayName: string;
  role: DescribesYou | null;
  yearOfStudy: YearOfStudy | null;
  specialties: Specialty[];
  targetExam: TargetExam | null;
  institution: string;
  contentScope: ContentScope | null;
  focusSubjects: Specialty[];
}
interface OnboardingContextValue {
  draft: OnboardingDraft;
  setDisplayName: (v: string) => void;
  setRole: (v: DescribesYou) => void;
  setYearOfStudy: (v: YearOfStudy | null) => void;
  toggleSpecialty: (v: Specialty) => void;
  setTargetExam: (v: TargetExam) => void;
  setInstitution: (v: string) => void;
  setContentScope: (v: ContentScope) => void;
  toggleFocusSubject: (v: Specialty) => void;
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
    specialties: [],
    targetExam: null,
    institution: '',
    contentScope: null,
    focusSubjects: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setDisplayName = useCallback((v: string) => setDraft((d) => ({ ...d, displayName: v })), []);

  const setRole = useCallback(
    (v: DescribesYou) =>
      setDraft((d) => {
        const targetStillValid = d.targetExam ? targetExamsFor(v).includes(d.targetExam) : false;
        return {
          ...d,
          role: v,
          yearOfStudy: ROLE_HAS_YEAR[v] ? d.yearOfStudy : null,
          specialties: ROLE_HAS_SPECIALTY[v] ? d.specialties : [],
          targetExam: targetStillValid ? d.targetExam : null,
        };
      }),
    []
  );
  const setYearOfStudy = useCallback((v: YearOfStudy | null) => setDraft((d) => ({ ...d, yearOfStudy: v })), []);
  const toggleSpecialty = useCallback(
    (v: Specialty) =>
      setDraft((d) => {
        if (d.specialties.includes(v)) return { ...d, specialties: d.specialties.filter((s) => s !== v) };
        if (d.specialties.length >= MAX_SPECIALTIES) return d;
        return { ...d, specialties: [...d.specialties, v] };
      }),
    []
  );
  const setTargetExam = useCallback((v: TargetExam) => setDraft((d) => ({ ...d, targetExam: v })), []);
  const setInstitution = useCallback((v: string) => setDraft((d) => ({ ...d, institution: v })), []);
  const setContentScope = useCallback(
    (v: ContentScope) =>
      setDraft((d) => ({
        ...d,
        contentScope: v,
        focusSubjects: v === 'focused' ? d.focusSubjects : [],
      })),
    []
  );
  const toggleFocusSubject = useCallback(
    (v: Specialty) =>
      setDraft((d) => {
        if (d.focusSubjects.includes(v)) return { ...d, focusSubjects: d.focusSubjects.filter((s) => s !== v) };
        if (d.focusSubjects.length >= MAX_FOCUS_SUBJECTS) return d;
        return { ...d, focusSubjects: [...d.focusSubjects, v] };
      }),
    []
  );

  const submit = useCallback(async (): Promise<boolean> => {
    if (!draft.role || !draft.targetExam || !draft.contentScope) {
      setSubmitError('Please complete every step before continuing.');
      return false;
    }
    if (draft.displayName.trim().length < 5) {
      setSubmitError('Display name must be at least 5 characters.');
      return false;
    }
    if (ROLE_HAS_YEAR[draft.role] && !draft.yearOfStudy) {
      setSubmitError('Please select your year of study.');
      return false;
    }
    if (ROLE_HAS_SPECIALTY[draft.role] && draft.specialties.length === 0) {
      setSubmitError('Please select at least one specialty.');
      return false;
    }
    if (draft.contentScope === 'focused' && draft.focusSubjects.length < MIN_FOCUS_SUBJECTS) {
      setSubmitError('Please select at least one subject to focus on.');
      return false;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await completeOnboarding({
        displayName: draft.displayName.trim(),
        describesYou: draft.role,
        yearOfStudy: draft.yearOfStudy ?? undefined,
        specialties: draft.specialties.length ? draft.specialties : undefined,
        targetExam: draft.targetExam,
        institution: draft.institution.trim() || undefined,
        contentScope: draft.contentScope,
        focusSubjects: draft.focusSubjects.length ? draft.focusSubjects : undefined,
      });
      return true;
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
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
      toggleSpecialty,
      setTargetExam,
      setInstitution,
      setContentScope,
      toggleFocusSubject,
      submitting,
      submitError,
      submit,
    }),
    [
      draft,
      setDisplayName,
      setRole,
      setYearOfStudy,
      toggleSpecialty,
      setTargetExam,
      setInstitution,
      setContentScope,
      toggleFocusSubject,
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
