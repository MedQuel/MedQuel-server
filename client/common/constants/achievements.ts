import {
  Award,
  BadgeCheck,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Crown,
  Flame,
  Gem,
  Medal,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react-native';

export type AchievementVariant =
  | 'gold'
  | 'red'
  | 'purple'
  | 'blue'
  | 'green';

export type AchievementRarity =
  | 'Common'
  | 'Rare'
  | 'Epic'
  | 'Legendary';

export type AchievementIconKey =
  | 'award'
  | 'badge'
  | 'book'
  | 'brain'
  | 'check'
  | 'clock'
  | 'crown'
  | 'flame'
  | 'gem'
  | 'medal'
  | 'shield'
  | 'sparkles'
  | 'star'
  | 'target'
  | 'trophy'
  | 'users'
  | 'zap';

export type AchievementId =
  | 'gold_medalist'
  | 'streak_7'
  | 'streak_30'
  | 'streak_100'
  | 'perfect_quiz_3'
  | 'perfect_quiz_10'
  | 'questions_100'
  | 'questions_500'
  | 'questions_1000'
  | 'speed_demon'
  | 'contest_95_plus'
  | 'contest_winner'
  | 'top_3_rank'
  | 'knowledge_seeker'
  | 'social_learner'
  | 'consistent'
  | 'study_marathon'
  | 'premium_member';

export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  subtitle: string;
  variant: AchievementVariant;
  rarity: AchievementRarity;
  iconKey: AchievementIconKey;
};

export type EarnedAchievement = {
  id: AchievementId;
  earnedAt?: string;
  isNew?: boolean;
};

export const achievementCatalog = {
  gold_medalist: {
    id: 'gold_medalist',
    title: 'Gold Medalist',
    subtitle: '95%+ in any contest',
    variant: 'gold',
    rarity: 'Legendary',
    iconKey: 'award',
  },

  streak_7: {
    id: 'streak_7',
    title: '7 Day Streak',
    subtitle: 'Study for 7 consecutive days',
    variant: 'green',
    rarity: 'Common',
    iconKey: 'flame',
  },

  streak_30: {
    id: 'streak_30',
    title: '30 Day Streak',
    subtitle: 'Study for 30 consecutive days',
    variant: 'red',
    rarity: 'Epic',
    iconKey: 'flame',
  },

  streak_100: {
    id: 'streak_100',
    title: '100 Day Streak',
    subtitle: 'Study for 100 consecutive days',
    variant: 'gold',
    rarity: 'Legendary',
    iconKey: 'flame',
  },

  perfect_quiz_3: {
    id: 'perfect_quiz_3',
    title: 'Perfect Quiz',
    subtitle: '3 perfect quizzes',
    variant: 'blue',
    rarity: 'Rare',
    iconKey: 'check',
  },

  perfect_quiz_10: {
    id: 'perfect_quiz_10',
    title: 'Quiz Master',
    subtitle: '10 perfect quizzes',
    variant: 'purple',
    rarity: 'Epic',
    iconKey: 'check',
  },

  questions_100: {
    id: 'questions_100',
    title: 'Question Starter',
    subtitle: '100 questions solved',
    variant: 'green',
    rarity: 'Common',
    iconKey: 'brain',
  },

  questions_500: {
    id: 'questions_500',
    title: 'Knowledge Seeker',
    subtitle: '500 questions solved',
    variant: 'purple',
    rarity: 'Rare',
    iconKey: 'book',
  },

  questions_1000: {
    id: 'questions_1000',
    title: 'Question Grinder',
    subtitle: '1000 questions solved',
    variant: 'gold',
    rarity: 'Legendary',
    iconKey: 'brain',
  },

  speed_demon: {
    id: 'speed_demon',
    title: 'Speed Demon',
    subtitle: 'Finish in half the time',
    variant: 'blue',
    rarity: 'Rare',
    iconKey: 'zap',
  },

  contest_95_plus: {
    id: 'contest_95_plus',
    title: 'Elite Contest',
    subtitle: '95%+ in any contest',
    variant: 'gold',
    rarity: 'Legendary',
    iconKey: 'target',
  },

  contest_winner: {
    id: 'contest_winner',
    title: 'Contest Winner',
    subtitle: 'Won a contest',
    variant: 'gold',
    rarity: 'Legendary',
    iconKey: 'trophy',
  },

  top_3_rank: {
    id: 'top_3_rank',
    title: 'Top 3 Rank',
    subtitle: 'Reached top 3 leaderboard',
    variant: 'gold',
    rarity: 'Epic',
    iconKey: 'medal',
  },

  knowledge_seeker: {
    id: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    subtitle: '500 questions done',
    variant: 'purple',
    rarity: 'Rare',
    iconKey: 'book',
  },

  social_learner: {
    id: 'social_learner',
    title: 'Social Learner',
    subtitle: '50 messages in rooms',
    variant: 'blue',
    rarity: 'Common',
    iconKey: 'users',
  },

  consistent: {
    id: 'consistent',
    title: 'Consistent',
    subtitle: '100 study hours',
    variant: 'green',
    rarity: 'Common',
    iconKey: 'shield',
  },

  study_marathon: {
    id: 'study_marathon',
    title: 'Study Marathon',
    subtitle: 'Long study session completed',
    variant: 'green',
    rarity: 'Rare',
    iconKey: 'sparkles',
  },

  premium_member: {
    id: 'premium_member',
    title: 'Premium Member',
    subtitle: 'Unlocked premium tier',
    variant: 'purple',
    rarity: 'Epic',
    iconKey: 'gem',
  },
} as const satisfies Record<AchievementId, AchievementDefinition>;

export const achievementIcons = {
  award: Award,
  badge: BadgeCheck,
  book: BookOpen,
  brain: Brain,
  check: CheckCircle2,
  clock: Clock3,
  crown: Crown,
  flame: Flame,
  gem: Gem,
  medal: Medal,
  shield: Shield,
  sparkles: Sparkles,
  star: Star,
  target: Target,
  trophy: Trophy,
  users: Users,
  zap: Zap,
} as const;