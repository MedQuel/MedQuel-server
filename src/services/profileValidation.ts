import { GraphQLError } from 'graphql';
import { type TargetExam, type StudyLevel } from './onboardingValidation.js';
import { VALID_TARGET_EXAMS, VALID_STUDY_LEVELS, VALID_YEAR_OPTIONS } from './onboardingValidation.js';


export interface UpdateProfileInput {
  displayName?: string | null;
  photoURL?: string | null;
  targetExam?: string | null;
  studyLevel?: string | null;
  yearOfStudy?: string | null;
  institution?: string | null;
}
export interface ValidatedProfileUpdate {
  displayName?: string;
  photoURL?: string | null;
  targetExam?: TargetExam;
  studyLevel?: StudyLevel;
  yearOfStudy?: string | null;
  institution?: string | null;
}

export function validateUpdateProfileInput(input: UpdateProfileInput): ValidatedProfileUpdate {
  const result: ValidatedProfileUpdate = {};

  if (input.displayName !== undefined && input.displayName !== null) {
    const trimmed = input.displayName.trim();
    if (trimmed.length < 5) {
      throw new GraphQLError('Display name must be at least 5 characters.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    if (trimmed.length > 30) {
      throw new GraphQLError('Display name is too long.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    result.displayName = trimmed;
  }

  if (input.photoURL !== undefined) result.photoURL = input.photoURL;

  if (input.targetExam !== undefined && input.targetExam !== null) {
    if (!VALID_TARGET_EXAMS.includes(input.targetExam as TargetExam)) {
      throw new GraphQLError(`Invalid value for targetExam: "${input.targetExam}".`,
        { extensions: { code: 'BAD_USER_INPUT' } }
      );
    }
    result.targetExam = input.targetExam as TargetExam;
  }

  if (input.studyLevel !== undefined && input.studyLevel !== null) {
    if (!VALID_STUDY_LEVELS.includes(input.studyLevel as StudyLevel)) {
      throw new GraphQLError(`Invalid value for studyLevel: "${input.studyLevel}".`,
        { extensions: { code: 'BAD_USER_INPUT' } }
      );
    }
    result.studyLevel = input.studyLevel as StudyLevel;
  }

  if (input.yearOfStudy !== undefined) {
    if (input.yearOfStudy !== null && !VALID_YEAR_OPTIONS.includes(input.yearOfStudy as never)) {
      throw new GraphQLError(`Invalid value for yearOfStudy: "${input.yearOfStudy}".`,
        { extensions: { code: 'BAD_USER_INPUT' } }
      );
    }
    result.yearOfStudy = input.yearOfStudy ?? null;
  }

  if (input.institution !== undefined) {
    const trimmed = input.institution?.trim() || null;
    if (trimmed && trimmed.length > 60) {
      throw new GraphQLError('Institution name is too long.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    result.institution = trimmed;
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
export interface ValidatedNotifPrefs {
  pushEnabled?: boolean;
  emailDigest?: boolean;
  rankAlerts?: boolean;
  contestReminders?: boolean;
  achievementAlerts?: boolean;
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
    if (typeof value !== 'boolean') {
      throw new GraphQLError(`notifPrefs.${field} must be a boolean.`, {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
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
      throw new GraphQLError(`quizPrefs.defaultDifficulty must be easy/medium/hard, got "${input.defaultDifficulty}".`, {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    result.defaultDifficulty = normalized;
  }

  if (input.timerSound !== undefined && input.timerSound !== null) {
    if (typeof input.timerSound !== 'boolean') {
      throw new GraphQLError('quizPrefs.timerSound must be a boolean.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    result.timerSound = input.timerSound;
  }

  if (input.autoSubmit !== undefined && input.autoSubmit !== null) {
    if (typeof input.autoSubmit !== 'boolean') {
      throw new GraphQLError('quizPrefs.autoSubmit must be a boolean.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    result.autoSubmit = input.autoSubmit;
  }

  return result;
}
