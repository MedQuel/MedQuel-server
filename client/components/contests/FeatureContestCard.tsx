import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fragment, useEffect, useMemo, useState } from 'react';

import { useTheme } from '../../theme/ThemeContext';


type FeatureContestCardProps = {
  title: string;
  participants: number;
  reward: number;
  questions: number;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  endsAt: string | Date;
  onPress?: () => void;
};

function getRemainingTime(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

export function FeatureContestCard(props: FeatureContestCardProps) {
  const endDate = useMemo(() => new Date(props.endsAt), [props.endsAt]);
  const [remaining, setRemaining] = useState(getRemainingTime(endDate));

  const { theme } = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemainingTime(endDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <LinearGradient
      colors={theme.isDark ? ['#121333', '#0b1041', '#0A1E66'] : ['#7e71e2', '#4f44c7', '#2253e4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        overflow: 'hidden',
        borderWidth: 1.5,
        borderRadius: theme.borderRadius.xl,
        borderColor: theme.isDark ? theme.color.border : 'rgba(255,255,255,0.10)',
        boxShadow: theme.isDark ? '0px 12px 30px rgba(0,0,0,0.30)' : '0px 12px 24px rgba(0,0,0,0.12)',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: -90,
          right: -60,
          width: 180,
          height: 180,
          borderRadius: theme.borderRadius.full,
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: -40,
          right: 40,
          width: 100,
          height: 100,
          borderRadius: theme.borderRadius.full,
          backgroundColor: 'rgba(255,255,255,0.04)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -100,
          left: -70,
          width: 220,
          height: 220,
          borderRadius: theme.borderRadius.full,
          backgroundColor: 'rgba(128,0,255,0.08)',
        }}
      />

      <View style={{ flexDirection: 'column', padding: theme.space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                gap: theme.space.xs,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: theme.space.xs,
                paddingHorizontal: theme.space.sm,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.color.warning + '22',
              }}
            >
              <Feather name='star' size={theme.fontSize.xs + 1} color={theme.color.warning} />
              <Text
                style={{
                  color: theme.color.warning,
                  fontSize: theme.fontSize.xs,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {theme.i18n.t('contests.featured_badge')}
              </Text>
            </View>

            <Text
              style={{
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                color: theme.isDark ? theme.color.textSecondary : theme.color.textInverse + '77',
              }}
            >
              {theme.i18n.t('contests.competing', { participants: props.participants.toLocaleString() })}
            </Text>
          </View>

          <Text
            style={{
              color: theme.color.warning,
              fontSize: theme.fontSize.xxl,
              fontFamily: theme.fontFamily.numberBold,
            }}
          >
            +{props.reward}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View
            style={{
              flex: 1,
              gap: theme.space.xs,
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Text
              numberOfLines={2}
              style={{
                fontSize: theme.fontSize.xl,
                fontFamily: theme.fontFamily.bold,
                color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
              }}
            >
              {props.title}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.md,
                fontFamily: theme.fontFamily.regular,
                color: theme.isDark ? theme.color.textSecondary : theme.color.textInverse + '77',
              }}
            >
              {props.questions}{' '}{theme.i18n.t('contests.questions')} ·{' '}
              {theme.i18n.t('contests.minute', { mins: props.duration })} ·{' '}
              {theme.i18n.t(`common.${props.difficulty}`)}
            </Text>
          </View>

          <Text
            style={{
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
              color: theme.isDark ? theme.color.textSecondary : theme.color.textInverse + '77',
              marginBottom: theme.space.md,
            }}
          >
            {theme.i18n.t('contests.ep_reward')}
          </Text>
        </View>F

        <View
          style={{
            gap: theme.space.sm,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: theme.space.md,
          }}
        >
          <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
              <Feather
                name='clock'
                size={theme.space.md}
                color={theme.isDark ? theme.color.textSecondary : theme.color.textInverse + '77'}
              />
              <Text
                style={{
                  fontSize: theme.fontSize.md,
                  fontFamily: theme.fontFamily.regular,
                  color: theme.isDark ? theme.color.textSecondary : theme.color.textInverse + '77',
                }}
              >
                {theme.i18n.t('contests.ends_in')}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {[remaining.hours, remaining.minutes, remaining.seconds].map(
                (value, index) => (
                  <Fragment key={index}>
                    <View
                      style={{
                        alignItems: 'center',
                        padding: theme.space.sm,
                        borderRadius: theme.borderRadius.md,
                        backgroundColor: theme.isDark ? theme.color.textMuted + '77' : theme.color.textMuted + '55',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: theme.fontSize.lg,
                          fontFamily: theme.fontFamily.numberBold,
                          color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                        }}
                      >
                        {value}
                      </Text>
                    </View>

                    {index < 2 && (
                      <Text
                        style={{
                          fontSize: theme.fontSize.xl,
                          color: theme.color.textMuted,
                          fontFamily: theme.fontFamily.numberBold,
                          marginHorizontal: theme.space.xs,
                        }}
                      >
                        :
                      </Text>
                    )}
                  </Fragment>
                )
              )}
            </View>
          </View>

          <Pressable
            onPress={props.onPress}
            accessibilityRole='button'
            accessibilityLabel={theme.i18n.t('contests.join_now')}
            style={{
              paddingHorizontal: theme.space.md,
              paddingVertical: theme.space.sm * 1.25,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
              boxShadow: '0px 4px 10px rgba(255,255,255,0.12)',
            }}
          >
            <Text
              style={{
                color: '#6D28D9',
                fontSize: theme.fontSize.md,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {theme.i18n.t('contests.join_now')}
            </Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}
