/* eslint-disable no-bitwise */
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AchievementProgressCard } from '../../components/AchievementProgressCard';
import { BadgeProgressCard } from '../../components/BadgeProgressCard';
import { EarnedBadgeCard } from '../../components/EarnedBadgeCard';
import { useBottomBar } from '../../common/context/useBottomBar';
import { achievementsMock } from '../../common/constants/achievementsMock';
import { useTheme } from '../../theme/ThemeContext';

const withAlpha = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3 ? clean.split('').map(ch => ch + ch).join('') : clean.slice(0, 6);
  const int = Number.parseInt(full, 16);

  return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`;
};

function EmptyStateCard({
  title,
  description,
  icon = 'info',
}: {
  title: string;
  description: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
}) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        padding: theme.space.md,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.color.border,
        backgroundColor: theme.color.card,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: theme.borderRadius.lg,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: withAlpha(theme.color.accent, theme.isDark ? 0.22 : 0.14),
            backgroundColor: withAlpha(theme.color.accent, theme.isDark ? 0.10 : 0.06),
          }}
        >
          <Feather name={icon} size={18} color={theme.color.accent} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.md,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              marginTop: 2,
              color: theme.color.textMuted,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
}

function LockedBadgeCard({
  title,
  icon,
  accent,
}: {
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  accent?: string;
}) {
  const { theme } = useTheme();
  const resolvedAccent = accent ?? theme.color.accent;

  return (
    <View
      style={{
        flex: 1,
        minHeight: 84,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.color.border,
        backgroundColor: theme.color.card,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.space.sm,
        paddingHorizontal: theme.space.xs,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: theme.borderRadius.full,
          alignItems: 'center',
          justifyContent: 'center',
            backgroundColor: withAlpha(resolvedAccent, theme.isDark ? 0.12 : 0.08),
          borderWidth: 1,
            borderColor: withAlpha(resolvedAccent, theme.isDark ? 0.22 : 0.14),
        }}
      >
        <Feather name={icon} size={18} color={resolvedAccent} />
      </View>

      <Text
        numberOfLines={1}
        style={{
          marginTop: theme.space.sm,
          color: theme.color.textMuted,
          fontSize: theme.fontSize.xs,
          fontWeight: theme.fontWeight.bold,
          fontFamily: theme.fontFamily.regular,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

export default function AchievementsScreen() {
  const { theme } = useTheme();
  useBottomBar(true, 'home');

  const mock = achievementsMock as any;

  const progressData = mock.progress ?? {
    earned: 0,
    total: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
    epReward: 0,
  };

  const hasProgressData = Boolean(mock.progress);

  const earnedAchievements = Array.isArray(mock.earnedBadges) ? mock.earnedBadges : [];
  const badgeProgressItems = Array.isArray(mock.badgeProgress) ? mock.badgeProgress : [];
  const lockedBadges = Array.isArray(mock.lockedBadges) ? mock.lockedBadges : [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <View
        style={{
          paddingHorizontal: theme.space.md,
          paddingTop: theme.space.md,
          paddingBottom: theme.space.sm,
          backgroundColor: theme.color.background,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: theme.space.sm }}>
            <Pressable
              onPress={() => {}}
              style={{
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.borderRadius.lg,
                borderWidth: 1,
                borderColor: theme.color.border,
                backgroundColor: theme.color.card,
              }}
            >
              <Feather name="chevron-left" size={18} color={theme.color.textSecondary} />
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
                Achievements
              </Text>

              <Text
                style={{
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                Collect badges & earn EP rewards
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.space.md,
          paddingTop: theme.space.sm,
          paddingBottom: theme.space.xxl * 2.5,
        }}
      >
        <View style={{ gap: theme.space.md }}>
          {hasProgressData ? (
            <AchievementProgressCard {...progressData} />
          ) : (
            <EmptyStateCard
              title="No progress yet"
              description="Your achievement summary will appear here once data is available."
              icon="bar-chart-2"
            />
          )}

          {earnedAchievements.length > 0 ? (
            <EarnedBadgeCard achievements={earnedAchievements} />
          ) : (
            <EmptyStateCard
              title="No badges earned yet"
              description="Complete contests and study goals to unlock badges."
              icon="award"
            />
          )}

          {badgeProgressItems.length > 0 ? (
            <BadgeProgressCard items={badgeProgressItems} />
          ) : (
            <EmptyStateCard
              title="No in-progress badges"
              description="Start a streak or contest to track badge progress."
              icon="activity"
            />
          )}

          <View style={{ marginTop: theme.space.xs }}>
            <Text
              style={{
                marginBottom: theme.space.sm,
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.lg,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              Locked
            </Text>

            {lockedBadges.length > 0 ? (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    rowGap: theme.space.sm,
                  }}
                >
                  {lockedBadges.slice(0, 2).map((item: any) => (
                    <LockedBadgeCard
                      key={item.id}
                      title={item.title}
                      icon={item.icon}
                      accent={item.color}
                    />
                  ))}
                </View>

                {lockedBadges.length > 2 ? <View style={{ height: theme.space.sm }} /> : null}

                {lockedBadges.length > 2 ? (
                  <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
                    {lockedBadges.slice(2, 4).map((item: any) => (
                      <LockedBadgeCard
                        key={item.id}
                        title={item.title}
                        icon={item.icon}
                        accent={item.color}
                      />
                    ))}
                  </View>
                ) : null}
              </>
            ) : (
              <EmptyStateCard
                title="No locked badges"
                description="Locked badge placeholders will appear here."
                icon="lock"
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}