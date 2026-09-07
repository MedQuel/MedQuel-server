import { subjectCatalog } from './subject';
import type { DescribesYou, TargetExam, Specialty } from '../types/types';


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
export const SPECIALTY_OPTIONS: Specialty[] = Object.values(subjectCatalog).map(
  (s) => s.title
) as Specialty[];

export const DESCRIBES_YOU_OPTIONS: DescribesYou[] = [
  'MBBS Student',
  'Postgraduate',
  'Practicing Doctor',
  'Nursing / Allied',
];
export const YEAR_OF_STUDY_OPTIONS = [
  'Year 1',
  'Year 2',
  'Year 3',
  'Year 4',
  'Final Year',
  'Intern',
] as const;
