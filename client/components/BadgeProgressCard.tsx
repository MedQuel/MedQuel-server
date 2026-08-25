import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
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
  const [isExpanded, setIsExpanded] = useState(false);

  const colors: Record<BadgeVariant, string> = {
    pink: theme.color.premium,
    orange: theme.color.warning,
    blue: theme.color.accent,
    red: theme.color.error,
  };

  const hasMoreThanFive = items.length > 5;
  const visibleItems = isExpanded || !hasMoreThanFive ? items : items.slice(0, 5);

  return (
    <View>
      <Text
        style={{
          marginBottom: theme.space.md,
          color: theme.color.textPrimary,
          fontSize: theme.fontSize.lg,
          fontWeight: theme.fontWeight.bold,
          fontFamily: theme.fontFamily.bold,
        }}
      >
        {title ?? theme.i18n.t('components.BadgeProgressCard.title')}
      </Text>

      {items.length > 0 ? (
        <View>
          <View style={{ gap: theme.space.md }}>
            {visibleItems.map(item => {
              const accent = colors[item.variant];
              const progress = item.total > 0 ? Math.min(100, Math.max(0, (item.current / item.total) * 100)) : 0;

              return (
                <View
                  key={item.id}
                  style={{
                    backgroundColor: theme.color.card,
                    borderWidth: 1,
                    borderColor: theme.color.border,
                    borderRadius: theme.borderRadius.xl,
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
                        width: 48,
                        height: 48,
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
                          numberOfLines={1}
                          style={{
                            flex: 1,
                            marginRight: theme.space.xs,
                            color: theme.color.textPrimary,
                            fontSize: theme.fontSize.md,
                            fontWeight: theme.fontWeight.bold,
                            fontFamily: theme.fontFamily.bold,
                          }}
                        >
                          {item.title}
                        </Text>

                        <Text
                          style={{
                            color: accent,
                            fontSize: theme.fontSize.sm,
                            fontWeight: theme.fontWeight.bold,
                            fontFamily: theme.fontFamily.number,
                          }}
                        >
                          {item.current}/{item.total}
                        </Text>
                      </View>

                      <Text
                        numberOfLines={1}
                        style={{
                          marginTop: 2,
                          color: theme.color.textSecondary,
                          fontSize: theme.fontSize.xs + 1,
                          fontFamily: theme.fontFamily.regular,
                        }}
                      >
                        {item.subtitle}
                      </Text>

                      <View
                        style={{
                          marginTop: theme.space.sm,
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

          {/* Show More / Show Less Button at Bottom Center */}
          {hasMoreThanFive ? (
            <Pressable
              onPress={() => setIsExpanded(prev => !prev)}
              style={({ pressed }) => ({
                alignSelf: 'center',
                marginTop: theme.space.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.xs,
                paddingVertical: theme.space.xs * 1.5,
                paddingHorizontal: theme.space.lg,
                borderWidth: 1,
                borderRadius: theme.borderRadius.full,
                borderColor: theme.color.border,
                backgroundColor: theme.color.card,
                opacity: pressed ? 0.85 : 1,
                elevation: 1,
              })}
            >
              <Text
                style={{
                  color: theme.color.accent,
                  fontSize: theme.fontSize.sm,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </Text>
              <Feather
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={theme.color.accent}
              />
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View
          style={{
            backgroundColor: theme.color.card,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.xl,
            padding: theme.space.lg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name="activity" size={32} color={theme.color.textMuted} style={{ marginBottom: theme.space.xs, opacity: 0.6 }} />
          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {theme.i18n.t('achievements.empty_states.in_progress.title') || 'No badges currently in progress'}
          </Text>
        </View>
      )}
    </View>
  );
}