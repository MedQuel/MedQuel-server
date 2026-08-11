import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {  ScrollView, Text, TouchableOpacity, View } from 'react-native';

import {
  achievementCatalog,
  type AchievementId,
  type EarnedAchievement,
} from '../../common/constants/achievements';
import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import type { Badge } from '../../common/types/types';
import { useBottomBar } from '../../common/context/useBottomBar';
import { MOCK_ACHIEVEMENTS } from '../../common/constants/mockData';

import { Loading } from '../../components/common/loading';
import { EmptyStateCard } from '../../components/EmptyStateCard';
import { EarnedBadgeCard } from '../../components/EarnedBadgeCard';
import { BadgeProgressCard } from '../../components/BadgeProgressCard';
import { LockedBadgeCard } from '../../components/achievements/LockedBadgeCard';
import { AchievementProgressCard } from '../../components/AchievementProgressCard';


type BadgeVariant = 'pink' | 'orange' | 'blue' | 'red';
type BadgeIcon = 'target' | 'trending' | 'people' | 'medal';
type LockedAccentKey = 'premium' | 'warning' | 'accent' | 'success' | 'info' | 'error';
type BadgeProgressItem = {
  id: string;
  title: string;
  subtitle: string;
  current: number;
  total: number;
  variant: BadgeVariant;
  icon: BadgeIcon;
};
type AchievementProgress = {
  earned: number;
  total: number;
  gold: number;
  silver: number;
  bronze: number;
  epReward: number;
};
type LockedBadgeItem = {
  id: string;
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  accent: LockedAccentKey;
};
type AchievementSnapshot = {
  progress: AchievementProgress;
  earnedBadges: EarnedAchievement[];
  badgeProgress: BadgeProgressItem[];
  lockedBadges: LockedBadgeItem[];
};

const mapVariant = (tier: Badge['tier']): BadgeVariant => {
  if (tier === 'gold') return 'orange';
  if (tier === 'silver') return 'blue';
  if (tier === 'bronze') return 'red';
  return 'pink';
};
const mapProgressIcon = (icon: string): BadgeIcon => {
  if (icon === 'flame') return 'trending';
  if (icon === 'book') return 'target';
  if (icon === 'clock') return 'medal';
  return 'people';
};
const mapLockedIcon = (icon: string): React.ComponentProps<typeof Feather>['name'] => {
  if (icon === 'flame') return 'zap';
  if (icon === 'book') return 'book-open';
  if (icon === 'clock') return 'clock';
  if (icon === 'zap') return 'zap';
  return 'award';
};
const mapAccent = (tier: Badge['tier']): LockedAccentKey => {
  if (tier === 'gold') return 'warning';
  if (tier === 'silver') return 'accent';
  return 'info';
};

const buildAchievementSnapshot = (badges: Badge[]): AchievementSnapshot => {
  const earnedBadges = badges
    .filter((badge) => badge.status === 'earned')
    .map((badge) => ({ id: badge.badgeId as AchievementId, earnedAt: badge.earnedAt }));

  const badgeProgress = badges
    .filter((badge) => badge.status === 'in_progress')
    .map((badge) => ({
      id: badge.badgeId,
      title: badge.name,
      subtitle: badge.description,
      current: Math.round(badge.currentProgress),
      total: badge.requirementValue,
      variant: mapVariant(badge.tier),
      icon: mapProgressIcon(badge.icon),
    }));

  const lockedBadges = badges
    .filter((badge) => badge.status === 'locked')
    .map((badge) => ({
      id: badge.badgeId,
      title: badge.name,
      icon: mapLockedIcon(badge.icon),
      accent: mapAccent(badge.tier),
    }));

  let gold = 0;
  let silver = 0;
  let bronze = 0;

  earnedBadges.forEach((badge) => {
    const catalogItem = achievementCatalog[badge.id];
    const variant = catalogItem?.variant;

    if (variant === 'gold') gold++;
    else if (variant === 'purple' || variant === 'blue' || variant === 'red') silver++;
    else bronze++;
  });

  return {
    progress: {
      earned: earnedBadges.length,
      total: badges.length,
      gold,
      silver,
      bronze,
      epReward: earnedBadges.length * 100,
    },
    earnedBadges,
    badgeProgress,
    lockedBadges,
  };
};


