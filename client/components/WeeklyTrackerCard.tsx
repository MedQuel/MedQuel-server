import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '../theme/ThemeContext';

type WeeklyProgressCardProps = {
  title?: string;
  date: string;
  completedDays: number[];
  currentDay: number;
  reward: number;
};

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function CheckIcon({
  color,
  size,
}: {
  color: string;
  size: number;
}) {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4'
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap='round'
      />
      <Path
        d='M8.5 11.8L11 14.3L16.5 8.8'
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  );
}

function LightningIcon({
  color,
  size,
}: {
  color: string;
  size: number;
}) {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M13 2L4 14H11L9 22L20 9H13L13 2Z'
        stroke={color}
        strokeWidth={2}
        strokeLinejoin='round'
      />
    </Svg>
  );
}
export function WeeklyProgressCard({
  title = 'This Week',
  date,
  completedDays,
  currentDay,
  reward,
}: WeeklyProgressCardProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const completedCount = completedDays.length;

  // NOTE: this estimates the card's inner width from the *screen* width minus
  // an assumed outer margin. If the screen wrapping this card changes its
  // horizontal padding, update `horizontalPadding` below to match, or the day
  // circles will be sized for the wrong width (this only affects circle size,
  // not the card's own width, which always matches its parent).
  const horizontalPadding = theme.space.lg * 2;

  const daySize = Math.min(
    42,
    (width - horizontalPadding - theme.space.xs * 12) / 7
  );

  const iconSize = daySize * 0.45;

  return (
    <View
      style={{
        paddingVertical: theme.space.sm,
        paddingHorizontal: theme.space.md,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1.5,
        borderColor: theme.isDark
          ? 'rgba(59,130,246,0.15)'
          : '#DCE7FF',
        backgroundColor: theme.color.card,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.space.sm,
        }}
      >
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg,
            fontWeight: theme.fontWeight.bold.toString() as any,
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

      {/* Days */}
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
            : current
            ? theme.color.accent
            : theme.isDark
            ? '#17305D'
            : '#D8E3F7';

          const bgColor = completed
            ? theme.color.success + '10'
            : current
            ? theme.color.accent + '08'
            : 'transparent';

          const textColor = completed
            ? theme.color.success
            : current
            ? theme.color.accent
            : theme.color.textMuted;

          return (
            <View
              key={`${day}-${index}`}
              style={{
                flex: 1,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: daySize,
                  height: daySize,
                  borderRadius: daySize * 0.28,
                  borderWidth: 2,
                  borderColor,
                  backgroundColor: bgColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {completed ? (
                  <CheckIcon
                    color={theme.color.success}
                    size={iconSize}
                  />
                ) : (
                  <Text
                    style={{
                      color: textColor,
                      fontSize: theme.fontSize.lg,
                      fontWeight: theme.fontWeight.bold.toString() as any,
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
                  color: current
                    ? theme.color.accent
                    : theme.color.textMuted,
                  fontSize: theme.fontSize.sm,
                  fontWeight: current
                    ? (theme.fontWeight.bold.toString() as any)
                    : ('400' as any),
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {day}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Footer */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
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
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space.xs,
            flexShrink: 1,
          }}
        >
          <LightningIcon
            color={theme.color.accent}
            size={theme.fontSize.md}
          />

          <Text
            numberOfLines={1}
            style={{
              color: theme.color.accent,
              fontSize: theme.fontSize.md,
              fontWeight: theme.fontWeight.bold.toString() as any,
              fontFamily: theme.fontFamily.regular,
              flexShrink: 1,
            }}
          >
            +{reward} EP on completion
          </Text>
        </View>
      </View>
    </View>
  );
}