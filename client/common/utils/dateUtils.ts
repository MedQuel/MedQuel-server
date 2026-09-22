export type TimeRemaining = { kind: 'expired' } | { kind: 'hours'; value: number } | { kind: 'minutes'; value: number };

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
}

export function getTimeRemaining(iso: string): TimeRemaining {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return { kind: 'expired' };

  const hours = Math.floor(ms / 3600000);
  if (hours >= 1) return { kind: 'hours', value: hours };

  return { kind: 'minutes', value: Math.max(1, Math.round(ms/60000)) };
}

export function formatStudyTime(studyHours: number | null | undefined): string {
  if (studyHours == null || isNaN(studyHours) || studyHours <= 0) return '0 sec';

  const totalSeconds = Math.round(studyHours * 3600);
  if (totalSeconds < 60) return `${totalSeconds} sec`;
  if (totalSeconds < 3600) {
    const minutes = Math.round((totalSeconds/60)*100) / 100;
    return `${minutes} min`;
  }

  const hours = Math.round(studyHours*100) / 100;
  return `${hours} hr`;
}
