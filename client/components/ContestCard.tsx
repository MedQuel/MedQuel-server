import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


type ContestCardProps = {
  title: string;
  subject: string;
  difficulty: 'hard' | 'medium' | 'easy';
  epReward: number;
  timeLeft?: string;
  questionsCount: number;
  duration: string;
  participantsCount: number;
  onStartPress: () => void;
};

export function ContestCard(props: ContestCardProps) {
  const { theme } = useTheme();

  const difficultyColor = ( difficulty: 'hard' | 'medium' | 'easy' ): { textColor: string } => {
    if (difficulty === 'hard') return { textColor: theme.color.error };
    else if (difficulty === 'medium') return { textColor: theme.color.warning };
    else return { textColor: theme.color.success };
  };

  const formattedTimeLeft = (() => {
    const minutes = Number(props.timeLeft);

    if (!Number.isFinite(minutes)) return props.timeLeft;
    if (minutes > 60) return `${theme.i18n.t('contests.hour', { hrs: Math.floor(minutes / 60) })}`;

    return `${theme.i18n.t('contests.minute', { mins: minutes })}`;
  })();


  return (
    <View
      style={{
        gap: theme.space.sm,
        flexDirection: 'column',
        padding: theme.space.md,
        borderWidth: 1.5,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
        boxShadow: theme.isDark
          ? '0px 4px 20px rgba(0,0,0,0.4)'
          : '0px 2px 12px rgba(0,0,0,0.08)',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              paddingVertical: theme.space.xs,
              paddingHorizontal: theme.space.sm * 1.25,
              borderRadius: theme.borderRadius.sm * 1.25,
              backgroundColor: theme.color.accent + '18',
            }}
          >
            <Text
              style={{
                color: theme.color.accent,
                fontSize: theme.fontSize.xs,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {props.subject}
            </Text>
          </View>

          <View
            style={{
              paddingVertical: theme.space.xs,
              paddingHorizontal: theme.space.sm,
              borderRadius: theme.borderRadius.sm * 1.25,
              backgroundColor: difficultyColor(props.difficulty).textColor + '18',
            }}
          >
            <Text
              style={{
                color: difficultyColor(props.difficulty).textColor,
                fontSize: theme.fontSize.xs,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {theme.i18n.t(`common.${props.difficulty}`)}
            </Text>
          </View>
        </View>

        <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
          <Feather
            name='zap'
            size={theme.fontSize.lg}
            color={theme.isDark ? theme.color.info : theme.color.accent}
          />
          <Text
            style={{
              color: theme.isDark ? theme.color.info : theme.color.accent,
              fontSize: theme.fontSize.xl,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.number,
            }}
          >
            +{props.epReward}
          </Text>
        </View>
      </View>

      <View
        style={{
          gap: theme.space.sm,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'column', gap: theme.space.sm, justifyContent: 'flex-start' }}>
          <Text
            style={{
              flexShrink: 1,
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.regular,
            }}
            numberOfLines={2}
          >
            {props.title}
          </Text>
          <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
            <Feather name='clock' size={theme.fontSize.sm} color={theme.color.warning} />
            <Text
              style={{
                color: theme.color.warning,
                fontSize: theme.fontSize.sm,
                fontWeight: theme.fontWeight.medium,
                fontFamily: theme.fontFamily.light,
              }}
            >
              {formattedTimeLeft} {theme.i18n.t('contests.time_left')}
            </Text>
          </View>
        </View>

        <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
          {theme.i18n.t('contests.ep_reward')}
        </Text>
      </View>

      <View
        style={{
          gap: theme.space.sm,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginVertical: theme.space.xs,
        }}
      >
        <View
          style={{
            flex: 1,
            gap: theme.space.xs * 1.25,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingVertical: theme.space.sm,
            paddingHorizontal: theme.space.sm,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.color.surface,
          }}
        >
          <Feather name='file-text' size={theme.space.md * 0.9} color={theme.color.textMuted} />
          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm * 1.1,
              fontWeight: theme.fontWeight.medium,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {props.questionsCount} {theme.i18n.t('contests.questions')}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            gap: theme.space.xs * 1.25,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingVertical: theme.space.sm,
            paddingHorizontal: theme.space.sm,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.color.surface,
          }}
        >
          <Feather name='clock' size={theme.space.md * 0.9} color={theme.color.textMuted} />
          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm * 1.1,
              fontWeight: theme.fontWeight.medium,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {theme.i18n.t('contests.minute', { mins: props.duration })}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            gap: theme.space.xs * 1.25,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingVertical: theme.space.sm,
            paddingHorizontal: theme.space.sm,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.color.surface,
          }}
        >
          <Feather name='users' size={theme.space.md * 0.9} color={theme.color.textMuted} />
          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm * 1.1,
              fontWeight: theme.fontWeight.medium,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {props.participantsCount.toLocaleString()}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={props.onStartPress}
        activeOpacity={0.85}
        style={{
          gap: theme.space.xs,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: theme.space.md * 0.9,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.color.accent,
        }}
      >
        <Text
          style={{
            letterSpacing: 0.3,
            color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {theme.i18n.t('common.start_contest')}
        </Text>
        <Feather name='chevron-right' size={theme.fontSize.lg} color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse} />
      </TouchableOpacity>
    </View>
  );
}
