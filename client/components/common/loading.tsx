import React, { useEffect, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { G, Defs, Path, Stop, ClipPath, LinearGradient } from 'react-native-svg';
import { View, Text, Easing, Animated, Platform, useWindowDimensions } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


const AnimatedView = Animated.createAnimatedComponent(View);
const GWithoutCollapsable = React.forwardRef<any, any>((props, ref) => {
  const rest = { ...props };
  delete (rest as any).collapsable;
  return <G ref={ref} {...rest} />;
});
const AnimatedG = Animated.createAnimatedComponent(GWithoutCollapsable);

interface PremiumLoaderProps {
  size?: number;
  width?: number;
  height?: number;
  color: string;
  secondaryColor: string;
}
function PremiumLoader({ size, width, height, color, secondaryColor }: PremiumLoaderProps) {
  const finalWidth = width ?? size ?? 120;
  const finalHeight = height ?? size ?? 120;
  const minDim = Math.min(finalWidth, finalHeight);

  const progress = useRef(new Animated.Value(0)).current;
  const wavePhase = useRef(new Animated.Value(0)).current;

  const boltPath = 'M16.5 2 L8.5 13.5 h5 L10.5 22 l8 -11.5 h-5 Z';
  const wavePath = 'M 0 5 Q 3 0 6 5 T 12 5 T 18 5 T 24 5 T 30 5 T 36 5 T 42 5 T 48 5 L 48 40 L 0 40 Z';

  useEffect(() => {
    const waveAnim = Animated.loop(
      Animated.timing(wavePhase, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );

    const fillAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 2,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    );

    waveAnim.start();
    fillAnim.start();

    return () => {
      waveAnim.stop();
      fillAnim.stop();
    };
  }, [progress, wavePhase]);

  const wave1X = wavePhase.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const wave2X = wavePhase.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] });

  const liquidY = progress.interpolate({ inputRange: [0, 1, 2], outputRange: [24, -5, -5] });
  const liquidY2 = progress.interpolate({ inputRange: [0, 1, 2], outputRange: [23, -6, -6] });

  const coreScale = progress.interpolate({ inputRange: [0, 0.95, 1, 1.1, 1.3, 2], outputRange: [1, 1, 1, 1.6, 0.9, 1] });


  return (
    <View
      style={{
        width: finalWidth,
        height: finalHeight,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AnimatedView
        style={{
          width: minDim * 0.65,
          height: minDim * 0.65,
          transform: [{ scale: coreScale }],
        }}
      >
        <Svg width='100%' height='100%' viewBox='0 0 24 24'>
          <Defs>
            <ClipPath id='boltClip'>
              <Path d={boltPath} />
            </ClipPath>
            <LinearGradient id='liquidGrad1' x1='0%' y1='0%' x2='0%' y2='100%'>
              <Stop offset='0%' stopColor={secondaryColor} stopOpacity='1' />
              <Stop offset='100%' stopColor={color} stopOpacity='1' />
            </LinearGradient>
            <LinearGradient id='liquidGrad2' x1='0%' y1='0%' x2='0%' y2='100%'>
              <Stop offset='0%' stopColor={color} stopOpacity='0.75' />
              <Stop offset='100%' stopColor={secondaryColor} stopOpacity='0.75' />
            </LinearGradient>
          </Defs>

          <Path d={boltPath} stroke={color} strokeWidth={1} fill='none' opacity={0.2} />

          <G clipPath='url(#boltClip)'>
            <AnimatedG x={wave2X as any} y={liquidY2 as any}>
              <Path d={wavePath} fill='url(#liquidGrad2)' />
            </AnimatedG>

            <AnimatedG x={wave1X as any} y={liquidY as any}>
              <Path d={wavePath} fill='url(#liquidGrad1)' />
            </AnimatedG>
          </G>
        </Svg>
      </AnimatedView>
    </View>
  );
}


export interface LoadingProps {
  message?: string;
  size?: number;
  width?: number;
  height?: number;
  fullscreen?: boolean;
  style?: StyleProp<ViewStyle>;
}
export function Loading({ message, size, width, height, fullscreen = false, style }: LoadingProps) {
  const { theme } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const primaryColor = theme.color.info;
  const secondaryColor = theme.color.accent;

  const responsiveSize = Math.min(112, Math.max(64, Math.min(screenWidth, screenHeight) * 0.25));
  const defaultSize = fullscreen ? 108 : responsiveSize;

  const containerStyle: StyleProp<ViewStyle> = fullscreen
    ? [
        {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          zIndex: 999,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.color.background + 'EE',
          ...(Platform.OS === 'web' && ({ backdropFilter: 'blur(8px)' } as any)),
        },
        style,
      ]
    : [
        { alignItems: 'center', justifyContent: 'center', padding: theme.space.md },
        style,
      ];

  return (
    <View
      style={containerStyle}
      accessibilityRole='progressbar'
      accessibilityLabel={message || 'Loading'}
    >
      <PremiumLoader
        size={size ?? defaultSize}
        width={width}
        height={height}
        color={primaryColor}
        secondaryColor={secondaryColor}
      />

      {!!message && (
        <Text
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm * 1.1,
            fontFamily: theme.fontFamily.regular,
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
}
