import { View, Text } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


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

export function ContestDetailCard({
  subtitle,
  title,
  creator,
  creatorSpecialty,
  qCount,
  timeMinutes,
  epReward,
  passPercentage,
}: ContestDetailCardProps) {
  const { theme } = useTheme();

  const infoBlocks = [
    {
      key: 'qs',
      icon: <Feather name="file-text" size={theme.fontSize.lg} color={theme.color.info} />,
      label: `${qCount} ${theme.i18n.t('components.ContestDetailCard.qs')}`,
    },
    {
      key: 'time',
      icon: <Feather name="clock" size={theme.fontSize.lg} color={theme.color.info} />,
      label: `${timeMinutes} ${theme.i18n.t('components.ContestDetailCard.min')}`,
    },
    {
      key: 'ep',
      icon: <MaterialCommunityIcons name="lightning-bolt-outline" size={theme.fontSize.md} color={theme.color.info} />,
      label: `+${epReward} ${theme.i18n.t('components.ContestDetailCard.ep')}`,
    },
    {
      key: 'pass',
      icon: <Feather name="target" size={theme.fontSize.lg} color={theme.color.info} />,
      label: `${passPercentage}% ${theme.i18n.t('components.ContestDetailCard.pass_percent')}`,
    },
  ];

  return (
    <View
      style={{
        backgroundColor: theme.isDark ? theme.color.card : theme.color.error,
        borderRadius: theme.borderRadius.xl,
        overflow: 'hidden',
        padding: theme.space.md,
        gap: theme.space.sm,
        shadowColor: theme.isDark ? '#000000' : theme.color.error,
        shadowOpacity: theme.isDark ? 0.25 : 0.35,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 5 },
        elevation: 8,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -theme.space.xxl,
          top: -theme.space.xxl,
          width: 135,
          height: 135,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.isDark
            ? theme.color.accent + '22'
            : 'rgba(255,255,255,0.15)',
        }}
      />

      <Text
        style={{
          color: theme.isDark ? theme.color.info : theme.color.textInverse,
          fontSize: theme.fontSize.xs,
          fontWeight: theme.fontWeight.bold as any,
          fontFamily: theme.fontFamily.regular,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        }}
      >
        {subtitle}
      </Text>

      <Text
        style={{
          color: '#FFFFFF',
          fontSize: theme.fontSize.xxl,
          fontWeight: theme.fontWeight.bold as any,
          fontFamily: theme.fontFamily.regular,
          lineHeight: theme.fontSize.xxl * 1.25,
        }}
        numberOfLines={2}
      >
        {title}
      </Text>

      <Text
        style={{
          color: theme.isDark ? theme.color.textSecondary : theme.color.textInverse + 'BB',
          fontSize: theme.fontSize.sm,
          fontFamily: theme.fontFamily.light,
        }}
        numberOfLines={1}
      >
        {`${theme.i18n.t('components.ContestDetailCard.by')}${creator} · ${creatorSpecialty}`}
      </Text>

      <View style={{ flexDirection: 'row', gap: theme.space.md, marginTop: theme.space.md }}>
        {infoBlocks.map((block) => (
          <View
            key={block.key}
            style={{
              flex: 1,
              alignItems: 'center',
              gap: theme.space.xs,
              paddingVertical: theme.space.sm,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.isDark
                ? theme.color.surface
                : 'rgba(255,255,255,0.18)',
            }}
          >
            {block.icon}
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: theme.fontSize.sm,
                fontWeight: theme.fontWeight.medium as any,
                fontFamily: theme.fontFamily.number,
              }}
              numberOfLines={1}
            >
              {block.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default  
ContestDetailCard;