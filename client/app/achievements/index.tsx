import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { BADGE_CATALOG_MAP, AchievementIconKey, AchievementVariant } from '../../common/constants/achievements';
import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import type { Badge, User } from '../../common/types/types';
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

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<Badge[]>(MOCK_ACHIEVEMENTS);
  const [user, setUser] = useState<User | null>(null);
  const [userRank, setUserRank] = useState<number | string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(true, 'profile');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [badgeData, meData, leaderboardData] = await Promise.all([
          api.achievement.getAchievements().catch(() => MOCK_ACHIEVEMENTS),
          api.user.getMe().catch(() => null),
          api.leaderboard.getLeaderboard('weekly', 'global').catch(() => null),
        ]);

        if (isMounted) {
          setAchievements(badgeData);
          if (meData) setUser(meData);
          if (leaderboardData?.myRank) {
            setUserRank(leaderboardData.myRank);
          }
        }
      } catch (error) {
        console.error('Error fetching achievements page data:', error);
        if (isMounted) setAchievements(MOCK_ACHIEVEMENTS);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const earnedBadges = useMemo(() => {
    return achievements.filter((b) => b.status === 'earned');
  }, [achievements]);

  const inProgressBadges = useMemo((): BadgeProgressItem[] => {
    return achievements
      .filter((b) => b.status === 'in_progress')
      .map((b) => ({
        id: b.badgeId,
        title: b.name,
        subtitle: b.description,
        current: Math.round(b.currentProgress),
        total: Math.round(b.requirementValue),
        variant: mapVariant(b.variant),
        icon: mapProgressIcon(b.iconKey),
      }));
  }, [achievements]);

  const lockedBadges = useMemo(() => {
    return achievements.filter((b) => b.status === 'locked');
  }, [achievements]);

  const lockedRows = useMemo(() => {
    const rows: Badge[][] = [];
    for (let i = 0; i < lockedBadges.length; i += 3) {
      rows.push(lockedBadges.slice(i, i + 3));
    }
    return rows;
  }, [lockedBadges]);

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
            contentContainerStyle={{
              paddingTop: theme.space.sm,
              paddingBottom: theme.space.xxl * 1.75,
              paddingHorizontal: theme.space.md,
              gap: theme.space.md,
            }}
          >
            {/* Achievement Progress Card (Shows Rank/Level instead of Gold/Silver/Bronze) */}
            {totalBadges > 0 ? (
              <AchievementProgressCard
                earned={earnedCount}
                total={totalBadges}
                rank={userRank}
                level={user?.currentLevel}
                epReward={epReward}
              />
            ) : (
              <EmptyStateCard
                icon="bar-chart-2"
                title={theme.i18n.t('achievements.empty_states.no_progress.title')}
                description={theme.i18n.t('achievements.empty_states.no_progress.description')}
              />
            )}

            {/* Earned Badges Card with View All button */}
            <EarnedBadgeCard
              achievements={earnedBadges}
              onViewAllPress={() => router.push('/achievements/earned')}
            />

            {/* In Progress Badges Card */}
            {inProgressBadges.length > 0 ? (
              <BadgeProgressCard items={inProgressBadges} />
            ) : (
              <EmptyStateCard
                icon="activity"
                title={theme.i18n.t('achievements.empty_states.in_progress.title')}
                description={theme.i18n.t('achievements.empty_states.in_progress.description')}
              />
            )}

            {/* Locked Badges Section in 3 Columns */}
            <View style={{ marginTop: theme.space.xs }}>
              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.lg,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.bold,
                  marginBottom: theme.space.sm,
                }}
              >
                {theme.i18n.t('achievements.locked')}
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
                  icon="lock"
                  title={theme.i18n.t('achievements.empty_states.no_locked.title')}
                  description={theme.i18n.t('achievements.empty_states.no_locked.description')}
                />
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
