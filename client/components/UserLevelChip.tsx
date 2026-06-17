import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


export function UserLevelChip({ level }: { level: number }) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        gap: theme.space.xs * 1.25,
        flexDirection: 'row',
        alignSelf: 'flex-start',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: theme.borderRadius.full,
        borderColor: theme.color.accent + '33',
        paddingVertical: theme.space.sm * 0.8,
        paddingHorizontal: theme.space.md,
        backgroundColor: theme.color.surface,
      }}
    >
      <FontAwesome
        name='star'
        size={theme.space.md * 0.95}
        color={theme.color.warning}
      />
      <Text
        style={{
          color: theme.color.accent,
          fontSize: theme.fontSize.md,
          fontWeight: theme.fontWeight.bold,
          fontFamily: theme.fontFamily.regular,
        }}
      >
        {theme.i18n.t('common.lv')} {level}
      </Text>
    </View>
  );
}
