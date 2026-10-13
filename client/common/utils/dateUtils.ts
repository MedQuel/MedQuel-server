import type { useTheme } from '../../theme/ThemeContext';


export type TimeRemaining = { kind: 'expired' } | { kind: 'hours'; value: number } | { kind: 'minutes'; value: number };

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeDuration(ms: number): string {
  const clamped = Math.max(0, ms);
  const totalMins = Math.floor(clamped / 60_000);

  const days = Math.floor(totalMins / 1440);
  const hours = Math.floor((totalMins%1440) / 60);
  const mins = totalMins % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${Math.max(mins, 1)}m`;
}

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

export function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped%3600) / 60);
  const s = clamped % 60;

  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '0s';
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);

  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;

  return `${s}s`;
}

export function formatRelativeTime(
  iso: string,
  theme: ReturnType<typeof useTheme>['theme'],
  now: number = Date.now()
): string {
  const t = theme.i18n.t.bind(theme.i18n);
  const created = new Date(iso).getTime();
  const mins = Math.floor(Math.max(0, now-created) / 60_000);

  if (mins < 1) return t('notifications.time.now');
  if (mins < 60) return t('notifications.time.minutes', { count: mins });

  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('notifications.time.hours', { count: hours });

  const days = Math.floor(hours / 24);
  if (days < 7) return t('notifications.time.days', { count: days });

  return new Date(created).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}
