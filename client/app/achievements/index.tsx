import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

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

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<Badge[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userRank, setUserRank] = useState<number | string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

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

      setAchievements(Array.isArray(badgeData) ? badgeData : []);
      if (meData) setUser(meData);
      if (leaderboardData?.myRank) {
        setUserRank(leaderboardData.myRank);
      }
    } catch (error: any) {
      if (error?.name !== 'AuthenticationError' && error?.code !== 'UNAUTHENTICATED') {
        console.warn('Error fetching achievements page data:', error?.message || error);
      }
      setAchievements([]);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, []);

  // Single focus effect to load data on initial visit & screen focus cleanly without race condition
  useFocusEffect(
    useCallback(() => {
      const shouldShowLoader = achievements.length === 0;
      fetchData(shouldShowLoader);
      return () => {
      };
    }, [fetchData, achievements.length])
  );

  const earnedBadges = useMemo(() => {
    return achievements.filter((b) => b.status === 'earned');
  }, [achievements]);

  // Strict fresh account check: In progress cards start showing ONLY after completing at least 1 contest / practice quiz
  const hasPlayedContest = useMemo(() => {
    const questions = user?.totalQuestions ?? 0;
    const contests = user?.stats?.contestsPlayed ?? 0;
    const sessions = (user?.stats as any)?.completedSessions ?? 0;
    const earnedCount = achievements.filter((b) => b.status === 'earned').length;

    return questions > 0 || contests > 0 || sessions > 0 || earnedCount > 0;
  }, [user, achievements]);

  // Compute in-progress section by category:
  // For fresh accounts (hasPlayedContest === false), returns [] to show clean empty message.
  // When at least 1 contest is completed (hasPlayedContest === true), populates target badge per category section.
  // Special rule: hard_contest only shows if user played at least 1 hard contest (currentProgress >= 1).
  const inProgressBadges = useMemo((): BadgeProgressItem[] => {
    if (!hasPlayedContest || !achievements || achievements.length === 0) return [];

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
  }, [achievements, hasPlayedContest]);

  const totalBadges = achievements.length;
  const earnedCount = earnedBadges.length;
  const epReward = earnedCount * 100;
  const isDataEmpty = !hasPlayedContest && earnedCount === 0;

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
            scrollEnabled={!isDataEmpty}
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
