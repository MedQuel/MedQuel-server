import { useCallback, useEffect, useRef, useState } from 'react';

import { api } from '../api/api';
import type { AppNotification } from '../types/types';
import { notificationStore, refreshUnreadCount } from './notificationStore';


const PAGE_SIZE = 20;
export type NotificationsStatus = 'loading' | 'ready' | 'error';

function mergeById(prev: AppNotification[], next: AppNotification[]): AppNotification[] {
  const seen = new Set(prev.map((n) => n.notificationId));
  return [...prev, ...next.filter((n) => !seen.has(n.notificationId))];
}

export function useNotifications() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [status, setStatus] = useState<NotificationsStatus>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const cursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef(true);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);
  const itemsRef = useRef<AppNotification[]>([]);
  itemsRef.current = items;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false };
  }, []);

  const fetchPage = useCallback(async (reset: boolean) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
  
    try {
      const res = await api.notification.getNotifications(
        PAGE_SIZE,
        reset ? null : cursorRef.current
      );

      if (!mountedRef.current) return;
      cursorRef.current = res.nextCursor;
      hasMoreRef.current = Boolean(res.nextCursor);
      setItems((prev) => reset ? res.notifications : mergeById(prev, res.notifications));
      setStatus('ready');
    } catch (error) {
      hasMoreRef.current = false;
      if (__DEV__) console.error('[notifications] failed to load page', error);
      if (mountedRef.current && itemsRef.current.length === 0) setStatus('error');
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) {
        setRefreshing(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchPage(true).catch(() => {});
    refreshUnreadCount().catch(() => {});
  }, [fetchPage]);

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return;
    setRefreshing(true);
    await fetchPage(true);
    refreshUnreadCount().catch(() => {});
  }, [fetchPage]);

  const retry = useCallback(() => {
    setStatus('loading');
    fetchPage(true).catch(() => {});
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (status !== 'ready' || !hasMoreRef.current || inFlightRef.current) return;
    setLoadingMore(true);
    fetchPage(false).catch(() => {});
  }, [fetchPage, status]);

  const markRead = useCallback(async (id: string) => {
    const target = itemsRef.current.find((n) => n.notificationId === id);
    if (!target || target.isRead) return;

    setItems((prev) => prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)));
    notificationStore.set(notificationStore.get() - 1);

    try {
      await api.notification.markRead(id);
    } catch {
      setItems((prev) => prev.map((n) => (n.notificationId === id ? { ...n, isRead: false } : n)));
      refreshUnreadCount().catch(() => {});
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!itemsRef.current.some((n) => !n.isRead) && notificationStore.get() === 0) return;

    setItems((prev) => prev.map((n) => (n.isRead ? n : { ...n, isRead: true })));
    notificationStore.set(0);

    try {
      await api.notification.markAllRead();
    } catch {
      fetchPage(true).catch(() => {});
      refreshUnreadCount().catch(() => {});
    }
  }, [fetchPage]);

  return {
    items,
    status,
    refreshing,
    loadingMore,
    refresh,
    retry,
    loadMore,
    markRead,
    markAllRead,
  };
}
