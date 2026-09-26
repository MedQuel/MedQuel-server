import { FontAwesome } from '@expo/vector-icons';
import { View, Text, ViewStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


export function UserLevelChip({ level, size = 'md', style }: {
  level: number;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}) {
  const { theme } = useTheme();
  const isSm = size === 'sm';

  return (
    <View
      style={{
        gap: isSm ? theme.space.xs : theme.space.xs * 1.25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: isSm ? theme.space.xs : theme.space.sm * 0.8,
        paddingHorizontal: isSm ? theme.space.sm * 1.5 : theme.space.md,
        borderWidth: isSm ? 1 : 2,
        borderRadius: theme.borderRadius.full,
        borderColor: theme.color.accent + '33',
        backgroundColor: theme.color.surface,
        ...style,
      }}
    >
      <FontAwesome
        name='star'
        size={isSm ? theme.fontSize.sm * 1.15 : theme.space.md}
        color={theme.color.warning}
      />
      <Text
        style={{
          color: theme.color.accent,
          fontSize: isSm ? theme.fontSize.sm * 1.15 : theme.fontSize.md,
          fontFamily: theme.fontFamily.numberBold,
        }}
      >
        {theme.i18n.t('common.lv')} {level}
      </Text>
    </View>
  );
}
