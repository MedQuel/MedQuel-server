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

const resolveBadgesWithCatalog = (apiBadges: Badge[], userData: User | null): Badge[] => {
  const apiMap = new Map<string, Badge>();
  if (Array.isArray(apiBadges)) {
    apiBadges.forEach((b) => {
      if (b?.badgeId) apiMap.set(b.badgeId, b);
    });
  }

  return BADGE_CATALOG.map((catalog) => {
    const fromApi = apiMap.get(catalog.badgeId);
    if (fromApi) {
      return fromApi;
    }

    // Default calculation from user stats if not provided by API
    let currentProgress = 0;
    if (userData) {
      if (catalog.category === 'streak') {
        currentProgress = Math.max(userData.currentStreak ?? 0, userData.longestStreak ?? 0);
      } else if (catalog.category === 'questions') {
        currentProgress = userData.totalQuestions ?? 0;
      } else if (catalog.category === 'study') {
        currentProgress = userData.studyHours ?? 0;
      } else if (catalog.category === 'level') {
        currentProgress = userData.currentLevel ?? 1;
      } else if (catalog.category === 'contests') {
        currentProgress = userData.stats?.contestsPlayed ?? 0;
      } else if (catalog.category === 'contest_high_score') {
        currentProgress = (userData.stats as any)?.contests90Plus ?? 0;
      } else if (catalog.category === 'hard_contest') {
        currentProgress = (userData.stats as any)?.hardContestsDone ?? 0;
      } else if (catalog.category === 'perfect_quiz') {
        currentProgress = (userData.stats as any)?.perfectQuizzes ?? 0;
      } else if (catalog.category === 'speed') {
        currentProgress = (userData.stats as any)?.fastCompletions ?? 0;
      }
    }

    const isEarned = currentProgress >= catalog.requirementValue;
    const status: 'earned' | 'in_progress' | 'locked' = isEarned
      ? 'earned'
      : currentProgress > 0
      ? 'in_progress'
      : 'locked';

    return {
      badgeId: catalog.badgeId,
      name: catalog.name,
      description: catalog.description,
      iconKey: catalog.iconKey,
      variant: catalog.variant,
      rarity: catalog.rarity,
      category: catalog.category,
      requirementValue: catalog.requirementValue,
      currentProgress: Math.min(currentProgress, catalog.requirementValue),
      status,
      earnedAt: isEarned ? new Date().toISOString() : null,
    };
  });
};

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<Badge[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userRank, setUserRank] = useState<number | string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(true, 'profile');

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

      if (meData) setUser(meData);
      if (leaderboardData?.myRank) {
        setUserRank(leaderboardData.myRank);
      }

      const mergedBadges = resolveBadgesWithCatalog(
        Array.isArray(badgeData) ? badgeData : [],
        meData
      );
      setAchievements(mergedBadges);
    } catch (error: any) {
      if (error?.name !== 'AuthenticationError' && error?.code !== 'UNAUTHENTICATED') {
        console.warn('Error fetching achievements page data:', error?.message || error);
      }
      setAchievements(resolveBadgesWithCatalog([], null));
    } finally {
      if (showLoader) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Ensure initial data fetch executes immediately on mount
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Keep screen updated when returning from earned badges screen
  useFocusEffect(
    useCallback(() => {
      fetchData(false);
    }, [fetchData])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  const earnedBadges = useMemo(() => {
    return achievements.filter((b) => b.status === 'earned');
  }, [achievements]);

  // Compute in-progress section by category:
  // Shows next badge target for each category with live progress
  const inProgressBadges = useMemo((): BadgeProgressItem[] => {
    if (!achievements || achievements.length === 0) return [];

    const categoryMap: Record<string, Badge[]> = {};
    achievements.forEach((b) => {
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
  }, [achievements]);

  const totalBadges = achievements.length;
  const earnedCount = earnedBadges.length;
  const epReward = earnedCount * 100;

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
            else router.push('/profile');
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
              paddingBottom: theme.space.xxl * 1.75,
              paddingHorizontal: theme.space.md,
              gap: theme.space.lg + 4,
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
