import { useSyncExternalStore } from 'react';

import { api } from '../api/api';
import type { NotificationType } from '../types/types';


export type { NotificationType };
export interface NotificationEvent {
  userId: string;
  type: NotificationType;
  kind: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  dedupeKey?: string;
  inApp?: boolean;
  push?: boolean;
}

let unread = 0;
const listeners = new Set<() => void>();

export const notificationStore = {
  get: () => unread,
  set: (n: number) => {
    const next = Math.max(0, n);
    if (next === unread) return;
    unread = next;
    listeners.forEach((l) => l());
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useUnreadCount(): number {
  return useSyncExternalStore(
    notificationStore.subscribe,
    notificationStore.get,
    notificationStore.get
  );
}

export async function refreshUnreadCount(): Promise<void> {
  try {
    notificationStore.set(await api.notification.getUnreadCount());
  } catch {
    // The badge is non-critical; keep the last known value.
  }
}
