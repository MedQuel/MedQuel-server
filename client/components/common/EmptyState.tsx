import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeContext';


interface EmptyStateProps {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = 'inbox', title, subtitle }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={{ gap: theme.space.xs, alignItems: 'center', paddingVertical: theme.space.lg }}>
      <Feather
        name={icon}
        size={theme.space.lg * 1.2}
        color={theme.color.textMuted}
      />
      <Text
        style={{
          textAlign: 'center',
          color: theme.color.textSecondary,
          fontSize: theme.fontSize.sm,
          fontFamily: theme.fontFamily.bold,
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            textAlign: 'center',
            color: theme.color.textMuted,
            fontSize: theme.fontSize.xs,
            marginTop: theme.space.xs * 0.5,
            paddingHorizontal: theme.space.lg,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}
