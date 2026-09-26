import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


type DailyChallengeCardProps = {
  title: string;
  subject: string;
  questions: number;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  endsAt: string;
  epReward: number;
  completed?: boolean;
  onStart: () => void;
  onDismiss?: () => void;
};

export function DailyChallengeCard(props: DailyChallengeCardProps) {
  const { theme } = useTheme();

  const formattedTimeLeft = (() => {
    const expiry = new Date(props.endsAt).getTime();
    if (!Number.isFinite(expiry)) return props.endsAt || '-';
    const minutes = Math.max(0, Math.ceil((expiry-Date.now()) / 60000));
    if (minutes > 60) return `${Math.floor(minutes / 60)}h`;

    return `${Math.max(1, minutes)}m`;
  })();

  const gradientColors: [string, string, string] = theme.isDark
    ? ['#0d2a63', '#0a1e48', '#071638']
    : ['#ffffff', '#f8fafc', '#eef2f7'];

  if (props.completed) {
    return (
      <View
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderWidth: 0,
          borderRadius: theme.borderRadius.xl,
        }}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.xl,
            paddingHorizontal: theme.space.xl,
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 170,
              height: 170,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.info + '18',
              pointerEvents: 'none'
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: -50,
              left: -30,
              width: 130,
              height: 130,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.accent + '18',
              pointerEvents: 'none'
            }}
          />

          {props.onDismiss && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={props.onDismiss}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 30,
                height: 30,
                zIndex: 20,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.textPrimary + '18',
              }}
            >
              <Feather name='x' size={theme.fontSize.md} color={theme.color.textSecondary} />
            </TouchableOpacity>
          )}

          <View
            style={{
              width: theme.space.xxl * 1.5,
              height: theme.space.xxl * 1.5,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.space.md,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.success + '22',
            }}
          >
            <Feather name='check' size={theme.fontSize.xxl} color={theme.color.success} />
          </View>

          <Text
            style={{
              textAlign: 'center',
              fontSize: theme.fontSize.xl,
              color: theme.color.textPrimary,
              fontFamily: theme.fontFamily.regular,
              marginBottom: theme.space.xs,
            }}
          >
            {theme.i18n.t('home.daily_challenge_completed')}
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: theme.fontSize.sm,
              color: theme.color.textSecondary,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {theme.i18n.t('home.daily_challenge_come_back')}
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingHorizontal: theme.space.md,
        paddingVertical: theme.space.md * 1.15,
        borderWidth: 0,
        borderRadius: theme.borderRadius.xl,
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
          backgroundColor: theme.color.info + '18',
          pointerEvents: 'none'
        }}
      />

      <View style={{ gap: theme.space.sm, flexDirection: 'column', justifyContent: 'center' }}>
        <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: theme.space.sm,
              height: theme.space.sm,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.info,
            }}
          />
          <Text
            style={{
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              lineHeight: theme.fontSize.sm * 1.25,
              color: theme.color.info,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('home.daily_challenge')}
          </Text>
        </View>

        <View style={{ gap: theme.space.xs * 0.25, flexDirection: 'column' }}>
          <Text
            style={{
              fontSize: theme.fontSize.xl,
              color: theme.color.textPrimary,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {props.title}
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              color: theme.color.textSecondary,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {props.subject}
          </Text>
        </View>

        <Text
          style={{
            fontSize: theme.fontSize.md,
            color: theme.color.textSecondary,
            fontFamily: theme.fontFamily.number,
          }}
        >
          {props.questions} {theme.i18n.t('common.questions')} ·{' '}
          {props.duration} {theme.i18n.t('common.min')} ·{' '}
          {theme.i18n.t(`common.${props.difficulty}`)}
        </Text>

        <View
          style={{
            gap: theme.space.sm,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
              <Feather
                name='clock'
                size={theme.fontSize.sm}
                color={theme.color.textSecondary}
              />
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.color.textSecondary,
                  fontFamily: theme.fontFamily.number,
                }}
              >
                {formattedTimeLeft} {theme.i18n.t('home.expires')}
              </Text>
            </View>

            <View
              style={{
                gap: theme.space.xs,
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: theme.space.xs,
                paddingHorizontal: theme.space.sm,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.color.info + '22',
              }}
            >
              <Feather name='zap' size={theme.fontSize.xs} color={theme.color.info} />
              <Text
                style={{
                  color: theme.color.info,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.numberBold,
                }}
              >
                +{props.epReward} {theme.i18n.t('common.ep')}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={props.onStart}
            style={{
              gap: theme.space.xs,
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.space.sm,
              paddingHorizontal: theme.space.md,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.color.accent,
            }}
          >
            <Text
              style={{
                lineHeight: theme.fontSize.md * 1.25,
                fontSize: theme.fontSize.md,
                fontFamily: theme.fontFamily.bold,
                color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
              }}
            >
              {theme.i18n.t('common.start')} →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}
