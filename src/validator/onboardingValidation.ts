import { GraphQLError } from 'graphql';
import { ForbiddenError } from '../utils/errors.js';


export const VALID_DESCRIBES_YOU = [
  'MBBS Student',
  'Postgraduate',
  'Practicing Doctor',
  'Nursing / Allied',
] as const;
export type DescribesYou = (typeof VALID_DESCRIBES_YOU)[number];
export const UNDERGRAD_TRACK = new Set<DescribesYou>(['MBBS Student', 'Nursing / Allied']);
export const SPECIALTY_TRACK = new Set<DescribesYou>(['Postgraduate', 'Practicing Doctor']);

export const VALID_STUDY_LEVELS = [
  'MBBS Year 1-5',
  'Postgraduate',
  'Practitioner',
  'Nursing / Allied',
] as const;
export type StudyLevel = (typeof VALID_STUDY_LEVELS)[number];

export const DESCRIBES_YOU_TO_STUDY_LEVEL: Record<DescribesYou, StudyLevel> = {
  'MBBS Student': 'MBBS Year 1-5',
  Postgraduate: 'Postgraduate',
  'Practicing Doctor': 'Practitioner',
  'Nursing / Allied': 'Nursing / Allied',
};
const STUDY_LEVEL_TO_DESCRIBES_YOU: Record<StudyLevel, DescribesYou> = {
  'MBBS Year 1-5': 'MBBS Student',
  Postgraduate: 'Postgraduate',
  Practitioner: 'Practicing Doctor',
  'Nursing / Allied': 'Nursing / Allied',
};
export function deriveDescribesYouFromStudyLevel(studyLevel: StudyLevel): DescribesYou {
  return STUDY_LEVEL_TO_DESCRIBES_YOU[studyLevel];
}

export const VALID_YEAR_OPTIONS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Final Year', 'Intern'] as const;
export type YearOfStudy = (typeof VALID_YEAR_OPTIONS)[number];

export const VALID_SPECIALTIES = [
  'Anatomy', 'Biochemistry', 'Physiology', 'Microbiology', 'Pharmacology',
  'Forensic Medicine', 'Pathology', 'Ophthalmology', 'ENT', 'Community Medicine',
  'Medicine', 'Surgery', 'Pediatrics', 'Gynaecology', 'Obstetrics',
  'Orthopedics', 'Dermatology', 'Psychiatry', 'Anesthesia', 'Radiology'
] as const;
export type Specialty = (typeof VALID_SPECIALTIES)[number];

export const MAX_SPECIALTIES = 3;
export const MIN_FOCUS_SUBJECTS = 1;
export const MAX_FOCUS_SUBJECTS = 5;

export const UNDERGRAD_TARGET_EXAMS = [
  'USMLE',
  'NEET-PG',
  'INI-CET',
  'PLAB',
  'MRCP',
  'FMGE',
  'Clinical Mastery'
] as const;
export const SPECIALTY_TARGET_EXAMS = ['DM', 'MCH', 'Fellowship Exams', 'Clinical Mastery'] as const;
export type TargetExam = (typeof UNDERGRAD_TARGET_EXAMS)[number] | (typeof SPECIALTY_TARGET_EXAMS)[number];

export const VALID_CONTENT_SCOPES = ['all', 'focused'] as const;
export type ContentScope = (typeof VALID_CONTENT_SCOPES)[number];


export interface CompleteOnboardingInput {
  displayName: string;
  describesYou: string;
  yearOfStudy?: string | null;
  specialties?: string[] | null;
  targetExam: string;
  institution?: string | null;
  contentScope: string;
  focusSubjects?: string[] | null;
}
export interface ValidatedOnboardingData {
  displayName: string;
  describesYou: DescribesYou;
  studyLevel: StudyLevel;
  yearOfStudy: YearOfStudy | null;
  specialties: Specialty[];
  targetExam: TargetExam;
  institution: string | null;
  contentScope: ContentScope;
  focusSubjects: Specialty[];
}

function badInput(message: string): never {
  throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
}

