import { GraphQLError } from 'graphql';

import {
  VALID_DESCRIBES_YOU,
  SPECIALTY_TRACK,
  DESCRIBES_YOU_TO_STUDY_LEVEL,
  VALID_YEAR_OPTIONS,
  VALID_SPECIALTIES,
  UNDERGRAD_TARGET_EXAMS,
  SPECIALTY_TARGET_EXAMS,
  VALID_CONTENT_SCOPES,
  MAX_SPECIALTIES,
  MIN_FOCUS_SUBJECTS,
  MAX_FOCUS_SUBJECTS,
} from './onboardingValidation.js';
import type { DescribesYou, StudyLevel, YearOfStudy, Specialty, TargetExam, ContentScope } from './onboardingValidation.js';


const FIREBASE_STORAGE_PHOTO_URL_PATTERN = /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/profilePhotos%2F/;
export interface UpdateProfileInput {
  displayName?: string | null;
  photoURL?: string | null;
  describesYou?: string | null;
  yearOfStudy?: string | null;
  specialties?: string[] | null;
  targetExam?: string | null;
  institution?: string | null;
  contentScope?: string | null;
  focusSubjects?: string[] | null;
}
export interface CurrentProfileForUpdate {
  describesYou: DescribesYou;
  yearOfStudy: string | null;
  specialties: string[];
  targetExam: string;
  contentScope: ContentScope;
  focusSubjects: string[];
}
export interface ValidatedProfileUpdate {
  displayName?: string;
  photoURL?: string | null;
  describesYou?: DescribesYou;
  studyLevel?: StudyLevel;
  yearOfStudy?: string | null;
  specialties?: string[];
  targetExam?: TargetExam;
  institution?: string | null;
  contentScope?: ContentScope;
  focusSubjects?: string[];
}

function badInput(message: string): never {
  throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
}

function validatePhotoURL(photoURL: string): void {
  if (!FIREBASE_STORAGE_PHOTO_URL_PATTERN.test(photoURL)) {
    badInput('photoURL must be a valid uploaded profile photo link.');
  }
}

function dedupeAndValidateSubjects(raw: string[], fieldLabel: string, min: number, max: number): string[] {
  const deduped = Array.from(new Set(raw.map((s) => s.trim()).filter(Boolean)));
  if (deduped.length < min) {
    badInput(`${fieldLabel} requires at least ${min} value${min === 1 ? '' : 's'}.`);
  }
  if (deduped.length > max) {
    badInput(`${fieldLabel} allows at most ${max} value${max === 1 ? '' : 's'}.`);
  }
  for (const s of deduped) {
    if (!VALID_SPECIALTIES.includes(s as Specialty)) badInput(`Invalid value in ${fieldLabel}: "${s}".`);
  }

  return deduped;
}


