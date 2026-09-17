import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import type { Badge, User } from '../../common/types/types';
import { useBottomBar } from '../../common/context/useBottomBar';
import { BADGE_CATALOG } from '../../common/constants/achievements';

import { Loading } from '../../components/common/loading';
import { EarnedBadgeCard } from '../../components/EarnedBadgeCard';
import { BadgeProgressCard } from '../../components/BadgeProgressCard';
import { AchievementProgressCard } from '../../components/AchievementProgressCard';
// Temporarily commented out ActivityHeatmapCard from achievements screen
// import { ActivityHeatmapCard } from '../../components/ActivityHeatmapCard';

type BadgeVariant = 'pink' | 'orange' | 'blue' | 'red';
type BadgeIcon = 'target' | 'trending' | 'people' | 'medal';

type BadgeProgressItem = {
  id: string;
  title: string;
  subtitle: string;
  current: number;
  total: number;
  variant: BadgeVariant;
  icon: BadgeIcon;
};

const mapVariant = (variant: string): BadgeVariant => {
  if (variant === 'gold') return 'orange';
  if (variant === 'purple') return 'pink';
  if (variant === 'blue') return 'blue';
  return 'red';
};

const mapProgressIcon = (iconKey: string): BadgeIcon => {
  if (iconKey === 'flame' || iconKey === 'zap') return 'trending';
  if (iconKey === 'brain' || iconKey === 'book') return 'target';
  if (iconKey === 'clock' || iconKey === 'trophy' || iconKey === 'medal') return 'medal';
  return 'people';
};

const CATEGORIES_IN_ORDER = [
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

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<Badge[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userRank, setUserRank] = useState<number | string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const [badgeData, meData, leaderboardData] = await Promise.all([
        api.achievement.getAchievements().catch((err) => {
          if (err?.name !== 'AuthenticationError' && err?.code !== 'UNAUTHENTICATED') {
            console.warn('Could not fetch achievements:', err?.message || err);
          }
          return [];
        }),
        api.user.getMe().catch(() => null),
        api.leaderboard.getLeaderboard('weekly', 'global').catch(() => null),
      ]);

      if (Array.isArray(badgeData) && badgeData.length > 0) {
        setAchievements(badgeData);
      }
      if (meData) setUser(meData);
      if (leaderboardData?.myRank) {
        setUserRank(leaderboardData.myRank);
      }
    } catch (error: any) {
      if (error?.name !== 'AuthenticationError' && error?.code !== 'UNAUTHENTICATED') {
        console.warn('Error fetching achievements page data:', error?.message || error);
      }
    } finally {
      if (showLoader) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Run on mount immediately
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Also refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchData(false);
    }, [fetchData])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  // Resolve badges using API results merged with complete catalog so screen is never empty
  const resolvedBadges = useMemo(() => {
    const apiMap = new Map<string, Badge>();
    achievements.forEach((b) => {
      if (b?.badgeId) apiMap.set(b.badgeId, b);
    });

    return BADGE_CATALOG.map((catalogItem): Badge => {
      const fromApi = apiMap.get(catalogItem.badgeId);
      if (fromApi) return fromApi;

      // Compute live progress from user data if not yet seeded
      let progress = 0;
      if (user) {
        if (catalogItem.category === 'streak') {
          progress = user.currentStreak || 0;
        } else if (catalogItem.category === 'questions') {
          progress = user.totalQuestions || 0;
        } else if (catalogItem.category === 'contests') {
          progress = user.stats?.contestsPlayed || 0;
        } else if (catalogItem.category === 'study') {
          progress = Math.round((user.studyHours || 0) * 60);
        } else if (catalogItem.category === 'level') {
          progress = user.currentLevel || 1;
        }
      }

      const isEarned = progress >= catalogItem.requirementValue;
      return {
        badgeId: catalogItem.badgeId,
        name: catalogItem.name,
        description: catalogItem.description,
        iconKey: catalogItem.iconKey,
        variant: catalogItem.variant as any,
        rarity: catalogItem.rarity as any,
        category: catalogItem.category,
        requirementValue: catalogItem.requirementValue,
        currentProgress: Math.min(progress, catalogItem.requirementValue),
        status: isEarned ? 'earned' : 'in_progress',
        earnedAt: null,
      };
    });
  }, [achievements, user]);

  const earnedBadges = useMemo(() => {
    return resolvedBadges.filter((b) => b.status === 'earned');
  }, [resolvedBadges]);

  // Compute in-progress section by category so each category shows its next unearned target badge
  const inProgressBadges = useMemo((): BadgeProgressItem[] => {
    const categoryMap: Record<string, Badge[]> = {};
    resolvedBadges.forEach((b) => {
      const cat = b.category || 'special';
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push(b);
    });

    const result: BadgeProgressItem[] = [];

    CATEGORIES_IN_ORDER.forEach((catKey) => {
      const badgesInCat = categoryMap[catKey] ?? [];
      badgesInCat.sort((a, b) => a.requirementValue - b.requirementValue);

      // Find first badge not earned yet
      const targetBadge = badgesInCat.find((b) => b.status !== 'earned');

      if (targetBadge) {
        // Special rule: Hard-difficulty contest progress only starts when playing >= 1 hard contest
        if (catKey === 'hard_contest' && targetBadge.currentProgress < 1) {
          return;
        }

        result.push({
          id: targetBadge.badgeId,
          title: targetBadge.name,
          subtitle: targetBadge.description,
          current: Math.round(targetBadge.currentProgress),
          total: Math.round(targetBadge.requirementValue),
          variant: mapVariant(targetBadge.variant),
          icon: mapProgressIcon(targetBadge.iconKey),
        });
      }
    });

    return result;
  }, [resolvedBadges]);

  const totalBadges = resolvedBadges.length;
  const earnedCount = earnedBadges.length;
  const epReward = earnedCount * 100;

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      {/* Header */}
      <View
        style={{
          gap: theme.space.md,
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
            else router.push('/profile');
          }}
          activeOpacity={0.8}
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            backgroundColor: theme.color.card,
            borderRadius: theme.borderRadius.lg,
            borderColor: theme.color.border,
          }}
        >
          <Feather name="chevron-left" size={20} color={theme.color.textPrimary} />
        </TouchableOpacity>

        <View style={{ flex: 1, gap: theme.space.xs / 2, flexDirection: 'column' }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.xxl,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('achievements.title')}
          </Text>
          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {theme.i18n.t('achievements.subtitle')}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: theme.space.xl }}>
            <Loading message={theme.i18n.t('achievements.loading')} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme.color.accent}
                colors={[theme.color.accent]}
              />
            }
            contentContainerStyle={{
              paddingTop: theme.space.sm,
              paddingBottom: theme.space.xxl,
              paddingHorizontal: theme.space.md,
              gap: theme.space.lg,
            }}
          >
            {/* Achievement Progress Card */}
            <AchievementProgressCard
              earned={earnedCount}
              total={totalBadges > 0 ? totalBadges : BADGE_CATALOG.length}
              rank={userRank}
              level={user?.currentLevel}
              epReward={epReward}
            />

            {/* Temporarily commented out ActivityHeatmapCard from achievements screen */}
            {/* <ActivityHeatmapCard /> */}

            {/* Earned Badges Card with View All button inside card header */}
            <EarnedBadgeCard
              achievements={earnedBadges}
              onViewAllPress={() => router.push('/achievements/earned')}
            />

            {/* In Progress Badges Card */}
            <BadgeProgressCard items={inProgressBadges} />
          </ScrollView>
        )}
      </View>
    </View>
  );
}