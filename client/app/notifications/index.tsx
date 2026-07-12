import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


function withOpacity(hex: string, opacity: number) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = Math.floor(bigint / 65536) % 256;
  const g = Math.floor(bigint / 256) % 256;
  const b = bigint % 256;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

type ColorKey =
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'premium';
interface NotificationItem {
  id: string;
  icon: string;
  colorKey: ColorKey;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  section: 'UNREAD' | 'EARLIER';
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    icon: 'fire',
    colorKey: 'danger',
    title: 'Streak at Risk!',
    description: "Don't break your 24-day streak. Complete today's challenge.",
    time: '2m',
    unread: true,
    section: 'UNREAD',
  },
  {
    id: '2',
    icon: 'trophy-outline',
    colorKey: 'warning',
    title: 'New Contest Live',
    description: 'Cardiology Grand Prix has started. 500 EP prize pool!',
    time: '15m',
    unread: true,
    section: 'UNREAD',
  },
  {
    id: '3',
    icon: 'star-outline',
    colorKey: 'accent',
    title: 'Level Up!',
    description: "You've reached Level 12. New challenges are unlocked.",
    time: '1h',
    unread: true,
    section: 'UNREAD',
  },
  {
    id: '4',
    icon: 'trending-up',
    colorKey: 'success',
    title: 'Rank Improved',
    description: 'You climbed from #139 to #127 globally this week.',
    time: '2h',
    unread: false,
    section: 'EARLIER',
  },
  {
    id: '5',
    icon: 'medal-outline',
    colorKey: 'warning',
    title: 'Badge Earned',
    description: 'Gold Medalist — scored 95%+ in Grand Medical Championship.',
    time: '3h',
    unread: false,
    section: 'EARLIER',
  },
  {
    id: '6',
    icon: 'chat-outline',
    colorKey: 'accent',
    title: 'Discussion Reply',
    description: 'Dr. Sarah K. replied to your question in Cardiology Room.',
    time: '4h',
    unread: false,
    section: 'EARLIER',
  },
  {
    id: '7',
    icon: 'book-open-blank-variant-outline',
    colorKey: 'accent',
    title: 'Daily Challenge',
    description: "Today's Anatomy challenge is available. +150 EP awaits.",
    time: '6h',
    unread: false,
    section: 'EARLIER',
  },
  {
    id: '8',
    icon: 'crown-outline',
    colorKey: 'premium',
    title: 'Premium Trial',
    description: 'Try Premium free for 7 days. Access all contests!',
    time: '1d',
    unread: false,
    section: 'EARLIER',
  },
  {
    id: '9',
    icon: 'bullseye',
    colorKey: 'success',
    title: 'Weekly Goal',
    description: 'You completed 50 questions this week. Keep it up!',
    time: '2d',
    unread: false,
    section: 'EARLIER',
  },
];

function NotificationCard({ item }: { item: NotificationItem }) {
  const { theme } = useTheme();
  const colors = theme.color;
  const iconColorMap: Record<ColorKey, string> = {
    accent: colors.accent,
    success: colors.success,
    warning: colors.warning,
    danger: colors.error,
    info: colors.info,
    premium: colors.premium,
  };
  const iconColor = iconColorMap[item.colorKey] ?? colors.accent;

  return (
    <View
      style={{
        backgroundColor: item.unread ? colors.surface : colors.card,
        borderRadius: theme.borderRadius.lg,
        padding: 10,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: theme.borderRadius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: withOpacity(iconColor, 0.15),
        }}
      >
        <MaterialCommunityIcons
          name={item.icon as any}
          size={theme.fontSize.md + 2}
          color={iconColor}
        />
      </View>
      <View style={{ flex: 1, paddingLeft: 10 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSize.sm - 1,
              fontWeight: theme.fontWeight.medium,
              color: colors.textPrimary,
              paddingRight: 6,
              flexShrink: 1,
            }}
          >
            {item.title}
          </Text>
          <Text
            style={{ fontSize: theme.fontSize.xs - 2, color: colors.textMuted }}
          >
            {item.time}
          </Text>
        </View>
        <Text
          style={{
            fontSize: theme.fontSize.xs - 1,
            color: colors.textSecondary,
            paddingTop: 2,
            lineHeight: 15,
          }}
        >
          {item.description}
        </Text>
        {item.unread && (
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.accent,
              marginTop: 5,
            }}
          />
        )}
      </View>
    </View>
  );
}

function Section({ label, items }: { label: string, items: NotificationItem[] }) {
  const { theme } = useTheme();
  const colors = theme.color;
  if (items.length === 0) return null;
  return (
    <>
      <Text
        style={{
          fontSize: theme.fontSize.sm - 2,
          fontWeight: theme.fontWeight.medium,
          color: colors.textMuted,
          letterSpacing: 0.4,
          marginTop:
            label === 'UNREAD' ? theme.space.md - 4 : theme.space.sm + 3,
          marginBottom: label === 'UNREAD' ? theme.space.sm : theme.space.sm,
        }}
      >
        {label}
      </Text>
      <View style={{ gap: 6 }}>
        {items.map((item) => (
          <NotificationCard key={item.id} item={item} />
        ))}
      </View>
    </>
  );
}


export default function NotificationsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { isDark } = theme;
  const colors = theme.color;

  const unread = NOTIFICATIONS.filter((n) => n.section === 'UNREAD');
  const earlier = NOTIFICATIONS.filter((n) => n.section === 'EARLIER');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 70 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={{
              paddingVertical: theme.space.xs + 1,
              paddingHorizontal: theme.space.xs + 2,
              borderRadius: theme.borderRadius.lg - 2,
              backgroundColor: isDark ? colors.card : colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Ionicons
              name='chevron-back'
              size={theme.space.md}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <View style={{ paddingLeft: theme.space.sm }}>
            <Text
              onPress={toggleTheme}
              style={{
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.medium,
                color: colors.textPrimary,
              }}
            >
              Notifications
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.xs,
                color: colors.textMuted,
                paddingTop: 1,
              }}
            >
              {unread.length} unread
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text
            style={{
              fontSize: theme.fontSize.sm - 1,
              fontWeight: theme.fontWeight.medium,
              color: colors.accent,
            }}
          >
            Mark all read
          </Text>
        </TouchableOpacity>
      </View>

      <Section label='UNREAD' items={unread} />
      <Section label='EARLIER' items={earlier} />
    </ScrollView>
  );
}
