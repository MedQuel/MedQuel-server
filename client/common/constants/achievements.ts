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

export type AchievementVariant = 'gold' | 'red' | 'purple' | 'blue' | 'green';
export type AchievementRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

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

export interface BadgeCatalogItem {
  badgeId: string;
  name: string;
  description: string;
  iconKey: AchievementIconKey;
  variant: AchievementVariant;
  rarity: AchievementRarity;
  category: string;
  requirementType?: 'threshold' | 'arrayLength' | 'boolean';
  requirementField?: string;
  requirementValue: number;
  isActive?: boolean;
}

export const BADGE_CATALOG: BadgeCatalogItem[] = [
  // ---- Streaks ----
  { badgeId: 'streak_3', name: 'Getting Started', description: 'Study for 3 consecutive days', iconKey: 'flame', variant: 'red', rarity: 'Common', category: 'streak', requirementValue: 3 },
  { badgeId: 'streak_7', name: 'Week Warrior', description: 'Study for 7 consecutive days', iconKey: 'flame', variant: 'red', rarity: 'Common', category: 'streak', requirementValue: 7 },
  { badgeId: 'streak_14', name: 'Two-Week Titan', description: 'Study for 14 consecutive days', iconKey: 'flame', variant: 'red', rarity: 'Rare', category: 'streak', requirementValue: 14 },
  { badgeId: 'streak_30', name: 'Monthly Master', description: 'Study for 30 consecutive days', iconKey: 'flame', variant: 'red', rarity: 'Rare', category: 'streak', requirementValue: 30 },
  { badgeId: 'streak_60', name: 'Unstoppable', description: 'Study for 60 consecutive days', iconKey: 'flame', variant: 'red', rarity: 'Epic', category: 'streak', requirementValue: 60 },
  { badgeId: 'streak_100', name: 'Century Streak', description: 'Study for 100 consecutive days', iconKey: 'flame', variant: 'red', rarity: 'Epic', category: 'streak', requirementValue: 100 },
  { badgeId: 'streak_365', name: 'Year-Long Legend', description: 'Study for 365 consecutive days', iconKey: 'flame', variant: 'gold', rarity: 'Legendary', category: 'streak', requirementValue: 365 },

  // ---- Questions solved ----
  { badgeId: 'questions_50', name: 'First Steps', description: 'Solve 50 questions', iconKey: 'brain', variant: 'green', rarity: 'Common', category: 'questions', requirementValue: 50 },
  { badgeId: 'questions_100', name: 'Question Starter', description: 'Solve 100 questions', iconKey: 'brain', variant: 'green', rarity: 'Common', category: 'questions', requirementValue: 100 },
  { badgeId: 'questions_250', name: 'Rising Scholar', description: 'Solve 250 questions', iconKey: 'brain', variant: 'purple', rarity: 'Rare', category: 'questions', requirementValue: 250 },
  { badgeId: 'questions_500', name: 'Knowledge Seeker', description: 'Solve 500 questions', iconKey: 'brain', variant: 'purple', rarity: 'Rare', category: 'questions', requirementValue: 500 },
  { badgeId: 'questions_1000', name: 'Question Grinder', description: 'Solve 1000 questions', iconKey: 'brain', variant: 'purple', rarity: 'Epic', category: 'questions', requirementValue: 1000 },
  { badgeId: 'questions_2500', name: 'Deep Diver', description: 'Solve 2500 questions', iconKey: 'brain', variant: 'purple', rarity: 'Epic', category: 'questions', requirementValue: 2500 },
  { badgeId: 'questions_5000', name: 'Question Machine', description: 'Solve 5000 questions', iconKey: 'brain', variant: 'gold', rarity: 'Legendary', category: 'questions', requirementValue: 5000 },
  { badgeId: 'questions_10000', name: 'Question Legend', description: 'Solve 10000 questions', iconKey: 'brain', variant: 'gold', rarity: 'Legendary', category: 'questions', requirementValue: 10000 },

  // ---- Perfect quizzes ----
  { badgeId: 'perfect_quiz_1', name: 'First Perfection', description: 'Score 100% on a quiz', iconKey: 'check', variant: 'blue', rarity: 'Common', category: 'perfect_quiz', requirementValue: 1 },
  { badgeId: 'perfect_quiz_5', name: 'Sharp Mind', description: '5 perfect quizzes', iconKey: 'check', variant: 'blue', rarity: 'Rare', category: 'perfect_quiz', requirementValue: 5 },
  { badgeId: 'perfect_quiz_15', name: 'Precision Expert', description: '15 perfect quizzes', iconKey: 'check', variant: 'blue', rarity: 'Rare', category: 'perfect_quiz', requirementValue: 15 },
  { badgeId: 'perfect_quiz_30', name: 'Flawless Scholar', description: '30 perfect quizzes', iconKey: 'check', variant: 'purple', rarity: 'Epic', category: 'perfect_quiz', requirementValue: 30 },
  { badgeId: 'perfect_quiz_75', name: 'Perfectionist', description: '75 perfect quizzes', iconKey: 'check', variant: 'gold', rarity: 'Legendary', category: 'perfect_quiz', requirementValue: 75 },
  { badgeId: 'perfect_quiz_150', name: 'The Untouchable', description: '150 perfect quizzes', iconKey: 'check', variant: 'gold', rarity: 'Legendary', category: 'perfect_quiz', requirementValue: 150 },

  // ---- Contests played ----
  { badgeId: 'contests_5', name: 'Contest Rookie', description: 'Play 5 contests', iconKey: 'trophy', variant: 'gold', rarity: 'Common', category: 'contests', requirementValue: 5 },
  { badgeId: 'contests_15', name: 'Contest Regular', description: 'Play 15 contests', iconKey: 'trophy', variant: 'gold', rarity: 'Rare', category: 'contests', requirementValue: 15 },
  { badgeId: 'contests_30', name: 'Contest Veteran', description: 'Play 30 contests', iconKey: 'trophy', variant: 'gold', rarity: 'Rare', category: 'contests', requirementValue: 30 },
  { badgeId: 'contests_75', name: 'Contest Champion', description: 'Play 75 contests', iconKey: 'trophy', variant: 'gold', rarity: 'Epic', category: 'contests', requirementValue: 75 },
  { badgeId: 'contests_150', name: 'Contest Legend', description: 'Play 150 contests', iconKey: 'trophy', variant: 'gold', rarity: 'Legendary', category: 'contests', requirementValue: 150 },

  // ---- Contest high scorers ≥90% ----
  { badgeId: 'contest_90_3', name: 'Elite Performer', description: 'Score 90%+ in 3 contests', iconKey: 'target', variant: 'gold', rarity: 'Rare', category: 'contest_high_score', requirementValue: 3 },
  { badgeId: 'contest_90_10', name: 'Sharpshooter', description: 'Score 90%+ in 10 contests', iconKey: 'target', variant: 'gold', rarity: 'Epic', category: 'contest_high_score', requirementValue: 10 },
  { badgeId: 'contest_90_25', name: 'Contest Master', description: 'Score 90%+ in 25 contests', iconKey: 'target', variant: 'gold', rarity: 'Legendary', category: 'contest_high_score', requirementValue: 25 },
  { badgeId: 'contest_90_60', name: 'Contest Deity', description: 'Score 90%+ in 60 contests', iconKey: 'target', variant: 'gold', rarity: 'Legendary', category: 'contest_high_score', requirementValue: 60 },

  // ---- Hard-difficulty contests ----
  { badgeId: 'hard_contest_5', name: 'Brave Beginner', description: 'Complete 5 hard contests', iconKey: 'shield', variant: 'red', rarity: 'Common', category: 'hard_contest', requirementValue: 5 },
  { badgeId: 'hard_contest_15', name: 'Gladiator', description: 'Complete 15 hard contests', iconKey: 'shield', variant: 'red', rarity: 'Rare', category: 'hard_contest', requirementValue: 15 },
  { badgeId: 'hard_contest_40', name: 'Iron Will', description: 'Complete 40 hard contests', iconKey: 'shield', variant: 'purple', rarity: 'Epic', category: 'hard_contest', requirementValue: 40 },
  { badgeId: 'hard_contest_100', name: 'Hard-Mode Legend', description: 'Complete 100 hard contests', iconKey: 'shield', variant: 'gold', rarity: 'Legendary', category: 'hard_contest', requirementValue: 100 },

  // ---- Speed ----
  { badgeId: 'speed_5', name: 'Quick Thinker', description: 'Finish 5 quizzes in half the time', iconKey: 'zap', variant: 'blue', rarity: 'Common', category: 'speed', requirementValue: 5 },
  { badgeId: 'speed_20', name: 'Speed Demon', description: 'Finish 20 quizzes in half the time', iconKey: 'zap', variant: 'blue', rarity: 'Rare', category: 'speed', requirementValue: 20 },
  { badgeId: 'speed_50', name: 'Lightning Fast', description: 'Finish 50 quizzes in half the time', iconKey: 'zap', variant: 'purple', rarity: 'Epic', category: 'speed', requirementValue: 50 },
  { badgeId: 'speed_150', name: 'Time Bender', description: 'Finish 150 quizzes in half the time', iconKey: 'zap', variant: 'gold', rarity: 'Legendary', category: 'speed', requirementValue: 150 },

  // ---- Study hours ----
  { badgeId: 'study_10', name: 'Dedicated Learner', description: 'Accumulate 10 study hours', iconKey: 'clock', variant: 'green', rarity: 'Common', category: 'study', requirementValue: 10 },
  { badgeId: 'study_50', name: 'Study Marathon', description: 'Accumulate 50 study hours', iconKey: 'clock', variant: 'green', rarity: 'Rare', category: 'study', requirementValue: 50 },
  { badgeId: 'study_100', name: 'Consistent', description: 'Accumulate 100 study hours', iconKey: 'clock', variant: 'green', rarity: 'Epic', category: 'study', requirementValue: 100 },
  { badgeId: 'study_500', name: 'Master Scholar', description: 'Accumulate 500 study hours', iconKey: 'clock', variant: 'gold', rarity: 'Legendary', category: 'study', requirementValue: 500 },

  // ---- Level milestones ----
  { badgeId: 'level_5', name: 'Rising Star', description: 'Reach level 5', iconKey: 'star', variant: 'green', rarity: 'Common', category: 'level', requirementValue: 5 },
  { badgeId: 'level_10', name: 'Skilled Practitioner', description: 'Reach level 10', iconKey: 'star', variant: 'blue', rarity: 'Rare', category: 'level', requirementValue: 10 },
  { badgeId: 'level_20', name: 'Expert', description: 'Reach level 20', iconKey: 'star', variant: 'purple', rarity: 'Epic', category: 'level', requirementValue: 20 },
  { badgeId: 'level_35', name: 'Master', description: 'Reach level 35', iconKey: 'star', variant: 'gold', rarity: 'Legendary', category: 'level', requirementValue: 35 },
  { badgeId: 'level_50', name: 'Grandmaster', description: 'Reach level 50', iconKey: 'crown', variant: 'gold', rarity: 'Legendary', category: 'level', requirementValue: 50 },

  // ---- Subject mastery ----
  { badgeId: 'subject_master_1', name: 'Specialist', description: 'Master 1 subject (70%+ accuracy)', iconKey: 'book', variant: 'green', rarity: 'Common', category: 'subject_mastery', requirementValue: 1 },
  { badgeId: 'subject_master_5', name: 'Multi-Talented', description: 'Master 5 subjects', iconKey: 'book', variant: 'purple', rarity: 'Epic', category: 'subject_mastery', requirementValue: 5 },
  { badgeId: 'subject_master_10', name: 'All-Rounder', description: 'Master 10 subjects', iconKey: 'book', variant: 'gold', rarity: 'Legendary', category: 'subject_mastery', requirementValue: 10 },

  // ---- Leaderboard rank ----
  { badgeId: 'top3_1', name: 'Podium Finish', description: 'Finish top 3 in a contest', iconKey: 'medal', variant: 'gold', rarity: 'Rare', category: 'rank', requirementValue: 1 },
  { badgeId: 'top3_5', name: 'Top Contender', description: 'Finish top 3 in 5 contests', iconKey: 'medal', variant: 'gold', rarity: 'Epic', category: 'rank', requirementValue: 5 },
  { badgeId: 'top3_20', name: 'Leaderboard Legend', description: 'Finish top 3 in 20 contests', iconKey: 'medal', variant: 'gold', rarity: 'Legendary', category: 'rank', requirementValue: 20 },

  // ---- Special ----
  { badgeId: 'premium_member', name: 'Premium Member', description: 'Unlocked premium tier', iconKey: 'gem', variant: 'purple', rarity: 'Epic', category: 'special', requirementValue: 1 },
  { badgeId: 'social_learner', name: 'Social Learner', description: '50 messages in discussion rooms', iconKey: 'users', variant: 'blue', rarity: 'Common', category: 'special', requirementValue: 50 },
];

export const BADGE_CATALOG_MAP: Record<string, BadgeCatalogItem> = Object.fromEntries(
  BADGE_CATALOG.map((badge) => [badge.badgeId, badge])
);

export const CATEGORY_LABELS: Record<string, string> = {
  streak: 'Streak',
  questions: 'Questions Solved',
  perfect_quiz: 'Perfect Quizzes',
  contests: 'Contests Played',
  contest_high_score: 'Contest High Scorers',
  hard_contest: 'Hard Contests',
  speed: 'Speed Badges',
  study: 'Study Hours',
  level: 'Level Milestones',
  subject_mastery: 'Subject Mastery',
  rank: 'Leaderboard Rank',
  special: 'Special Badges',
};

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