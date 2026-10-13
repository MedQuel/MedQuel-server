import { useRouter } from 'expo-router';
import { useCallback, memo, useMemo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionList, RefreshControl, ActivityIndicator } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { formatRelativeTime } from '../../common/utils/dateUtils';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { useUnreadCount } from '../../common/notifications/notificationStore';
import { useNotifications } from '../../common/notifications/useNotifications';
import { getNotificationText } from '../../common/notifications/notificationText';
import type { AppNotification, NotificationType } from '../../common/types/types';
import { routeForNotification } from '../../common/notifications/notificationRoutes';


type ColorKey = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'premium';
interface TypeConfig {
  icon: string;
  colorKey: ColorKey;
}
interface NotificationSection {
  key: 'unread' | 'earlier';
  title: string;
  data: AppNotification[];
}

function withOpacity(hex: string, opacity: number) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = Math.floor(bigint/65536) % 256;
  const g = Math.floor(bigint/256) % 256;
  const b = bigint % 256;

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
  streak: { icon: 'fire', colorKey: 'danger' },
  contest: { icon: 'trophy-outline', colorKey: 'warning' },
  level: { icon: 'star-outline', colorKey: 'accent' },
  leaderboard: { icon: 'trending-up', colorKey: 'success' },
  achievements: { icon: 'medal-outline', colorKey: 'warning' },
  chat: { icon: 'chat-outline', colorKey: 'accent' },
  dailyChallenge: { icon: 'book-open-blank-variant-outline', colorKey: 'accent' },
  premium: { icon: 'crown-outline', colorKey: 'premium' },
  studyPlan: { icon: 'bullseye', colorKey: 'success' },
  friends: { icon: 'account-plus-outline', colorKey: 'info' },
  challenge: { icon: 'sword-cross', colorKey: 'warning' },
  announcement: { icon: 'bullhorn-outline', colorKey: 'info' },
};
const FALLBACK_CONFIG: TypeConfig = {
  icon: 'bell-outline',
  colorKey: 'accent',
};

