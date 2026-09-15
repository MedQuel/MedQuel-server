import { useMemo, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

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
  heatmap?: { date: string; questionsAttempted?: number; minutesStudied?: number }[];
  label?: string;
};

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function ActivityHeatmapCard({ days, heatmap }: Props) {
  const { theme } = useTheme();

  // 0 = current month, 1 = 1 month ago, ... up to 5 = 5 months ago (max 6 months total history)
  const [monthOffset, setMonthOffset] = useState<number>(0);

  // Parse activity into a fast-lookup map: 'YYYY-MM-DD' -> { questions, minutes }
  const activityMap = useMemo(() => {
    const map = new Map<string, { questions: number; minutes: number }>();

    if (Array.isArray(heatmap)) {
      heatmap.forEach((entry) => {
        if (!entry?.date) return;
        const key = entry.date.split('T')[0];
        if (key) {
          const current = map.get(key) || { questions: 0, minutes: 0 };
          map.set(key, {
            questions: current.questions + (entry.questionsAttempted || 0),
            minutes: current.minutes + (entry.minutesStudied || 0),
          });
        }
      });
    }

    if (Array.isArray(days)) {
      days.forEach((entry) => {
        if (!entry?.date) return;
        const key = entry.date.split('T')[0];
        if (key) {
          const current = map.get(key) || { questions: 0, minutes: 0 };
          map.set(key, {
            questions: Math.max(current.questions, entry.questionsAttempted || (entry.level > 0 ? entry.level * 5 : 0)),
            minutes: Math.max(current.minutes, entry.minutesStudied || (entry.level > 0 ? entry.level * 8 : 0)),
          });
        }
      });
    }

    return map;
  }, [heatmap, days]);

  // Target month calculation based on real date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Month being viewed
  const viewDate = useMemo(() => {
    return new Date(currentYear, currentMonth - monthOffset, 1);
  }, [currentYear, currentMonth, monthOffset]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const monthName = useMemo(() => {
    return viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  }, [viewDate]);

  // Today ISO string for reference
  const todayKey = useMemo(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Calendar days generation for viewYear/viewMonth
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun, 6 = Sat

    const result: Array<{
      dayNumber: number;
      dateKey: string;
      isCurrentMonth: boolean;
      hasActivity: boolean;
      questions: number;
      minutes: number;
      isToday: boolean;
    } | null> = [];

    // Leading empty padding slots before first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      result.push(null);
    }

    // Days in month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const activityData = activityMap.get(dateKey);
      const hasActivity = Boolean(activityData && activityData.questions > 0);

      result.push({
        dayNumber: d,
        dateKey,
        isCurrentMonth: true,
        hasActivity,
        questions: activityData?.questions || 0,
        minutes: activityData?.minutes || 0,
        isToday: dateKey === todayKey,
      });
    }

    return result;
  }, [viewYear, viewMonth, activityMap, todayKey]);

  // Total active days in this month
  const activeDaysThisMonth = useMemo(() => {
    return calendarDays.filter((d) => d && d.hasActivity).length;
  }, [calendarDays]);

  // Selected day for inspection
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const selectedDayInfo = useMemo(() => {
    if (!selectedDateKey) return null;
    return calendarDays.find((d) => d?.dateKey === selectedDateKey) || null;
  }, [selectedDateKey, calendarDays]);

  const canGoPrevious = monthOffset < 5; // Max 6 months history (0..5)
  const canGoNext = monthOffset > 0; // Cannot view future months

  return (
    <View
      style={{
        padding: theme.space.md,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.color.border,
        backgroundColor: theme.color.card,
      }}
    >
      {/* Header: Title & Total Month Stats */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.space.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
          <MaterialCommunityIcons name="fire" size={theme.space.md * 1.25} color={theme.color.warning} />
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.md,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('components.ActivityHeatmapCard.title') || 'Activity Calendar'}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: theme.space.sm,
            paddingVertical: theme.space.xs * 0.5,
            borderRadius: theme.borderRadius.full,
            backgroundColor: withAlpha(theme.color.warning, 0.12),
            borderWidth: 1,
            borderColor: withAlpha(theme.color.warning, 0.25),
          }}
        >
          <MaterialCommunityIcons name="lightning-bolt" size={13} color={theme.color.warning} />
          <Text
            style={{
              color: theme.color.warning,
              fontSize: theme.fontSize.xs,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {`${activeDaysThisMonth} ${activeDaysThisMonth === 1 ? 'Day' : 'Days'} Active`}
          </Text>
        </View>
      </View>

      {/* Month Navigator (< MONTH YYYY >) */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: theme.space.xs * 0.75,
          paddingHorizontal: theme.space.sm,
          marginBottom: theme.space.sm,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: withAlpha(theme.color.border, 0.35),
        }}
      >
        <TouchableOpacity
          disabled={!canGoPrevious}
          onPress={() => setMonthOffset((prev) => Math.min(5, prev + 1))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{
            padding: theme.space.xs,
            opacity: canGoPrevious ? 1 : 0.3,
          }}
        >
          <Feather name="chevron-left" size={18} color={theme.color.textPrimary} />
        </TouchableOpacity>

        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.xs * 1.15,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.bold,
            letterSpacing: 0.8,
          }}
        >
          {monthName}
        </Text>

        <TouchableOpacity
          disabled={!canGoNext}
          onPress={() => setMonthOffset((prev) => Math.max(0, prev - 1))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{
            padding: theme.space.xs,
            opacity: canGoNext ? 1 : 0.3,
          }}
        >
          <Feather name="chevron-right" size={18} color={theme.color.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Day of Week Labels (S M T W T F S) */}
      <View
        style={{
          flexDirection: 'row',
          marginBottom: theme.space.xs,
        }}
      >
        {DAY_LABELS.map((dayLabel, idx) => (
          <Text
            key={`header-${idx}`}
            style={{
              flex: 1,
              textAlign: 'center',
              color: idx === 0 || idx === 6 ? theme.color.warning : theme.color.textMuted,
              fontSize: theme.fontSize.xs,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {dayLabel}
          </Text>
        ))}
      </View>

      {/* Monthly Calendar Grid */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {calendarDays.map((item, idx) => {
          if (!item) {
            return (
              <View
                key={`empty-${idx}`}
                style={{
                  width: '14.285%',
                  aspectRatio: 1,
                  padding: 2,
                }}
              />
            );
          }

          const isSelected = selectedDateKey === item.dateKey;
          const hasActivity = item.hasActivity;

          return (
            <View
              key={item.dateKey}
              style={{
                width: '14.285%',
                aspectRatio: 1,
                padding: 2,
              }}
            >
              <Pressable
                onPress={() => setSelectedDateKey(item.dateKey === selectedDateKey ? null : item.dateKey)}
                style={({ pressed }) => ({
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: theme.borderRadius.full,
                  borderWidth: isSelected ? 1.5 : item.isToday ? 1 : hasActivity ? 1.5 : 0,
                  borderColor: isSelected
                    ? theme.color.accent
                    : item.isToday
                    ? withAlpha(theme.color.accent, 0.6)
                    : hasActivity
                    ? theme.color.warning
                    : 'transparent',
                  backgroundColor: hasActivity
                    ? withAlpha(theme.color.warning, 0.18)
                    : isSelected
                    ? withAlpha(theme.color.accent, 0.12)
                    : 'transparent',
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                {hasActivity ? (
                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons
                      name="fire"
                      size={11}
                      color={theme.color.warning}
                      style={{ marginBottom: -1 }}
                    />
                    <Text
                      style={{
                        color: theme.color.warning,
                        fontSize: theme.fontSize.xs,
                        fontWeight: theme.fontWeight.bold,
                        fontFamily: theme.fontFamily.number,
                      }}
                    >
                      {item.dayNumber}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={{
                      color: item.isToday ? theme.color.accent : theme.color.textSecondary,
                      fontSize: theme.fontSize.xs,
                      fontWeight: item.isToday ? theme.fontWeight.bold : theme.fontWeight.regular,
                      fontFamily: theme.fontFamily.regular,
                    }}
                  >
                    {item.dayNumber}
                  </Text>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Selected Day Inspector */}
      {selectedDayInfo && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: theme.space.md,
            paddingVertical: theme.space.xs * 1.25,
            paddingHorizontal: theme.space.sm * 1.2,
            backgroundColor: withAlpha(theme.color.border, 0.35),
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
              {selectedDayInfo.dateKey}
            </Text>
          </View>

          <Text
            style={{
              color: selectedDayInfo.hasActivity ? theme.color.warning : theme.color.textMuted,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.bold,
              fontWeight: theme.fontWeight.bold,
            }}
          >
            {selectedDayInfo.hasActivity
              ? `${selectedDayInfo.questions} Questions Completed`
              : 'No quizzes on this day'}
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
          {`Max 6-month activity history`}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: theme.borderRadius.full,
              backgroundColor: withAlpha(theme.color.warning, 0.3),
              borderWidth: 1,
              borderColor: theme.color.warning,
            }}
          />
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.xs * 0.9,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            Completed Contest
          </Text>
        </View>
      </View>
    </View>
  );
}