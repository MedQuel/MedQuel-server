import React from 'react';
import { View, Text } from 'react-native';

import { useTheme } from '../theme/ThemeContext';

type ProjectionCardProps = {
  title: string;
  subtitle: string;
  projectedEP: number;
};

export function ProjectionCard({
  title,
  subtitle,
  projectedEP,
}: ProjectionCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.color.card,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        padding: theme.space.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.xl,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.md,
            fontFamily: theme.fontFamily.regular,
            marginTop: theme.space.xs,
          }}
        >
          {subtitle}
        </Text>
      </View>

      <View
        style={{
          alignItems: 'flex-end',
          marginLeft: theme.space.lg,
        }}
      >
        <Text
          style={{
            color: theme.color.accent,
            // TODO: replace with your largest theme.fontSize token (e.g. theme.fontSize['2xl'])
            fontSize: theme.fontSize.xl,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          +{projectedEP.toLocaleString()}
        </Text>

        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.md,
            fontFamily: theme.fontFamily.regular,
            marginTop: theme.space.xs,
          }}
        >
          EP this week
        </Text>
      </View>
    </View>
  );
}