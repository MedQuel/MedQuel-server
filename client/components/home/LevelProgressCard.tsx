import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../theme/ThemeContext';
import { xpRequiredForLevel, computeLevelFromXp } from '../common/utils/computeLevelXP';


export function LevelProgressCard({ xpPoints }: { xpPoints: number }) {
  const currentLevelXP = xpRequiredForLevel(computeLevelFromXp(xpPoints));
  const nextLevelXP = xpRequiredForLevel(computeLevelFromXp(xpPoints) + 1);
  const remainingXP = Math.max(0, nextLevelXP-xpPoints);

  const progress = (nextLevelXP - currentLevelXP) > 0
    ? Math.min(Math.max((xpPoints-currentLevelXP) / (nextLevelXP-currentLevelXP), 0), 1)
    : 0;

  const { theme } = useTheme();

  return (
    <View
      style={{
        paddingVertical: theme.space.md * 0.75,
        paddingHorizontal: theme.space.md * 1.1,
        borderWidth: 1.5,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
        boxShadow: theme.isDark ? '0px 8px 20px rgba(0,0,0,0.22)' : '0px 8px 18px rgba(15,23,42,0.06)',
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
            fontSize: theme.fontSize.sm * 1.15,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {theme.i18n.t('common.level')} {computeLevelFromXp(xpPoints)} ➜{' '}
          {theme.i18n.t('common.level')} {computeLevelFromXp(xpPoints) + 1}
        </Text>
        <Text
          style={{
            color: theme.color.accent,
            fontSize: theme.fontSize.sm * 1.05,
            fontFamily: theme.fontFamily.numberBold,
          }}
        >
          {xpPoints.toLocaleString()} / {nextLevelXP.toLocaleString()}{' '}{theme.i18n.t('common.XP')}
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
          fontFamily: theme.fontFamily.number,
          marginTop: theme.space.sm,
        }}
      >
        {theme.i18n.t('home.xp_to_next_level', { remainingXP: remainingXP.toLocaleString() })}
      </Text>
    </View>
  );
}
