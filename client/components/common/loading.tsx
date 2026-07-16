import { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '../../theme/ThemeContext';

const AnimatedView = Animated.createAnimatedComponent(View);

interface ChargingBoltProps {
  size: number;
  color: string;
}

// Charging Bolt Animation Component (SVG double-translation native mask)
function ChargingBolt({ size, color }: ChargingBoltProps) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        // Phase 1: Fill from bottom to top (1300ms)
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1300,
          useNativeDriver: true,
        }),
        // Phase 2: Glow burst and scale pulse (180ms total)
        Animated.timing(animValue, {
          toValue: 2,
          duration: 180,
          useNativeDriver: true,
        }),
        // Phase 3: Immediate Reset
        Animated.timing(animValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [animValue]);

  // Interpolations for mask translation, svg translation, scale, and glow
  const maskTranslateY = animValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [size, 0, 0],
  });

  const svgTranslateY = animValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [-size, 0, 0],
  });

  const mainScale = animValue.interpolate({
    inputRange: [0, 1, 1.5, 2],
    outputRange: [1, 1, 1.05, 1],
  });

  const glowScale = animValue.interpolate({
    inputRange: [0, 1, 1.5, 2],
    outputRange: [1, 1, 1.3, 1],
  });

  const glowOpacity = animValue.interpolate({
    inputRange: [0, 1, 1.5, 2],
    outputRange: [0, 0, 0.4, 0],
  });

  // SVG Path: Custom elegant Thunderbolt matching splash-icon.png
  const boltPath = 'M16.5 2 L8.5 13.5 h5 L10.5 22 l8 -11.5 h-5 Z';

  return (
    <AnimatedView
      style={{
        width: size,
        height: size,
        transform: [{ scale: mainScale }],
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Glow Layer */}
      <AnimatedView
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      >
        <Svg width="100%" height="100%" viewBox="0 0 24 24">
          <Path d={boltPath} fill={color} />
        </Svg>
      </AnimatedView>

      {/* Faint Background Outline */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 24 24">
          <Path
            d={boltPath}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            opacity={0.25}
          />
        </Svg>
      </View>

      {/* Masked Foreground Layer */}
      <AnimatedView
        style={[
          StyleSheet.absoluteFill,
          {
            overflow: 'hidden',
            transform: [{ translateY: maskTranslateY }],
          },
        ]}
      >
        <AnimatedView
          style={{
            width: size,
            height: size,
            transform: [{ translateY: svgTranslateY }],
          }}
        >
          <Svg width="100%" height="100%" viewBox="0 0 24 24">
            <Path d={boltPath} fill={color} />
          </Svg>
        </AnimatedView>
      </AnimatedView>
    </AnimatedView>
  );
}

export interface LoadingProps {
  message?: string;
  size?: number;
  fullscreen?: boolean;
  style?: StyleProp<ViewStyle>;
}

// ⚡ Reusable Loading Overlay/Indicator Component
export function Loading({
  message,
  size = 80,
  fullscreen = false,
  style,
}: LoadingProps) {
  const { theme } = useTheme();

  const boltColor = theme.isDark ? theme.color.info : theme.color.accent;
  
  const containerStyle = fullscreen
    ? [
        styles.fullscreen,
        { backgroundColor: theme.color.background + 'D9' }, // ~85% opacity
        style,
      ]
    : [styles.container, style];

  return (
    <View
      style={containerStyle}
      accessibilityRole="progressbar"
      accessibilityLabel={message || 'Loading'}
    >
      <ChargingBolt size={size} color={boltColor} />
      {!!message && (
        <Text
          style={[
            styles.text,
            {
              color: theme.color.textSecondary,
              fontFamily: theme.fontFamily.regular,
              fontSize: theme.fontSize.sm,
            },
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fullscreen: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    textAlign: 'center',
  },
});
