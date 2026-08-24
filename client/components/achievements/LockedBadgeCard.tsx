import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeContext';
import { withAlpha } from '../../common/utils/withAlpha';
import { AchievementIcon } from './AchievementIcon';
import type { AchievementIconKey, AchievementVariant } from '../../common/constants/achievements';

type Props = {
  title: string;
  description?: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  iconKey?: AchievementIconKey;
  variant?: AchievementVariant;
  accent?: string;
};

export function LockedBadgeCard({ title, description, icon, iconKey, variant, accent }: Props) {
  const { theme } = useTheme();

  const resolvedAccent = accent ?? theme.color.textMuted;

  return (
    <View
      style={{
        flex: 1,
        minHeight: 110,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.space.sm + 4,
        paddingHorizontal: theme.space.xs,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
        opacity: 0.85,
      }}
    >
      <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: theme.space.xs + 2 }}>
        {iconKey ? (
          <View style={{ opacity: 0.65 }}>
            <AchievementIcon iconKey={iconKey} variant={variant ?? 'gold'} size={52} />
          </View>
        ) : (
          <View
            style={{
              width: 48,
              height: 48,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderRadius: theme.borderRadius.full,
              borderColor: withAlpha(resolvedAccent, theme.isDark ? 0.24 : 0.14),
              backgroundColor: withAlpha(resolvedAccent, theme.isDark ? 0.12 : 0.08),
            }}
          >
            <Feather name={icon || 'lock'} size={20} color={resolvedAccent} />
          </View>
        )}

        <View
          style={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            width: 20,
            height: 20,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.surface,
            borderWidth: 1,
            borderColor: theme.color.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name="lock" size={10} color={theme.color.textMuted} />
        </View>
      </View>

      <Text
        numberOfLines={2}
        style={{
          textAlign: 'center',
          color: theme.color.textSecondary,
          fontSize: theme.fontSize.xs + 1,
          fontWeight: theme.fontWeight.bold,
          fontFamily: theme.fontFamily.bold,
        }}
      >
        {title}
      </Text>

      {description ? (
        <Text
          numberOfLines={1}
          style={{
            textAlign: 'center',
            color: theme.color.textMuted,
            fontSize: theme.fontSize.xs * 0.9,
            fontFamily: theme.fontFamily.regular,
            marginTop: 2,
          }}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}
