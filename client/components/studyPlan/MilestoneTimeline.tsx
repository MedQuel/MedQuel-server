import { View, Text, ScrollView } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import type { StudyPlan } from '../../common/types/types';


export function MilestoneTimeline({ plan }: { plan: StudyPlan }) {
  const { theme } = useTheme();

  return (
    <View>
      <Text
        style={{
          color: theme.color.textPrimary,
          fontSize: theme.fontSize.md,
          fontFamily: theme.fontFamily.bold,
          marginBottom: theme.space.sm,
        }}
      >
        {theme.i18n.t('studyPlan.milestones.title')}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.space.sm }}
      >
        {plan.milestones.map((m) => {
          const isCurrent = plan.currentWeekNumber >= m.startWeek && (m.endWeek === null || plan.currentWeekNumber <= m.endWeek);
          return (
            <View
              key={m.label}
              style={{
                width: 180,
                padding: theme.space.md,
                borderWidth: 1.5,
                borderRadius: theme.borderRadius.lg,
                borderColor: isCurrent ? theme.color.accent : theme.color.border,
                backgroundColor: isCurrent ? theme.color.accent + '10' : theme.color.card,
              }}
            >
              <Text
                style={{
                  color: isCurrent ? theme.color.accent : theme.color.textMuted,
                  fontSize: theme.fontSize.xs,
                  fontFamily: theme.fontFamily.bold,
                  marginBottom: theme.space.xs,
                }}
              >
                {m.label}
              </Text>
              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.sm + 1,
                  fontFamily: theme.fontFamily.bold,
                  marginBottom: theme.space.xs,
                }}
              >
                {m.phase}
              </Text>
              <Text
                numberOfLines={3}
                style={{
                  color: theme.color.textMuted,
                  fontSize: theme.fontSize.xs,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {m.description}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
