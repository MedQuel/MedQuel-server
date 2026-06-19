import React from 'react';
import { Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';

type StatKey = 'accuracy' | 'streak' | 'questions';

type Props = {
  accuracy: number;
  streak: number;
  questions: number;
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
  questions: (size, color) => <Feather name="check-square" size={size} color={color} />,
};

const withAlpha = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(ch => ch + ch).join('') : clean.slice(0, 6);
  const int = Number.parseInt(full, 16);
  // eslint-disable-next-line no-bitwise
  return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`;
};

export function AnalyticsStatsCard({ accuracy, streak, questions }: Props) {
  const { theme } = useTheme();

  const stats: StatItem[] = [
    {
      key: 'accuracy',
      label: theme.i18n.t('components.AnalyticsStatsCard.accuracy'),
      value: `${accuracy}%`,
      color: theme.color.accent,
      valueColor: theme.color.textPrimary,
      background: theme.color.card,
      border: theme.color.border,
      shadowColor: theme.color.accent,
    },
    {
      key: 'streak',
      label: theme.i18n.t('components.AnalyticsStatsCard.streak'),
      value: String(streak),
      color: theme.color.error,
      valueColor: theme.color.success,
      background: withAlpha(theme.color.success, theme.isDark ? 0.09 : 0.12),
      border: withAlpha(theme.color.success, theme.isDark ? 0.24 : 0.30),
      shadowColor: theme.color.success,
    },
    {
      key: 'questions',
      label: theme.i18n.t('components.AnalyticsStatsCard.questions'),
      value: String(questions),
      color: theme.color.success,
      valueColor: theme.color.textPrimary,
      background: theme.color.card,
      border: theme.color.border,
      shadowColor: theme.color.success,
    },
  ];

  return (
    <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
      {stats.map(item => (
        <View
          key={item.key}
          style={{
            flex: 1,
            minHeight: 112,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: theme.space.sm,
            paddingVertical: theme.space.md,
            borderRadius: theme.borderRadius.xl,
            borderWidth: 1.5,
            borderColor: item.border,
            backgroundColor: item.background,
            shadowColor: item.shadowColor,
            shadowOpacity: theme.isDark ? 0.12 : 0.05,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          }}
        >
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {icons[item.key](27, item.color)}
          </View>

          <Text
            style={{
              marginTop: theme.space.sm,
              color: item.valueColor,
              fontSize: theme.fontSize.xxl,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {item.value}
          </Text>

          <Text
            style={{
              marginTop: 2,
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