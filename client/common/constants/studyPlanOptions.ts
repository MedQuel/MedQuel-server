import type { StudyPlanWeekday, DailyCommitment } from '../types/types';


export const MIN_DAYS_PER_WEEK = 3;
export const MIN_DAYS_UNTIL_EXAM = 7;
export const MAX_SUBJECT_PRIORITY = 6;

export const WEEKDAY_OPTIONS: { value: StudyPlanWeekday; label: string }[] = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

export const DAILY_COMMITMENT_OPTIONS: { value: DailyCommitment; label: string; description: string }[] = [
  { value: 'light', label: 'Light', description: '~1 session a day' },
  { value: 'moderate', label: 'Moderate', description: '~2 sessions a day' },
  { value: 'intense', label: 'Intense', description: '~3+ sessions a day' },
];

export const EXAM_DATE_PRESETS: { label: string; months: number }[] = [
  { label: '1 month', months: 1 },
  { label: '2 months', months: 2 },
  { label: '3 months', months: 3 },
  { label: '6 months', months: 6 },
];
