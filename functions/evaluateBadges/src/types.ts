export type RequirementType = 'threshold' | 'arrayLength' | 'boolean';

export interface BadgeDoc {
  badgeId: string;
  name: string;
  description: string;
  iconKey: string;
  variant: string;
  rarity: string;
  category: string;
  requirementType: RequirementType;
  requirementField: string;
  requirementValue: number;
  isActive: boolean;
}

export interface QuizCompletedEvent {
  sessionId: string;
  userId: string;
  quizType: string;
  contestId: string | null;
  subject: string;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  score: number;
  scorePercent: number;
  epEarned: number;
  xpEarned: number;
  completedAt: string;
}
