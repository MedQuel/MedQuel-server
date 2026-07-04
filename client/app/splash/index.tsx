import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Line, Rect } from 'react-native-svg';
import { View, Text, Image, Dimensions, Animated, Easing } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../common/context/AppContext';
import { useBottomBar } from '../../common/context/useBottomBar';


const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { authStatus } = useAppContext();
  const { theme } = useTheme();
  useBottomBar(false);

  const shimmer = useRef(new Animated.Value(0)).current;
  const brandGradient = [theme.color.accent, theme.color.info] as const;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  useEffect(() => {
    if (authStatus === 'checking') return;

    if (authStatus === 'authenticated') {
      router.replace('/home');
    } else if (authStatus === 'needsOnboarding') {
      router.replace('/onboarding');
    } else {
      router.replace('/auth/login'); // 'unauthenticated'
    }
  }, [authStatus, router]);

  const shimmerLeft = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ['-40%', '100%'],
  });


  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <Svg
        width={SCREEN_W}
        height={SCREEN_H}
        style={{ position: 'absolute', top: 0, left: 0 }}
        pointerEvents='none'
      >
        <Defs>
          <Pattern
            id='grid'
            width={32}
            height={32}
            patternUnits='userSpaceOnUse'
          >
            <Line
              x1={0}
              y1={0}
              x2={32}
              y2={0}
              stroke={theme.color.border}
              strokeWidth={1}
            />
            <Line
              x1={0}
              y1={0}
              x2={0}
              y2={32}
              stroke={theme.color.border}
              strokeWidth={1}
            />
          </Pattern>
        </Defs>
        <Rect
          width='100%'
          height='100%'
          fill='url(#grid)'
          opacity={theme.isDark ? 0.35 : 0.6}
        />
      </Svg>

      <View
        pointerEvents='none'
        style={{
          position: 'absolute',
          top: SCREEN_H * 0.3,
          left: SCREEN_W / 2 - 170,
          width: 340,
          height: 340,
          borderWidth: 1.25,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.full,
          opacity: theme.isDark ? 0.4 : 0.6,
        }}
      />
      <View
        pointerEvents='none'
        style={{
          position: 'absolute',
          top: SCREEN_H * 0.3 + 45,
          left: SCREEN_W / 2 - 125,
          width: 250,
          height: 250,
          borderWidth: 1.15,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.full,
          opacity: theme.isDark ? 0.4 : 0.45,
        }}
      />

      <View style={{ flex: 1, alignItems: 'center', paddingTop: SCREEN_H * 0.32 }}>
        <View style={{ width: 100, height: 100 }}>
          <Image
            source={require('../../assets/icons/splash-icon.png')}
            resizeMode='contain'
            style={{ width: 100, height: 100 }}
          />

          <LinearGradient
            colors={brandGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 28,
              height: 28,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: theme.color.background,
              borderRadius: theme.borderRadius.full,
            }}
          >
            <Zap size={14} color='#FFFFFF' fill='#FFFFFF' />
          </LinearGradient>
        </View>

        <View style={{ flexDirection: 'row', marginTop: theme.space.lg * 1.15 }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.xxxl * 1.2,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('splash.brandPrefix')}
          </Text>
          <Text
            style={{
              color: theme.color.accent,
              fontSize: theme.fontSize.xxxl * 1.2,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('splash.brandSuffix')}
          </Text>
        </View>

        <Text
          style={{
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: theme.color.textMuted,
            fontSize: theme.fontSize.xs * 1.05,
            fontFamily: theme.fontFamily.regular,
            marginTop: theme.space.sm,
          }}
        >
          {theme.i18n.t('splash.tagline')}
        </Text>

        <View style={{ gap: theme.space.sm, flexDirection: 'row', marginTop: theme.space.lg * 1.2 }}>
          {(
            [ 'splash.pillPractice', 'splash.pillContests', 'splash.pillLeaderboards' ] as const
          ).map((key) => (
            <View
              key={key}
              style={{
                paddingHorizontal: theme.space.md * 0.75,
                paddingVertical: theme.space.xs * 1.25,
                borderWidth: 1.5,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.lg,
                backgroundColor: theme.color.surface,
              }}
            >
              <Text
                style={{
                  color: theme.color.accent,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t(key)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingBottom: theme.space.xxl, paddingHorizontal: theme.space.xxl }}>
        <View
          style={{
            height: 4,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.surface,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={{
              position: 'absolute',
              left: shimmerLeft,
              width: '40%',
              height: '100%',
            }}
          >
            <LinearGradient
              colors={brandGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: theme.borderRadius.full,
              }}
            />
          </Animated.View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.space.lg }}>
          {[
            { value: '25K+', label: theme.i18n.t('splash.statStudents') },
            { value: '10K+', label: theme.i18n.t('splash.statQuestions') },
            { value: '4.9★', label: theme.i18n.t('splash.statRating') },
          ].map((stat) => (
            <View key={stat.label} style={{ flex: 1, alignItems: 'center' }}>
              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.lg,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {stat.value}
              </Text>
              <Text
                style={{
                  color: theme.color.textMuted,
                  fontSize: theme.fontSize.xs,
                  fontFamily: theme.fontFamily.regular,
                  marginTop: theme.space.xs * 0.5,
                }}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
