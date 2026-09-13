import { Feather } from '@expo/vector-icons';
import { Easing, Animated } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { View, Text, Pressable, ScrollView, RefreshControl } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { getInitials } from '../../common/utils/getInitials';
import { TabContainer } from '../../components/TabContainer';
import { useBottomBar } from '../../common/context/useBottomBar';
import type { LeaderboardEntry, LeaderboardPeriod, LeaderboardResult } from '../../common/types/types';

import { Loading } from '../../components/common/loading';
import { EmptyStateCard } from '../../components/EmptyStateCard';
import { LeaderboardRankCard } from '../../components/LeaderboardRankCard';
import { LeaderboardPodiumContainer } from '../../components/LeaderboardPodiumContainer';
import { CurrentUserLeaderboardRankCard } from '../../components/CurrentUserLeaderboardRankCard';


type LeaderboardPodiumUser = {
  id: string;
  name: string;
  initials: string;
  score: number;
};
type LeaderboardRankRow = {
  id: string;
  rank: number;
  initials: string;
  name: string;
  specialty: string;
  points: number;
};
type CurrentUserLeaderboardRow = {
  rank: number;
  initials: string;
  name: string;
  specialty: string;
  points: number;
  trend: number;
  trendLabel: string;
};
type LeaderboardSnapshot = {
  podiumUsers: LeaderboardPodiumUser[];
  currentUser: CurrentUserLeaderboardRow | null;
  globalRankings: LeaderboardRankRow[];
  allRankings: LeaderboardRankRow[];
  playersCount: number;
};

const mapTrendLabel = (timeFilter: LeaderboardPeriod) => {
  if (timeFilter === 'weekly') return 'this week';
  if (timeFilter === 'monthly') return 'this month';
  return 'all time';
};

const mapLeaderboardSnapshot = (
  result: LeaderboardResult,
  timeFilter: LeaderboardPeriod,
  scopeFilter: 'global' | 'friends' = 'global'
): LeaderboardSnapshot => {
  const sorted = [...result.entries].sort((a, b) => a.rank - b.rank);

  const podiumUsers = sorted.slice(0, 3).map((entry, index) => ({
    id: entry.userId || `podium-${index}`,
    name: entry.displayName,
    initials: getInitials(entry.displayName || '') || '??',
    score: entry.epPoints,
  }));

  // Global Rankings list shows remaining participants (rank 4+) without repeating top 3 podium participants
  const globalRankings = sorted.slice(3).map((entry: LeaderboardEntry) => ({
    id: entry.userId,
    rank: entry.rank,
    initials: getInitials(entry.displayName || '') || '??',
    name: entry.displayName,
    specialty: entry.specialization,
    points: entry.epPoints,
  }));

  // Friends Rankings list shows all friends starting from rank #1 onwards (without podium)
  const allRankings = sorted.map((entry: LeaderboardEntry) => ({
    id: entry.userId,
    rank: entry.rank,
    initials: getInitials(entry.displayName || '') || '??',
    name: entry.displayName,
    specialty: entry.specialization,
    points: entry.epPoints,
  }));

  // Show Current User card if backend returns a valid myEntry with EP > 0, or if viewing friends leaderboard
  const currentUserSource = result.myEntry ?? null;
  const currentUser: CurrentUserLeaderboardRow | null =
    currentUserSource && (currentUserSource.epPoints > 0 || scopeFilter === 'friends')
      ? {
          rank: currentUserSource.rank || result.myRank || 0,
          initials: getInitials(currentUserSource.displayName || '') || '??',
          name: currentUserSource.displayName,
          specialty: currentUserSource.specialization,
          points: currentUserSource.epPoints,
          trend: currentUserSource.weeklyChange,
          trendLabel: mapTrendLabel(timeFilter),
        }
      : null;

  return {
    podiumUsers,
    currentUser,
    globalRankings,
    allRankings,
    playersCount: sorted.length,
  };
};

const timeTabs: { id: LeaderboardPeriod; label: string }[] = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'allTime', label: 'All Time' },
];


