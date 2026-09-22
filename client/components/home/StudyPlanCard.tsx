import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import type { StudyPlan } from '../../common/types/types';


export function StudyPlanCard({ plan }: { plan: StudyPlan | null }) {
  const router = useRouter();
  const { theme } = useTheme();

  const todayKey = new Date().toISOString().slice(0, 10);
  const nextSession = plan
    ? (plan.sessions.find(
        (s) => s.status === 'pending' && s.scheduledDate >= todayKey
      ) ?? plan.sessions.find((s) => s.status === 'pending'))
    : null;

  const title = plan
    ? theme.i18n.t('studyPlan.home.continueTitle')
    : theme.i18n.t('studyPlan.home.createTitle');

  const subtitle = plan
    ? nextSession
      ? theme.i18n.t('studyPlan.home.nextSessionSubtitle', { subject: nextSession.subject, xp: nextSession.xpReward })
      : theme.i18n.t('studyPlan.home.allDoneSubtitle')
    : theme.i18n.t('studyPlan.home.createSubtitle');

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push('/studyPlan')}
      style={{
        gap: theme.space.sm * 1.25,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: theme.space.md * 0.5,
        paddingBottom: theme.space.md * 0.75,
        paddingHorizontal: theme.space.sm * 1.25,
        borderWidth: 1.5,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.color.card,
        boxShadow: theme.isDark ? '0px 8px 20px rgba(0,0,0,0.22)' : '0px 8px 18px rgba(15,23,42,0.06)',
      }}
    >
      <View
        style={{
          width: theme.space.xl * 1.25,
          height: theme.space.xl * 1.25,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.color.accent + '18',
        }}
      >
        <Feather name='calendar' size={theme.fontSize.lg * 1.25} color={theme.color.accent} />
      </View>

      <View style={{ flex: 1, gap: theme.space.xs * 0.5 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: theme.fontSize.md * 0.95,
            color: theme.color.textPrimary,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {title}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontSize: theme.fontSize.sm,
            color: theme.color.textMuted,
            fontFamily: theme.fontFamily.number,
          }}
        >
          {subtitle}
        </Text>

        {plan && (
          <View
            style={{
              overflow: 'hidden',
              height: theme.space.xs * 0.7,
              marginTop: theme.space.xs * 0.5,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.border,
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, plan.preparationPercent))}%`,
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.accent,
              }}
            />
          </View>
        )}
      </View>

      <Feather
        name='chevron-right'
        size={theme.fontSize.lg}
        color={theme.color.textSecondary}
      />
    </TouchableOpacity>
  );
}
