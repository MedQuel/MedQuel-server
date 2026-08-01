import { Feather } from '@expo/vector-icons';
import { View, Text, useWindowDimensions } from 'react-native';

import { useTheme } from '../theme/ThemeContext';


const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
type WeeklyProgressCardProps = {
  title: string;
  date: string;
  completedDays: number[];
  currentDay: number;
  reward: number;
};

export function WeeklyProgressCard({ title, date, completedDays, currentDay, reward }: WeeklyProgressCardProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const completedCount = completedDays.length;

  const horizontalPadding = theme.space.lg * 2;
  const daySize = Math.min(42, (width-horizontalPadding-theme.space.xs * 12) / 7);
  const iconSize = daySize * 0.45;

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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.space.sm,
        }}
      >
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.md,
            fontFamily: theme.fontFamily.light,
          }}
        >
          {date}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: theme.space.sm,
        }}
      >
        {DAYS.map((day, index) => {
          const completed = completedDays.includes(index);
          const current = currentDay === index;

          const borderColor = completed
            ? theme.color.success
            : current ? theme.color.accent : theme.isDark ? '#17305D' : '#D8E3F7';
          const bgColor = completed
            ? theme.color.success + '10'
            : current ? theme.color.accent + '08' : 'transparent';
          const textColor = completed
            ? theme.color.success
            : current ? theme.color.accent : theme.color.textMuted;

          return (
            <View
              key={`${day}-${index}`}
              style={{ flex: 1, alignItems: 'center' }}
            >
              <View
                style={{
                  width: daySize,
                  height: daySize,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor,
                  borderRadius: daySize * 0.28,
                  backgroundColor: bgColor,
                }}
              >
                {completed ? (
                  <Feather name='check-circle' color={theme.color.success} size={iconSize} />
                ) : (
                  <Text
                    style={{
                      color: textColor,
                      fontSize: theme.fontSize.lg,
                      fontWeight: theme.fontWeight.bold,
                      fontFamily: theme.fontFamily.regular,
                    }}
                  >
                    {day}
                  </Text>
                )}
              </View>

              <Text
                style={{
                  marginTop: 4,
                  color: current ? theme.color.accent : theme.color.textMuted,
                  fontSize: theme.fontSize.sm,
                  fontWeight: current ? theme.fontWeight.bold : theme.fontWeight.regular,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {day}
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
          {completedCount}/7 complete
        </Text>

        <View
          style={{
            flexShrink: 1,
            gap: theme.space.xs,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Feather name='zap' color={theme.color.accent} size={theme.fontSize.md} />
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
            +{reward} EP on completion
          </Text>
        </View>
      </View>
    </View>
  );
}
