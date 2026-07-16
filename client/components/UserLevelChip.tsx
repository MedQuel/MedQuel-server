import { View, Text, ViewStyle } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


export function UserLevelChip({ level, size = 'md', style }: { level: number, size?: 'sm' | 'md', style?: ViewStyle }) {
  const { theme } = useTheme();
  const isSm = size === 'sm';

  return (
    <View
      style={{
        gap: isSm ? theme.space.xs : theme.space.xs * 1.25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: isSm ? 1 : 2,
        borderRadius: theme.borderRadius.full,
        borderColor: theme.color.accent + '33',
        paddingVertical: isSm ? theme.space.xs : theme.space.sm * 0.8,
        paddingHorizontal: isSm ? theme.space.sm : theme.space.md,
        backgroundColor: theme.color.surface,
        ...style,
      }}
    >
      <FontAwesome
        name='star'
        size={isSm ? theme.fontSize.sm : theme.space.md * 0.95}
        color={theme.color.warning}
      />
      <Text
        style={{
          color: theme.color.accent,
          fontSize: isSm ? theme.fontSize.sm : theme.fontSize.md,
          fontWeight: theme.fontWeight.bold,
          fontFamily: theme.fontFamily.regular,
        }}
      >
        {theme.i18n.t('common.lv')} {level}
      </Text>
    </View>
  );
}