export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<Badge[]>(MOCK_ACHIEVEMENTS);
  const [isLoading, setIsLoading] = useState(true);

  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(true, 'profile');

  useEffect(() => {
    let isMounted = true;
    const fetchAchievements = async () => {
      setIsLoading(true);
      try {
        const data = await api.achievement.getAchievements();
        if (isMounted) setAchievements(data);
      } catch (error) {
        console.error('Error fetching achievements:', error);
        if (isMounted) setAchievements(MOCK_ACHIEVEMENTS);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAchievements();
    return () => {
      isMounted = false;
    };
  }, []);

  const data = useMemo(
    () => buildAchievementSnapshot(achievements),
    [achievements]
  );
  const progressData = data.progress;
  const earnedBadges = data.earnedBadges;
  const lockedBadges = data.lockedBadges;
  const badgeProgressItems = data.badgeProgress;

  const hasProgressData = progressData.total > 0;
  const lockedBadgeRows: LockedBadgeItem[][] = [
    lockedBadges.slice(0, 3),
    lockedBadges.slice(3, 6),
  ].filter((row) => row.length > 0);

  const accentMap: Record<LockedAccentKey, string> = {
    premium: theme.color.premium,
    warning: theme.color.warning,
    accent: theme.color.accent,
    success: theme.color.success,
    info: theme.color.info,
    error: theme.color.error,
  };


  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
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
          onPress={() => router.push('/profile')}
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
          <Feather
            name='chevron-left'
            size={theme.fontSize.xl}
            color={theme.color.textPrimary}
          />
        </TouchableOpacity>

        <View style={{ flexDirection: 'column', gap: theme.space.xs * 0.5 }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg * 1.1,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('achievements.title')}
          </Text>
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm * 1.05,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {theme.i18n.t('achievements.subtitle')}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: theme.space.xl }}>
            <Loading message={theme.i18n.t('achievements.loading')} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: theme.space.sm,
              paddingBottom: theme.space.xxl * 1.75,
              paddingHorizontal: theme.space.md,
            }}
          >
            <View style={{ gap: theme.space.md }}>
              {hasProgressData ? (
                <AchievementProgressCard {...progressData} />
              ) : (
                <EmptyStateCard
                  icon='bar-chart-2'
                  title={theme.i18n.t('achievements.empty_states.no_progress.title')}
                  description={theme.i18n.t('achievements.empty_states.no_progress.description')}
                />
              )}

              {earnedBadges.length > 0 ? (
                <EarnedBadgeCard achievements={earnedBadges} />
              ) : (
                <EmptyStateCard
                  icon='award'
                  title={theme.i18n.t('achievements.empty_states.no_badges.title')}
                  description={theme.i18n.t('achievements.empty_states.no_badges.description')}
                />
              )}

              {badgeProgressItems.length > 0 ? (
                <BadgeProgressCard items={badgeProgressItems} />
              ) : (
                <EmptyStateCard
                  icon='activity'
                  title={theme.i18n.t('achievements.empty_states.in_progress.title')}
                  description={theme.i18n.t('achievements.empty_states.in_progress.description')}
                />
              )}

              <View style={{ marginTop: theme.space.xs }}>
                <Text
                  style={{
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.lg,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.regular,
                    marginBottom: theme.space.sm,
                  }}
                >
                  {theme.i18n.t('achievements.locked')}
                </Text>

                {lockedBadgeRows.length > 0 ? (
                  <View style={{ gap: theme.space.sm }}>
                    {lockedBadgeRows.map((row, rowIndex) => (
                      <View
                        key={`locked-row-${rowIndex}`}
                        style={{ flexDirection: 'row', gap: theme.space.sm }}
                      >
                        {row.map((item) => (
                          <View key={item.id} style={{ width: '31.5%' }}>
                            <LockedBadgeCard
                              title={item.title}
                              icon={item.icon}
                              accent={accentMap[item.accent]}
                            />
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                ) : (
                  <EmptyStateCard
                    icon='lock'
                    title={theme.i18n.t('achievements.empty_states.no_locked.title')}
                    description={theme.i18n.t('achievements.empty_states.no_locked.description')}
                  />
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
