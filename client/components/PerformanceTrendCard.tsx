import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export type PerformanceTrendCardProps = {
  data?: number[];
  accuracy?: number;
} & ViewStyle;

const defaultData = [35, 52, 28, 68, 46, 82, 78];

export function PerformanceTrendCard({ data = defaultData, accuracy = 87, ...style }: PerformanceTrendCardProps) {
  const { theme } = useTheme();

  const maxValue = Math.max(...data, 1);

  const weekDays = [
    theme.i18n.t('components.PerformanceTrendCard.days.mon'),
    theme.i18n.t('components.PerformanceTrendCard.days.tue'),
    theme.i18n.t('components.PerformanceTrendCard.days.wed'),
    theme.i18n.t('components.PerformanceTrendCard.days.thu'),
    theme.i18n.t('components.PerformanceTrendCard.days.fri'),
    theme.i18n.t('components.PerformanceTrendCard.days.sat'),
    theme.i18n.t('components.PerformanceTrendCard.days.sun'),
  ];

  return (
    <View
      style={[
        {
          backgroundColor: theme.color.card,
          borderRadius: theme.borderRadius.xl,
          borderWidth: 1,
          borderColor: theme.color.border,
          padding: theme.space.lg,
          overflow: 'hidden',
          boxShadow: '0 8px 20px rgba(0,0,0,0.10)',
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: 18,
              fontWeight: '700',
            }}
          >
            {theme.i18n.t('components.PerformanceTrendCard.title')}
          </Text>

          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: 13,
              marginTop: 4,
            }}
          >
            {theme.i18n.t('components.PerformanceTrendCard.subtitle')}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: theme.color.success + '20',
            borderRadius: theme.borderRadius.lg,
            paddingHorizontal: 14,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: theme.color.success,
              fontSize: 18,
              marginRight: 6,
            }}
          >
            ↗
          </Text>

          <Text
            style={{
              color: theme.color.success,
              fontSize: 14,
              fontWeight: '700',
            }}
          >
            {accuracy}%
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: theme.space.xl,
          height: 170,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        {data.map((value, index) => {
          const isLatest = index === data.length - 1;
          const barHeight = Math.max((value / maxValue) * 115, 40);

          return (
            <View
              key={index}
              style={{
                flex: 1,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  alignSelf: 'stretch',
                  marginHorizontal: 5,
                  height: barHeight,
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: isLatest
                    ? theme.color.accent
                    : theme.isDark
                      ? 'rgba(59,123,248,0.28)'
                      : 'rgba(37,99,235,0.18)',

                  ...(isLatest &&
                    theme.isDark && {
                      boxShadow: `0 0 14px ${theme.color.accent}`,
                    }),
                }}
              />

              <Text
                style={{
                  marginTop: 12,
                  color: isLatest ? theme.color.accent : theme.color.textSecondary,
                  fontSize: 12,
                  fontWeight: isLatest ? '700' : '500',
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

export default PerformanceTrendCard;