import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

type NotificationItemProps = {
  streakDays: number;
  roomId: string;
  challengeText: string;
};

export function NotificationItem({
  streakDays,
  roomId,
  challengeText,
}: NotificationItemProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.space.md,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
      }}
    >
      <View
        style={{
          width: theme.space.xl * 2.5,
          height: theme.space.xl * 2.5,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: `${theme.color.error}1A`,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: theme.space.md,
        }}
      >
        <Svg width={theme.fontSize.xl * 1.6} height={theme.fontSize.xl * 1.6} viewBox="0 0 24 24" fill="none">
          <Path
            d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"
            stroke={theme.color.error}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          Streak at Risk!
        </Text>
        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.md,
            fontFamily: theme.fontFamily.light,
            marginTop: theme.space.xs,
            lineHeight: theme.fontSize.md * 1.4,
          }}
        >
          Don't break your {streakDays}-day streak. {challengeText}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.space.sm,
          }}
        >
          <View
            style={{
              width: theme.space.sm,
              height: theme.space.sm,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.info,
              marginRight: theme.space.xs,
            }}
          />
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.light,
            }}
          >
            Room ID: {roomId}
          </Text>
        </View>
      </View>
    </View>
  );
}