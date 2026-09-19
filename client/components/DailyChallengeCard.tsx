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

  if (props.completed) {
    return (
      <View
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 24,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0c224e',
        }}
      >
        <LinearGradient
          colors={['#0d2a63', '#0a1e48', '#071638']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            paddingVertical: 36,
            paddingHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 170,
              height: 170,
              borderRadius: 85,
              backgroundColor: 'rgba(25, 60, 130, 0.45)',
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: -50,
              left: -30,
              width: 130,
              height: 130,
              borderRadius: 65,
              backgroundColor: 'rgba(15, 45, 100, 0.35)',
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
                zIndex: 20,
                width: 30,
                height: 30,
                borderRadius: 15,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <Feather name="x" size={16} color="#A0B3D6" />
            </TouchableOpacity>
          )}

          <View
            style={{
              width: 74,
              height: 74,
              borderRadius: 37,
              backgroundColor: 'rgba(16, 75, 78, 0.75)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
            }}
          >
            <Feather name="check" size={36} color="#10B981" />
          </View>

          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 22,
              fontWeight: '700',
              fontFamily: theme?.fontFamily?.bold ?? 'System',
              textAlign: 'center',
              marginBottom: 8,
              letterSpacing: 0.2,
            }}
          >
            Today's Challenge Completed!
          </Text>

          <Text
            style={{
              color: '#8CA3CF',
              fontSize: 14,
              fontFamily: theme?.fontFamily?.regular ?? 'System',
              textAlign: 'center',
            }}
          >
            Come back tomorrow for a new one.
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1.5,
        borderRadius: 20,
        borderColor: theme?.isDark ? theme?.color?.border : 'rgba(37,99,235,0.15)',
        backgroundColor: theme?.color?.card ?? '#071630',
        paddingVertical: 16,
        paddingHorizontal: 16,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -55,
          right: -35,
          width: 140,
          height: 140,
          borderRadius: 999,
          backgroundColor: (theme?.color?.surface ?? '#102246') + '44',
        }}
      />

      <View style={{ gap: 8, flexDirection: 'column', justifyContent: 'center' }}>
        <View style={{ gap: 6, flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              padding: 4,
              borderRadius: 999,
              backgroundColor: theme?.color?.info ?? '#3B82F6',
            }}
          />
          <Text
            style={{
              letterSpacing: 0.85,
              textTransform: 'uppercase',
              color: theme?.color?.info ?? '#3B82F6',
              fontSize: 11,
              fontWeight: '700',
              fontFamily: theme?.fontFamily?.regular,
            }}
          >
            {t('home.daily_challenge')}
          </Text>
        </View>

        <Text
          style={{
            color: theme?.color?.textPrimary ?? '#FFFFFF',
            fontSize: 18,
            fontWeight: '700',
            fontFamily: theme?.fontFamily?.bold,
          }}
        >
          {props.title}
        </Text>

        <Text
          style={{
            color: theme?.color?.textSecondary ?? '#8E9BAE',
            fontSize: 14,
            fontWeight: '500',
            fontFamily: theme?.fontFamily?.regular,
          }}
        >
          {props.questions} {t('common.questions')} · {props.duration} {t('common.min')} ·{' '}
          {t(`common.${props.difficulty}`)}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: 10, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ gap: 4, flexDirection: 'row', alignItems: 'center' }}>
              <Feather
                name="clock"
                size={12}
                color={theme?.color?.textSecondary ?? '#8E9BAE'}
              />
              <Text
                style={{
                  color: theme?.color?.textSecondary ?? '#8E9BAE',
                  fontSize: 12,
                  fontWeight: '500',
                  fontFamily: theme?.fontFamily?.regular,
                }}
              >
                {formattedTimeLeft} {t('contests.time_left')}
              </Text>
            </View>

            <View
              style={{
                gap: 4,
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 8,
                backgroundColor: (theme?.color?.accent ?? '#3B82F6') + '22',
              }}
            >
              <Feather
                name="zap"
                size={11}
                color={theme?.color?.info ?? '#3B82F6'}
              />
              <Text
                style={{
                  color: theme?.color?.info ?? '#3B82F6',
                  fontSize: 12,
                  fontWeight: '700',
                  fontFamily: theme?.fontFamily?.number,
                }}
              >
                +{props.epReward} {t('common.ep')}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={props.onStart}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: theme?.color?.accent ?? '#3B82F6',
            }}
          >
            <Text
              style={{
                letterSpacing: 0.2,
                color: theme?.color?.textInverse ?? '#FFFFFF',
                fontSize: 15,
                fontWeight: '700',
                fontFamily: theme?.fontFamily?.bold,
              }}
            >
              {t('common.start')} →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}