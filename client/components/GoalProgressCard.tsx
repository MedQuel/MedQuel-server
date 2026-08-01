import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


export function GoalProgressCard({ examName, examDate, preparationPercent, daysLeft }: {
  examName: string;
  examDate: string;
  preparationPercent: number;
  daysLeft: number;
}) {
  const { theme } = useTheme();
  const actualProgress = Math.max(0, Math.min(preparationPercent, 100));
  const progress = Math.min(actualProgress === 0 ? 1 : actualProgress, 100);

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
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {daysLeft}
        </Text>
        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.md,
            fontFamily: theme.fontFamily.light,
          }}
        >
          days left
        </Text>
      </View>
      <Text
        style={{
          color: theme.color.textMuted,
          fontSize: theme.fontSize.md,
          fontFamily: theme.fontFamily.light,
          marginBottom: theme.space.sm,
        }}
      >
        Target Exam
      </Text>

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
        {examName}
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
            fontFamily: theme.fontFamily.light,
          }}
        >
          {examDate}
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
          Preparation
        </Text>
        <Text
          style={{
            color: theme.isDark ? theme.color.card : theme.color.accent,
            fontSize: theme.fontSize.xl,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.number,
          }}
        >
          {actualProgress}%
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
            width: `${progress}%`,
            height: '100%',
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.isDark ? theme.color.info : theme.color.textInverse,
          }}
        />
      </View>
    </View>
  );
}
