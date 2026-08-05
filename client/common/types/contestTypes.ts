import type { SelectedOption } from './types';


export type ContestFilter = string | 'all' | 'premium';
export type ContestItem = {
  id: string;
  title: string;
  subject: string;
  category: Exclude<ContestFilter, 'all'>[];
  difficulty: 'easy' | 'medium' | 'hard';
  epReward: number;
  timeLeft: string;
  questionsCount: number;
  duration: string;
  participantsCount: number;
  isPro: boolean;
  isLive: boolean;
};
export type FeaturedContest = {
  id: string;
  title: string;
  participants: number;
  reward: number;
  questions: number;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  endsAt: string;
};


// -----> Pre-quiz screen <-----
export type QuizTopic = { id: string; label: string };
export type QuizRule = {
  id: string;
  points: number;
  description: string;
  icon: 'plus-circle' | 'minus-circle' | 'clock';
  color: 'success' | 'error' | 'textMuted' | 'info';
};
export type PreQuizData = {
  contestId: string;
  subtitle: string;
  title: string;
  creator: string;
  creatorSpecialty: string;
  qCount: number;
  timeMinutes: number;
  epReward: number;
  passPercentage: number;
  bestScore: number;
  attempts: number;
  bestRank: number;
  difficulty: 'easy' | 'intermediate' | 'hard';
  recommended: string;
  topics: QuizTopic[];
  rules: QuizRule[];
};

export type StatItemProps = { value: string; label: string; color: string };


// -----> Quiz screen ([quizId]) <-----
export type MCQOption = { label: 'A' | 'B' | 'C' | 'D'; text: string };
export type QuizQuestion = {
  id: string;
  subject: string;
  question: string;
  image?: string;
  options: MCQOption[];
  points: number;
};

export type ModalType = 'summary' | null;
export type AnswerRecord = {
  questionId: string;
  selectedLabel: SelectedOption | null;
  isBookmarked: boolean;
  isFlagged: boolean;
};


// -----> Post-quiz screen <-----
export type ReviewItem = {
  id: string;
  index: number;
  question: string;
  isCorrect: boolean;
  isSkipped: boolean;
  selectedLabel: SelectedOption | null;
  selectedText: string | null;
  correctLabel: SelectedOption | '';
  correctText: string;
  explanation: string;
};

export type StatBox = {
  key: 'correct' | 'wrong' | 'time' | 'xp';
  icon: 'check' | 'x' | 'clock' | 'trending-up';
  value: string;
  labelKey: string;
  colorToken: 'success' | 'error' | 'textPrimary' | 'accent';
};

export type QuizResultData = {
  title: string;
  totalQuestions: number;
  scorePercent: number;
  epEarned: number;
  formattedTime: string;
  percentileMessage: string;
  showBadge: boolean;
  badge: { label: string; title: string; subtitle: string } | null;
  statBoxes: StatBox[];
  reviewItems: ReviewItem[];
  reviewSummary: { correct: number; wrong: number; skipped: number };
  isPractice: boolean;
};

export type ReviewQuestion = {
  id: string;
  subject: string;
  question: string;
  options: MCQOption[];
};
