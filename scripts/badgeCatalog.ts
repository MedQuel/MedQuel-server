export interface BadgeSeed {
  badgeId: string;
  name: string;
  description: string;
  iconKey: string;
  variant: 'gold' | 'red' | 'purple' | 'blue' | 'green';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  category: string;
  requirementType: 'threshold' | 'arrayLength' | 'boolean';
  requirementField: string;
  requirementValue: number;
  rewardPremiumDays: number;
  isActive: boolean;
}
type BadgeDefinition = Omit<BadgeSeed, 'rewardPremiumDays'>;

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ---- Streaks —> flame / red ----
  { badgeId: 'streak_3', name: 'Getting Started', description: 'Study for 3 consecutive days', iconKey: 'flame', variant: 'red', rarity: 'Common', category: 'streak', requirementType: 'threshold', requirementField: 'currentStreak', requirementValue: 3, isActive: true },
  { badgeId: 'streak_7', name: 'Week Warrior', description: 'Study for 7 consecutive days', iconKey: 'flame', variant: 'red', rarity: 'Common', category: 'streak', requirementType: 'threshold', requirementField: 'currentStreak', requirementValue: 7, isActive: true },
  { badgeId: 'streak_14', name: 'Two-Week Titan', description: 'Study for 14 consecutive days', iconKey: 'flame', variant: 'red', rarity: 'Rare', category: 'streak', requirementType: 'threshold', requirementField: 'currentStreak', requirementValue: 14, isActive: true },
  { badgeId: 'streak_30', name: 'Monthly Master', description: 'Study for 30 consecutive days', iconKey: 'flame', variant: 'red', rarity: 'Rare', category: 'streak', requirementType: 'threshold', requirementField: 'currentStreak', requirementValue: 30, isActive: true },
  { badgeId: 'streak_60', name: 'Unstoppable', description: 'Study for 60 consecutive days', iconKey: 'flame', variant: 'red', rarity: 'Epic', category: 'streak', requirementType: 'threshold', requirementField: 'currentStreak', requirementValue: 60, isActive: true },
  { badgeId: 'streak_100', name: 'Century Streak', description: 'Study for 100 consecutive days', iconKey: 'flame', variant: 'red', rarity: 'Epic', category: 'streak', requirementType: 'threshold', requirementField: 'currentStreak', requirementValue: 100, isActive: true },
  { badgeId: 'streak_365', name: 'Year-Long Legend', description: 'Study for 365 consecutive days', iconKey: 'flame', variant: 'gold', rarity: 'Legendary', category: 'streak', requirementType: 'threshold', requirementField: 'currentStreak', requirementValue: 365, isActive: true },

  // ---- Questions solved —> brain / purple ----
  { badgeId: 'questions_50', name: 'First Steps', description: 'Solve 50 questions', iconKey: 'brain', variant: 'green', rarity: 'Common', category: 'questions', requirementType: 'threshold', requirementField: 'totalQuestions', requirementValue: 50, isActive: true },
  { badgeId: 'questions_100', name: 'Question Starter', description: 'Solve 100 questions', iconKey: 'brain', variant: 'green', rarity: 'Common', category: 'questions', requirementType: 'threshold', requirementField: 'totalQuestions', requirementValue: 100, isActive: true },
  { badgeId: 'questions_250', name: 'Rising Scholar', description: 'Solve 250 questions', iconKey: 'brain', variant: 'purple', rarity: 'Rare', category: 'questions', requirementType: 'threshold', requirementField: 'totalQuestions', requirementValue: 250, isActive: true },
  { badgeId: 'questions_500', name: 'Knowledge Seeker', description: 'Solve 500 questions', iconKey: 'brain', variant: 'purple', rarity: 'Rare', category: 'questions', requirementType: 'threshold', requirementField: 'totalQuestions', requirementValue: 500, isActive: true },
  { badgeId: 'questions_1000', name: 'Question Grinder', description: 'Solve 1000 questions', iconKey: 'brain', variant: 'purple', rarity: 'Epic', category: 'questions', requirementType: 'threshold', requirementField: 'totalQuestions', requirementValue: 1000, isActive: true },
  { badgeId: 'questions_2500', name: 'Deep Diver', description: 'Solve 2500 questions', iconKey: 'brain', variant: 'purple', rarity: 'Epic', category: 'questions', requirementType: 'threshold', requirementField: 'totalQuestions', requirementValue: 2500, isActive: true },
  { badgeId: 'questions_5000', name: 'Question Machine', description: 'Solve 5000 questions', iconKey: 'brain', variant: 'gold', rarity: 'Legendary', category: 'questions', requirementType: 'threshold', requirementField: 'totalQuestions', requirementValue: 5000, isActive: true },
  { badgeId: 'questions_10000', name: 'Question Legend', description: 'Solve 10000 questions', iconKey: 'brain', variant: 'gold', rarity: 'Legendary', category: 'questions', requirementType: 'threshold', requirementField: 'totalQuestions', requirementValue: 10000, isActive: true },

  // ---- Perfect quizzes —> check / blue ----
  { badgeId: 'perfect_quiz_1', name: 'First Perfection', description: 'Score 100% on a quiz', iconKey: 'check', variant: 'blue', rarity: 'Common', category: 'perfect_quiz', requirementType: 'threshold', requirementField: 'stats.perfectQuizzes', requirementValue: 1, isActive: true },
  { badgeId: 'perfect_quiz_5', name: 'Sharp Mind', description: '5 perfect quizzes', iconKey: 'check', variant: 'blue', rarity: 'Rare', category: 'perfect_quiz', requirementType: 'threshold', requirementField: 'stats.perfectQuizzes', requirementValue: 5, isActive: true },
  { badgeId: 'perfect_quiz_15', name: 'Precision Expert', description: '15 perfect quizzes', iconKey: 'check', variant: 'blue', rarity: 'Rare', category: 'perfect_quiz', requirementType: 'threshold', requirementField: 'stats.perfectQuizzes', requirementValue: 15, isActive: true },
  { badgeId: 'perfect_quiz_30', name: 'Flawless Scholar', description: '30 perfect quizzes', iconKey: 'check', variant: 'purple', rarity: 'Epic', category: 'perfect_quiz', requirementType: 'threshold', requirementField: 'stats.perfectQuizzes', requirementValue: 30, isActive: true },
  { badgeId: 'perfect_quiz_75', name: 'Perfectionist', description: '75 perfect quizzes', iconKey: 'check', variant: 'gold', rarity: 'Legendary', category: 'perfect_quiz', requirementType: 'threshold', requirementField: 'stats.perfectQuizzes', requirementValue: 75, isActive: true },
  { badgeId: 'perfect_quiz_150', name: 'The Untouchable', description: '150 perfect quizzes', iconKey: 'check', variant: 'gold', rarity: 'Legendary', category: 'perfect_quiz', requirementType: 'threshold', requirementField: 'stats.perfectQuizzes', requirementValue: 150, isActive: true },

  // ---- Contests played —> trophy / gold ----
  { badgeId: 'contests_5', name: 'Contest Rookie', description: 'Play 5 contests', iconKey: 'trophy', variant: 'gold', rarity: 'Common', category: 'contests', requirementType: 'threshold', requirementField: 'stats.contestsPlayed', requirementValue: 5, isActive: true },
  { badgeId: 'contests_15', name: 'Contest Regular', description: 'Play 15 contests', iconKey: 'trophy', variant: 'gold', rarity: 'Rare', category: 'contests', requirementType: 'threshold', requirementField: 'stats.contestsPlayed', requirementValue: 15, isActive: true },
  { badgeId: 'contests_30', name: 'Contest Veteran', description: 'Play 30 contests', iconKey: 'trophy', variant: 'gold', rarity: 'Rare', category: 'contests', requirementType: 'threshold', requirementField: 'stats.contestsPlayed', requirementValue: 30, isActive: true },
  { badgeId: 'contests_75', name: 'Contest Champion', description: 'Play 75 contests', iconKey: 'trophy', variant: 'gold', rarity: 'Epic', category: 'contests', requirementType: 'threshold', requirementField: 'stats.contestsPlayed', requirementValue: 75, isActive: true },
  { badgeId: 'contests_150', name: 'Contest Legend', description: 'Play 150 contests', iconKey: 'trophy', variant: 'gold', rarity: 'Legendary', category: 'contests', requirementType: 'threshold', requirementField: 'stats.contestsPlayed', requirementValue: 150, isActive: true },

  // ---- Contest high scorers ≥90% —> target / gold ----
  { badgeId: 'contest_90_3', name: 'Elite Performer', description: 'Score 90%+ in 3 contests', iconKey: 'target', variant: 'gold', rarity: 'Rare', category: 'contest_high_score', requirementType: 'threshold', requirementField: 'stats.contests90Plus', requirementValue: 3, isActive: true },
  { badgeId: 'contest_90_10', name: 'Sharpshooter', description: 'Score 90%+ in 10 contests', iconKey: 'target', variant: 'gold', rarity: 'Epic', category: 'contest_high_score', requirementType: 'threshold', requirementField: 'stats.contests90Plus', requirementValue: 10, isActive: true },
  { badgeId: 'contest_90_25', name: 'Contest Master', description: 'Score 90%+ in 25 contests', iconKey: 'target', variant: 'gold', rarity: 'Legendary', category: 'contest_high_score', requirementType: 'threshold', requirementField: 'stats.contests90Plus', requirementValue: 25, isActive: true },
  { badgeId: 'contest_90_60', name: 'Contest Deity', description: 'Score 90%+ in 60 contests', iconKey: 'target', variant: 'gold', rarity: 'Legendary', category: 'contest_high_score', requirementType: 'threshold', requirementField: 'stats.contests90Plus', requirementValue: 60, isActive: true },

  // ---- Hard-difficulty contests —> shield / red ----
  { badgeId: 'hard_contest_5', name: 'Brave Beginner', description: 'Complete 5 hard contests', iconKey: 'shield', variant: 'red', rarity: 'Common', category: 'hard_contest', requirementType: 'threshold', requirementField: 'stats.hardContestsDone', requirementValue: 5, isActive: true },
  { badgeId: 'hard_contest_15', name: 'Gladiator', description: 'Complete 15 hard contests', iconKey: 'shield', variant: 'red', rarity: 'Rare', category: 'hard_contest', requirementType: 'threshold', requirementField: 'stats.hardContestsDone', requirementValue: 15, isActive: true },
  { badgeId: 'hard_contest_40', name: 'Iron Will', description: 'Complete 40 hard contests', iconKey: 'shield', variant: 'purple', rarity: 'Epic', category: 'hard_contest', requirementType: 'threshold', requirementField: 'stats.hardContestsDone', requirementValue: 40, isActive: true },
  { badgeId: 'hard_contest_100', name: 'Hard-Mode Legend', description: 'Complete 100 hard contests', iconKey: 'shield', variant: 'gold', rarity: 'Legendary', category: 'hard_contest', requirementType: 'threshold', requirementField: 'stats.hardContestsDone', requirementValue: 100, isActive: true },

  // ---- Speed —> zap / blue ----
  { badgeId: 'speed_5', name: 'Quick Thinker', description: 'Finish 5 quizzes in half the time', iconKey: 'zap', variant: 'blue', rarity: 'Common', category: 'speed', requirementType: 'threshold', requirementField: 'stats.fastCompletions', requirementValue: 5, isActive: true },
  { badgeId: 'speed_20', name: 'Speed Demon', description: 'Finish 20 quizzes in half the time', iconKey: 'zap', variant: 'blue', rarity: 'Rare', category: 'speed', requirementType: 'threshold', requirementField: 'stats.fastCompletions', requirementValue: 20, isActive: true },
  { badgeId: 'speed_50', name: 'Lightning Fast', description: 'Finish 50 quizzes in half the time', iconKey: 'zap', variant: 'purple', rarity: 'Epic', category: 'speed', requirementType: 'threshold', requirementField: 'stats.fastCompletions', requirementValue: 50, isActive: true },
  { badgeId: 'speed_150', name: 'Time Bender', description: 'Finish 150 quizzes in half the time', iconKey: 'zap', variant: 'gold', rarity: 'Legendary', category: 'speed', requirementType: 'threshold', requirementField: 'stats.fastCompletions', requirementValue: 150, isActive: true },

  // ---- Study hours —> clock / green ----
  { badgeId: 'study_10', name: 'Dedicated Learner', description: 'Accumulate 10 study hours', iconKey: 'clock', variant: 'green', rarity: 'Common', category: 'study', requirementType: 'threshold', requirementField: 'studyHours', requirementValue: 10, isActive: true },
  { badgeId: 'study_50', name: 'Study Marathon', description: 'Accumulate 50 study hours', iconKey: 'clock', variant: 'green', rarity: 'Rare', category: 'study', requirementType: 'threshold', requirementField: 'studyHours', requirementValue: 50, isActive: true },
  { badgeId: 'study_100', name: 'Consistent', description: 'Accumulate 100 study hours', iconKey: 'clock', variant: 'green', rarity: 'Epic', category: 'study', requirementType: 'threshold', requirementField: 'studyHours', requirementValue: 100, isActive: true },
  { badgeId: 'study_500', name: 'Master Scholar', description: 'Accumulate 500 study hours', iconKey: 'clock', variant: 'gold', rarity: 'Legendary', category: 'study', requirementType: 'threshold', requirementField: 'studyHours', requirementValue: 500, isActive: true },

  // ---- Level milestones —> star / gold ----
  { badgeId: 'level_5', name: 'Rising Star', description: 'Reach level 5', iconKey: 'star', variant: 'green', rarity: 'Common', category: 'level', requirementType: 'threshold', requirementField: 'currentLevel', requirementValue: 5, isActive: true },
  { badgeId: 'level_10', name: 'Skilled Practitioner', description: 'Reach level 10', iconKey: 'star', variant: 'blue', rarity: 'Rare', category: 'level', requirementType: 'threshold', requirementField: 'currentLevel', requirementValue: 10, isActive: true },
  { badgeId: 'level_20', name: 'Expert', description: 'Reach level 20', iconKey: 'star', variant: 'purple', rarity: 'Epic', category: 'level', requirementType: 'threshold', requirementField: 'currentLevel', requirementValue: 20, isActive: true },
  { badgeId: 'level_35', name: 'Master', description: 'Reach level 35', iconKey: 'star', variant: 'gold', rarity: 'Legendary', category: 'level', requirementType: 'threshold', requirementField: 'currentLevel', requirementValue: 35, isActive: true },
  { badgeId: 'level_50', name: 'Grandmaster', description: 'Reach level 50', iconKey: 'crown', variant: 'gold', rarity: 'Legendary', category: 'level', requirementType: 'threshold', requirementField: 'currentLevel', requirementValue: 50, isActive: true },

  // ---- Subject mastery —> book / purple ----
  { badgeId: 'subject_master_1', name: 'Specialist', description: 'Master 1 subject (70%+ accuracy)', iconKey: 'book', variant: 'green', rarity: 'Common', category: 'subject_mastery', requirementType: 'arrayLength', requirementField: 'stats.masteredSubjects', requirementValue: 1, isActive: true },
  { badgeId: 'subject_master_5', name: 'Multi-Talented', description: 'Master 5 subjects', iconKey: 'book', variant: 'purple', rarity: 'Epic', category: 'subject_mastery', requirementType: 'arrayLength', requirementField: 'stats.masteredSubjects', requirementValue: 5, isActive: true },
  { badgeId: 'subject_master_10', name: 'All-Rounder', description: 'Master 10 subjects', iconKey: 'book', variant: 'gold', rarity: 'Legendary', category: 'subject_mastery', requirementType: 'arrayLength', requirementField: 'stats.masteredSubjects', requirementValue: 10, isActive: true },

  // ---- Leaderboard rank — medal / gold ----
  { badgeId: 'top3_1', name: 'Podium Finish', description: 'Finish top 3 in a contest', iconKey: 'medal', variant: 'gold', rarity: 'Rare', category: 'rank', requirementType: 'threshold', requirementField: 'stats.top3Finishes', requirementValue: 1, isActive: true },
  { badgeId: 'top3_5', name: 'Top Contender', description: 'Finish top 3 in 5 contests', iconKey: 'medal', variant: 'gold', rarity: 'Epic', category: 'rank', requirementType: 'threshold', requirementField: 'stats.top3Finishes', requirementValue: 5, isActive: true },
  { badgeId: 'top3_20', name: 'Leaderboard Legend', description: 'Finish top 3 in 20 contests', iconKey: 'medal', variant: 'gold', rarity: 'Legendary', category: 'rank', requirementType: 'threshold', requirementField: 'stats.top3Finishes', requirementValue: 20, isActive: true },

  // ---- Special ----
  { badgeId: 'premium_member', name: 'Premium Member', description: 'Unlocked premium tier', iconKey: 'gem', variant: 'purple', rarity: 'Epic', category: 'special', requirementType: 'boolean', requirementField: 'hasEverPurchased', requirementValue: 1, isActive: true },
  { badgeId: 'social_learner', name: 'Social Learner', description: '50 messages in discussion rooms', iconKey: 'users', variant: 'blue', rarity: 'Common', category: 'special', requirementType: 'threshold', requirementField: 'chatMessageCount', requirementValue: 50, isActive: false },
];