export default function LeaderboardScreen() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResult | null>(null);
  const [timeFilter, setTimeFilter] = useState<LeaderboardPeriod>('weekly');
  const [scopeFilter, setScopeFilter] = useState<'global' | 'friends'>('global');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { theme } = useTheme();
  useBottomBar(true, 'leaderboard');

  const spin = useRef(new Animated.Value(0)).current;
  const rotate = useMemo(
    () => spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }),
    [spin]
  );

  const scopeTabs = useMemo(
    () => [
      { id: 'global', label: theme.i18n.t('components.TabContainer.global') },
      { id: 'friends', label: theme.i18n.t('components.TabContainer.friends') },
    ],
    [theme.i18n]
  );

  const activeSnapshot = useMemo(() => {
    if (!leaderboardData) return null;
    return mapLeaderboardSnapshot(leaderboardData, timeFilter, scopeFilter);
  }, [leaderboardData, timeFilter, scopeFilter]);

  const fetchLeaderboard = useCallback(
    async (showLoader = true) => {
      if (showLoader) setIsLoading(true);

      try {
        const data = await api.leaderboard.getLeaderboard(timeFilter, scopeFilter);
        setLeaderboardData(data);
      } catch (error: any) {
        if (error?.name !== 'AuthenticationError' && error?.code !== 'UNAUTHENTICATED') {
          console.warn('Error fetching leaderboard:', error?.message || error);
        }
      } finally {
        if (showLoader) setIsLoading(false);
      }
    },
    [timeFilter, scopeFilter]
  );

  useEffect(() => {
    let isMounted = true;
    if (isMounted) fetchLeaderboard(true);

    return () => { isMounted = false };
  }, [fetchLeaderboard]);

  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard(false);
    }, [fetchLeaderboard])
  );

  const refreshAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const refreshLeaderboard = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    spin.setValue(0);

    refreshAnimRef.current = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    refreshAnimRef.current.start();

    fetchLeaderboard(true).finally(() => {
      if (refreshAnimRef.current) {
        refreshAnimRef.current.stop();
      }
      spin.setValue(0);
      setRefreshing(false);
    });
  }, [refreshing, spin, fetchLeaderboard]);

  const switchScope = useCallback((value: 'global' | 'friends') => { setScopeFilter(value) }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <View
        style={{
          paddingTop: theme.space.lg,
          paddingBottom: theme.space.sm,
          paddingHorizontal: theme.space.md,
          backgroundColor: theme.color.background,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.space.md }}>
          <View style={{ flex: 1, gap: theme.space.xs / 2, flexDirection: 'column', paddingRight: theme.space.sm }}>
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.xxl,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {theme.i18n.t('leaderboard.title')}
            </Text>

            <Text
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.light,
              }}
            >
              {theme.i18n.t('leaderboard.subtitle')}
            </Text>
          </View>

          <Pressable
            onPress={refreshLeaderboard}
            disabled={refreshing}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.card,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Feather
                name='refresh-cw'
                size={theme.space.md}
                color={theme.color.accent}
              />
            </Animated.View>
          </Pressable>
        </View>

        <View
          style={{
            width: '100%',
            gap: theme.space.xs,
            flexDirection: 'row',
            alignSelf: 'flex-start',
            marginBottom: theme.space.sm,
          }}
        >
          {timeTabs.map((tab) => {
            const active = timeFilter === tab.id;

            return (
              <Pressable
                key={tab.id}
                onPress={() => setTimeFilter(tab.id)}
                style={({ pressed }) => ({
                  minWidth: 80,
                  minHeight: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: theme.space.xs * 0.75,
                  paddingHorizontal: theme.space.md,
                  borderWidth: 1,
                  borderRadius: theme.borderRadius.full,
                  borderColor: active ? theme.color.accent : theme.color.border,
                  backgroundColor: active ? theme.color.accent : theme.color.card,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text
                  style={{
                    color: active ? theme.color.textInverse : theme.color.textSecondary,
                    fontSize: theme.fontSize.xs,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {theme.i18n.t(`leaderboard.tabs.${tab.id}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {isLoading || !activeSnapshot ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: theme.space.xl }}>
            <Loading message={theme.i18n.t('leaderboard.loading')} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshLeaderboard}
                tintColor={theme.color.accent}
                colors={[theme.color.accent]}
              />
            }
            contentContainerStyle={{
              paddingTop: theme.space.md,
              paddingBottom: 140, // Increased bottom padding to ensure participant cards roll clear of AppBottomBar
              paddingHorizontal: theme.space.md,
            }}
          >
            <TabContainer
              tabs={scopeTabs}
              value={scopeFilter}
              onChange={(value) => switchScope(value as 'global' | 'friends')}
            />

            <View style={{ height: theme.space.md }} />

            {scopeFilter === 'friends' ? (
              /* Friends Leaderboard: No Podium, shows all friends starting from Rank #1 */
              activeSnapshot.allRankings.length === 0 ? (
                <EmptyStateCard
                  icon='users'
                  title={theme.i18n.t('No Friends Connected Yet')}
                  description={theme.i18n.t('Connect with your Medical study Peers!')}
                />
              ) : (
                <>
                  {activeSnapshot.currentUser ? (
                    <>
                      <CurrentUserLeaderboardRankCard
                        name={activeSnapshot.currentUser.name.replace('You • ', '')}
                        rank={activeSnapshot.currentUser.rank}
                        points={activeSnapshot.currentUser.points}
                        weeklyGrowth={activeSnapshot.currentUser.trend}
                      />
                      <View style={{ height: theme.space.md }} />
                    </>
                  ) : null}

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: theme.space.lg,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.color.textPrimary,
                        fontSize: theme.fontSize.lg,
                        fontWeight: theme.fontWeight.bold,
                        fontFamily: theme.fontFamily.regular,
                      }}
                    >
                      {theme.i18n.t('leaderboard.rankings')}
                    </Text>

                    <Text
                      style={{
                        color: theme.color.textMuted,
                        fontSize: theme.fontSize.sm,
                        fontFamily: theme.fontFamily.regular,
                      }}
                    >
                      {theme.i18n.t('leaderboard.players_count', { count: activeSnapshot.playersCount })}
                    </Text>
                  </View>

                  <View>
                    {activeSnapshot.allRankings.map((item) => (
                      <View key={item.id} style={{ marginBottom: theme.space.sm }}>
                        <LeaderboardRankCard
                          rank={item.rank}
                          name={item.name}
                          specialty={item.specialty}
                          points={item.points}
                        />
                      </View>
                    ))}
                  </View>
                </>
              )
            ) : (
              /* Global Leaderboard: Podium displays top 3, Rankings section displays remaining (Rank #4+) */
              activeSnapshot.podiumUsers.length === 0 && activeSnapshot.globalRankings.length === 0 ? (
                <EmptyStateCard
                  icon='users'
                  title={theme.i18n.t('No Rankings Yet')}
                  description={theme.i18n.t('Be the first to join the leaderboard!')}
                />
              ) : (
                <>
                  <LeaderboardPodiumContainer users={activeSnapshot.podiumUsers} />

                  {activeSnapshot.currentUser ? (
                    <>
                      <View style={{ height: theme.space.md }} />
                      <CurrentUserLeaderboardRankCard
                        name={activeSnapshot.currentUser.name.replace('You • ', '')}
                        rank={activeSnapshot.currentUser.rank}
                        points={activeSnapshot.currentUser.points}
                        weeklyGrowth={activeSnapshot.currentUser.trend}
                      />
                    </>
                  ) : null}

                  {activeSnapshot.globalRankings.length > 0 && (
                    <>
                      <View style={{ height: theme.space.lg }} />
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: theme.space.lg,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.color.textPrimary,
                            fontSize: theme.fontSize.lg,
                            fontWeight: theme.fontWeight.bold,
                            fontFamily: theme.fontFamily.regular,
                          }}
                        >
                          {theme.i18n.t('leaderboard.rankings')}
                        </Text>

                        <Text
                          style={{
                            color: theme.color.textMuted,
                            fontSize: theme.fontSize.sm,
                            fontFamily: theme.fontFamily.regular,
                          }}
                        >
                          {theme.i18n.t('leaderboard.players_count', { count: activeSnapshot.playersCount })}
                        </Text>
                      </View>

                      <View>
                        {activeSnapshot.globalRankings.map((item) => (
                          <View key={item.id} style={{ marginBottom: theme.space.sm }}>
                            <LeaderboardRankCard
                              rank={item.rank}
                              name={item.name}
                              specialty={item.specialty}
                              points={item.points}
                            />
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </>
              )
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
