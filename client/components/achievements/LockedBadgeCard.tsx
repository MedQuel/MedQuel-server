import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import { withAlpha } from '../common/utilities/withAlpha';

type Props = {
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  accent?: string;
};

export function LockedBadgeCard({
  title,
  icon,
  accent,
}: Props) {
  const { theme } = useTheme();

  const resolvedAccent = accent ?? theme.color.accent;

  return (
    <View
      style={{
        flex: 1,

        minHeight: 104,

        alignItems: 'center',
        justifyContent: 'center',

        paddingHorizontal: theme.space.md,
        paddingVertical: theme.space.md,

        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,

        backgroundColor: theme.color.card,
      }}
    >
      <View
        style={{
          width: 52,
          height: 52,

          alignItems: 'center',
          justifyContent: 'center',

          marginBottom: theme.space.md,

          borderRadius: theme.borderRadius.full,

          borderWidth: 1,
          borderColor: withAlpha(
            resolvedAccent,
            theme.isDark ? 0.24 : 0.14
          ),

          backgroundColor: withAlpha(
            resolvedAccent,
            theme.isDark ? 0.12 : 0.08
          ),
        }}
      >
        <Feather
          name={icon}
          size={22}
          color={resolvedAccent}
        />
      </View>

      <Text
        numberOfLines={2}
        style={{
          color: theme.color.textSecondary,

          textAlign: 'center',

          fontFamily: theme.fontFamily.regular,
          fontSize: theme.fontSize.sm,
          fontWeight: theme.fontWeight.bold,
        }}
      >
        {title}
      </Text>
    </View>
  );
}