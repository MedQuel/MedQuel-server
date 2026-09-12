import React from 'react';
import { Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import { withAlpha } from '../common/utils/withAlpha';


type StatKey = 'accuracy' | 'streak' | 'questions';
type Props = {
  accuracy: number;
  streak: number;
  questions?: number;
  totalQuestions?: number;
  totalCorrect?: number;
};
type StatItem = {
  key: StatKey;
  label: string;
  value: string;
  color: string;
  valueColor: string;
  background: string;
  border: string;
  shadowColor: string;
};

const icons: Record<StatKey, (size: number, color: string) => React.ReactNode> = {
  accuracy: (size, color) => <Feather name="target" size={size} color={color} />,
  streak: (size, color) => <MaterialCommunityIcons name="fire" size={size} color={color} />,
  questions: (size, color) => <Feather name="help-circle" size={size} color={color} />,
};


export function AnalyticsStatsCard({ accuracy, streak, questions, totalQuestions, totalCorrect }: Props) {
  const { theme } = useTheme();
  const questionsValue = questions ?? totalQuestions ?? totalCorrect ?? 0;

  const stats: StatItem[] = [
    {
      key: 'accuracy',
      label: theme.i18n.t('components.AnalyticsStatsCard.accuracy') || 'Accuracy',
      value: `${accuracy}%`,
      color: theme.color.accent,
      valueColor: theme.color.textPrimary,
      background: theme.color.card,
      border: theme.color.border,
      shadowColor: theme.color.accent,
    },
    {
      key: 'streak',
      label: theme.i18n.t('components.AnalyticsStatsCard.streak') || 'Streak',
      value: String(streak),
      color: theme.color.error,
      valueColor: theme.color.success,
      background: withAlpha(theme.color.success, theme.isDark ? 0.09 : 0.12),
      border: withAlpha(theme.color.success, theme.isDark ? 0.24 : 0.30),
      shadowColor: theme.color.success,
    },
    {
      key: 'questions',
      label: theme.i18n.t('components.AnalyticsStatsCard.questions') || 'Total Questions',
      value: String(questionsValue),
      color: theme.color.info,
      valueColor: theme.color.textPrimary,
      background: theme.color.card,
      border: theme.color.border,
      shadowColor: theme.color.info,
    },
  ];

  return (
    <View style={{ flexDirection: 'row', gap: theme.space.xs * 1.5 }}>
      {stats.map(item => (
        <View
          key={item.key}
          style={{
            flex: 1,
            minHeight: 92,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.sm * 1.1,
            paddingHorizontal: theme.space.xs,
            borderWidth: 1,
            borderColor: item.border,
            borderRadius: theme.borderRadius.lg,
            elevation: 2,
            boxShadow: `0px 4px 10px ${withAlpha(item.shadowColor, theme.isDark ? 0.12 : 0.05)}`,
            backgroundColor: item.background,
          }}
        >
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {icons[item.key](21, item.color)}
          </View>

          <Text
            style={{
              color: item.valueColor,
              fontSize: theme.fontSize.lg + 2,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.number,
              marginTop: theme.space.xs,
            }}
          >
            {item.value}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              marginTop: theme.space.xs * 0.25,
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
