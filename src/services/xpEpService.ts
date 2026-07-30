const XP_PER_CORRECT_ANSWER = 5;
const XP_PER_QUESTION_ATTEMPTED = 2;
const DAILY_FIRST_QUIZ_BONUS_XP = 10;

const XP_ACCURACY_BONUS_TIERS: ReadonlyArray<{ minScorePercent: number, bonusXp: number }> = [
  { minScorePercent: 100, bonusXp: 50 },
  { minScorePercent: 90, bonusXp: 30 },
  { minScorePercent: 75, bonusXp: 15 },
  { minScorePercent: 50, bonusXp: 5 },
];


// -- XP Computation --
export interface XpEarnedInput {
  totalQuestions: number;
  correctCount: number;
  skippedCount: number;
  scorePercent: number;
  isFirstActivityToday: boolean;
}
export function computeXpEarned(input: XpEarnedInput): number {
  const attempted = input.totalQuestions - input.skippedCount;
  let xp = attempted*XP_PER_QUESTION_ATTEMPTED + input.correctCount*XP_PER_CORRECT_ANSWER;

  const tier = XP_ACCURACY_BONUS_TIERS.find((t) => input.scorePercent >= t.minScorePercent);
  if (tier) xp += tier.bonusXp;

  if (input.isFirstActivityToday) xp += DAILY_FIRST_QUIZ_BONUS_XP;

  return xp;
}


// -- EP Computation --
export interface EpEarnedInput {
  isContestMode: boolean;
  scorePercent: number;
  passPercent: number;
  epBaseReward: number;
}
export function computeEpEarned(input: EpEarnedInput): number {
  if (!input.isContestMode) return 0;
  if (input.scorePercent < input.passPercent) return 0;

  return Math.round(input.epBaseReward * (input.scorePercent / 100));
}


// -- Level Computation --
// Quadratic growth: xpRequiredForLevel(L) = 50 * (L-1) * L
// L2 needs 100 XP, L3 needs 300, L5 needs 1000, L10 needs 4500
function xpRequiredForLevel(level: number): number {
  return 50 * (level-1) * level;
}
export function computeLevelFromXp(totalXp: number): number {
  let level = 1;
  while (totalXp >= xpRequiredForLevel(level + 1)) {
    level += 1;
  }
  return level;
}


// Streak Computation
const IST_OFFSET_MS = (5 * 60+30) * 60 * 1000;

function toISTDateKey(date: Date): string {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const d = String(shifted.getUTCDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}
function istDateKeyMinusOneDay(date: Date): string {
  return toISTDateKey(new Date(date.getTime() - 24*60*60*1000));
}

export interface StreakUpdateResult {
  currentStreak: number;
  longestStreak: number;
  isFirstActivityToday: boolean;
}
export function updateStreak(lastActiveDate: Date | null, now: Date, currentStreak: number, longestStreak: number): StreakUpdateResult {
  const todayKey = toISTDateKey(now);
  const lastKey = lastActiveDate ? toISTDateKey(lastActiveDate) : null;

  if (lastKey === todayKey) {
    return { currentStreak, longestStreak, isFirstActivityToday: false };
  }

  const yesterdayKey = istDateKeyMinusOneDay(now);
  if (lastKey === yesterdayKey) {
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      isFirstActivityToday: true,
    };
  }

  return {
    currentStreak: 1,
    longestStreak: Math.max(1, longestStreak),
    isFirstActivityToday: true,
  };
}