function dedupeAndValidateSubjects(raw: string[], fieldLabel: string, min: number, max: number): Specialty[] {
  const deduped = Array.from(new Set(raw.map((s) => s.trim()).filter(Boolean)));
  if (deduped.length < min) {
    badInput(`${fieldLabel} requires at least ${min} value${min === 1 ? '' : 's'}.`);
  }
  if (deduped.length > max) {
    badInput(`${fieldLabel} allows at most ${max} value${max === 1 ? '' : 's'}.`);
  }
  for (const s of deduped) {
    if (!VALID_SPECIALTIES.includes(s as Specialty)) {
      badInput(`Invalid value in ${fieldLabel}: "${s}".`);
    }
  }

  return deduped as Specialty[];
}


export function validateOnboardingInput(input: CompleteOnboardingInput): ValidatedOnboardingData {
  const displayName = input.displayName?.trim();
  if (!displayName || displayName.length < 5) {
    badInput('Display name must be at least 5 characters.');
  }
  if (displayName.length > 30) {
    badInput('Display name is too long.');
  }

  const describesYouRaw = input.describesYou?.trim();
  if (!VALID_DESCRIBES_YOU.includes(describesYouRaw as DescribesYou)) {
    badInput(`Invalid value for describesYou: "${input.describesYou}".`);
  }
  const describesYou = describesYouRaw as DescribesYou;
  const studyLevel = DESCRIBES_YOU_TO_STUDY_LEVEL[describesYou];
  const isSpecialtyTrack = SPECIALTY_TRACK.has(describesYou);

  let yearOfStudy: YearOfStudy | null = null;
  if (describesYou === 'MBBS Student') {
    const yearRaw = input.yearOfStudy?.trim();
    if (!yearRaw) {
      badInput('yearOfStudy is required when describesYou is "MBBS Student".');
    }
    if (!VALID_YEAR_OPTIONS.includes(yearRaw as YearOfStudy)) {
      badInput(`Invalid value for yearOfStudy: "${input.yearOfStudy}".`);
    }
    yearOfStudy = yearRaw as YearOfStudy;
  } else if (input.yearOfStudy != null && input.yearOfStudy !== '') {
    badInput(`yearOfStudy must not be provided when describesYou is "${describesYou}".`);
  }

  let specialties: Specialty[] = [];
  if (isSpecialtyTrack) {
    const raw = Array.isArray(input.specialties) ? input.specialties : [];
    specialties = dedupeAndValidateSubjects(raw, 'specialties', 1, MAX_SPECIALTIES);
  } else if (input.specialties != null && input.specialties.length > 0) {
    badInput(`specialties must not be provided when describesYou is "${describesYou}".`);
  }

  const targetExamRaw = input.targetExam?.trim();
  const allowedTargetExams: readonly string[] = isSpecialtyTrack
    ? SPECIALTY_TARGET_EXAMS
    : UNDERGRAD_TARGET_EXAMS;

  if (!allowedTargetExams.includes(targetExamRaw)) {
    badInput(`Invalid value for targetExam: "${input.targetExam}". For describesYou="${describesYou}", must be one of: ${allowedTargetExams.join(', ')}.`);
  }
  const targetExam = targetExamRaw as TargetExam;

  const contentScopeRaw = input.contentScope?.trim();
  if (!VALID_CONTENT_SCOPES.includes(contentScopeRaw as ContentScope)) {
    badInput(`Invalid value for contentScope: "${input.contentScope}". Must be "all" or "focused".`);
  }
  const contentScope = contentScopeRaw as ContentScope;

  let focusSubjects: Specialty[] = [];
  if (contentScope === 'focused') {
    const raw = Array.isArray(input.focusSubjects) ? input.focusSubjects : [];
    focusSubjects = dedupeAndValidateSubjects(raw, 'focusSubjects', MIN_FOCUS_SUBJECTS, MAX_FOCUS_SUBJECTS);
  } else if (input.focusSubjects != null && input.focusSubjects.length > 0) {
    badInput('focusSubjects must not be provided when contentScope is "all".');
  }

  const institution = input.institution?.trim() || null;
  if (institution && institution.length > 60) {
    badInput('Institution name is too long.');
  }

  return {
    displayName,
    describesYou,
    studyLevel,
    yearOfStudy,
    specialties,
    targetExam,
    institution,
    contentScope,
    focusSubjects,
  };
}

// Guards against re-running onboarding for a user who already has a profile.
export function assertNotAlreadyOnboarded(existingDoc: { exists: boolean }): void {
  if (existingDoc.exists) {
    throw new ForbiddenError('Onboarding has already been completed for this account.');
  }
}
