import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { EmptyStateCard } from '../../components/EmptyStateCard';
import { EarnedBadgeCard } from '../../components/EarnedBadgeCard';
import { BadgeProgressCard } from '../../components/BadgeProgressCard';
import type { EarnedAchievement } from '../../common/constants/achievements';
import { LockedBadgeCard } from '../../components/achievements/LockedBadgeCard';
import { AchievementProgressCard } from '../../components/AchievementProgressCard';


type BadgeIcon = 'target' | 'trending' | 'people' | 'medal';
type BadgeVariant = 'pink' | 'orange' | 'blue' | 'red';
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
type LockedAccentKey =
  | 'premium'
  | 'warning'
  | 'accent'
  | 'success'
  | 'info'
  | 'error';
type LockedBadgeItem = {
  id: string;
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  accent: LockedAccentKey;
};

const achievementsMock = {
  header: { title: 'Achievements', subtitle: 'Collect badges & earn EP rewards' },

  progress: {
    earned: 14,
    total: 48,
    gold: 5,
    silver: 6,
    bronze: 3,
    epReward: 850,
  } satisfies AchievementProgress,

  earnedBadges: [
    { id: 'gold_medalist', isNew: true },
    { id: 'streak_30' },
    { id: 'knowledge_seeker' },
    { id: 'speed_demon' },
    { id: 'consistent' },
  ] satisfies EarnedAchievement[],

  badgeProgress: [
    { id: 'sharpshooter', title: 'Sharpshooter', subtitle: '90%+ in 5 contests', current: 3, total: 5, variant: 'pink', icon: 'target' },
    { id: 'all-rounder', title: 'All-Rounder', subtitle: '70%+ in all 10 subjects', current: 7, total: 10, variant: 'orange', icon: 'trending' },
    { id: 'social-learner', title: 'Social Learner', subtitle: '50 messages in rooms', current: 28, total: 50, variant: 'blue', icon: 'people' },
    { id: 'gladiator', title: 'Gladiator', subtitle: 'Complete 10 hard contests', current: 6, total: 10, variant: 'red', icon: 'medal' },
  ] satisfies BadgeProgressItem[],

  lockedBadges: [
    { id: 'champion', title: 'Champion', icon: 'award', accent: 'premium' },
    { id: 'elite', title: 'Elite', icon: 'star', accent: 'warning' },
    { id: 'protector', title: 'Protector', icon: 'shield', accent: 'accent' },
    { id: 'master', title: 'Master', icon: 'trending-up', accent: 'success' },
    { id: 'researcher', title: 'Researcher', icon: 'book-open', accent: 'info' },
    { id: 'legend', title: 'Legend', icon: 'zap', accent: 'error' },
  ] satisfies LockedBadgeItem[],
};

export default function AchievementsScreen() {
  const { theme } = useTheme();
  useBottomBar(true, 'profile');

  const progressData = achievementsMock.progress;
  const earnedBadges = achievementsMock.earnedBadges;
  const lockedBadges = achievementsMock.lockedBadges;
  const badgeProgressItems = achievementsMock.badgeProgress;

  const hasProgressData =
    progressData.earned > 0 ||
    progressData.total > 0 ||
    progressData.gold > 0 ||
    progressData.silver > 0 ||
    progressData.bronze > 0 ||
    progressData.epReward > 0;

  const lockedBadgeRows = [
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
          paddingTop: theme.space.md,
          paddingBottom: theme.space.sm,
          paddingHorizontal: theme.space.md,
          backgroundColor: theme.color.background,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View
            style={{
              flex: 1,
              gap: theme.space.sm,
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}
          >
            <Pressable
              onPress={() => {}}
              style={{
                width: theme.space.xl,
                height: theme.space.xl,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.lg,
                backgroundColor: theme.color.card,
              }}
            >
              <Feather
                name='chevron-left'
                size={theme.space.md}
                color={theme.color.textSecondary}
              />
            </Pressable>

            <View style={{ flex: 1, paddingRight: theme.space.sm }}>
              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.lg + 1,
                  lineHeight: theme.fontSize.xl,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.regular,
                  marginBottom: theme.space.xs,
                }}
              >
                {achievementsMock.header.title}
              </Text>

              <Text
                style={{
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {achievementsMock.header.subtitle}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: theme.space.sm,
          paddingBottom: theme.space.xxl * 2.5,
          paddingHorizontal: theme.space.md,
        }}
      >
        <View style={{ gap: theme.space.md }}>
          {hasProgressData ? (
            <AchievementProgressCard {...progressData} />
          ) : (
            <EmptyStateCard
              title='No progress yet'
              description='Your achievement summary will appear here once data is available.'
              icon='bar-chart-2'
            />
          )}

          {earnedBadges.length > 0 ? (
            <EarnedBadgeCard achievements={earnedBadges} />
          ) : (
            <EmptyStateCard
              title='No badges earned yet'
              description='Complete contests and study goals to unlock badges.'
              icon='award'
            />
          )}

          {badgeProgressItems.length > 0 ? (
            <BadgeProgressCard items={badgeProgressItems} />
          ) : (
            <EmptyStateCard
              title='No in-progress badges'
              description='Start a streak or contest to track badge progress.'
              icon='activity'
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
              Locked
            </Text>

            {lockedBadgeRows.length > 0 ? (
              <View style={{ gap: theme.space.sm }}>
                {lockedBadgeRows.map((row, rowIndex) => (
                  <View key={`locked-row-${rowIndex}`} style={{ flexDirection: 'row', gap: theme.space.sm }}>
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
                title='No locked badges'
                description='Locked badge placeholders will appear here.'
                icon='lock'
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
