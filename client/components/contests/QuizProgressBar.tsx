import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


const MAX_SEGMENTS = 20;
type QuizProgressBarProps = {
  current: number;
  total: number;
};

export function QuizProgressBar({ current, total }: QuizProgressBarProps) {
  const { theme } = useTheme();
  const ratio = total > 0 ? Math.min(1, Math.max(0, current/total)) : 0;

  const fillAnim = useRef(new Animated.Value(ratio)).current;
  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: ratio,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [ratio, fillAnim]);

  const fillWidth = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      accessible
      accessibilityRole='progressbar'
      accessibilityLabel={`${theme.i18n.t('contests.questions')} ${current} / ${total}`}
      accessibilityValue={{ min: 1, max: total, now: current }}
      style={{ gap: theme.space.sm }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          style={{
            fontSize: theme.fontSize.sm,
            color: theme.color.textPrimary,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {`${theme.i18n.t('common.question')} ${current}`}
        </Text>
        <Text
          style={{
            fontSize: theme.fontSize.sm,
            color: theme.color.textMuted,
            fontFamily: theme.fontFamily.number,
          }}
        >
          {`${current} / ${total}`}
        </Text>
      </View>

      {total <= MAX_SEGMENTS ? (
        <View style={{ gap: theme.space.xs, flexDirection: 'row' }}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: theme.space.xs * 1.5,
                borderRadius: theme.borderRadius.full,
                backgroundColor: i < current
                  ? i === current-1 ? theme.color.accent : theme.color.success
                  : theme.isDark ? theme.color.surface : theme.color.border,
              }}
            />
          ))}
        </View>
      ) : (
        <View
          style={{
            overflow: 'hidden',
            height: theme.space.xs * 1.5,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.isDark ? theme.color.surface : theme.color.border,
          }}
        >
          <Animated.View
            style={{
              height: '100%',
              width: fillWidth,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.accent,
            }}
          />
        </View>
      )}
    </View>
  );
}
