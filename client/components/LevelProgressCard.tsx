import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../theme/ThemeContext';
import { xpRequiredForLevel } from '../common/utils/computeLevelXP';


export type LevelProgressCardProps = {
  currentLevel: number;
  nextLevel: number;
  currentXP: number;
  nextLevelXP: number;
  remainingXP: number;
};

export function LevelProgressCard(props: LevelProgressCardProps) {
  const { theme } = useTheme();

  // XP already required to have reached the CURRENT level (i.e. the start of this level's range)
  const currentLevelXP = xpRequiredForLevel(props.currentLevel);
  const levelRange = props.nextLevelXP - currentLevelXP;

  // Progress within THIS level's range, not against total accumulated XP
  const progress = levelRange > 0
    ? Math.min(Math.max((props.currentXP - currentLevelXP) / levelRange, 0), 1)
    : 0;

  return (
    <View
      style={{
        paddingVertical: theme.space.md * 0.75,
        paddingHorizontal: theme.space.md * 1.1,
        borderWidth: 1.5,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
        boxShadow: theme.isDark
          ? '0px 8px 20px rgba(0,0,0,0.22)'
          : '0px 8px 18px rgba(15,23,42,0.06)',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.space.sm,
        }}
      >
        <Text
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {theme.i18n.t('common.level')} {props.currentLevel} ⟶{' '}
          {theme.i18n.t('common.level')} {props.nextLevel}
        </Text>
        <Text
          style={{
            color: theme.color.accent,
            fontSize: theme.fontSize.sm * 1.05,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.number,
          }}
        >
          {props.currentXP.toLocaleString()} /{' '}
          {props.nextLevelXP.toLocaleString()} {theme.i18n.t('common.XP')}
        </Text>
      </View>

      <View
        style={{
          overflow: 'hidden',
          height: theme.space.sm * 0.9,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.color.border,
        }}
      >
        <LinearGradient
          colors={[
            theme.isDark ? theme.color.accent : theme.color.accent + 'AA',
            theme.isDark ? theme.color.info : theme.color.accent,
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            height: '100%',
            width: `${progress * 100}%`,
            borderRadius: theme.borderRadius.full,
          }}
        />
      </View>

      <Text
        style={{
          color: theme.color.textMuted,
          fontSize: theme.fontSize.sm,
          fontFamily: theme.fontFamily.light,
          marginTop: theme.space.sm,
        }}
      >
        {theme.i18n.t('home.ep_to_next_level', { remainingEP: props.remainingXP.toLocaleString() })}
      </Text>
    </View>
  );
}