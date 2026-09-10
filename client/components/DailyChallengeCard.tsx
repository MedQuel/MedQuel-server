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
  onDismiss?: () => void;
};

export function DailyChallengeCard(props: DailyChallengeCardProps) {
  const { theme } = useTheme();

  const t = (key: string, options?: any) => {
    try {
      const translation = theme?.i18n?.t ? theme.i18n.t(key, options) : key;
      return translation || key;
    } catch {
      return key;
    }
  };

  const formattedTimeLeft = (() => {
    const minutes = Number(props.endsAt);
    if (!Number.isFinite(minutes)) return props.endsAt ?? '0';
    if (minutes > 60) return `${Math.floor(minutes / 60)}h`;
    return `${minutes}m`;
  })();

  return (
    <LinearGradient
      colors={
        theme?.isDark
          ? ['#05173d', '#071d4d', '#08205a']
          : ['#2762f7', '#1a56f0', '#0f49db']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1.5,
        borderRadius: (theme?.borderRadius?.xl ?? 16) * 1.25,
        borderColor: theme?.isDark ? theme?.color?.border : 'rgba(37,99,235,0.15)',
        paddingVertical: theme?.space?.lg ?? 16,
        paddingHorizontal: (theme?.space?.md ?? 12) * 1.25,
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: -55,
          right: -35,
          width: 140,
          height: 140,
          borderRadius: theme?.borderRadius?.full ?? 999,
          backgroundColor: (theme?.color?.textMuted ?? '#666666') + '33',
        }}
      />

      {/* Cross Button */}
      {props.completed && props.onDismiss ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={props.onDismiss}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{
            position: 'absolute',
            top: theme?.space?.md ?? 12,
            right: theme?.space?.md ?? 12,
            zIndex: 20,
            width: (theme?.space?.xl ?? 20) * 1.1,
            height: (theme?.space?.xl ?? 20) * 1.1,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme?.borderRadius?.full ?? 999,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.35)',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
          }}
        >
          <Feather name="x" size={theme?.fontSize?.md ?? 14} color="#FFFFFF" />
        </TouchableOpacity>
      ) : null}

      {props.completed ? (
        <View style={{ gap: theme?.space?.md ?? 12, alignItems: 'center', paddingVertical: theme?.space?.sm ?? 8 }}>
          <View
            style={{
              width: (theme?.space?.xxl ?? 24) * 1.4,
              height: (theme?.space?.xxl ?? 24) * 1.4,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme?.borderRadius?.full ?? 999,
              backgroundColor: (theme?.color?.success ?? '#10B981') + '33',
            }}
          >
            <Feather name="check" size={theme?.fontSize?.xxl ?? 24} color={theme?.color?.success ?? '#10B981'} />
          </View>

          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                color: theme?.isDark ? theme?.color?.textPrimary : theme?.color?.textInverse,
                fontSize: (theme?.fontSize?.xl ?? 18) * 1.05,
                fontWeight: theme?.fontWeight?.bold ?? '700',
                fontFamily: theme?.fontFamily?.bold,
                textAlign: 'center',
              }}
            >
              Today's Challenge Completed!
            </Text>
            <Text
              style={{
                marginTop: theme?.space?.xs ?? 4,
                color: theme?.isDark ? theme?.color?.textSecondary : (theme?.color?.textInverse ?? '#FFF') + '99',
                fontSize: theme?.fontSize?.md ?? 14,
                fontFamily: theme?.fontFamily?.regular,
                textAlign: 'center',
              }}
            >
              Come back tomorrow for a new one.
            </Text>
          </View>
        </View>
      ) : (
        <View style={{ gap: theme?.space?.sm ?? 8, flexDirection: 'column', justifyContent: 'center' }}>
          <View style={{ gap: (theme?.space?.sm ?? 8) * 0.75, flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                padding: (theme?.space?.xs ?? 4) * 1.1,
                borderRadius: theme?.borderRadius?.full ?? 999,
                backgroundColor: theme?.color?.info ?? '#3B82F6',
              }}
            />
            <Text
              style={{
                letterSpacing: 0.85,
                textTransform: 'uppercase',
                color: theme?.isDark ? theme?.color?.info : (theme?.color?.textInverse ?? '#FFF') + '99',
                fontSize: (theme?.fontSize?.sm ?? 12) * 0.95,
                fontWeight: theme?.fontWeight?.bold ?? '700',
                fontFamily: theme?.fontFamily?.regular,
              }}
            >
              {t('home.daily_challenge')}
            </Text>
          </View>

          <Text
            style={{
              color: theme?.isDark ? theme?.color?.textPrimary : theme?.color?.textInverse,
              fontSize: (theme?.fontSize?.xl ?? 18) * 1.05,
              fontWeight: theme?.fontWeight?.bold ?? '700',
              fontFamily: theme?.fontFamily?.bold,
            }}
          >
            {props.title}
          </Text>

          <Text
            style={{
              color: theme?.isDark ? theme?.color?.textSecondary : (theme?.color?.textInverse ?? '#FFF') + '99',
              fontSize: theme?.fontSize?.md ?? 14,
              fontWeight: theme?.fontWeight?.medium ?? '500',
              fontFamily: theme?.fontFamily?.regular,
            }}
          >
            {props.questions} {t('common.questions')} · {props.duration} {t('common.min')} ·{' '}
            {t(`common.${props.difficulty}`)}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ gap: (theme?.space?.sm ?? 8) * 1.25, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ gap: theme?.space?.xs ?? 4, flexDirection: 'row', alignItems: 'center' }}>
                <Feather
                  name="clock"
                  size={theme?.space?.md ?? 12}
                  color={theme?.isDark ? theme?.color?.textSecondary : (theme?.color?.textInverse ?? '#FFF') + '99'}
                />
                <Text
                  style={{
                    color: theme?.isDark ? theme?.color?.textSecondary : (theme?.color?.textInverse ?? '#FFF') + '99',
                    fontSize: theme?.fontSize?.sm ?? 12,
                    fontWeight: theme?.fontWeight?.medium ?? '500',
                    fontFamily: theme?.fontFamily?.regular,
                  }}
                >
                  {formattedTimeLeft} {t('contests.time_left')}
                </Text>
              </View>

              <View
                style={{
                  gap: (theme?.space?.sm ?? 8) * 0.5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: (theme?.space?.xs ?? 4) * 1.5,
                  paddingHorizontal: (theme?.space?.sm ?? 8) * 1.25,
                  borderRadius: theme?.borderRadius?.md ?? 8,
                  backgroundColor: theme?.isDark ? (theme?.color?.accent ?? '#3B82F6') + '33' : (theme?.color?.textInverse ?? '#FFF') + '33',
                }}
              >
                <Feather
                  name="zap"
                  size={(theme?.space?.md ?? 12) * 0.95}
                  color={theme?.isDark ? theme?.color?.info : theme?.color?.textInverse}
                />
                <Text
                  style={{
                    color: theme?.isDark ? theme?.color?.info : theme?.color?.textInverse,
                    fontSize: theme?.fontSize?.sm ?? 12,
                    fontWeight: theme?.fontWeight?.bold ?? '700',
                    fontFamily: theme?.fontFamily?.number,
                  }}
                >
                  +{props.epReward} {t('common.ep')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={props.onStart}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme?.space?.xs ?? 4,
                paddingVertical: theme?.space?.sm ?? 8,
                paddingHorizontal: theme?.space?.md ?? 12,
                borderRadius: theme?.borderRadius?.lg ?? 12,
                backgroundColor: theme?.isDark ? theme?.color?.info : theme?.color?.textInverse,
              }}
            >
              <Text
                style={{
                  letterSpacing: 0.2,
                  color: theme?.isDark ? theme?.color?.background : theme?.color?.accent,
                  fontSize: theme?.fontSize?.lg ?? 16,
                  fontWeight: theme?.fontWeight?.bold ?? '700',
                  fontFamily: theme?.fontFamily?.bold,
                }}
              >
                {t('common.start')} →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}