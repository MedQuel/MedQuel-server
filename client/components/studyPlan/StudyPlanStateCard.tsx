import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


interface StudyPlanStateCardProps {
  variant: 'empty' | 'error';
  onAction: () => void;
}

export function StudyPlanStateCard({ variant, onAction }: StudyPlanStateCardProps) {
  const { theme } = useTheme();
  const isEmpty = variant === 'empty';

  return (
    <View
      style={{
        flex: 1,
        gap: theme.space.md,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.space.lg,
      }}
    >
      <View style={{ padding: theme.space.lg, borderRadius: theme.borderRadius.full, backgroundColor: theme.color.accent + '15' }}>
        <Feather
          name={isEmpty ? 'calendar' : 'alert-triangle'}
          size={theme.space.xxl}
          color={theme.color.accent}
        />
      </View>

      <Text
        style={{
          textAlign: 'center',
          fontSize: theme.fontSize.lg,
          color: theme.color.textPrimary,
          fontFamily: theme.fontFamily.bold,
        }}
      >
        {theme.i18n.t(isEmpty ? 'studyPlan.empty.title' : 'studyPlan.error.title')}
      </Text>
      <Text
        style={{
          maxWidth: '85%',
          textAlign: 'center',
          fontSize: theme.fontSize.sm,
          color: theme.color.textMuted,
          fontFamily: theme.fontFamily.regular,
        }}
      >
        {theme.i18n.t(isEmpty ? 'studyPlan.empty.subtitle' : 'studyPlan.error.subtitle')}
      </Text>

      <TouchableOpacity
        onPress={onAction}
        style={{
          marginTop: theme.space.sm,
          paddingVertical: theme.space.sm * 1.25,
          paddingHorizontal: theme.space.lg,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.color.accent,
        }}
      >
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.sm + 1,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {theme.i18n.t(isEmpty ? 'studyPlan.empty.cta' : 'studyPlan.error.cta')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
