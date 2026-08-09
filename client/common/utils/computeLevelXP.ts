export function xpRequiredForLevel(level: number): number {
  return 50 * (level - 1) * level;
}

export function computeLevelFromXp(totalXp: number): number {
  let level = 1;
  while (totalXp >= xpRequiredForLevel(level + 1)) {
    level += 1;
  }

  return level;
}
