import React from 'react';
import { LayoutChangeEvent, Text, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import { withAlpha } from '../common/utils/withAlpha';
import { AchievementIcon } from './achievements/AchievementIcon';
import { BADGE_CATALOG_MAP, AchievementIconKey, AchievementVariant } from '../common/constants/achievements';
import type { Badge } from '../common/types/types';

type EarnedItemInput = Partial<Badge> & {
  id?: string;
  badgeId?: string;
  earnedAt?: string | null;
  isNew?: boolean;
};

type Props = {
  achievements: EarnedItemInput[];
  title?: string;
  onViewAllPress?: () => void;
  onBadgePress?: () => void;
};

type DisplayBadgeItem = {
  id: string;
  title: string;
  iconKey: AchievementIconKey;
  variant: AchievementVariant;
  earnedAt?: string | null;
  isNew?: boolean;
  order: number;
};

const resolveText = (value: string, fallback: string, key: string) => {
  const text = String(value ?? '').trim();
  return !text || text === key ? fallback : text;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const parseEarnedAt = (value?: string | null) => {
  if (!value) return -1;
  const text = value.trim().toLowerCase();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  if (text === 'today') return now;
  if (text === 'yesterday') return now - day;

  const match = text.match(/^(\d+)\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days|w|wk|wks|week|weeks|mo|month|months|y|yr|yrs|year|years)\s*ago$/);

  if (match) {
    const n = Number(match[1]);
    const unit = match[2] ?? '';
    const delta =
      unit?.startsWith('m') && !unit.startsWith('mo') ? 60 * 1000 :
      unit.startsWith('h') ? 60 * 60 * 1000 :
      unit.startsWith('w') ? 7 * day :
      unit.startsWith('mo') ? 30 * day :
      unit.startsWith('y') ? 365 * day :
      day;
    return now - n * delta;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? -1 : parsed;
};

export function EarnedBadgeCard({ achievements, title, onViewAllPress, onBadgePress }: Props) {
  const { theme } = useTheme();
  const [cardWidth, setCardWidth] = React.useState<number>(0);

  const sectionTitle = resolveText(theme.i18n.t('components.EarnedBadgeCard.title'), title ?? 'Earned Badges', 'components.EarnedBadgeCard.title');
  const emptyText = resolveText(theme.i18n.t('components.EarnedBadgeCard.empty'), 'Have not earned any badge yet', 'components.EarnedBadgeCard.empty');

  const safeAchievements = Array.isArray(achievements) ? achievements : [];

  const items = safeAchievements
    .map((item, order): DisplayBadgeItem | null => {
      const id = item.badgeId || item.id;
      if (!id) return null;

      const catalogInfo = BADGE_CATALOG_MAP[id];
      const name = item.name || catalogInfo?.name || id;
      const iconKey = (item.iconKey || catalogInfo?.iconKey || 'award') as AchievementIconKey;
      const variant = (item.variant || catalogInfo?.variant || 'gold') as AchievementVariant;

      return { id, title: name, iconKey, variant, earnedAt: item.earnedAt, isNew: item.isNew, order };
    })
    .filter((item): item is DisplayBadgeItem => Boolean(item))
    .sort((a, b) => {
      const diff = parseEarnedAt(b.earnedAt) - parseEarnedAt(a.earnedAt);
      return diff || a.order - b.order;
    })
    .slice(0, 6);

  const rows = [items.slice(0, 3), items.slice(3, 6)].filter(row => row.length);

  const tileSize = cardWidth
    ? clamp(Math.floor(((cardWidth - theme.space.sm * 2) / 3) * 0.34), 54, 72)
    : 72;

  const onCardLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    setCardWidth(prev => (prev === nextWidth ? prev : nextWidth));
  };

  return (
    <View
      onLayout={onCardLayout}
      style={{
        padding: theme.space.md,
        borderWidth: 1,
        borderRadius: theme.borderRadius.xl,
        borderColor: theme.color.border,
        backgroundColor: theme.color.card,
      }}
    >
      {/* Header */}
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

        {onViewAllPress && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onViewAllPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.borderRadius.full,
              backgroundColor: withAlpha(theme.color.accent, 0.12),
              borderWidth: 1,
              borderColor: withAlpha(theme.color.accent, 0.25),
            }}
          >
            <Feather name="chevron-right" size={18} color={theme.color.accent} />
          </TouchableOpacity>
        )}
      </View>

      {items.length ? (
        rows.map((row, rowIndex) => (
          <View
            key={`earned-row-${rowIndex}`}
            style={{
              gap: theme.space.sm,
              flexDirection: 'row',
              marginTop: rowIndex ? theme.space.md : 0,
            }}
          >
            {row.map(item => (
              // ← View → TouchableOpacity
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={onBadgePress}
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
                        paddingVertical: theme.space.xs * 0.75,
                        paddingHorizontal: theme.space.sm,
                        borderRadius: theme.borderRadius.full,
                        backgroundColor: theme.color.error,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.color.textInverse,
                          fontSize: theme.fontSize.xs,
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
                    textAlign: 'center',
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.sm,
                    lineHeight: theme.fontSize.lg,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.bold,
                    marginTop: theme.space.md + 2,
                  }}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}

            {row.length < 3 ? Array.from({ length: 3 - row.length }).map((_, index) => (
              <View key={`gap-${rowIndex}-${index}`} style={{ flex: 1 }} />
            )) : null}
          </View>
        ))
      ) : (
        <View
          style={{
            minHeight: 120,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.lg,
            paddingHorizontal: theme.space.md,
          }}
        >
          <Feather name="award" size={32} color={theme.color.textMuted} style={{ marginBottom: theme.space.xs, opacity: 0.6 }} />
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
  );
}