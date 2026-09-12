import { useMemo, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { withAlpha } from '../common/utils/withAlpha';


export type HeatmapDayItem = {
  date: string;
  dayNumber?: number;
  dayOfWeek?: number;
  dayName?: string;
  formattedDate?: string;
  questionsAttempted?: number;
  minutesStudied?: number;
  level: number;
};
type Props = {
  month?: number;
  year?: number;
  activity?: number[];
  days?: HeatmapDayItem[];
  label?: string;
};

const resolveText = (translated: string, fallback: string) => {
  const value = String(translated ?? '').trim();
  return !value || value.includes('components.ActivityHeatmapCard') ? fallback : value;
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function ActivityHeatmapCard({ activity, days, label }: Props) {
  const { theme } = useTheme();

  const title = resolveText(
    theme.i18n.t('components.ActivityHeatmapCard.title'),
    'Activity Heatmap'
  );
  const less = resolveText(
    theme.i18n.t('components.ActivityHeatmapCard.less'),
    'Less'
  );
  const more = resolveText(
    theme.i18n.t('components.ActivityHeatmapCard.more'),
    'More'
  );

  // Normalize into standard 35 days (5 full weeks: Mon -> Sun)
  const normalizedDays: HeatmapDayItem[] = useMemo(() => {
    if (Array.isArray(days) && days.length > 0) {
      return days;
    }

    const now = new Date();
    const result: HeatmapDayItem[] = [];
    const sourceActivity = Array.isArray(activity) ? activity : [];

    // Construct 35 continuous days (5 weeks) ending on current week's Sunday
    const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon...
    const daysUntilEndOfWeek = (7 - (currentDayOfWeek === 0 ? 7 : currentDayOfWeek)) % 7;
    const endOfWeek = new Date(now.getTime() + daysUntilEndOfWeek * 86400000);

    for (let i = 34; i >= 0; i--) {
      const d = new Date(endOfWeek.getTime() - i * 86400000);
      const isoDate = d.toISOString().split('T')[0] ?? '';
      const dayIdx = 34 - i;
      const activityLevel = sourceActivity[dayIdx] ?? 0;

      result.push({
        date: isoDate,
        dayNumber: d.getDate(),
        dayOfWeek: d.getDay(),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        questionsAttempted: activityLevel > 0 ? activityLevel * 6 : 0,
        minutesStudied: activityLevel > 0 ? activityLevel * 8 : 0,
        level: Math.max(0, Math.min(4, activityLevel)),
      });
    }

    return result;
  }, [days, activity]);

  const [selectedDay, setSelectedDay] = useState<HeatmapDayItem | null>(() => {
    // Default to the last active day or today
    const lastActive = [...normalizedDays].reverse().find((d) => d.level > 0);
    return lastActive ?? normalizedDays[normalizedDays.length - 1] ?? null;
  });

  const activeDaysCount = useMemo(
    () => normalizedDays.filter((d) => d.level > 0).length,
    [normalizedDays]
  );

  const totalQuestionsAttempted = useMemo(
    () => normalizedDays.reduce((acc, d) => acc + (d.questionsAttempted || 0), 0),
    [normalizedDays]
  );

  const levelColor = (level: number) => {
    if (level <= 0) {
      return theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
    }
    const alphaMap = [0.05, 0.25, 0.45, 0.70, 0.95];
    const alpha = alphaMap[Math.min(level, 4)] ?? 0.95;
    return withAlpha(theme.color.accent, alpha);
  };

  const levelBorderColor = (level: number, isSelected: boolean) => {
    if (isSelected) {
      return theme.color.accent;
    }
    if (level > 0) {
      return withAlpha(theme.color.accent, theme.isDark ? 0.35 : 0.25);
    }
    return theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  };

  // Group into weeks (7 days per row)
  const weeks: HeatmapDayItem[][] = useMemo(() => {
    const rows: HeatmapDayItem[][] = [];
    for (let i = 0; i < normalizedDays.length; i += 7) {
      rows.push(normalizedDays.slice(i, i + 7));
    }
    return rows;
  }, [normalizedDays]);

  return (
    <View
      style={{
        padding: theme.space.md,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.color.border,
        backgroundColor: theme.color.card,
        elevation: 2,
        boxShadow: `0px 4px 12px ${withAlpha(theme.color.accent, theme.isDark ? 0.08 : 0.04)}`,
      }}
    >
      {/* Header with Title & Stats Pill */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.space.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
          <Feather name="activity" size={theme.fontSize.md} color={theme.color.accent} />
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.md * 1.05,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {title}
          </Text>
        </View>

        <View
          style={{
            paddingHorizontal: theme.space.sm * 0.9,
            paddingVertical: theme.space.xs * 0.5,
            borderRadius: theme.borderRadius.full,
            backgroundColor: withAlpha(theme.color.accent, theme.isDark ? 0.15 : 0.08),
            borderWidth: 1,
            borderColor: withAlpha(theme.color.accent, theme.isDark ? 0.25 : 0.15),
          }}
        >
          <Text
            style={{
              color: theme.color.accent,
              fontSize: theme.fontSize.xs * 0.95,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {label ?? `${activeDaysCount} Active Days`}
          </Text>
        </View>
      </View>

      {/* Weekday Labels Header (Mon -> Sun) */}
      <View
        style={{
          flexDirection: 'row',
          gap: 6,
          marginBottom: 6,
          paddingHorizontal: 2,
        }}
      >
        {DAY_LABELS.map((dayLabel, idx) => (
          <Text
            key={`header-${idx}`}
            style={{
              flex: 1,
              textAlign: 'center',
              color: idx >= 5 ? theme.color.accent : theme.color.textMuted,
              fontSize: theme.fontSize.xs * 0.85,
              fontWeight: idx >= 5 ? theme.fontWeight.bold : theme.fontWeight.regular,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {dayLabel}
          </Text>
        ))}
      </View>

      {/* Heatmap Grid (Weeks x Days) */}
      <View style={{ gap: 6, paddingHorizontal: 2 }}>
        {weeks.map((week, weekIdx) => (
          <View key={`week-${weekIdx}`} style={{ flexDirection: 'row', gap: 6 }}>
            {week.map((item, dayIdx) => {
              const isSelected = selectedDay?.date === item.date;

              return (
                <Pressable
                  key={item.date || `day-${weekIdx}-${dayIdx}`}
                  onPress={() => setSelectedDay(item)}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    borderRadius: 6,
                    backgroundColor: levelColor(item.level),
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: levelBorderColor(item.level, isSelected),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && (
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: item.level > 2 ? theme.color.textInverse : theme.color.accent,
                      }}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {/* Selected Day Quick Inspector */}
      {selectedDay && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: theme.space.md,
            paddingVertical: theme.space.xs * 1.25,
            paddingHorizontal: theme.space.sm * 1.2,
            backgroundColor: theme.color.surface,
            borderRadius: theme.borderRadius.lg,
            borderWidth: 1,
            borderColor: theme.color.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
            <Feather name="calendar" size={13} color={theme.color.accent} />
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.xs,
                fontFamily: theme.fontFamily.bold,
                fontWeight: theme.fontWeight.bold,
              }}
            >
              {selectedDay.formattedDate || selectedDay.date}
            </Text>
          </View>

          <Text
            style={{
              color: selectedDay.questionsAttempted ? theme.color.accent : theme.color.textMuted,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.bold,
              fontWeight: theme.fontWeight.bold,
            }}
          >
            {selectedDay.questionsAttempted
              ? `${selectedDay.questionsAttempted} Questions`
              : 'No activity'}
            {selectedDay.minutesStudied ? ` · ${selectedDay.minutesStudied}m` : ''}
          </Text>
        </View>
      )}

      {/* Footer Legend */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: theme.space.sm,
          paddingTop: theme.space.xs,
        }}
      >
        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.xs * 0.9,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {totalQuestionsAttempted > 0
            ? `${totalQuestionsAttempted} total Qs studied`
            : `${activeDaysCount} of ${normalizedDays.length} days active`}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.xs * 0.85,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {less}
          </Text>

          {[0, 1, 2, 3, 4].map((lvl) => (
            <View
              key={`legend-${lvl}`}
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                backgroundColor: levelColor(lvl),
                borderWidth: 1,
                borderColor: levelBorderColor(lvl, false),
              }}
            />
          ))}

          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.xs * 0.85,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {more}
          </Text>
        </View>
      </View>
    </View>
  );
}
