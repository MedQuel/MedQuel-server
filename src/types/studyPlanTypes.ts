import type { DailyCommitment, Weekday } from '../validators/studyPlanValidation.js';


export type StudyPlanSessionStatus = 'pending' | 'completed' | 'skipped';

export interface QuizSessionPlanItem {
  sessionId: string;
  sessionType: 'quiz';
  subject: string;
  topic: string;
  scheduledDate: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  status: StudyPlanSessionStatus;
  linkedQuizSessionId: string | null;
  completedAt: string | null;
}
export interface ReadSessionPlanItem {
  sessionId: string;
  sessionType: 'read';
  subject: string;
  topic: string;
  scheduledDate: string;
  title: string;
  content: string;
  disclaimer: string;
  estimatedMinutes: number;
  xpReward: number;
  status: StudyPlanSessionStatus;
  completedAt: string | null;
}
export type StudyPlanSessionItem = QuizSessionPlanItem | ReadSessionPlanItem;

export interface StudyPlanMilestone {
  label: string;
  phase: string;
  description: string;
  startWeek: number;
  endWeek: number | null;
}

export interface StudyPlanDocument {
  userId: string;
  targetExam: string;
  examDate: string | null;
  dailyCommitment: DailyCommitment;
  daysPerWeek: Weekday[];
  subjectPriority: string[];
  milestones: StudyPlanMilestone[];
  weeklyXpTarget: number;
  preparationPercent: number;
  currentWeekNumber: number;
  currentWeekStartDate: string;
  sessions: StudyPlanSessionItem[];
  generatedBy: 'ai' | 'fallback';
}