const NotificationCard = memo(function NotificationCardComponent({ item, onPress }: {
  item: AppNotification;
  onPress: (item: AppNotification) => void;
}) {
  const { theme } = useTheme();

  const iconColorMap: Record<ColorKey, string> = {
    accent: theme.color.accent,
    success: theme.color.success,
    warning: theme.color.warning,
    danger: theme.color.error,
    info: theme.color.info,
    premium: theme.color.premium,
  };

  const { icon, colorKey } = TYPE_CONFIG[item.type] ?? FALLBACK_CONFIG;
  const iconColor = iconColorMap[colorKey] ?? theme.color.accent;
  const { title, body } = getNotificationText(item, theme);
  const time = formatRelativeTime(item.createdAt, theme);
  const unread = !item.isRead;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(item)}
      accessibilityRole='button'
      accessibilityLabel={`${unread ? `${theme.i18n.t('notifications.a11y.unread')}. ` : ''}${title}. ${body}. ${time}`}
      style={{
        gap: theme.space.sm,
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.space.md - 3,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: unread ? theme.color.surface : theme.color.card,
      }}
    >
      <View
        style={{
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.space.sm,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: withOpacity(iconColor, 0.15),
        }}
      >
        <MaterialCommunityIcons name={icon as any} size={theme.fontSize.md} color={iconColor} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            numberOfLines={1}
            style={{
              flexShrink: 1,
              fontSize: theme.fontSize.sm,
              color: theme.color.textPrimary,
              fontFamily: theme.fontFamily.bold,
              paddingRight: theme.space.xs,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize.xs,
              color: theme.color.textMuted,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {time}
          </Text>
        </View>

        <Text
          numberOfLines={3}
          style={{
            fontSize: theme.fontSize.xs,
            color: theme.color.textSecondary,
            fontFamily: theme.fontFamily.regular,
            paddingTop: theme.space.xs * 0.5,
          }}
        >
          {body}
        </Text>

        {unread && (
          <View
            style={{
              width: theme.space.xs,
              height: theme.space.xs,
              marginTop: theme.space.xs,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.accent,
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
});


export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  useBottomBar(false);

  const {
    items,
    status,
    refreshing,
    loadingMore,
    refresh,
    retry,
    loadMore,
    markRead,
    markAllRead,
  } = useNotifications();
  const unreadCount = useUnreadCount();

  const sections = useMemo<NotificationSection[]>(() => {
    const all: NotificationSection[] = [
      {
        key: 'unread',
        title: theme.i18n.t('notifications.sectionUnread'),
        data: items.filter((n) => !n.isRead),
      },
      {
        key: 'earlier',
        title: theme.i18n.t('notifications.sectionEarlier'),
        data: items.filter((n) => n.isRead),
      },
    ];
    return all.filter((s) => s.data.length > 0);
  }, [items, theme.i18n]);

  const handlePress = useCallback(
    (item: AppNotification) => {
      markRead(item.notificationId).catch(() => {});
      const route = routeForNotification(item);
      if (route) router.push(route as never);
    }, [markRead, router]
  );

  const hasNoNotifications = status === 'ready' && items.length === 0;
  const subtitle = hasNoNotifications
    ? theme.i18n.t('notifications.noNotifications')
    : unreadCount >= 100
      ? theme.i18n.t('notifications.unreadMany')
      : theme.i18n.t('notifications.unreadCount', { count: unreadCount });
  const canMarkAll = unreadCount > 0;

  const header = (
    <ScreenHeader
      title={theme.i18n.t('notifications.title')}
      subtitle={subtitle}
      onBack={() => router.canGoBack()
        ? router.back()
        : router.replace('/home')
      }
      rightElement={
        <TouchableOpacity
          onPress={markAllRead}
          disabled={!canMarkAll}
          accessibilityRole='button'
          accessibilityState={{ disabled: !canMarkAll }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
              color: canMarkAll ? theme.color.accent : theme.color.textMuted,
            }}
          >
            {theme.i18n.t('notifications.markAllRead')}
          </Text>
        </TouchableOpacity>
      }
      containerStyle={{ marginHorizontal: -theme.space.md }}
    />
  );

  const empty = (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.space.lg,
      }}
    >
      {status === 'loading' ? (
        <ActivityIndicator color={theme.color.accent} />
      ) : status === 'error' ? (
        <>
          <MaterialCommunityIcons
            name='cloud-alert-outline'
            size={theme.space.xl * 1.25}
            color={theme.color.textMuted}
          />
          <Text
            style={{
              textAlign: 'center',
              fontSize: theme.fontSize.sm,
              color: theme.color.textSecondary,
              fontFamily: theme.fontFamily.regular,
              marginTop: theme.space.sm,
            }}
          >
            {theme.i18n.t('notifications.error')}
          </Text>

          <TouchableOpacity
            onPress={retry}
            accessibilityRole='button'
            style={{
              marginTop: theme.space.md,
              paddingVertical: theme.space.sm,
              paddingHorizontal: theme.space.lg,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.accent,
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.color.background,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {theme.i18n.t('notifications.retry')}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <MaterialCommunityIcons
            name='bell-outline'
            size={theme.space.xl * 1.25}
            color={theme.color.textMuted}
          />
          <Text
            style={{
              fontSize: theme.fontSize.md,
              color: theme.color.textPrimary,
              fontFamily: theme.fontFamily.regular,
              marginTop: theme.space.sm,
            }}
          >
            {theme.i18n.t('notifications.emptyTitle')}
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: theme.fontSize.sm,
              color: theme.color.textMuted,
              fontFamily: theme.fontFamily.regular,
              marginTop: theme.space.xs,
            }}
          >
            {theme.i18n.t('notifications.emptyBody')}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <SectionList
      style={{ flex: 1, backgroundColor: theme.color.background }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: insets.bottom * 1.5,
        paddingHorizontal: theme.space.md,
      }}
      sections={sections}
      keyExtractor={(item) => item.notificationId}
      renderItem={({ item }) => (
        <View style={{ marginBottom: theme.space.sm }}>
          <NotificationCard item={item} onPress={handlePress} />
        </View>
      )}
      renderSectionHeader={({ section }) => (
        <Text
          style={{
            letterSpacing: 0.5,
            fontSize: theme.fontSize.sm,
            color: theme.color.textMuted,
            fontFamily: theme.fontFamily.regular,
            marginTop: theme.space.md,
            marginBottom: theme.space.sm + 2,
            backgroundColor: theme.color.background,
          }}
        >
          {section.title}
        </Text>
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator style={{ paddingVertical: theme.space.md }} color={theme.color.accent} />
        ) : null
      }
      stickySectionHeadersEnabled={false}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={theme.color.accent}
          colors={[theme.color.accent]}
        />
      }
      initialNumToRender={10}
      windowSize={7}
      showsVerticalScrollIndicator={false}
    />
  );
}
