import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


type TrendPoint = {
  date: string;
  accuracy: number | null;
};
type PerformanceTrendCardProps = {
  data: TrendPoint[];
};

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const MIN_BAR_HEIGHT = 10;
const MAX_BAR_HEIGHT = 120;

function weekdayKeyForDate(dateStr: string): (typeof WEEKDAY_KEYS)[number] {
  const day = new Date(`${dateStr}T00:00:00Z`).getUTCDay();
  if (!Number.isInteger(day) || day < 0 || day > 6) return 'sun';
  return WEEKDAY_KEYS[day]!;
}

function calculateTrend(points: TrendPoint[]): number | null {
  const known = points
    .map((p, i) => ({ x: i+1, y: p.accuracy }))
    .filter((p): p is { x: number; y: number } => p.y !== null);
  if (known.length < 2) return null;

  let xMean = 0;
  let yMean = 0;
  known.forEach((p) => {
    xMean += p.x;
    yMean += p.y;
  });
  xMean /= known.length;
  yMean /= known.length;

  let xyDiffProduct = 0;
  let xDiffSquared = 0;
  known.forEach((p) => {
    const xDiff = p.x - xMean;
    const yDiff = p.y - yMean;
    xyDiffProduct += xDiff * yDiff;
    xDiffSquared += xDiff * xDiff;
  });

  if (xDiffSquared === 0 || yMean === 0) return 0;
  const slope = xyDiffProduct / xDiffSquared;
  return (slope/yMean) * 100;
}


export function PerformanceTrendCard({ data }: PerformanceTrendCardProps) {
  const { theme } = useTheme();

  const knownValues = data
    .map((d) => d.accuracy)
    .filter((v): v is number => v !== null);
  const hasAnyActivity = knownValues.length > 0;
  const maxValue = hasAnyActivity ? Math.max(...knownValues, 1) : 1;
  const trend = calculateTrend(data);

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
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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

        {trend !== null && (
          <View
            style={{
              gap: theme.space.xs * 1.5,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.xs * 1.5,
              paddingHorizontal: theme.space.md * 0.75,
              borderRadius: theme.borderRadius.md,
              backgroundColor: trend >= 0 ? theme.color.success + '22' : theme.color.error + '22',
            }}
          >
            <Feather
              name={trend >= 0 ? 'trending-up' : 'trending-down'}
              size={theme.space.md}
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
        )}
      </View>

      {!hasAnyActivity ? (
        <View style={{ gap: theme.space.xs, alignItems: 'center', paddingVertical: theme.space.lg }}>
          <Feather
            name='bar-chart-2'
            size={theme.space.md + 2}
            color={theme.color.textMuted}
          />
          <Text
            style={{
              textAlign: 'center',
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {theme.i18n.t('components.PerformanceTrendCard.noActivity')}
          </Text>
        </View>
      ) : (
        <View
          style={{
            gap: theme.space.md * 0.8,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          {data.map((point, index) => {
            const isLatest = index === data.length-1;
            const isNoActivity = point.accuracy === null;
            const isZeroScore = point.accuracy === 0;

            const barHeight = isNoActivity
              ? MIN_BAR_HEIGHT
              : Math.max((point.accuracy!/maxValue) * MAX_BAR_HEIGHT, MIN_BAR_HEIGHT);

            const barColor = isNoActivity
              ? theme.color.textMuted + '33'
              : isLatest ? theme.color.accent + 'AA' : theme.color.textMuted + 'AA';

            return (
              <View
                key={point.date}
                style={{
                  flex: 1,
                  gap: theme.space.sm,
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                {!isNoActivity && (
                  <Text
                    style={{
                      color: isZeroScore ? theme.color.error : theme.color.textMuted,
                      fontSize: theme.fontSize.xs * 0.9,
                      fontFamily: theme.fontFamily.number,
                    }}
                  >
                    {Math.round(point.accuracy!)}%
                  </Text>
                )}

                <View
                  style={{
                    height: barHeight,
                    alignSelf: 'stretch',
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: barColor,
                    borderWidth: isNoActivity ? 1 : 0,
                    borderStyle: isNoActivity ? 'dashed' : 'solid',
                    borderColor: theme.color.textMuted + '55',
                    boxShadow: isNoActivity
                      ? undefined
                      : isLatest ? `0 0 12px ${theme.color.accent}45` : `0 0 12px ${theme.color.textMuted}45`,
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
                  {theme.i18n.t(`components.PerformanceTrendCard.days.${weekdayKeyForDate(point.date)}`)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
