import type { ComponentProps } from 'react';
import type { Feather } from '@expo/vector-icons';

import type { QuizType } from '../types/types';


type FeatherIconName = ComponentProps<typeof Feather>['name'];
type AccentToken = 'accent' | 'premium' | 'success' | 'info' | 'warning';

export type QuizModeKey = QuizType | 'studyPlan';
export interface QuizModeConfig {
  key: QuizModeKey;
  labelKey: string;
  icon: FeatherIconName;
  accentToken: AccentToken;
  showsEp: boolean;
  showsChallengeResult: boolean;
  showsPassThreshold: boolean;
  showsRetrySameSet: boolean;
  hardTimerStop: boolean;
  backCta: { labelKey: string; route: string };
}


const BASE_CONTEST: Omit<QuizModeConfig, 'key'> = {
  labelKey: 'contests.mode.contest',
  icon: 'zap',
  accentToken: 'accent',
  showsEp: true,
  showsChallengeResult: false,
  showsPassThreshold: true,
  showsRetrySameSet: true,
  hardTimerStop: true,
  backCta: { labelKey: 'common.back_to_contests', route: '/contests' },
};

export const QUIZ_MODE_CONFIG: Record<QuizModeKey, QuizModeConfig> = {
  contest: { key: 'contest', ...BASE_CONTEST },
  daily: {
    key: 'daily',
    ...BASE_CONTEST,
    labelKey: 'contests.mode.daily',
    icon: 'sun',
    accentToken: 'warning',
    showsRetrySameSet: false,
  },
  challenge: {
    key: 'challenge',
    labelKey: 'contests.mode.challenge',
    icon: 'flag',
    accentToken: 'premium',
    showsEp: true,
    showsChallengeResult: true,
    showsPassThreshold: false,
    showsRetrySameSet: false,
    hardTimerStop: true,
    backCta: { labelKey: 'challenges.title', route: '/challenges' },
  },
  subject: {
    key: 'subject',
    labelKey: 'contests.mode.practice',
    icon: 'book-open',
    accentToken: 'success',
    showsEp: false,
    showsChallengeResult: false,
    showsPassThreshold: false,
    showsRetrySameSet: true,
    hardTimerStop: false,
    backCta: {
      labelKey: 'home.practiceBySubject.title',
      route: '/home/practiceBySubject',
    },
  },
  practice: {
    key: 'practice',
    labelKey: 'contests.mode.practice',
    icon: 'book-open',
    accentToken: 'success',
    showsEp: false,
    showsChallengeResult: false,
    showsPassThreshold: false,
    showsRetrySameSet: true,
    hardTimerStop: false,
    backCta: {
      labelKey: 'home.practiceBySubject.title',
      route: '/home/practiceBySubject',
    },
  },
  studyPlan: {
    key: 'studyPlan',
    labelKey: 'studyPlan.header.title',
    icon: 'calendar',
    accentToken: 'info',
    showsEp: false,
    showsChallengeResult: false,
    showsPassThreshold: false,
    showsRetrySameSet: false,
    hardTimerStop: false,
    backCta: { labelKey: 'studyPlan.header.title', route: '/studyPlan' },
  },
};

export function resolveQuizModeKey(params: {
  quizType?: string | null;
  studyPlanSessionId?: string | null;
}): QuizModeKey {
  if (params.studyPlanSessionId) return 'studyPlan';
  const qt = params.quizType as QuizType | undefined;
  if (qt && qt in QUIZ_MODE_CONFIG) return qt as QuizModeKey;

  return 'practice';
}

export function getQuizModeConfig(key: QuizModeKey): QuizModeConfig {
  return QUIZ_MODE_CONFIG[key] ?? QUIZ_MODE_CONFIG.practice;
}
