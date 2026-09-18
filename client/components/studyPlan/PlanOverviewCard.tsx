import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeContext';
import type { StudyPlan } from '../../common/types/types';


function daysUntil(isoDate: string): number {
  return Math.max(0, Math.ceil((new Date(isoDate).getTime()-Date.now()) / 86400000));
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}


export function PlanOverviewCard({ plan }: { plan: StudyPlan }) {
  const { theme } = useTheme();
  const progress = Math.max(0, Math.min(plan.preparationPercent, 100));

  return (
    <View
      style={{
        overflow: 'hidden',
        position: 'relative',
        padding: theme.space.md,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.isDark ? theme.color.card : theme.color.accent,
      }}
    >
      {plan.examDate && (
        <View
          style={{
            position: 'absolute',
            right: -theme.space.lg,
            top: -theme.space.lg,
            width: theme.space.xxl * 3.2,
            height: theme.space.xxl * 3.2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.surface,
              opacity: theme.isDark ? 0.25 : 0.12,
            }}
          />

          <Text
            style={{
              color: theme.color.warning,
              fontSize: theme.fontSize.xxxl * 1.5,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {daysUntil(plan.examDate)}
          </Text>
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.md,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {theme.i18n.t('studyPlan.overview.daysLeft')}
          </Text>
        </View>
      )}

      <View
        style={{
          gap: theme.space.sm,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.space.sm,
        }}
      >
        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.md,
            fontFamily: theme.fontFamily.light,
          }}
        >
          {theme.i18n.t('studyPlan.overview.targetExam')}
        </Text>

        <View
          style={{
            paddingVertical: theme.space.xs * 0.5,
            paddingHorizontal: theme.space.sm,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.surface,
            opacity: theme.isDark ? 1 : 0.85,
          }}
        >
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('studyPlan.overview.weekBadge', { number: plan.currentWeekNumber })}
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={2}
        style={{
          maxWidth: '65%',
          color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
          fontSize: theme.fontSize.xxxl,
          fontWeight: theme.fontWeight.bold,
          fontFamily: theme.fontFamily.regular,
          marginBottom: theme.space.sm,
        }}
      >
        {plan.targetExam}
      </Text>

      <View
        style={{
          gap: theme.space.xs,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.space.md,
        }}
      >
        <Feather
          name='calendar'
          size={theme.fontSize.md}
          color={theme.color.textMuted}
        />
        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.md,
            fontFamily: theme.fontFamily.number,
          }}
        >
          {plan.examDate ? formatDate(plan.examDate) : theme.i18n.t('studyPlan.overview.noExamDate')}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.space.sm,
        }}
      >
        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.md,
            fontFamily: theme.fontFamily.light,
          }}
        >
          {theme.i18n.t('studyPlan.overview.preparation')}
        </Text>
        <Text
          style={{
            color: theme.isDark ? theme.color.card : theme.color.accent,
            fontSize: theme.fontSize.xl,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.number,
          }}
        >
          {progress}%
        </Text>
      </View>

      <View
        style={{
          overflow: 'hidden',
          height: theme.space.sm,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.isDark ? theme.color.border : theme.color.textInverse + '55',
        }}
      >
        <View
          style={{
            width: `${Math.max(progress, 2)}%`,
            height: '100%',
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.isDark ? theme.color.info : theme.color.textInverse,
          }}
        />
      </View>

      {plan.generatedBy === 'fallback' && (
        <View
          style={{
            gap: theme.space.xs,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.space.sm,
          }}
        >
          <Feather
            name='info'
            size={theme.fontSize.sm}
            color={theme.color.textMuted}
          />
          <Text
            style={{
              flex: 1,
              color: theme.color.textMuted,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {theme.i18n.t('studyPlan.overview.fallbackNotice')}
          </Text>
        </View>
      )}
    </View>
  );
}
