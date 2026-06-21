import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';

type GoalProgressCardProps = {
  examName: string;
  examDate: string;
  preparationPercent: number;
  daysLeft: number;
};

export function GoalProgressCard({
  examName,
  examDate,
  preparationPercent,
  daysLeft,
}: GoalProgressCardProps) {
  const { theme } = useTheme();

  const actualProgress = Math.max(
    0,
    Math.min(preparationPercent, 100)
  );

  const progress = Math.min(
    actualProgress === 0 ? 1 : actualProgress,
    100
  );

  const cardBackground = theme.isDark
    ? theme.color.card
    : theme.color.accent;

  const cardTextColor = theme.isDark
    ? theme.color.textPrimary
    : theme.color.textInverse;

  const cardMutedColor = theme.isDark
    ? theme.color.textSecondary
    : theme.color.textInverse + 'CC';

  return (
    <View
      style={{
        backgroundColor: cardBackground,
        borderRadius: theme.borderRadius.xl,
        padding: theme.space.xl,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Decorative Circle */}
      <View
        style={{
          position: 'absolute',

          right: -theme.space.xl,
          top: -theme.space.xl,

          width: theme.space.xxl * 4,
          height: theme.space.xxl * 4,

          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Circle Background */}
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

            fontWeight:
              theme.fontWeight.bold.toString() as any,

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

      {/* Header */}
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

          color: cardTextColor,

          fontSize: theme.fontSize.xxxl,

          fontWeight:
            theme.fontWeight.bold.toString() as any,

          fontFamily: theme.fontFamily.regular,

          marginBottom: theme.space.md,
        }}
      >
        {examName}
      </Text>

      {/* Date */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',

          gap: theme.space.xs,

          marginBottom: theme.space.lg,
        }}
      >
        <Feather
          name="calendar"
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

      {/* Progress Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
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
          Preparation
        </Text>

        <Text
          style={{
            color: cardTextColor,

            fontSize: theme.fontSize.xl,

            fontWeight:
              theme.fontWeight.bold.toString() as any,

            fontFamily: theme.fontFamily.number,
          }}
        >
          {actualProgress}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View
        style={{
          height: theme.space.sm,

          borderRadius: theme.borderRadius.full,

          overflow: 'hidden',

          backgroundColor: theme.isDark
            ? theme.color.border
            : theme.color.textInverse + '55',
        }}
      >
       <View
  style={{
    width: `${progress}%`,

    height: '100%',

    borderRadius: theme.borderRadius.full,

    backgroundColor: theme.isDark
      ? theme.color.info
      : theme.color.textInverse,
  }}
/>
      </View>
    </View>
  );
}