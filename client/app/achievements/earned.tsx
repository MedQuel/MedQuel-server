import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import type { Badge, User } from '../../common/types/types';
import { useBottomBar } from '../../common/context/useBottomBar';
import { CATEGORY_LABELS, BADGE_CATALOG_MAP, AchievementIconKey, AchievementVariant } from '../../common/constants/achievements';

import { Loading } from '../../components/common/loading';
import { EmptyStateCard } from '../../components/EmptyStateCard';
import { AchievementIcon } from '../../components/achievements/AchievementIcon';
import { LockedBadgeCard } from '../../components/achievements/LockedBadgeCard';

const parseEarnedAt = (value?: string | null) => {
  if (!value) return -1;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? -1 : parsed;
};

const CATEGORY_ORDER = [
  'streak',
  'questions',
  'perfect_quiz',
  'contests',
  'contest_high_score',
  'hard_contest',
  'speed',
  'study',
  'level',
  'subject_mastery',
  'rank',
  'special',
];

export default function EarnedBadgesScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setError(null);
    try {
      const [meData, achievementData] = await Promise.all([
        api.user.getMe().catch(() => null),
        api.achievement.getAchievements().catch((err) => {
          if (err?.name !== 'AuthenticationError' && err?.code !== 'UNAUTHENTICATED') {
            console.warn('Could not fetch achievements in earned screen:', err?.message || err);
          }
          return [];
        }),
      ]);

      setUser(meData);
      setBadges(Array.isArray(achievementData) ? achievementData : []);
    } catch (err: any) {
      if (err?.name !== 'AuthenticationError' && err?.code !== 'UNAUTHENTICATED') {
        console.warn('Error fetching earned badges:', err?.message || err);
      }
      setError(theme.i18n.t('Failed to load earned badges'));
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, [theme.i18n]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData(false);
    }, [fetchData])
  );

  // Separate earned vs locked badges
  const earnedBadges = useMemo(() => {
    return badges
      .filter((b) => b.status === 'earned')
      .sort((a, b) => parseEarnedAt(b.earnedAt) - parseEarnedAt(a.earnedAt));
  }, [badges]);

  const lockedBadges = useMemo(() => {
    return badges.filter((b) => b.status !== 'earned');
  }, [badges]);

  // Group earned badges by category
  const earnedByCategory = useMemo(() => {
    const map: Record<string, Badge[]> = {};
    earnedBadges.forEach((badge) => {
      const cat = badge.category || 'special';
      if (!map[cat]) map[cat] = [];
      map[cat].push(badge);
    });
    return map;
  }, [earnedBadges]);

  // Ordered list of active earned categories (only categories with >0 earned badges)
  const activeEarnedCategories = useMemo(() => {
    const present = Object.keys(earnedByCategory);
    const sorted = CATEGORY_ORDER.filter((cat) => present.includes(cat));
    present.forEach((cat) => {
      if (!sorted.includes(cat)) sorted.push(cat);
    });
    return sorted;
  }, [earnedByCategory]);

  // Chunk locked badges into rows of 3 columns
  const lockedRows = useMemo(() => {
    const rows: Badge[][] = [];
    for (let i = 0; i < lockedBadges.length; i += 3) {
      rows.push(lockedBadges.slice(i, i + 3));
    }
    return rows;
  }, [lockedBadges]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      {/* Header */}
      <View
        style={{
          gap: theme.space.sm,
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: theme.space.lg,
          paddingBottom: theme.space.sm,
          paddingHorizontal: theme.space.md,
          backgroundColor: theme.color.background,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.push('/achievements');
          }}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.space.xs * 1.75,
            borderWidth: 1,
            backgroundColor: theme.color.card,
            borderRadius: theme.borderRadius.lg,
            borderColor: theme.color.border,
          }}
        >
          <Feather name="chevron-left" size={theme.fontSize.xl} color={theme.color.textPrimary} />
        </TouchableOpacity>

        <View style={{ flexDirection: 'column', gap: theme.space.xs * 0.5 }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg * 1.1,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('Earned Badges') || 'Earned Badges'}
          </Text>
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm * 1.05,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {user ? `${user.displayName} · ${earnedBadges.length} Unlocked` : `${earnedBadges.length} Badges Unlocked`}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: theme.space.xl }}>
            <Loading message={theme.i18n.t('Loading earned badges...')} />
          </View>
        ) : error ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.space.md }}>
            <EmptyStateCard icon="alert-circle" title={theme.i18n.t('Error Loading Badges')} description={error} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: theme.space.sm,
              paddingBottom: theme.space.xxl * 2,
              paddingHorizontal: theme.space.md,
              gap: theme.space.lg,
            }}
          >
            {/* EARNED SECTIONS */}
            {earnedBadges.length > 0 ? (
              activeEarnedCategories.map((catKey) => {
                const categoryBadges = earnedByCategory[catKey] ?? [];
                const catTitle = CATEGORY_LABELS[catKey] ?? catKey.replace('_', ' ').toUpperCase();

                return (
                  <View key={catKey}>
                    <Text
                      style={{
                        color: theme.color.textPrimary,
                        fontSize: theme.fontSize.lg,
                        fontWeight: theme.fontWeight.bold,
                        fontFamily: theme.fontFamily.bold,
                        marginBottom: theme.space.sm,
                      }}
                    >
                      {catTitle} ({categoryBadges.length})
                    </Text>

                    <View
                      style={{
                        padding: theme.space.md,
                        borderWidth: 1,
                        borderRadius: theme.borderRadius.xl,
                        borderColor: theme.color.border,
                        backgroundColor: theme.color.card,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: theme.space.sm,
                      }}
                    >
                      {categoryBadges.map((badge) => {
                        const catalog = BADGE_CATALOG_MAP[badge.badgeId];
                        const iconKey = (badge.iconKey || catalog?.iconKey || 'award') as AchievementIconKey;
                        const variant = (badge.variant || catalog?.variant || 'gold') as AchievementVariant;

                        return (
                          <View
                            key={badge.badgeId}
                            style={{
                              width: '30%',
                              alignItems: 'center',
                              paddingVertical: theme.space.sm,
                              paddingHorizontal: theme.space.xs,
                            }}
                          >
                            <AchievementIcon iconKey={iconKey} variant={variant} size={64} />
                            <Text
                              numberOfLines={2}
                              style={{
                                textAlign: 'center',
                                color: theme.color.textPrimary,
                                fontSize: theme.fontSize.xs + 1,
                                fontWeight: theme.fontWeight.bold,
                                fontFamily: theme.fontFamily.bold,
                                marginTop: theme.space.sm,
                              }}
                            >
                              {badge.name}
                            </Text>
                            <Text
                              numberOfLines={2}
                              style={{
                                textAlign: 'center',
                                color: theme.color.textMuted,
                                fontSize: theme.fontSize.xs * 0.9,
                                fontFamily: theme.fontFamily.regular,
                                marginTop: 2,
                              }}
                            >
                              {badge.description}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })
            ) : (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: theme.space.xl,
                  paddingHorizontal: theme.space.md,
                }}
              >
                <Text
                  style={{
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.md,
                    fontFamily: theme.fontFamily.regular,
                    textAlign: 'center',
                  }}
                >
                  {theme.i18n.t('achievements.empty_states.no_badges.title') || 'No badges earned yet'}
                </Text>
              </View>
            )}

            {/* LOCKED BADGES SECTION (At bottom of Earned Badges screen, in 3 columns) */}
            <View style={{ marginTop: theme.space.md }}>
              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.lg,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.bold,
                  marginBottom: theme.space.sm,
                }}
              >
                {theme.i18n.t('Locked Badges') || 'Locked Badges'} ({lockedBadges.length})
              </Text>

              {lockedRows.length > 0 ? (
                <View style={{ gap: theme.space.sm }}>
                  {lockedRows.map((row, rowIndex) => (
                    <View key={`locked-row-${rowIndex}`} style={{ flexDirection: 'row', gap: theme.space.sm }}>
                      {row.map((item) => {
                        const catalog = BADGE_CATALOG_MAP[item.badgeId];
                        const iconKey = (item.iconKey || catalog?.iconKey || 'award') as AchievementIconKey;
                        const variant = (item.variant || catalog?.variant || 'gold') as AchievementVariant;

                        return (
                          <View key={item.badgeId} style={{ flex: 1, minWidth: 0 }}>
                            <LockedBadgeCard
                              title={item.name}
                              description={item.description}
                              iconKey={iconKey}
                              variant={variant}
                            />
                          </View>
                        );
                      })}
                      {row.length < 3
                        ? Array.from({ length: 3 - row.length }).map((_, gapIdx) => (
                            <View key={`gap-${rowIndex}-${gapIdx}`} style={{ flex: 1 }} />
                          ))
                        : null}
                    </View>
                  ))}
                </View>
              ) : (
                <EmptyStateCard
                  icon="check-circle"
                  title={theme.i18n.t('All Badges Unlocked')}
                  description={theme.i18n.t('Great job! You have earned all available badges.')}
                />
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
