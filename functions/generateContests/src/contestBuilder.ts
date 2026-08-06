import { randomUUID } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';

import { computeEpReward } from './epReward.js';
import { pickFromArray } from './weightedRandom.js';
import type { ContestKind, ContestTemplate, ContestDifficulty } from './types.js';


const JOIN_WINDOW_HOURS: Record<ContestKind, number> = {
  daily: 24,
  live: 6,
  weekly: 7*24,
};

const DAILY_TITLE_TEMPLATES: readonly string[] = [
  'Daily {subject} Quiz',
  'Daily {subject} Challenge',
  'Daily {subject} Sprint',
  '{subject} Daily Drill',
  'Daily {subject} Practice Set',
];
const LIVE_TITLE_TEMPLATES: readonly string[] = [
  '{subject} Live Challenge',
  '{subject} Sprint',
  '{subject} Case Studies',
  '{subject} Rapid Fire',
  '{subject} Knowledge Battle',
  '{subject} Fundamentals',
];
const GRAND_CHAMPIONSHIP_TITLE = 'Grand Medical Championship';

function buildContestTitle(contestType: ContestKind, subject: string): string {
  if (contestType === 'weekly') return GRAND_CHAMPIONSHIP_TITLE;
  const pool = contestType === 'daily' ? DAILY_TITLE_TEMPLATES : LIVE_TITLE_TEMPLATES;

  return pickFromArray(pool as string[]).replace('{subject}', subject);
}
function deriveInitialStatus(startsAt: Date, now: Date): 'active' | 'scheduled' {
  return startsAt.getTime() <= now.getTime() ? 'active' : 'scheduled';
}


export interface BuiltContest {
  contestId: string;
  doc: Record<string, unknown>;
}

export function finalizeContestDoc(params: {
  template: ContestTemplate;
  subject: string;
  difficulty: ContestDifficulty;
  contestType: ContestKind;
  questionIds: string[];
  timeLimitSecs: number;
  startsAt: Date;
  endsAtOverride?: Date;
}): BuiltContest {
  const { template, subject, difficulty, contestType, questionIds, timeLimitSecs, startsAt } = params;

  const contestId = randomUUID();
  const endsAt = params.endsAtOverride ?? new Date(startsAt.getTime()+JOIN_WINDOW_HOURS[contestType] * 60*60*1000);

  const title = buildContestTitle(contestType, subject);
  const epReward = computeEpReward(template.epRewardFormula, difficulty, questionIds.length);

  return {
    contestId,
    doc: {
      contestId,
      title,
      subject,
      topics: [],
      contestType,
      difficulty,
      isPremium: template.isPremium,
      totalQuestions: questionIds.length,
      timeLimitSecs,
      markingScheme: template.markingScheme,
      epReward,
      passPercent: template.passPercent,
      questionIds,
      recommendedLevel: template.recommendedLevel,
      status: deriveInitialStatus(startsAt, new Date()),
      startsAt: Timestamp.fromDate(startsAt),
      endsAt: Timestamp.fromDate(endsAt),
      participantCount: 0,
      createdBy: 'factory',
      createdAt: Timestamp.now(),
      templateId: template.templateId,
      generatedBy: 'factory' as const,
    },
  };
}
