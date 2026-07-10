import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import { withAlpha } from '../common/utilities/withAlpha';

type Props = {
  title: string;
  description: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
};

export function EmptyStateCard({
  title,
  description,
  icon = 'inbox',
}: Props) {
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
          alignItems: 'center',
          justifyContent: 'center',

          width: 72,
          height: 72,
          marginBottom: theme.space.lg,

          borderRadius: theme.borderRadius.full,
          backgroundColor: withAlpha(theme.color.accent, 0.1),
        }}
      >
        <Feather
          name={icon}
          size={32}
          color={theme.color.accent}
        />
      </View>

      <Text
        style={{
          color: theme.color.textPrimary,
          fontFamily: theme.fontFamily.regular,
          fontSize: theme.fontSize.lg,
          fontWeight: theme.fontWeight.bold,
          textAlign: 'center',
          marginBottom: theme.space.sm,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: theme.color.textSecondary,
          fontFamily: theme.fontFamily.regular,
          fontSize: theme.fontSize.md,
          textAlign: 'center',
          lineHeight: theme.fontSize.md * 1.5,
        }}
      >
        {description}
      </Text>
    </View>
  );
}