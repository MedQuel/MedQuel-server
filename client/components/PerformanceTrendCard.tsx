import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


type Accuracy = {
  mon?: number;
  tue?: number;
  wed?: number;
  thu?: number;
  fri?: number;
  sat?: number;
  sun?: number;
};
type PerformanceTrendCardProps = {
  accuracy: Accuracy;
};

const calculateTrend = (accuracy: Accuracy): number => {
  const values = Object.values(accuracy);
  if (values.length < 2) return 0;

  let slope = 0;
  let x_mean = 0;
  let y_mean = 0;
  let x_diff_squared = 0;
  let xy_diff_product = 0;

  values.forEach((value, index) => {
    x_mean += index + 1;
    y_mean += value;
  });
  x_mean /= values.length;
  y_mean /= values.length;

  values.forEach((value, i) => {
    let x_diff = i + 1 - x_mean;
    let y_diff = value;

    xy_diff_product += x_diff * y_diff;
    x_diff_squared += x_diff * x_diff;
  });
  slope = xy_diff_product / x_diff_squared;

  return (slope / y_mean) * 100; // Return percentage change per day
};


export function PerformanceTrendCard({ accuracy }: PerformanceTrendCardProps) {
  const { theme } = useTheme();

  const maxValue = Math.max(...Object.values(accuracy));
  const trend = calculateTrend(accuracy);
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
      style={{
        gap: theme.space.md,
        flexDirection: 'column',
        padding: theme.space.md,
        borderWidth: 1.5,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
        boxShadow: theme.isDark
          ? '0 6px 14px rgba(0,0,0,0.2)'
          : '0 6px 14px rgba(0,0,0,0.05)',
      }}
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, gap: theme.space.xs }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {theme.i18n.t('components.PerformanceTrendCard.title')}
          </Text>
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {theme.i18n.t('components.PerformanceTrendCard.subtitle')}
          </Text>
        </View>

        <View
          style={{
            gap: theme.space.xs * 1.5,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.xs * 1.5,
            paddingHorizontal: theme.space.md * 0.75,
            borderRadius: theme.borderRadius.md,
            backgroundColor:
              trend >= 0
                ? theme.color.success + '22'
                : theme.color.error + '22',
          }}
        >
          <Feather
            name={trend >= 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color={trend >= 0 ? theme.color.success : theme.color.error}
          />
          <Text
            style={{
              color: trend >= 0 ? theme.color.success : theme.color.error,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {trend.toFixed(2)}%
          </Text>
        </View>
      </View>

      <View
        style={{
          gap: theme.space.md * 0.8,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        {Object.entries(accuracy).map(([day, value]) => {
          const isLatest = day === Object.keys(accuracy)[Object.keys(accuracy).length - 1];
          const barHeight = Math.max((value / maxValue) * 120, 40);

          return (
            <View
              key={day}
              style={{
                flex: 1,
                gap: theme.space.sm,
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <View
                style={{
                  height: barHeight,
                  alignSelf: 'stretch',
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: isLatest ? theme.color.accent + 'AA' : theme.color.textMuted + 'AA',
                  boxShadow: isLatest ? `0 0 12px ${theme.color.accent}45` : `0 0 12px ${theme.color.textMuted}45`,
                }}
              />

              <Text
                style={{
                  color: isLatest ? theme.color.accent + 'AA' : theme.color.textSecondary,
                  fontSize: theme.fontSize.xs * 1.05,
                  fontWeight: isLatest ? theme.fontWeight.bold : theme.fontWeight.medium,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {
                  weekDays[
                    day === 'mon' ? 0
                      : day === 'tue' ? 1
                        : day === 'wed' ? 2
                          : day === 'thu' ? 3
                            : day === 'fri' ? 4
                              : day === 'sat' ? 5 : 6
                  ]
                }
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
