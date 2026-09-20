const MIN_PARTICIPATION_EP = 5;
const PARTICIPATION_EP_RATIO = 0.25;
const REFERENCE_QUESTION_COUNT = 10;
const BASE_EP_BY_DIFFICULTY: Record<'easy' | 'medium' | 'hard', number> = {
  easy: 20,
  medium: 35,
  hard: 50,
};

export function computeChallengeRewards(difficulty: 'easy' | 'medium' | 'hard', questionCount: number) {
  const winnerEp = Math.max(
    1,
    Math.round(BASE_EP_BY_DIFFICULTY[difficulty] * (questionCount/REFERENCE_QUESTION_COUNT))
  );

  const participationEp = Math.max(MIN_PARTICIPATION_EP, Math.round(winnerEp * PARTICIPATION_EP_RATIO));

  return { winnerEp, participationEp };
}
