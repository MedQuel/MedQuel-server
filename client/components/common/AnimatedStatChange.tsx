import type { ComponentProps } from 'react';
import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


type FeatherIconName = ComponentProps<typeof Feather>['name'];
export type AnimatedStatChangeProps = {
  icon: FeatherIconName;
  color: string;
  label: string;
  value: number;
  delta?: number;
  formatValue?: (n: number) => string;
  durationMs?: number;
};

export function AnimatedStatChange({
  icon,
  color,
  label,
  value,
  delta = 0,
  formatValue = (n) => String(Math.round(n)),
  durationMs = 900,
}: AnimatedStatChangeProps) {
  const { theme } = useTheme();
  const shouldAnimate = delta > 0;
  const startValue = shouldAnimate ? value-delta : value;

  const [displayValue, setDisplayValue] = useState(startValue);
  const countAnim = useRef(new Animated.Value(startValue)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!shouldAnimate || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    const listenerId = countAnim.addListener(({ value: v }) => setDisplayValue(Math.round(v)));

    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.timing(countAnim, {
          toValue: value,
          duration: durationMs,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.25,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.spring(bounceAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: durationMs + 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    return () => countAnim.removeListener(listenerId);
  }, [shouldAnimate, value, durationMs, countAnim, bounceAnim, floatAnim]);

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -28],
  });
  const floatOpacity = floatAnim.interpolate({
    inputRange: [0, 0.15, 0.75, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <View style={{ gap: theme.space.xs, alignItems: 'center' }}>
      <View
        style={{
          width: theme.space.xl * 2,
          height: theme.space.xl,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {shouldAnimate && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              opacity: floatOpacity,
              pointerEvents: 'none',
              transform: [{ translateY: floatTranslateY }],
            }}
          >
            <Text
              style={{
                color,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.numberBold,
              }}
            >
              +{delta}
            </Text>
          </Animated.View>
        )}

        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <Feather name={icon} size={theme.fontSize.lg} color={color} />
        </Animated.View>
      </View>

      <Text
        style={{
          color,
          fontSize: theme.fontSize.lg,
          fontFamily: theme.fontFamily.numberBold,
        }}
      >
        {formatValue(displayValue)}
      </Text>
      <Text
        style={{
          fontSize: theme.fontSize.xs,
          color: theme.color.textMuted,
          fontFamily: theme.fontFamily.regular,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
