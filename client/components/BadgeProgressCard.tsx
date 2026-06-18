 
import React from 'react';
import { Text, View } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';

type BadgeVariant = 'pink' | 'orange' | 'blue' | 'red';
type BadgeIcon = 'target' | 'trending' | 'people' | 'medal';

type BadgeProgress = {
  id: string;
  title: string;
  subtitle: string;
  current: number;
  total: number;
  variant: BadgeVariant;
  icon: BadgeIcon;
};

type Props = {
  items: BadgeProgress[];
  title?: string;
};

const iconMap: Record<BadgeIcon, (color: string) => React.ReactNode> = {
  target: color => <Ionicons name="radio-button-on-outline" size={22} color={color} />,
  trending: color => <Feather name="trending-up" size={22} color={color} />,
  people: color => <Ionicons name="people-outline" size={22} color={color} />,
  medal: color => <MaterialCommunityIcons name="medal-outline" size={22} color={color} />,
};

export function BadgeProgressCard({ items, title }: Props) {
  const { theme } = useTheme();

  const colors: Record<BadgeVariant, string> = {
    pink: theme.color.premium,
    orange: theme.color.warning,
    blue: theme.color.accent,
    red: theme.color.error,
  };

  return (
    <View>
      <Text
        style={{
          marginBottom: theme.space.md,
          color: theme.color.textPrimary,
          fontSize: theme.fontSize.lg,
          fontWeight: theme.fontWeight.bold,
          fontFamily: theme.fontFamily.regular,
        }}
      >
        {title ?? theme.i18n.t('components.BadgeProgressCard.title')}
      </Text>

      <View style={{ gap: theme.space.md }}>
        {items.map(item => {
          const accent = colors[item.variant];
          const progress = item.total > 0 ? Math.min(100, Math.max(0, (item.current / item.total) * 100)) : 0;

          return (
            <View
              key={item.id}
              style={{
                backgroundColor: theme.color.card,
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.xl + 2,
                padding: theme.space.md,
                shadowColor: accent,
                shadowOpacity: theme.isDark ? 0.08 : 0.04,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: theme.borderRadius.lg,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: theme.space.md,
                    backgroundColor: theme.isDark ? `${accent}14` : `${accent}10`,
                    borderWidth: 1,
                    borderColor: theme.isDark ? `${accent}33` : `${accent}22`,
                  }}
                >
                  {iconMap[item.icon](accent)}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text
                      style={{
                        color: theme.color.textPrimary,
                        fontSize: theme.fontSize.lg,
                        fontWeight: theme.fontWeight.bold,
                        fontFamily: theme.fontFamily.regular,
                      }}
                    >
                      {item.title}
                    </Text>

                    <Text
                      style={{
                        color: accent,
                        fontSize: theme.fontSize.md,
                        fontWeight: theme.fontWeight.bold,
                        fontFamily: theme.fontFamily.number,
                      }}
                    >
                      {item.current}/{item.total}
                    </Text>
                  </View>

                  <Text
                    style={{
                      marginTop: 4,
                      color: theme.color.textSecondary,
                      fontSize: theme.fontSize.sm,
                      fontFamily: theme.fontFamily.light,
                    }}
                  >
                    {item.subtitle}
                  </Text>

                  <View
                    style={{
                      marginTop: 10,
                      height: 6,
                      borderRadius: theme.borderRadius.full,
                      overflow: 'hidden',
                      backgroundColor: theme.color.surface,
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${progress}%`,
                        borderRadius: theme.borderRadius.full,
                        backgroundColor: accent,
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}