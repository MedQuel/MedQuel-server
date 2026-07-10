import { LinearGradient } from 'expo-linear-gradient';
import { Compass, ArrowLeft } from 'lucide-react-native';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import Svg, { Defs, Pattern, Line, Rect, RadialGradient, Stop, Circle } from 'react-native-svg';

import { useTheme } from '../theme/ThemeContext';
import { useAppContext } from '../common/context/AppContext';
import { useBottomBar } from '../common/context/useBottomBar';


const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const GLOW_COLOR = '#2563EB';
const GLOW_SIZE = 420;

function resolveSafeDestination(authStatus: string): '/home' | '/onboarding' | '/auth' | '/' {
  switch (authStatus) {
    case 'authenticated':
      return '/home';
    case 'needsOnboarding':
      return '/onboarding';
    case 'unauthenticated':
    case 'needsEmailVerification':
      return '/auth';
    default:
      return '/';
  }
}

export default function NotFoundScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const { authStatus } = useAppContext();
  useBottomBar(false);

  const canGoBack = router.canGoBack();
  const destination = resolveSafeDestination(authStatus);
  const attemptedPath = typeof params.path === 'string' ? params.path : undefined;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1, backgroundColor: theme.color.background }}>
        <Svg
          width={GLOW_SIZE}
          height={GLOW_SIZE}
          pointerEvents='none'
          style={{
            position: 'absolute',
            top: SCREEN_H*0.28 - GLOW_SIZE/2,
            left: SCREEN_W/2 - GLOW_SIZE/2,
          }}
        >
          <Defs>
            <RadialGradient id='glow' cx='50%' cy='50%' r='50%'>
              <Stop offset='0%' stopColor={GLOW_COLOR} stopOpacity={0.28} />
              <Stop offset='60%' stopColor={GLOW_COLOR} stopOpacity={0.1} />
              <Stop offset='100%' stopColor={GLOW_COLOR} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={GLOW_SIZE / 2} cy={GLOW_SIZE / 2} r={GLOW_SIZE / 2} fill='url(#glow)' />
        </Svg>

        <Svg
          width={SCREEN_W}
          height={SCREEN_H}
          pointerEvents='none'
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <Defs>
            <Pattern id='grid' width={32} height={32} patternUnits='userSpaceOnUse' >
              <Line x1={0} y1={0} x2={32} y2={0} stroke={theme.color.border} strokeWidth={1} />
              <Line x1={0} y1={0} x2={0} y2={32} stroke={theme.color.border} strokeWidth={1} />
            </Pattern>
          </Defs>
          <Rect width='100%' height='100%' fill='url(#grid)' opacity={theme.isDark ? 0.35 : 0.6} />
        </Svg>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: theme.space.xl,
          }}
        >
          <View
            style={{
              width: theme.space.xxl * 1.4,
              height: theme.space.xxl * 1.4,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.space.lg,
              borderWidth: 1.5,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.surface,
            }}
          >
            <Compass size={theme.space.xl} color={theme.color.accent} />
          </View>

          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.xxxl,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('notFound.title')}
          </Text>

          <Text
            style={{
              textAlign: 'center',
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm * 1.05,
              fontFamily: theme.fontFamily.regular,
              maxWidth: 320,
              marginTop: theme.space.sm,
              marginBottom: theme.space.xl,
            }}
          >
            {theme.i18n.t('notFound.subtitle')}
          </Text>

          {attemptedPath && (
            <View
              style={{
                marginBottom: theme.space.xl,
                paddingVertical: theme.space.xs * 1.25,
                paddingHorizontal: theme.space.md * 0.75,
                borderRadius: theme.borderRadius.lg,
                backgroundColor: theme.color.surface,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: theme.color.textMuted,
                  fontSize: theme.fontSize.xs,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {attemptedPath}
              </Text>
            </View>
          )}

          <Pressable
            onPress={() => router.replace(destination)}
            style={{ width: '100%', maxWidth: 320 }}
          >
            <LinearGradient
              colors={['#4378eb', '#2161eb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: theme.space.md * 0.9,
                borderRadius: theme.borderRadius.lg,
                boxShadow: `0 6px 20px ${theme.color.accent}55`,
              }}
            >
              <Text
                style={{
                  color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                  fontSize: theme.fontSize.md * 1.1,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {theme.i18n.t('notFound.primaryAction')}
              </Text>
            </LinearGradient>
          </Pressable>

          {canGoBack && (
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: theme.space.lg,
              }}
            >
              <ArrowLeft size={theme.space.md} color={theme.color.textSecondary} />
              <Text
                style={{
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                  marginLeft: theme.space.xs,
                }}
              >
                {theme.i18n.t('notFound.secondaryAction')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </>
  );
}
