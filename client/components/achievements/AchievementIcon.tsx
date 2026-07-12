import { View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { achievementIcons, AchievementIconKey, AchievementVariant } from '../../common/constants/achievements';


type Props = {
  iconKey: AchievementIconKey;
  variant: AchievementVariant;
  size?: number;
};

const rgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3
      ? normalized.split('').map((ch) => ch + ch).join('')
      : normalized.slice(0, 6);

  const red = Number.parseInt(full.slice(0, 2), 16);
  const green = Number.parseInt(full.slice(2, 4), 16);
  const blue = Number.parseInt(full.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export function AchievementIcon({ iconKey, variant, size = 72 }: Props) {
  const { theme } = useTheme();

  const Icon = achievementIcons[iconKey] ?? achievementIcons.award;

  const color = {
    gold: theme.color.warning,
    red: theme.color.error,
    purple: theme.color.premium,
    blue: theme.color.accent,
    green: theme.color.success,
  }[variant];

  const mainDiamond = size * 0.98;
  const innerDiamond = size * 0.72;
  const iconSize = Math.round(size * 0.48);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: mainDiamond,
          height: mainDiamond,
          borderWidth: 1.5,
          borderRadius: theme.borderRadius.md,
          borderColor: rgba(color, theme.isDark ? 0.28 : 0.18),
          backgroundColor: rgba(color, theme.isDark ? 0.14 : 0.08),
          transform: [{ rotate: '45deg' }],
        }}
      />

      <View
        style={{
          position: 'absolute',
          width: innerDiamond,
          height: innerDiamond,
          borderWidth: 1,
          borderRadius: theme.borderRadius.sm,
          borderColor: rgba(color, theme.isDark ? 0.22 : 0.14),
          backgroundColor: rgba(color, theme.isDark ? 0.12 : 0.06),
          transform: [{ rotate: '45deg' }],
        }}
      />

      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={iconSize} color={color} strokeWidth={2.25} />
      </View>
    </View>
  );
}
