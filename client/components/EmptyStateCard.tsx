import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import { withAlpha } from '../common/utils/withAlpha';


type Props = {
  title: string;
  description: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
};

export function EmptyStateCard({ title, description, icon = 'inbox' }: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.space.lg,
        paddingHorizontal: theme.space.xl,
        paddingVertical: theme.space.xxl,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.space.lg,
          borderRadius: theme.borderRadius.full,
          backgroundColor: withAlpha(theme.color.accent, 0.1),
        }}
      >
        <Feather name={icon} size={32} color={theme.color.accent} />
      </View>

      <Text
        style={{
          textAlign: 'center',
          color: theme.color.textPrimary,
          fontSize: theme.fontSize.lg,
          fontWeight: theme.fontWeight.bold,
          fontFamily: theme.fontFamily.regular,
          marginBottom: theme.space.sm,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          textAlign: 'center',
          color: theme.color.textSecondary,
          fontSize: theme.fontSize.md,
          fontFamily: theme.fontFamily.regular,
          lineHeight: theme.fontSize.md * 1.5,
        }}
      >
        {description}
      </Text>
    </View>
  );
}
