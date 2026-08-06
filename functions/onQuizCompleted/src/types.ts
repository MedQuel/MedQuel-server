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
