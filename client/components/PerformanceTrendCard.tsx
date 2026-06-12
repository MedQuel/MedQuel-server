import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';

export type PerformanceTrendCardProps = { accuracy?: number; data?: number[] } & ViewStyle;

const defaultData = [42, 58, 36, 72, 52, 88, 84];

export function PerformanceTrendCard({ accuracy = 87, data = defaultData, ...style }: PerformanceTrendCardProps) {
  const { theme } = useTheme();

  const weekDays = [
    theme.i18n.t('components.PerformanceTrendCard.days.mon'),
    theme.i18n.t('components.PerformanceTrendCard.days.tue'),
    theme.i18n.t('components.PerformanceTrendCard.days.wed'),
    theme.i18n.t('components.PerformanceTrendCard.days.thu'),
    theme.i18n.t('components.PerformanceTrendCard.days.fri'),
    theme.i18n.t('components.PerformanceTrendCard.days.sat'),
    theme.i18n.t('components.PerformanceTrendCard.days.sun'),
  ];

  const maxValue = Math.max(...data);

  return (
    <View
      style={{
        backgroundColor: theme.color.card,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.color.border,
        padding: theme.space.lg,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: theme.isDark ? 0.2 : 0.05,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
        ...style,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.xl,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {theme.i18n.t('components.PerformanceTrendCard.title')}
          </Text>

          <Text
            style={{
              marginTop: 4,
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {theme.i18n.t('components.PerformanceTrendCard.subtitle')}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.isDark ? 'rgba(16,185,129,0.16)' : 'rgba(16,185,129,0.10)',
            paddingHorizontal: theme.space.md,
            paddingVertical: theme.space.sm,
            borderRadius: theme.borderRadius.lg,
          }}
        >
          <MaterialCommunityIcons name="trending-up" size={16} color="#16A34A" />

          <Text
            style={{
              marginLeft: 4,
              color: '#16A34A',
              fontSize: theme.fontSize.md,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {accuracy}%
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: theme.space.xl,
          height: 230,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        {data.map((value, index) => {
          const isLatest = index === data.length - 1;
          const barHeight = Math.max((value / maxValue) * 120, 40);

          return (
            <View
              key={`${index}-${value}`}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <View
                style={{
                  alignSelf: 'stretch',
                  marginHorizontal: 6,
                  height: barHeight,
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: isLatest
                    ? theme.color.accent
                    : theme.isDark
                    ? 'rgba(59,123,248,0.32)'
                    : 'rgba(37,99,235,0.18)',
                  ...(isLatest
                    ? {
                        shadowColor: theme.color.accent,
                        shadowOpacity: 0.45,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 0 },
                        elevation: 10,
                      }
                    : {}),
                }}
              />

              <Text
                style={{
                  marginTop: theme.space.md,
                  color: isLatest ? theme.color.accent : theme.color.textSecondary,
                  fontSize: theme.fontSize.sm,
                  fontWeight: isLatest ? theme.fontWeight.bold : theme.fontWeight.medium,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {weekDays[index]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}