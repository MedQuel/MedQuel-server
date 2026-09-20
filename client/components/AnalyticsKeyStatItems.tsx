import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import { formatStudyTime } from '../common/utils/dateUtils';


type StatItem = {
  labelKey: string;
  value: string;
  color: string;
};
type Props = {
  totalCorrect: number;
  avgScore: number;
  bestSubject: string;
  studyHours: number | string;
  longestStreak: number;
  weakSubject: string;
};

export function AnalyticsKeyStatItems({ totalCorrect, avgScore, bestSubject, studyHours, longestStreak, weakSubject }: Props) {
  const { theme } = useTheme();

  const formattedStudyHours = typeof studyHours === 'number' ? formatStudyTime(studyHours) : studyHours;

  const stats: StatItem[][] = [
    [
      {
        labelKey: 'components.AnalyticsKeyStatItems.total_correct',
        value: String(totalCorrect),
        color: theme.color.accent,
      },
      {
        labelKey: 'components.AnalyticsKeyStatItems.avg_score',
        value: `${avgScore}/100`,
        color: theme.color.accent,
      },
    ],
    [
      {
        labelKey: 'components.AnalyticsKeyStatItems.best_subject',
        value: bestSubject,
        color: theme.color.success,
      },
      {
        labelKey: 'components.AnalyticsKeyStatItems.study_hours',
        value: formattedStudyHours,
        color: theme.color.warning,
      },
    ],
    [
      {
        labelKey: 'components.AnalyticsKeyStatItems.longest_streak',
        value: `${longestStreak} days`,
        color: theme.color.warning,
      },
      {
        labelKey: 'components.AnalyticsKeyStatItems.weak_subject',
        value: weakSubject,
        color: theme.color.error,
      },
    ],
  ];

  return (
    <View
      style={{
        padding: theme.space.md,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
      }}
    >
      <View
        style={{
          gap: theme.space.sm,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.space.md,
        }}
      >
        <Feather name='trending-up' size={theme.fontSize.lg} color={theme.color.accent} />
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {theme.i18n.t('components.AnalyticsKeyStatItems.title')}
        </Text>
      </View>

      <View style={{ gap: theme.space.md }}>
        {stats.map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row', gap: theme.space.sm }}>
            {row.map((item) => (
              <View
                key={item.labelKey}
                style={{
                  flex: 1,
                  paddingVertical: theme.space.sm,
                  paddingHorizontal: theme.space.sm * 1.25,
                  borderWidth: 1,
                  borderColor: theme.color.border,
                  borderRadius: theme.borderRadius.lg,
                  backgroundColor: 'transparent',
                }}
              >
                <Text
                  style={{
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.xs,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {theme.i18n.t(item.labelKey)}
                </Text>

                <Text
                  style={{
                    marginTop: 4,
                    color: item.color,
                    fontSize: theme.fontSize.lg,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.number,
                  }}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
