import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import { formatStudyTime } from '../common/utils/formatStudyTime';

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

export function AnalyticsKeyStatItems({
  totalCorrect,
  avgScore,
  bestSubject,
  studyHours,
  longestStreak,
  weakSubject,
}: Props) {
  const { theme } = useTheme();

  const formattedStudyHours = typeof studyHours === 'number' ? formatStudyTime(studyHours) : studyHours;

  const stats: StatItem[][] = [
    [
      { labelKey: 'components.AnalyticsKeyStatItems.total_correct', value: String(totalCorrect), color: theme.color.accent },
      { labelKey: 'components.AnalyticsKeyStatItems.avg_score', value: `${avgScore}/100`, color: theme.color.accent },
    ],
    [
      { labelKey: 'components.AnalyticsKeyStatItems.best_subject', value: bestSubject, color: theme.color.success },
      { labelKey: 'components.AnalyticsKeyStatItems.study_hours', value: formattedStudyHours, color: theme.color.warning },
    ],
    [
      { labelKey: 'components.AnalyticsKeyStatItems.longest_streak', value: `${longestStreak} days`, color: theme.color.warning },
      { labelKey: 'components.AnalyticsKeyStatItems.weak_subject', value: weakSubject, color: theme.color.error },
    ],
  ];

  return (
    <View
      style={{
        padding: theme.space.md,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.color.border,
        backgroundColor: theme.color.card,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm, marginBottom: theme.space.md }}>
        <Feather name="trending-up" size={theme.fontSize.lg} color={theme.color.accent} />
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
            {row.map(item => (
              <View
                key={item.labelKey}
                style={{
                  flex: 1,
                  padding: theme.space.sm,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.color.surface,
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