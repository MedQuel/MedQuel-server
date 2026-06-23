/* eslint-disable no-bitwise */
import React from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { AchievementDefinition, EarnedAchievement, achievementCatalog } from '../common/constants/achievements';
import { AchievementIcon } from './common/AchievementIcon';

type Props = {
  achievements: EarnedAchievement[];
  title?: string;
  onViewAllPress?: () => void;
};

type BadgeItem = AchievementDefinition & EarnedAchievement & { order: number };

const rgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3 ? normalized.split('').map(ch => ch + ch).join('') : normalized.slice(0, 6);
  const value = Number.parseInt(full, 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
};

const resolveText = (value: string, fallback: string, key: string) => {
  const text = String(value ?? '').trim();
  return !text || text === key ? fallback : text;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const parseEarnedAt = (value?: string) => {
  if (!value) return -1;

  const text = value.trim().toLowerCase();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (text === 'today') return now;
  if (text === 'yesterday') return now - day;

  const match = text.match(/^(\d+)\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days|w|wk|wks|week|weeks|mo|month|months|y|yr|yrs|year|years)\s*ago$/);
  if (match) {
    const n = Number(match[1]);
    const unit = match[2];
    const delta =
      unit.startsWith('m') && !unit.startsWith('mo') ? 60 * 1000 :
      unit.startsWith('h') ? 60 * 60 * 1000 :
      unit.startsWith('w') ? week :
      unit.startsWith('mo') ? month :
      unit.startsWith('y') ? year :
      day;

    return now - n * delta;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? -1 : parsed;
};

export function EarnedBadgeCard({ achievements, title, onViewAllPress }: Props) {
  const { theme } = useTheme();
  const [rowWidths, setRowWidths] = React.useState<number[]>([]);


  const sectionTitle = resolveText(theme.i18n.t('components.EarnedBadgeCard.title'), title ?? 'Earned Badges', 'components.EarnedBadgeCard.title');
  const viewAllText = resolveText(theme.i18n.t('components.EarnedBadgeCard.view_all'), 'View All', 'components.EarnedBadgeCard.view_all');
  const emptyText = resolveText(theme.i18n.t('components.EarnedBadgeCard.empty'), 'You have not earned any badge yet', 'components.EarnedBadgeCard.empty');

  const items = achievements
    .map((item, order): BadgeItem | null => {
      const achievement = achievementCatalog[item.id];
      return achievement ? { ...achievement, ...item, order } : null;
    })
    .filter((item): item is BadgeItem => Boolean(item))
    .sort((a, b) => {
      const diff = parseEarnedAt(b.earnedAt) - parseEarnedAt(a.earnedAt);
      return diff || a.order - b.order;
    })
    .slice(0, 6);

  const rows = [items.slice(0, 3), items.slice(3, 6)].filter(row => row.length);

  const tileSizeFor = (rowIndex: number, count: number) => {
    const rowWidth = rowWidths[rowIndex];
    if (!rowWidth) return 72;

    const slotWidth = (rowWidth - theme.space.sm * (count - 1)) / count;
    return clamp(Math.floor(slotWidth * 0.34), 54, 86);
  };

  const onRowLayout = (rowIndex: number) => (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    setRowWidths(prev => {
      if (prev[rowIndex] === nextWidth) return prev;
      const next = [...prev];
      next[rowIndex] = nextWidth;
      return next;
    });
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.space.md }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {sectionTitle}
        </Text>

        <Pressable
          onPress={onViewAllPress}
          disabled={!onViewAllPress}
          style={({ pressed }) => ({
            paddingHorizontal: theme.space.md,
            paddingVertical: 6,
            borderRadius: theme.borderRadius.full,
            borderWidth: 1,
            borderColor: rgba(theme.color.accent, theme.isDark ? 0.28 : 0.18),
            backgroundColor: rgba(theme.color.accent, theme.isDark ? 0.10 : 0.06),
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text
            style={{
              color: theme.color.accent,
              fontSize: theme.fontSize.xs,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {viewAllText}
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          borderRadius: theme.borderRadius.xl,
          borderWidth: 1.5,
          borderColor: rgba(theme.color.accent, theme.isDark ? 0.20 : 0.12),
          backgroundColor: theme.color.card,
          padding: theme.space.md,
        }}
      >
        {items.length ? (
          rows.map((row, rowIndex) => (
            <View
              key={`earned-row-${rowIndex}`}
              onLayout={onRowLayout(rowIndex)}
              style={{
                flexDirection: 'row',
                gap: theme.space.sm,
                marginTop: rowIndex ? theme.space.md : 0,
              }}
            >
              {row.map(item => {
                const tileSize = tileSizeFor(rowIndex, row.length);

                return (
                  <View
                    key={item.id}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      alignItems: 'center',
                      paddingVertical: theme.space.sm,
                      paddingHorizontal: theme.space.xs,
                    }}
                  >
                    <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                      <AchievementIcon iconKey={item.iconKey} variant={item.variant} size={tileSize} />

                      {item.isNew ? (
                     <View
                      style={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: theme.borderRadius.full,
                        backgroundColor: theme.color.error,
                       }}
                >
                      <Text
                        style={{
                          color: theme.color.textInverse,
                          fontSize: 10,
                          fontWeight: theme.fontWeight.bold,
                          fontFamily: theme.fontFamily.number,
                        }}
                      >
                        New
                      </Text>
                    </View>
                      ) : null}
                    </View>

                    <Text
                      numberOfLines={2}
                      style={{
                        marginTop: theme.space.md + 2,
                        textAlign: 'center',
                        color: theme.color.textPrimary,
                        fontSize: theme.fontSize.sm,
                        fontWeight: theme.fontWeight.bold,
                        fontFamily: theme.fontFamily.bold,
                        lineHeight: 17,
                      }}
                    >
                      {item.title}
                    </Text>

                    
                  </View>
                );
              })}

              {row.length < 3 ? Array.from({ length: 3 - row.length }).map((_, index) => <View key={`gap-${rowIndex}-${index}`} style={{ flex: 1 }} />) : null}
            </View>
          ))
        ) : (
          <View
            style={{
              minHeight: 132,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.xl,
              paddingHorizontal: theme.space.md,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {emptyText}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}