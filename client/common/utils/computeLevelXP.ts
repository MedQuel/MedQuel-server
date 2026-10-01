export interface LevelProgress {
  level: number;
  floorXp: number;
  ceilingXp: number;
  progressRatio: number;
}


export function xpRequiredForLevel(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return 50 * (l-1) * l;
}

export function computeLevelFromXp(totalXp: number): number {
  let level = 1;
  while (totalXp >= xpRequiredForLevel(level + 1)) level += 1;

  return level;
}

export function computeLevelProgress(totalXp: number): LevelProgress {
  const xp = Number.isFinite(totalXp) ? Math.max(0, totalXp) : 0;

  let level = 1;
  while (xp >= xpRequiredForLevel(level + 1)) level += 1;

  const floorXp = xpRequiredForLevel(level);
  const ceilingXp = xpRequiredForLevel(level + 1);
  const span = ceilingXp - floorXp;
  const progressRatio = span > 0 ? Math.min(1, Math.max(0, (xp-floorXp)/span)) : 0;

  return { level, floorXp, ceilingXp, progressRatio };
}
