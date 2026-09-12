import { View, Text } from 'react-native';
import { Feather, Octicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


type StatsOverviewCardProps = {
  rank: number;
  accuracy: number;
  quizzesTaken: number;
  earnedPoints: number;
};

export function StatsOverviewCard({ rank, accuracy, quizzesTaken, earnedPoints }: StatsOverviewCardProps) {
  const { theme } = useTheme();

  const earnedPointsFormatted = earnedPoints >= 1000
    ? (earnedPoints / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    : earnedPoints.toString();

  const stats = [
    {
      id: 'rank',
      label: theme.i18n.t('common.rank'),
      value: `#${rank}`,
      color: theme.color.warning,
      icon: (
        <Feather
          name='star'
          size={theme.space.md}
          color={theme.color.warning}
        />
      ),
    },
    {
      id: 'accuracy',
      label: theme.i18n.t('common.accuracy'),
      value: `${accuracy}%`,
      color: theme.color.success,
      icon: (
        <Octicons
          name='pulse'
          size={theme.space.md}
          color={theme.color.success}
        />
      ),
    },
    {
      id: 'quizzes',
      label: theme.i18n.t('common.quizzes'),
      value: `${quizzesTaken}`,
      color: theme.color.accent,
      icon: (
        <MaterialCommunityIcons
          name='brain'
          size={theme.space.md}
          color={theme.color.accent}
        />
      ),
    },
    {
      id: 'points',
      label: theme.i18n.t('common.ep_points'),
      value: `${earnedPointsFormatted}`,
      color: theme.isDark ? theme.color.info : theme.color.accent,
      icon: (
        <Feather
          name='zap'
          size={theme.space.md}
          color={theme.isDark ? theme.color.info : theme.color.accent}
        />
      ),
    },
  ];


  return (
    <View style={{ gap: theme.space.sm * 1.5, flexDirection: 'row' }}>
      {stats.map((stat) => (
        <View
          key={stat.id}
          style={{
            flex: 1,
            gap: theme.space.xs * 0.5,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.md,
            paddingHorizontal: theme.space.xs,
            borderWidth: 1,
            borderRadius: theme.borderRadius.xl,
            borderColor: theme.color.border,
            backgroundColor: theme.color.card,
          }}
        >
          <View>{stat.icon}</View>
          <Text
            style={{
              color: stat.color,
              textAlign: 'center',
              fontSize: theme.fontSize.lg * 1.1,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {stat.value}
          </Text>
          <Text
            style={{
              color: theme.color.textMuted,
              textAlign: 'center',
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
