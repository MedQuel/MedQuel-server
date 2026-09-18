import React from 'react';
import { LayoutChangeEvent, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import type { Badge } from '../common/types/types';
import { AchievementIcon } from './achievements/AchievementIcon';
import {
  BADGE_CATALOG_MAP,
  AchievementIconKey,
  AchievementVariant,
} from '../common/constants/achievements';

export type EarnedItemInput = Partial<Badge> & {
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

const rgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized.split('').map(ch => ch + ch).join('')
      : normalized.slice(0, 6);
  const red   = Number.parseInt(full.slice(0, 2), 16);
  const green = Number.parseInt(full.slice(2, 4), 16);
  const blue  = Number.parseInt(full.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const resolveText = (value: string, fallback: string, key: string) => {
  const text = String(value ?? '').trim();
  return !text || text === key ? fallback : text;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const parseEarnedAt = (value?: string | null) => {
  if (!value) return -1;
  const text = value.trim().toLowerCase();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (text === 'today') return now;
  if (text === 'yesterday') return now - day;
  const match = text.match(
    /^(\d+)\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days|w|wk|wks|week|weeks|mo|month|months|y|yr|yrs|year|years)\s*ago$/
  );
  if (match) {
    const n = Number(match[1]);
    const unit = match[2] ?? '';
    const delta =
      unit?.startsWith('m') && !unit.startsWith('mo') ? 60 * 1000
      : unit.startsWith('h') ? 60 * 60 * 1000
      : unit.startsWith('w') ? 7 * day
      : unit.startsWith('mo') ? 30 * day
      : unit.startsWith('y') ? 365 * day
      : day;
    return now - n * delta;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? -1 : parsed;
};

const TILE_WIDTH = 72;
const TILE_GAP   = 12;

export function EarnedBadgeCard({
  achievements,
  title,
  onViewAllPress,
  onBadgePress,
}: Props) {
  const { theme } = useTheme();
  const [cardWidth, setCardWidth] = React.useState<number>(0);

  const sectionTitle = resolveText(
    theme.i18n.t('components.EarnedBadgeCard.title'),
    title ?? 'Earned Badges',
    'components.EarnedBadgeCard.title'
  );

  const safeAchievements = Array.isArray(achievements) ? achievements : [];

  const items = safeAchievements
    .map((item, order): DisplayBadgeItem | null => {
      const id = item.badgeId || item.id;
      if (!id) return null;
      const catalogInfo = BADGE_CATALOG_MAP[id];
      const name    = item.name || catalogInfo?.name || id;
      const iconKey = (item.iconKey || catalogInfo?.iconKey || 'award') as AchievementIconKey;
      const variant = (item.variant || catalogInfo?.variant || 'gold')  as AchievementVariant;
      return { id, title: name, iconKey, variant, earnedAt: item.earnedAt, isNew: item.isNew, order };
    })
    .filter((item): item is DisplayBadgeItem => Boolean(item))
    .sort((a, b) => {
      const diff = parseEarnedAt(b.earnedAt) - parseEarnedAt(a.earnedAt);
      return diff || a.order - b.order;
    })
    .slice(0, 6);

  if (items.length === 0) return null;

  const onCardLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    setCardWidth(prev => prev === nextWidth ? prev : nextWidth);
  };

  // Check if all badges fit without scrolling
  // total space needed = items * TILE_WIDTH + gaps
  const totalNeeded = items.length * TILE_WIDTH + (items.length - 1) * TILE_GAP;
  const availableWidth = cardWidth - theme.space.md * 2; // card padding both sides
  const fitsInRow = cardWidth > 0 && totalNeeded <= availableWidth;

  const iconSize = clamp(TILE_WIDTH * 0.72, 48, 56);

  const renderBadge = (item: DisplayBadgeItem, tileWidth: number | 'auto') => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.7}
      onPress={onBadgePress}
      style={{
        width: tileWidth === 'auto' ? undefined : tileWidth,
        flex: tileWidth === 'auto' ? 1 : undefined,
        alignItems: 'center',
        paddingVertical: theme.space.sm,
      }}
    >
      <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
        <AchievementIcon
          iconKey={item.iconKey}
          variant={item.variant}
          size={iconSize}
        />
        {item.isNew ? (
          <View
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              paddingVertical: 2,
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
          fontSize: theme.fontSize.xs + 1,
          lineHeight: theme.fontSize.sm + 2,
          fontWeight: theme.fontWeight.bold,
          fontFamily: theme.fontFamily.bold,
          marginTop: theme.space.sm,
          width: TILE_WIDTH,
        }}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.97}
      onPress={onViewAllPress}
      onLayout={onCardLayout}
      style={{
        padding: theme.space.md,
        borderWidth: 1.5,
        borderRadius: theme.borderRadius.xl,
        borderColor: rgba(theme.color.accent, theme.isDark ? 0.2 : 0.12),
        backgroundColor: theme.color.card,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.space.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
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
          <Text
            style={{
              color: theme.color.accent,
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.number,
            }}
          >
            ({items.length})
          </Text>
        </View>
        <Feather name="chevron-right" size={theme.fontSize.lg} color={theme.color.textMuted} />
      </View>

      {/* Badges — flex row on web (evenly spaced), scroll on mobile */}
      {fitsInRow ? (
        // Web / wide screen: evenly distribute badges
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}
        >
          {items.map(item => renderBadge(item, 'auto'))}
        </View>
      ) : (
        // Mobile / narrow screen: horizontal scroll
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: TILE_GAP, paddingHorizontal: 2 }}
        >
          {items.map(item => renderBadge(item, TILE_WIDTH))}
        </ScrollView>
      )}
    </TouchableOpacity>
  );
}