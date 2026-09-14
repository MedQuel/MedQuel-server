import { Feather } from '@expo/vector-icons';
import { View, Text, useWindowDimensions } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import type { StudyPlan, StudyPlanWeekday } from '../../common/types/types';


type DayStatus = 'completed' | 'current' | 'missed' | 'upcoming' | 'inactive';

const WEEKDAY_ORDER: StudyPlanWeekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const WEEKDAY_SHORT: Record<StudyPlanWeekday, string> = {
  mon: 'M',
  tue: 'T',
  wed: 'W',
  thu: 'T',
  fri: 'F',
  sat: 'S',
  sun: 'S',
};
const WEEKDAY_OFFSET: Record<StudyPlanWeekday, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};

function addDays(dateKey: string, n: number): string {
  const d = new Date(`${dateKey}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + n);

  return d.toISOString().slice(0, 10);
}


export function WeeklyDayTracker({ plan }: { plan: StudyPlan }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const todayKey = new Date().toISOString().slice(0, 10);

  const daySize = Math.min(42, (width - (theme.space.lg*2) - theme.space.xs*12) / 7);
  const iconSize = daySize * 0.45;

  const completedSessions = plan.sessions.filter((s) => s.status === 'completed');
  const xpEarned = completedSessions.reduce((sum, s) => sum+s.xpReward, 0);

  const dayStatuses = WEEKDAY_ORDER.map((weekday) => {
    if (!plan.daysPerWeek.includes(weekday)) return { weekday, status: 'inactive' as DayStatus };

    const dateKey = addDays(plan.currentWeekStartDate, WEEKDAY_OFFSET[weekday]);
    const sessionsForDay = plan.sessions.filter((s) => s.scheduledDate === dateKey);

    let status: DayStatus;
    if (sessionsForDay.length > 0 && sessionsForDay.every((s) => s.status === 'completed')) status = 'completed';
    else if (dateKey === todayKey) status = 'current';
    else if (dateKey < todayKey) status = 'missed';
    else status = 'upcoming';

    return { weekday, status };
  });

  const statusColors: Record<DayStatus, { border: string; bg: string; text: string }> = {
    completed: {
      bg: theme.color.success + '10',
      text: theme.color.success,
      border: theme.color.success,
    },
    current: {
      bg: theme.color.accent + '08',
      text: theme.color.accent,
      border: theme.color.accent,
    },
    missed: {
      bg: 'transparent',
      text: theme.color.error,
      border: theme.color.error + '55',
    },
    upcoming: {
      bg: 'transparent',
      text: theme.color.textMuted,
      border: theme.isDark ? '#17305D' : '#D8E3F7',
    },
    inactive: {
      bg: 'transparent',
      text: theme.color.textMuted,
      border: theme.color.border,
    },
  };


  return (
    <View
      style={{
        paddingVertical: theme.space.sm,
        paddingHorizontal: theme.space.md,
        borderWidth: 1.5,
        borderRadius: theme.borderRadius.xl,
        borderColor: theme.isDark ? 'rgba(59,130,246,0.15)' : '#DCE7FF',
        backgroundColor: theme.color.card,
      }}
    >
      <Text
        style={{
          color: theme.color.textPrimary,
          fontSize: theme.fontSize.lg,
          fontWeight: theme.fontWeight.bold,
          fontFamily: theme.fontFamily.regular,
          marginBottom: theme.space.sm,
        }}
      >
        {theme.i18n.t('studyPlan.weekTracker.title')}
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.space.sm }}>
        {dayStatuses.map(({ weekday, status }) => {
          const colors = statusColors[status];
          return (
            <View
              key={weekday}
              style={{
                flex: 1,
                alignItems: 'center',
                opacity: status === 'inactive' ? 0.35 : 1,
              }}
            >
              <View
                style={{
                  width: daySize,
                  height: daySize,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: colors.border,
                  borderRadius: daySize * 0.28,
                  backgroundColor: colors.bg,
                }}
              >
                {status === 'completed' ? (
                  <Feather
                    name='check-circle'
                    color={theme.color.success}
                    size={iconSize}
                  />
                ) : (
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: theme.fontSize.lg,
                      fontWeight: theme.fontWeight.bold,
                      fontFamily: theme.fontFamily.regular,
                    }}
                  >
                    {WEEKDAY_SHORT[weekday]}
                  </Text>
                )}
              </View>

              <Text
                style={{
                  marginTop: theme.space.xs,
                  color: status === 'current' ? theme.color.accent : theme.color.textMuted,
                  fontSize: theme.fontSize.sm,
                  fontWeight: status === 'current' ? theme.fontWeight.bold : theme.fontWeight.regular,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {WEEKDAY_SHORT[weekday]}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.md,
            fontFamily: theme.fontFamily.light,
          }}
        >
          {theme.i18n.t('studyPlan.weekTracker.sessionsComplete', {
            completed: completedSessions.length,
            total: plan.sessions.length,
          })}
        </Text>

        <View
          style={{
            flexShrink: 1,
            gap: theme.space.xs,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Feather
            name='zap'
            color={theme.color.accent}
            size={theme.fontSize.md}
          />
          <Text
            numberOfLines={1}
            style={{
              flexShrink: 1,
              color: theme.color.accent,
              fontSize: theme.fontSize.md,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {theme.i18n.t('studyPlan.weekTracker.xpProgress', { earned: xpEarned, target: plan.weeklyXpTarget })}
          </Text>
        </View>
      </View>
    </View>
  );
}
