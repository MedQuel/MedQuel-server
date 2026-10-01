import type { Difficulty, SelectedOption } from './types';


export type MCQOption = { label: 'A' | 'B' | 'C' | 'D'; text: string };
export type ModalType = 'summary' | null;
export type QuizTopic = { id: string; label: string };
export type ContestFilter = string | 'all' | 'premium';
export type StatItemProps = { value: string; label: string; color: string };

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
  difficulty: 'easy' | 'medium' | 'hard';
  recommended: string;
  topics: QuizTopic[];
  rules: QuizRule[];
};

export type QuizQuestion = {
  id: string;
  subject: string;
  question: string;
  image?: string;
  options: MCQOption[];
  difficulty: Difficulty;
  points: number;
};
export type AnswerRecord = {
  questionId: string;
  selectedLabel: SelectedOption | null;
  isBookmarked: boolean;
  isFlagged: boolean;
};

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
export type ReviewQuestion = {
  id: string;
  subject: string;
  question: string;
  options: MCQOption[];
};
