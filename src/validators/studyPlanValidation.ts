import { GraphQLError } from 'graphql';
import { VALID_SPECIALTIES } from './onboardingValidation.js';


const MIN_DAYS_PER_WEEK = 3;
const MIN_DAYS_UNTIL_EXAM = 7;
const MAX_SUBJECT_PRIORITY = 6;

export const DAILY_COMMITMENT_LEVELS = ['light', 'moderate', 'intense'] as const;
export type DailyCommitment = (typeof DAILY_COMMITMENT_LEVELS)[number];

export const SESSIONS_PER_DAY_BY_COMMITMENT: Record<DailyCommitment, number> = {
  light: 1,
  moderate: 2,
  intense: 3,
};

export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export interface GenerateStudyPlanInput {
  examDate?: string | null;
  dailyCommitment: string;
  daysPerWeek: string[];
  subjectPriority?: string[] | null;
}
export interface ValidatedGenerateStudyPlanInput {
  examDate: Date | null;
  dailyCommitment: DailyCommitment;
  daysPerWeek: Weekday[];
  sessionsPerDay: number;
  subjectPriority: string[] | null;
}

function badInput(message: string): never {
  throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
}


export function validateGenerateStudyPlanInput(input: GenerateStudyPlanInput): ValidatedGenerateStudyPlanInput {
  const dailyCommitmentRaw = input.dailyCommitment?.trim();
  if (!DAILY_COMMITMENT_LEVELS.includes(dailyCommitmentRaw as DailyCommitment)) {
    badInput(`dailyCommitment must be one of ${DAILY_COMMITMENT_LEVELS.join('/')}, got "${input.dailyCommitment}".`);
  }
  const dailyCommitment = dailyCommitmentRaw as DailyCommitment;

  if (!Array.isArray(input.daysPerWeek) || input.daysPerWeek.length === 0) {
    badInput('daysPerWeek is required.');
  }
  const daysPerWeek = Array.from(
    new Set(input.daysPerWeek.map((d) => d.trim().toLowerCase()))
  );
  for (const day of daysPerWeek) {
    if (!WEEKDAYS.includes(day as Weekday)) badInput(`Invalid value in daysPerWeek: "${day}".`);
  }
  if (daysPerWeek.length < MIN_DAYS_PER_WEEK) {
    badInput(`Please select at least ${MIN_DAYS_PER_WEEK} days per week — fewer makes it hard to build a meaningful plan.`);
  }

  let examDate: Date | null = null;
  if (input.examDate) {
    const parsed = new Date(input.examDate);
    if (isNaN(parsed.getTime())) {
      badInput(`Invalid examDate: "${input.examDate}".`);
    }

    const minDate = new Date(Date.now() + MIN_DAYS_UNTIL_EXAM * 24*60*60*1000);
    if (parsed.getTime() < minDate.getTime()) {
      badInput(`examDate must be at least ${MIN_DAYS_UNTIL_EXAM} days from now.`);
    }
    examDate = parsed;
  }

  let subjectPriority: string[] | null = null;
  if (input.subjectPriority && input.subjectPriority.length > 0) {
    const deduped = Array.from(
      new Set(input.subjectPriority.map((s) => s.trim()))
    );

    for (const s of deduped) {
      if (!VALID_SPECIALTIES.includes(s as never)) badInput(`Invalid value in subjectPriority: "${s}".`);
    }
    subjectPriority = deduped.slice(0, MAX_SUBJECT_PRIORITY);
  }

  return {
    examDate,
    dailyCommitment,
    daysPerWeek: daysPerWeek as Weekday[],
    sessionsPerDay: SESSIONS_PER_DAY_BY_COMMITMENT[dailyCommitment],
    subjectPriority,
  };
}
