import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Easing, Animated, Pressable, ScrollView } from 'react-native';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { TabContainer } from '../../components/TabContainer';
import { useBottomBar } from '../../common/context/useBottomBar';
import type { LeaderboardEntry, LeaderboardPeriod, LeaderboardResult, LeaderboardScope } from '../../common/types/types';
import { getInitials } from '../../common/utils/getInitials';

import { Loading } from '../../components/common/loading';
import { EmptyStateCard } from '../../components/EmptyStateCard';
import { LeaderboardRankCard } from '../../components/LeaderboardRankCard';
import { LeaderboardPodiumContainer } from '../../components/LeaderboardPodiumContainer';
import { CurrentUserLeaderboardRankCard } from '../../components/CurrentUserLeaderboardRankCard';


type LeaderboardTimeFilter = LeaderboardPeriod;
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
  currentUser: CurrentUserLeaderboardRow;
  rankings: LeaderboardRankRow[];
  playersCount: number;
};

const mapTrendLabel = (timeFilter: LeaderboardTimeFilter) => {
  if (timeFilter === 'weekly') return 'this week';
  if (timeFilter === 'monthly') return 'this month';
  return 'all time';
};

const mapLeaderboardSnapshot = (result: LeaderboardResult, timeFilter: LeaderboardTimeFilter): LeaderboardSnapshot => {
  const sorted = [...result.entries].sort((a, b) => a.rank - b.rank);

  const podiumUsers = sorted.slice(0, 3).map((entry, index) => ({
    id: entry.userId || `podium-${index}`,
    name: entry.displayName,
    initials: getInitials(entry.displayName || '') || '??',
    score: entry.epPoints,
  }));

  const rankings = sorted.slice(3).map((entry: LeaderboardEntry) => ({
    id: entry.userId,
    rank: entry.rank,
    initials: getInitials(entry.displayName || '') || '??',
    name: entry.displayName,
    specialty: entry.specialization,
    points: entry.epPoints,
  }));

  const currentUserSource = result.myEntry ?? (result as any).currentUserEntry ?? sorted[0] ?? null;
  const currentUser = currentUserSource
    ? {
        rank: currentUserSource.rank,
        initials: getInitials(currentUserSource.displayName || '') || '??',
        name: currentUserSource.displayName,
        specialty: currentUserSource.specialization,
        points: currentUserSource.epPoints,
        trend: currentUserSource.weeklyChange,
        trendLabel: mapTrendLabel(timeFilter),
      }
    : {
        rank: 0,
        initials: '??',
        name: '',
        specialty: '',
        points: 0,
        trend: 0,
        trendLabel: mapTrendLabel(timeFilter),
      };

  return {
    podiumUsers,
    currentUser,
    rankings,
    playersCount: sorted.length,
  };
};

const timeTabs: { id: LeaderboardTimeFilter; label: string }[] = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'allTime', label: 'All Time' },
];


export default function LeaderboardScreen() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResult | null>(null);
  const [timeFilter, setTimeFilter] = useState<LeaderboardTimeFilter>('weekly');
  const [scopeFilter, setScopeFilter] = useState<LeaderboardScope>('global');
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
    return mapLeaderboardSnapshot(leaderboardData, timeFilter);
  }, [leaderboardData, timeFilter]);

  const fetchLeaderboard = useCallback(
    async (showLoader = true) => {
      if (showLoader) setIsLoading(true);

      try {
        const data = await api.leaderboard.getLeaderboard(timeFilter, scopeFilter);
        setLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        if (showLoader) setIsLoading(false);
      }
    },
    [timeFilter, scopeFilter]
  );

  useEffect(() => {
    let isMounted = true;
    if (isMounted) fetchLeaderboard(true);

    return () => {
      isMounted = false;
    };
  }, [fetchLeaderboard]);

  const refreshLeaderboard = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    spin.setValue(0);

    Animated.timing(spin, {
      toValue: 1,
      duration: 650,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    fetchLeaderboard(false).finally(() => { setRefreshing(false) });
  }, [refreshing, spin, fetchLeaderboard]);

  const switchScope = useCallback((value: LeaderboardScope) => { setScopeFilter(value) }, []);


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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: theme.space.md,
          }}
        >
          <View style={{ flex: 1, paddingRight: theme.space.sm }}>
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.lg + 1,
                lineHeight: theme.fontSize.xl,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {theme.i18n.t('leaderboard.title')}
            </Text>

            <Text
              style={{
                marginTop: theme.space.xs / 2,
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
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
              opacity: pressed ? 0.88 : 1,
              elevation: 2,
              boxShadow: theme.isDark ? `0px 2px 8px ${theme.color.accent}29` : `0px 2px 8px, ${theme.color.accent}14`,
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
                  minWidth: 88,
                  minHeight: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: theme.space.xs,
                  paddingHorizontal: theme.space.md,
                  borderWidth: active ? 0 : 1,
                  borderRadius: theme.borderRadius.full,
                  borderColor: active ? theme.color.accent : theme.color.border,
                  backgroundColor: active ? theme.color.accent : theme.color.card,
                  boxShadow: active ? `0px 2px 8px ${theme.color.accent}29` : `0px 0px 0px, ${theme.color.accent}14`,
                  opacity: pressed ? 0.9 : 1,
                  elevation: active ? 2 : 0,
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
            <Loading size={150} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: theme.space.md,
              paddingBottom: theme.space.xl,
              paddingHorizontal: theme.space.md,
            }}
          >
            <TabContainer
              tabs={scopeTabs}
              value={scopeFilter}
              onChange={(value) => switchScope(value as LeaderboardScope)}
            />

            <View style={{ height: theme.space.md }} />

            {scopeFilter === 'friends' || (activeSnapshot.podiumUsers.length === 0 && activeSnapshot.rankings.length === 0) ? (
              <EmptyStateCard
                icon="users"
                title={theme.i18n.t('No Friends Data Found')}
                description={theme.i18n.t('Connect with your medical study peers to compare your performance and climb the leaderboard together!')}
              />
            ) : (
              <>
                <LeaderboardPodiumContainer users={activeSnapshot.podiumUsers} />

                <View style={{ height: theme.space.md }} />
                <CurrentUserLeaderboardRankCard
                  name={activeSnapshot.currentUser.name.replace('You • ', '')}
                  rank={activeSnapshot.currentUser.rank}
                  points={activeSnapshot.currentUser.points}
                  weeklyGrowth={activeSnapshot.currentUser.trend}
                />

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
                  {activeSnapshot.rankings.map((item) => (
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
          </ScrollView>
        )}
      </View>
    </View>
  );
}
