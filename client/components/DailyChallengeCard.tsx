import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


export type DailyChallengeCardProps = {
  title: string;
  questions: number;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  endsAt: string;
  epReward: number;
  onStart: () => void;
  completed?: boolean;
};

export function DailyChallengeCard(props: DailyChallengeCardProps) {
  const { theme } = useTheme();

  const formattedTimeLeft = (() => {
    const minutes = Number(props.endsAt);

    if (!Number.isFinite(minutes)) return props.endsAt;
    if (minutes > 60) return `${theme.i18n.t('contests.hour', { hrs: Math.floor(minutes / 60) })}`;

    return `${theme.i18n.t('contests.minute', { mins: minutes })}`;
  })();


  return (
    <LinearGradient
      colors={
        theme.isDark
          ? ['#05173d', '#071d4d', '#08205a']
          : ['#2762f7', '#1a56f0', '#0f49db']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        overflow: 'hidden',
        borderWidth: 1.5,
        borderRadius: theme.borderRadius.xl * 1.25,
        borderColor: theme.isDark ? theme.color.border : 'rgba(37,99,235,0.15)',
        paddingVertical: theme.space.lg,
        paddingHorizontal: theme.space.md * 1.25,
        boxShadow: theme.isDark
          ? '0px 12px 28px rgba(0,0,0,0.25)'
          : '0px 10px 24px rgba(37,99,235,0.12)',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: -55,
          right: -35,
          width: 140,
          height: 140,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.color.textMuted + '33',
        }}
      />

      {props.completed ? (
        <View style={{ gap: theme.space.md, alignItems: 'center', paddingVertical: theme.space.sm }}>
          <View
            style={{
              width: theme.space.xxl * 1.4,
              height: theme.space.xxl * 1.4,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.success + '33',
            }}
          >
            <Feather name="check" size={theme.fontSize.xxl} color={theme.color.success} />
          </View>

          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                fontSize: theme.fontSize.xl * 1.05,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.bold,
                textAlign: 'center',
              }}
            >
              Today's Challenge Completed!
            </Text>
            <Text
              style={{
                marginTop: theme.space.xs,
                color: theme.isDark ? theme.color.textSecondary : theme.color.textInverse + '99',
                fontSize: theme.fontSize.md,
                fontFamily: theme.fontFamily.regular,
                textAlign: 'center',
              }}
            >
              Come back tomorrow for a new one.
            </Text>
          </View>
        </View>
      ) : (
        <View style={{ gap: theme.space.sm, flexDirection: 'column', justifyContent: 'center' }}>
          <View
            style={{
              gap: theme.space.sm * 0.75,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            <View
              style={{
                padding: theme.space.xs * 1.1,
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.info,
              }}
            />
            <Text
              style={{
                letterSpacing: 0.85,
                textTransform: 'uppercase',
                color: theme.isDark ? theme.color.info : theme.color.textInverse + '99',
                fontSize: theme.fontSize.sm * 0.95,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {theme.i18n.t('home.daily_challenge')}
            </Text>
          </View>

          <Text
            style={{
              color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
              fontSize: theme.fontSize.xl * 1.05,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {props.title}
          </Text>

          <Text
            style={{
              color: theme.isDark ? theme.color.textSecondary : theme.color.textInverse + '99',
              fontSize: theme.fontSize.md,
              fontWeight: theme.fontWeight.medium,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {props.questions} {theme.i18n.t('common.questions')} ·{' '}
            {props.duration} {theme.i18n.t('common.min')} ·{' '}
            {theme.i18n.t(`common.${props.difficulty}`)}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ gap: theme.space.sm * 1.25, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
                <Feather
                  name='clock'
                  size={theme.space.md}
                  color={theme.isDark ? theme.color.textSecondary : theme.color.textInverse + '99'}
                />
                <Text
                  style={{
                    color: theme.isDark ? theme.color.textSecondary : theme.color.textInverse + '99',
                    fontSize: theme.fontSize.sm,
                    fontWeight: theme.fontWeight.medium,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {formattedTimeLeft} {theme.i18n.t('contests.time_left')}
                </Text>
              </View>

              <View
                style={{
                  gap: theme.space.sm * 0.5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: theme.space.xs * 1.5,
                  paddingHorizontal: theme.space.sm * 1.25,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.isDark ? theme.color.accent + '33' : theme.color.textInverse + '33',
                }}
              >
                <Feather
                  name='zap'
                  size={theme.space.md * 0.95}
                  color={theme.isDark ? theme.color.info : theme.color.textInverse}
                />
                <Text
                  style={{
                    color: theme.isDark ? theme.color.info : theme.color.textInverse,
                    fontSize: theme.fontSize.sm,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.number,
                  }}
                >
                  +{props.epReward} {theme.i18n.t('common.ep')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={props.onStart}
              style={{
                paddingVertical: theme.space.sm,
                paddingHorizontal: theme.space.md,
                borderRadius: theme.borderRadius.lg,
                backgroundColor: theme.isDark ? theme.color.info : theme.color.textInverse,
                boxShadow: '0px 6px 16px rgba(0,0,0,0.10)',
              }}
            >
              <Text
                style={{
                  letterSpacing: 0.2,
                  color: theme.isDark ? theme.color.background : theme.color.accent,
                  fontSize: theme.fontSize.lg,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {theme.i18n.t('common.start')} ⟶
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}