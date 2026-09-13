const IST_OFFSET_MS = (5*60 + 30) * 60*1000;


export function toISTDateKey(date: Date): string {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth()+1).padStart(2, '0');
  const d = String(shifted.getUTCDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}

export function istDateKeyDaysAgo(date: Date, daysAgo: number): string {
  return toISTDateKey(new Date(date.getTime()-daysAgo * 24*60*60*1000));
}

export function getISTWeekStartDateKey(date: Date): string {
  const istShifted = new Date(date.getTime() + IST_OFFSET_MS);
  const day = istShifted.getUTCDay() || 7;
  const istMidnight = new Date(Date.UTC(
    istShifted.getUTCFullYear(),
    istShifted.getUTCMonth(),
    istShifted.getUTCDate()
  ));
  const mondayIstMidnight = new Date(istMidnight.getTime()-(day-1) * 24*60*60*1000);
  const mondayUtcInstant = new Date(mondayIstMidnight.getTime() - IST_OFFSET_MS);

  return toISTDateKey(mondayUtcInstant);
}
