import { randomUUID } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';

import { computeEpReward } from './epReward.js';
import type { ContestKind, ContestTemplate, ContestDifficulty } from './types.js';


const JOIN_WINDOW_HOURS: Record<ContestKind, number> = {
  daily: 24,
  live: 6,
  weekly: 7*24,
};
export interface BuiltContest {
  contestId: string;
  doc: Record<string, unknown>;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
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

  const epReward = computeEpReward(template.epRewardFormula, difficulty, questionIds.length);
  const title = `${subject} - ${capitalize(difficulty)} ${contestType === 'weekly' ? 'Grand Championship' : 'Contest'}`;

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
      status: 'scheduled',
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