export function validateUpdateProfileInput(input: UpdateProfileInput, current: CurrentProfileForUpdate): ValidatedProfileUpdate {
  const result: ValidatedProfileUpdate = {};

  if (input.displayName !== undefined && input.displayName !== null) {
    const trimmed = input.displayName.trim();
    if (trimmed.length < 5) badInput('Display name must be at least 5 characters.');
    if (trimmed.length > 30) badInput('Display name is too long.');
    result.displayName = trimmed;
  }

  if (input.photoURL !== undefined) {
    if (input.photoURL !== null) validatePhotoURL(input.photoURL);
    result.photoURL = input.photoURL;
  }

  if (input.institution !== undefined) {
    const trimmed = input.institution?.trim() || null;
    if (trimmed && trimmed.length > 60) badInput('Institution name is too long.');
    result.institution = trimmed;
  }

  let effectiveDescribesYou = current.describesYou;
  if (input.describesYou !== undefined && input.describesYou !== null) {
    const raw = input.describesYou.trim();
    if (!VALID_DESCRIBES_YOU.includes(raw as DescribesYou)) {
      badInput(`Invalid value for describesYou: "${input.describesYou}".`);
    }
    effectiveDescribesYou = raw as DescribesYou;
  }
  const describesYouChanged = effectiveDescribesYou !== current.describesYou;
  if (describesYouChanged) {
    result.describesYou = effectiveDescribesYou;
    result.studyLevel = DESCRIBES_YOU_TO_STUDY_LEVEL[effectiveDescribesYou];
  }
  const isSpecialtyTrackNow = SPECIALTY_TRACK.has(effectiveDescribesYou);

  if (effectiveDescribesYou === 'MBBS Student') {
    if (input.yearOfStudy !== undefined && input.yearOfStudy !== null) {
      const raw = input.yearOfStudy.trim();
      if (!VALID_YEAR_OPTIONS.includes(raw as YearOfStudy)) {
        badInput(`Invalid value for yearOfStudy: "${input.yearOfStudy}".`);
      }
      result.yearOfStudy = raw;
    } else if (describesYouChanged && !current.yearOfStudy) {
      badInput('yearOfStudy is required when switching describesYou to "MBBS Student".');
    }
  } else {
    if (input.yearOfStudy != null && input.yearOfStudy !== '') {
      badInput(`yearOfStudy must not be provided when describesYou is "${effectiveDescribesYou}".`);
    }
    if (describesYouChanged && current.yearOfStudy) result.yearOfStudy = null;
  }

  if (isSpecialtyTrackNow) {
    if (input.specialties !== undefined && input.specialties !== null) {
      result.specialties = dedupeAndValidateSubjects(input.specialties, 'specialties', 1, MAX_SPECIALTIES);
    } else if (describesYouChanged && current.specialties.length === 0) {
      badInput(`specialties is required when switching describesYou to "${effectiveDescribesYou}".`);
    }
  } else {
    if (input.specialties != null && input.specialties.length > 0) {
      badInput(`specialties must not be provided when describesYou is "${effectiveDescribesYou}".`);
    }
    if (describesYouChanged && current.specialties.length > 0) {
      result.specialties = [];
    }
  }

  const allowedTargetExams: readonly string[] = isSpecialtyTrackNow
    ? SPECIALTY_TARGET_EXAMS
    : UNDERGRAD_TARGET_EXAMS;
  if (input.targetExam !== undefined && input.targetExam !== null) {
    const raw = input.targetExam.trim();
    if (!allowedTargetExams.includes(raw)) {
      badInput(`Invalid value for targetExam: "${input.targetExam}". Must be one of: ${allowedTargetExams.join(', ')}.`);
    }
    result.targetExam = raw as TargetExam;
  } else if (describesYouChanged && !allowedTargetExams.includes(current.targetExam)) {
    badInput(`Your current targetExam ("${current.targetExam}") isn't valid for describesYou="${effectiveDescribesYou}".`);
  }

  let effectiveContentScope = current.contentScope;
  if (input.contentScope !== undefined && input.contentScope !== null) {
    const raw = input.contentScope.trim();
    if (!VALID_CONTENT_SCOPES.includes(raw as ContentScope)) {
      badInput(`Invalid value for contentScope: "${input.contentScope}". Must be "all" or "focused".`);
    }
    effectiveContentScope = raw as ContentScope;
    result.contentScope = effectiveContentScope;
  }
  const contentScopeChanged = effectiveContentScope !== current.contentScope;

  if (effectiveContentScope === 'focused') {
    if (input.focusSubjects !== undefined && input.focusSubjects !== null) {
      result.focusSubjects = dedupeAndValidateSubjects(input.focusSubjects, 'focusSubjects', MIN_FOCUS_SUBJECTS, MAX_FOCUS_SUBJECTS);
    } else if (contentScopeChanged && current.focusSubjects.length === 0) {
      badInput('focusSubjects is required when switching contentScope to "focused".');
    }
  } else {
    if (input.focusSubjects != null && input.focusSubjects.length > 0) {
      badInput('focusSubjects must not be provided when contentScope is "all".');
    }
    if (contentScopeChanged && current.focusSubjects.length > 0) {
      result.focusSubjects = [];
    }
  }

  return result;
}


export interface NotifPrefsInput {
  pushEnabled?: boolean | null;
  emailDigest?: boolean | null;
  rankAlerts?: boolean | null;
  contestReminders?: boolean | null;
  achievementAlerts?: boolean | null;
}
export function validateNotifPrefsInput(input: NotifPrefsInput): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  const fields: (keyof NotifPrefsInput)[] = [
    'pushEnabled',
    'emailDigest',
    'rankAlerts',
    'contestReminders',
    'achievementAlerts',
  ];

  for (const field of fields) {
    const value = input[field];
    if (value === undefined || value === null) continue;
    if (typeof value !== 'boolean') badInput(`notifPrefs.${field} must be a boolean.`);
    result[field] = value;
  }
  return result;
}


export interface QuizPrefsInput {
  defaultDifficulty?: string | null;
  timerSound?: boolean | null;
  autoSubmit?: boolean | null;
}
export function validateQuizPrefsInput(input: QuizPrefsInput): Record<string, boolean | string> {
  const result: Record<string, boolean | string> = {};
  if (input.defaultDifficulty !== undefined && input.defaultDifficulty !== null) {
    const normalized = input.defaultDifficulty.toLowerCase();
    if (!['easy', 'medium', 'hard'].includes(normalized)) {
      badInput(`quizPrefs.defaultDifficulty must be easy/medium/hard, got "${input.defaultDifficulty}".`);
    }
    result.defaultDifficulty = normalized;
  }

  if (input.timerSound !== undefined && input.timerSound !== null) {
    if (typeof input.timerSound !== 'boolean') badInput('quizPrefs.timerSound must be a boolean.');
    result.timerSound = input.timerSound;
  }

  if (input.autoSubmit !== undefined && input.autoSubmit !== null) {
    if (typeof input.autoSubmit !== 'boolean') badInput('quizPrefs.autoSubmit must be a boolean.');
    result.autoSubmit = input.autoSubmit;
  }

  return result;
}
