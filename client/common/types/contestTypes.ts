import type { Difficulty, SelectedOption } from './types';


export type ModalType = 'summary' | null;
export type ContestFilter = string | 'all' | 'premium';
export type MCQOption = { label: 'A' | 'B' | 'C' | 'D'; text: string };

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
