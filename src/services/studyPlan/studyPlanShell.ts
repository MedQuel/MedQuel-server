import type { StudyPlanMilestone } from '../../types/studyPlanTypes.js';


const MAX_PLANNED_WEEKS = 16;
const DEFAULT_ROLLING_WEEKS = 8;

export function computeWeeklyXpTarget(sessions: { xpReward: number }[]): number {
  return sessions.reduce((sum, s) => sum+s.xpReward, 0);
}

export function computeTotalWeeks(examDate: Date | null, now: Date): number {
  if (!examDate) return DEFAULT_ROLLING_WEEKS;

  const msPerWeek = 7 * 24*60*60*1000;
  const weeks = Math.ceil((examDate.getTime()-now.getTime()) / msPerWeek);

  return Math.min(Math.max(weeks, 1), MAX_PLANNED_WEEKS);
}

export function computeMilestones(examDate: Date | null, now: Date): StudyPlanMilestone[] {
  const totalWeeks = computeTotalWeeks(examDate, now);

  if (!examDate) {
    return [
      {
        label: 'Ongoing',
        phase: 'Continuous Practice',
        description: "No exam date set yet, we'll keep rotating through your weak subjects each week until you add one.",
        startWeek: 1,
        endWeek: null,
      },
    ];
  }

  const foundationWeeks = Math.max(1, Math.round(totalWeeks*0.5));
  const systemsWeeks = Math.max(1, Math.round(totalWeeks*0.3));
  const revisionStart = foundationWeeks + systemsWeeks+1;

  return [
    {
      label: `Weeks 1-${foundationWeeks}`,
      phase: 'Foundations',
      description: 'Build core knowledge across your weaker subjects.',
      startWeek: 1,
      endWeek: foundationWeeks,
    },
    {
      label: `Weeks ${foundationWeeks+1}-${foundationWeeks+systemsWeeks}`,
      phase: 'Systems Review',
      description: 'Systematic review across all subjects, tracking your accuracy trend.',
      startWeek: foundationWeeks + 1,
      endWeek: foundationWeeks + systemsWeeks,
    },
    {
      label: `Weeks ${revisionStart}-${totalWeeks}`,
      phase: 'Rapid Revision',
      description: 'High-frequency mixed practice and timed contests to simulate exam conditions.',
      startWeek: revisionStart,
      endWeek: totalWeeks,
    },
  ];
}