export const MAX_REWARD_PREMIUM_DAYS = 30;
export const REWARD_DAYS_BY_RARITY: Record<BadgeSeed['rarity'], number> = {
  Common: 1,
  Rare: 2,
  Epic: 3,
  Legendary: 5,
};

const NO_REWARD_BADGE_IDS = new Set<string>(['premium_member', 'social_learner']);
const PREMIUM_DERIVED_FIELDS = new Set<string>([
  'isPremium',
  'premiumExpiresAt',
  'premiumPlanId',
  'subscriptionId',
  'hasEverPurchased',
]);

export const BADGE_CATALOG: BadgeSeed[] = BADGE_DEFINITIONS.map((badge) => ({
  ...badge,
  rewardPremiumDays: NO_REWARD_BADGE_IDS.has(badge.badgeId)
    ? 0
    : REWARD_DAYS_BY_RARITY[badge.rarity],
}));

export function validateBadgeCatalog(catalog: BadgeSeed[] = BADGE_CATALOG): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const b of catalog) {
    if (seen.has(b.badgeId)) problems.push(`${b.badgeId}: duplicate badgeId.`);
    seen.add(b.badgeId);

    if (!b.requirementField.trim()) problems.push(`${b.badgeId}: requirementField is empty.`);

    if (!(b.requirementValue > 0)) problems.push(`${b.badgeId}: requirementValue must be > 0.`);

    if (!Number.isInteger(b.rewardPremiumDays) || b.rewardPremiumDays < 0 || b.rewardPremiumDays > MAX_REWARD_PREMIUM_DAYS) {
      problems.push(`${b.badgeId}: rewardPremiumDays must be an integer between 0 and ${MAX_REWARD_PREMIUM_DAYS}, got ${b.rewardPremiumDays}.`);
    }

    if (PREMIUM_DERIVED_FIELDS.has(b.requirementField) && b.rewardPremiumDays !== 0) {
      problems.push(`${b.badgeId}: requires "${b.requirementField}" (premium-derived), so its reward must be 0 to avoid a premium -> badge -> premium loop.`);
    }
  }

  return problems;
}
