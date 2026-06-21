import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


type AchievementBadgeCardProps = {
  label: string;
  title: string;
  subtitle: string;
};

export function AchievementBadgeCard({ label, title, subtitle }: AchievementBadgeCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.md,
        padding: theme.space.md,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1.5,
        borderColor: theme.color.warning + '55',
        backgroundColor: theme.color.card,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: theme.borderRadius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: theme.color.warning,
          backgroundColor: theme.color.warning + '18',
        }}
      >
        <Feather name="award" size={theme.fontSize.xxl} color={theme.color.warning} />
      </View>

      <View style={{ flex: 1, gap: theme.space.xs * 0.5 }}>
        <Text
          style={{
            color: theme.color.warning,
            fontSize: theme.fontSize.xs,
            fontWeight: theme.fontWeight.bold as any,
            fontFamily: theme.fontFamily.regular,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>

        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.bold as any,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.light,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

export default AchievementBadgeCard;