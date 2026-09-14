import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import type { StudyPlan } from '../../common/types/types';


interface StudyPlanHomeCardProps {
  plan: StudyPlan | null;
}

export function StudyPlanHomeCard({ plan }: StudyPlanHomeCardProps) {
  const router = useRouter();
  const { theme } = useTheme();

  const todayKey = new Date().toISOString().slice(0, 10);
  const nextSession = plan?.sessions.find(
    (s) => s.status === 'pending' && s.scheduledDate <= todayKey
  ) ?? plan?.sessions.find(
    (s) => s.status === 'pending'
  );

  return (
    <Pressable
      onPress={() => router.push('/studyPlan')}
      style={{
        gap: theme.space.md,
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.space.md,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
      }}
    >
      <View style={{ padding: theme.space.sm, borderRadius: theme.borderRadius.md, backgroundColor: theme.color.accent + '20' }}>
        <Feather
          name='calendar'
          size={theme.space.md * 1.2}
          color={theme.color.accent}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.sm + 1,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {theme.i18n.t(plan ? 'studyPlan.home.continueTitle' : 'studyPlan.home.createTitle')}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.xs,
            fontFamily: theme.fontFamily.regular,
            marginTop: theme.space.xs * 0.5,
          }}
        >
          {plan
            ? nextSession
              ? theme.i18n.t('studyPlan.home.nextSessionSubtitle', { subject: nextSession.subject, xp: nextSession.xpReward })
              : theme.i18n.t('studyPlan.home.allDoneSubtitle')
            : theme.i18n.t('studyPlan.home.createSubtitle')}
        </Text>
      </View>

      <Feather
        name='chevron-right'
        size={theme.space.md}
        color={theme.color.textMuted}
      />
    </Pressable>
  );
}
