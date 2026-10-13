import type { AppNotification } from '../types/types';


export interface NotificationRoute {
  pathname: string;
  params?: Record<string, string>;
}

export function parseNotificationData(raw: string): Record<string, string> {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] =>
        typeof entry[1] === 'string'
      )
    );
  } catch {
    return {};
  }
}

export function getNotificationRoute(
  type: string | undefined,
  kind: string | undefined,
  data: Record<string, string>
): NotificationRoute | null {
  switch (type) {
    case 'friends': return kind === 'friend_request_received'
      ? { pathname: '/friends', params: { tab: 'requests' } }
      : { pathname: '/friends' };
    case 'challenge': return data.challengeId
      ? { pathname: '/challenges', params: { challengeId: data.challengeId } }
      : { pathname: '/challenges' };
    case 'achievements':
    case 'level': return { pathname: '/achievements' };
    case 'contest': return data.contestId
      ? { pathname: '/contests', params: { contestId: data.contestId } }
      : { pathname: '/contests' };
    case 'leaderboard': return { pathname: '/leaderboard' };
    case 'dailyChallenge':
    case 'streak': return { pathname: '/home' };
    case 'studyPlan': return { pathname: '/studyPlan' };
    case 'premium': return { pathname: '/premium' };
    case 'chat': return { pathname: '/chat' };
    default:
      return null;
  }
}

export function routeForNotification(n: AppNotification): NotificationRoute | null {
  return getNotificationRoute(n.type, n.kind, parseNotificationData(n.data));
}
