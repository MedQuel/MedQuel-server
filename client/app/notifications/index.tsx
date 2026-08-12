import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router';
import { useTheme } from "../../theme/ThemeContext";
import { useBottomBar } from '../../common/context/useBottomBar';
import { NotificationType } from "../../common/constants/notification";

function withOpacity(hex: string, opacity: number) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = Math.floor(bigint / 65536) % 256;
  const g = Math.floor(bigint / 256) % 256;
  const b = bigint % 256;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

type ColorKey =
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "premium";

interface TypeConfig {
  icon: string;
  colorKey: ColorKey;
}

const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
  streak: { icon: "fire", colorKey: "danger" },
  contest: { icon: "trophy-outline", colorKey: "warning" },
  level: { icon: "star-outline", colorKey: "accent" },
  leaderboard: { icon: "trending-up", colorKey: "success" },
  achievements: { icon: "medal-outline", colorKey: "warning" },
  chat: { icon: "chat-outline", colorKey: "accent" },
  dailyChallenge: {
    icon: "book-open-blank-variant-outline",
    colorKey: "accent",
  },
  premium: { icon: "crown-outline", colorKey: "premium" },
  studyPlan: { icon: "bullseye", colorKey: "success" },
};

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  section: "UNREAD" | "READ";
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "streak",
    title: "Streak at Risk!",
    description: "Don't break your 24-day streak. Complete today's challenge.",
    time: "2m",
    unread: true,
    section: "UNREAD",
  },
  {
    id: "2",
    type: "contest",
    title: "New Contest Live",
    description: "Cardiology Grand Prix has started. 500 EP prize pool!",
    time: "15m",
    unread: true,
    section: "READ",
  },
  {
    id: "3",
    type: "level",
    title: "Level Up!",
    description: "You've reached Level 12. New challenges are unlocked.",
    time: "1h",
    unread: true,
    section: "UNREAD",
  },
  {
    id: "4",
    type: "leaderboard",
    title: "Rank Improved",
    description: "You climbed from #139 to #127 globally this week.",
    time: "2h",
    unread: false,
    section: "READ",
  },
  {
    id: "5",
    type: "achievements",
    title: "Badge Earned",
    description: "Gold Medalist — scored 95%+ in Grand Medical Championship.",
    time: "3h",
    unread: false,
    section: "READ",
  },
  {
    id: "6",
    type: "chat",
    title: "Discussion Reply",
    description: "Dr. Sarah K. replied to your question in Cardiology Room.",
    time: "4h",
    unread: false,
    section: "READ",
  },
  {
    id: "7",
    type: "dailyChallenge",
    title: "Daily Challenge",
    description: "Today's Anatomy challenge is available. +150 EP awaits.",
    time: "6h",
    unread: false,
    section: "READ",
  },
  {
    id: "8",
    type: "premium",
    title: "Premium Trial",
    description: "Try Premium free for 7 days. Access all contests!",
    time: "1d",
    unread: false,
    section: "READ",
  },
  {
    id: "9",
    type: "studyPlan",
    title: "Weekly Goal",
    description: "You completed 50 questions this week. Keep it up!",
    time: "2d",
    unread: false,
    section: "READ",
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

  const { icon, colorKey } = TYPE_CONFIG[item.type];
  const iconColor = iconColorMap[colorKey] ?? colors.accent;

  return (
    <View
      style={{
        backgroundColor: item.unread ? colors.surface : colors.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.space.md - 3,
        flexDirection: "row",
        alignItems: "center", 
        gap: 10,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: theme.borderRadius.lg,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: withOpacity(iconColor, 0.15),
          flexShrink: 0, 
        }}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={theme.fontSize.md + 2}
          color={iconColor}
        />
      </View>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center", 
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSize.sm - 1,
              fontWeight: theme.fontWeight.medium,
              fontFamily: theme.fontFamily.regular,
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
            fontFamily: theme.fontFamily.regular,
            fontWeight:theme.fontWeight.medium,
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

function Section({
  label,
  items,
}: {
  label: string;
  items: NotificationItem[];
}) {
  const { theme } = useTheme();
  const colors = theme.color;
  if (items.length === 0) return null;
  return (
    <>
      <Text
        style={{
          fontSize: theme.fontSize.md,
          fontWeight: theme.fontWeight.medium,
          fontFamily: theme.fontFamily.regular,
          color: colors.textMuted,
          letterSpacing: 0.5,
          marginTop: label === "UNREAD" ? theme.space.md : theme.space.md + 3,
          marginBottom:
            label === "UNREAD" ? theme.space.sm + 2 : theme.space.sm + 2,
        }}
      >
        {label}
      </Text>
      <View style={{ gap: 10 }}>
        {items.map((item) => (
          <NotificationCard key={item.id} item={item} />
        ))}
      </View>
    </>
  );
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const { isDark } = theme;
  const router = useRouter();
  const colors = theme.color;
  useBottomBar(false);

  const [notifications, setNotifications] =
    useState<NotificationItem[]>(NOTIFICATIONS);

  const unread = notifications.filter((n) => n.unread);
  const Read = notifications.filter((n) => !n.unread);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: theme.space.md,
        paddingBottom: 50,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: theme.space.sm,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.push('/home')}
            style={{
              paddingVertical: theme.space.sm,
              paddingTop:theme.space.md-6,
              paddingHorizontal: theme.space.sm,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: isDark ? colors.card : colors.surface,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Ionicons
              name="chevron-back"
              size={theme.space.lg}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <View style={{ paddingLeft: theme.space.md }}>
            <Text
              style={{
                fontSize: theme.fontSize.lg,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.regular,
                color: colors.textPrimary,
                paddingTop:theme.space.md-6,
              }}
            >
              Notifications
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                fontWeight: theme.fontWeight.bold,
                color: colors.textMuted,
                paddingTop: 2,
              }}
            >
              {unread.length} unread
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text
            style={{
              fontSize: theme.fontSize.md,
              fontWeight: theme.fontWeight.medium,
              fontFamily: theme.fontFamily.regular,
              color: colors.accent,
            }}
          >
            Mark all read
          </Text>
        </TouchableOpacity>
      </View>

      <Section label="UNREAD" items={unread} />
      <Section label="READ" items={Read} />
    </ScrollView>
  );
}