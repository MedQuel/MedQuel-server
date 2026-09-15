import type { StudyPlan } from '../types/types';


function getCurrentWeekStart(): string {
  const date = new Date();
  const day = date.getDay();
  const daysSinceMonday = day === 0 ? 6 : day-1;
  date.setDate(date.getDate() - daysSinceMonday);

  return date.toISOString().slice(0, 10);
}

function getExamDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 2);

  return date.toISOString().slice(0, 10);
}


function createEmptyStudyPlan(): StudyPlan {
  const weekStart = getCurrentWeekStart();
  const focusedDays = [0, 0, 2, 2, 4, 4];

  return {
    userId: 'empty-study-plan',
    targetExam: 'Clinical Mastery',
    examDate: getExamDate(),
    dailyCommitment: 'moderate',
    daysPerWeek: ['mon', 'wed', 'fri'],
    subjectPriority: [],
    milestones: [],
    weeklyXpTarget: 150,
    preparationPercent: 0,
    currentWeekNumber: 1,
    currentWeekStartDate: weekStart,
    generatedBy: 'fallback',
    sessions: focusedDays.map((dayOffset, index) => ({
      sessionId: `empty-study-plan-${index}`,
      sessionType: 'quiz',
      subject: 'Mixed review',
      topic: 'General review',
      scheduledDate: new Date(
        new Date(`${weekStart}T00:00:00.000Z`).getTime()+dayOffset * 86400000
      ).toISOString().slice(0, 10),
      status: 'pending',
      xpReward: 25,
      completedAt: null,
      questionCount: 15,
      difficulty: 'medium',
    })),
  };
}

export const EMPTY_STUDY_PLAN = createEmptyStudyPlan();
