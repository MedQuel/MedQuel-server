import { GraphQLError } from 'graphql';

import { ForbiddenError } from '../utils/errors.js';


export const VALID_TARGET_EXAMS = [
  'USMLE',
  'NEET-PG',
  'INI-CET',
  'PLAB',
  'MRCP',
  'FMGE',
  'Clinical Mastery',
] as const;
export type TargetExam = (typeof VALID_TARGET_EXAMS)[number];

export const VALID_STUDY_LEVELS = [
  'MBBS Year 1-5',
  'Postgraduate',
  'Practitioner',
  'Nursing / Allied',
] as const;
export type StudyLevel = (typeof VALID_STUDY_LEVELS)[number];

const DESCRIBES_YOU_TO_STUDY_LEVEL: Record<string, StudyLevel> = {
  'MBBS Student': 'MBBS Year 1-5',
  Postgraduate: 'Postgraduate',
  'Practicing Doctor': 'Practitioner',
  'Nursing / Allied': 'Nursing / Allied',
};
export const VALID_YEAR_OPTIONS = [
  'Year 1',
  'Year 2',
  'Year 3',
  'Year 4',
  'Final Year',
  'Intern',
] as const;

export interface CompleteOnboardingInput {
  displayName: string;
  describesYou: string;
  yearOfStudy?: string | null;
  targetExam: string;
  institution?: string | null;
}
export interface ValidatedOnboardingData {
  displayName: string;
  studyLevel: StudyLevel;
  yearOfStudy: string | null;
  targetExam: TargetExam;
  institution: string | null;
}


// Validates and normalizes raw onboarding input from the client. Throws GraphQLError on bad input.
export function validateOnboardingInput(
  input: CompleteOnboardingInput
): ValidatedOnboardingData {
  const displayName = input.displayName?.trim();
  if (!displayName || displayName.length < 5) {
    throw new GraphQLError('Display name must be at least 5 characters.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  if (displayName.length > 30) {
    throw new GraphQLError('Display name is too long.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const studyLevel = DESCRIBES_YOU_TO_STUDY_LEVEL[input.describesYou];
  if (!studyLevel) {
    throw new GraphQLError(
      `Invalid value for describesYou: "${input.describesYou}".`,
      { extensions: { code: 'BAD_USER_INPUT' } }
    );
  }

  let yearOfStudy: string | null = null;
  if (input.yearOfStudy) {
    if (!VALID_YEAR_OPTIONS.includes(input.yearOfStudy as never)) {
      throw new GraphQLError(
        `Invalid value for yearOfStudy: "${input.yearOfStudy}".`,
        {
          extensions: { code: 'BAD_USER_INPUT' },
        }
      );
    }
    yearOfStudy = input.yearOfStudy;
  }

  if (!VALID_TARGET_EXAMS.includes(input.targetExam as TargetExam)) {
    throw new GraphQLError(
      `Invalid value for targetExam: "${input.targetExam}".`,
      {
        extensions: { code: 'BAD_USER_INPUT' },
      }
    );
  }

  const institution = input.institution?.trim() || null;
  if (institution && institution.length > 60) {
    throw new GraphQLError('Institution name is too long.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  return {
    displayName,
    studyLevel,
    yearOfStudy,
    targetExam: input.targetExam as TargetExam,
    institution,
  };
}

// Guards against re-running onboarding for a user who already has a profile.
export function assertNotAlreadyOnboarded(existingDoc: {
  exists: boolean;
}): void {
  if (existingDoc.exists) {
    throw new ForbiddenError(
      'Onboarding has already been completed for this account.'
    );
  }
}
