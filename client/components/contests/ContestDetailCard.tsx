import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeContext';


type ContestDetailCardProps = {
  subtitle: string;
  title: string;
  creator: string;
  creatorSpecialty: string;
  qCount: number;
  timeMinutes: number;
  epReward: number;
  passPercentage: number;
};

export function ContestDetailCard(props: ContestDetailCardProps) {
  const { theme } = useTheme();

  const infoBlocks = [
    {
      key: 'qs',
      icon: (
        <Feather
          name='file-text'
          size={theme.fontSize.lg}
          color={theme.isDark ? theme.color.info : '#FFFFFF'}
        />
      ),
      label: `${props.qCount} ${theme.i18n.t('contests.questions')}`,
    },
    {
      key: 'time',
      icon: (
        <Feather
          name='clock'
          size={theme.fontSize.lg}
          color={theme.isDark ? theme.color.info : '#FFFFFF'}
        />
      ),
      label: `${theme.i18n.t('contests.minute', { mins: props.timeMinutes })}`,
    },
    {
      key: 'ep',
      icon: (
        <Feather
          name='zap'
          size={theme.fontSize.md}
          color={theme.isDark ? theme.color.info : '#FFFFFF'}
        />
      ),
      label: `+${props.epReward} ${theme.i18n.t('common.ep')}`,
    },
    {
      key: 'pass',
      icon: (
        <Feather
          name='target'
          size={theme.fontSize.lg}
          color={theme.isDark ? theme.color.info : '#FFFFFF'}
        />
      ),
      label: `${theme.i18n.t('contests.preQuiz.pass_percent', { percent: props.passPercentage })}`,
    },
  ];

  return (
    <View
      style={{
        overflow: 'hidden',
        gap: theme.space.sm,
        padding: theme.space.md,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.isDark ? theme.color.card : theme.color.error,
        boxShadow: theme.isDark ? '0px 5px 16px rgba(0, 0, 0, 0.25)' : `0px 5px 16px ${theme.color.error}`,
      }}
    >
      <View
        style={{
          position: 'absolute',
          right: -theme.space.xxl,
          top: -theme.space.xxl,
          width: 135,
          height: 135,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.isDark ? theme.color.accent + '22' : 'rgba(255,255,255,0.15)',
          pointerEvents: 'none',
        }}
      />

      <Text
        style={{
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          fontSize: theme.fontSize.xs,
          fontFamily: theme.fontFamily.bold,
          color: theme.isDark ? theme.color.info : theme.color.textInverse,
        }}
      >
        {props.subtitle}
      </Text>

      <Text
        numberOfLines={2}
        style={{
          fontSize: theme.fontSize.xxl,
          fontFamily: theme.fontFamily.bold,
          color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
          lineHeight: theme.fontSize.xxl * 1.25,
        }}
      >
        {props.title}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          fontSize: theme.fontSize.sm,
          fontFamily: theme.fontFamily.light,
          color: theme.isDark ? theme.color.textSecondary : theme.color.textInverse + 'BB',
        }}
      >
        {`${theme.i18n.t('contests.preQuiz.by')}${' '}${props.creator} · ${props.creatorSpecialty}`}
      </Text>

      <View style={{ gap: theme.space.md, flexDirection: 'row', marginTop: theme.space.md }}>
        {infoBlocks.map((block) => (
          <View
            key={block.key}
            style={{
              flex: 1,
              gap: theme.space.xs,
              alignItems: 'center',
              paddingVertical: theme.space.sm,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.isDark ? theme.color.surface : 'rgba(255,255,255,0.18)',
            }}
          >
            {block.icon}
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={{
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.numberBold,
                color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
              }}
            >
              {block.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
