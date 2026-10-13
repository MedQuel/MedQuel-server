import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { api } from '../api/api';
import { useTheme } from '../../theme/ThemeContext';
import { getNotificationRoute } from './notificationRoutes';
import { notificationStore, refreshUnreadCount } from './notificationStore';


const tokenKey = (uid: string) => `medquel.fcmToken.${uid}`;

type NotificationsModule = typeof import('expo-notifications');
const notifications: NotificationsModule | null = Platform.OS !== 'web' && Constants.appOwnership !== 'expo'
  ? (require('expo-notifications') as NotificationsModule)
  : null;

if (notifications) {
  notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensureChannels(names: Record<'social' | 'contests' | 'progress' | 'account', string>) {
  if (!notifications) return;
  const defs = [
    { id: 'social', importance: notifications.AndroidImportance.HIGH },
    { id: 'contests', importance: notifications.AndroidImportance.DEFAULT },
    { id: 'progress', importance: notifications.AndroidImportance.DEFAULT },
    { id: 'account', importance: notifications.AndroidImportance.DEFAULT },
  ] as const;

  await Promise.all(
    defs.map((d) =>
      notifications.setNotificationChannelAsync(d.id, {
        name: names[d.id],
        importance: d.importance,
      })
    )
  );
}

async function getFcmToken(): Promise<string | null> {
  if (!notifications || !Device.isDevice) return null;

  const current = await notifications.getPermissionsAsync();
  let granted = current.status === 'granted';
  if (!granted && current.canAskAgain) {
    granted = (await notifications.requestPermissionsAsync()).status === 'granted';
  }
  if (!granted) return null;

  const token = await notifications.getDevicePushTokenAsync();
  return typeof token.data === 'string' ? token.data : null;
}

async function syncToken(uid: string, token: string) {
  if ((await AsyncStorage.getItem(tokenKey(uid))) === token) return;
  await api.notification.registerDeviceToken(token);
  await AsyncStorage.setItem(tokenKey(uid), token);
}

export async function unregisterPushToken(uid: string) {
  const token = await AsyncStorage.getItem(tokenKey(uid));
  if (!token) return;

  try {
    await api.notification.unregisterDeviceToken(token);
  } catch {
    /* server also prunes stale tokens */
  }
  await AsyncStorage.removeItem(tokenKey(uid));
}

export function usePushNotifications(uid: string | null | undefined) {
  const router = useRouter();
  const { theme, currentLocale } = useTheme();

  const lastResponse = notifications?.useLastNotificationResponse?.() ?? null;
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    ensureChannels({
      social: theme.i18n.t('notifications.channels.social'),
      contests: theme.i18n.t('notifications.channels.contests'),
      progress: theme.i18n.t('notifications.channels.progress'),
      account: theme.i18n.t('notifications.channels.account'),
    }).catch((err) => {
      if (__DEV__) console.warn('[push] channel setup failed:', err);
    });
  }, [currentLocale, theme.i18n]);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;

    (async () => {
      try {
        const token = await getFcmToken();
        if (token && !cancelled) await syncToken(uid, token);
      } catch (err) {
        console.warn('[push] registration failed:', err);
      }
    })();

    if (!notifications) return;
    const tokenSub = notifications.addPushTokenListener(({ data }) => {
      if (typeof data === 'string') syncToken(uid, data).catch(() => undefined);
    });

    return () => { cancelled = true; tokenSub.remove(); };
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    refreshUnreadCount().catch(() => undefined);

    if (!notifications) return;
    const receivedSub = notifications.addNotificationReceivedListener(() => {
      notificationStore.set(Math.min(100, notificationStore.get()+1));
    });
    const appStateSub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refreshUnreadCount().catch(() => undefined);
    });

    return () => { receivedSub.remove(); appStateSub.remove(); };
  }, [uid]);

  useEffect(() => {
    if (!uid || !lastResponse) return;
    const request = lastResponse.notification.request;
    const data = (request.content.data ?? {}) as Record<string, string>;
    const id = data.notificationId ?? request.identifier;

    if (handledRef.current === id) return;
    handledRef.current = id;

    if (data.notificationId) api.notification.markRead(data.notificationId).catch(() => undefined);
    const route = getNotificationRoute(data.type, data.kind, data);
    if (route) router.push(route as never);
  }, [lastResponse, uid, router]);
}
