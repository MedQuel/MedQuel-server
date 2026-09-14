import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import type { ProfileComparison } from '../common/types/types';

type Props = {
  comparison: ProfileComparison;
};
export function ComparisonChips({ comparison }: Props) {
  const { theme } = useTheme();
  const chips = [
    { label: 'XP', delta: comparison.xpDelta },
    { label: 'EP', delta: comparison.epDelta, color: theme.color.info },
    { label: 'Streak', delta: comparison.streakDelta, color: theme.color.warning },
    { label: 'Level', delta: comparison.levelDelta, color: theme.color.accent },
  ].filter((c) => c.delta !== 0);
  if (!chips.length) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.xs }}>
      {chips.map((chip) => {
        const ahead = chip.delta > 0;
        const color = chip.color ?? (ahead ? theme.color.success : theme.color.error);
        return (
          <View
            key={chip.label}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: theme.borderRadius.full,
              backgroundColor: `${color}18`,
            }}
          >
            <MaterialCommunityIcons name={ahead ? 'arrow-up-bold' : 'arrow-down-bold'} size={11} color={color} />
            <Text style={{ color, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.number, fontWeight: theme.fontWeight.bold }}>
              {Math.abs(chip.delta)} {chip.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
