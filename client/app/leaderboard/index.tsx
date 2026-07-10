import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';

import { TabContainer } from '../../components/TabContainer';
import { LeaderboardPodiumContainer } from '../../components/LeaderboardPodiumContainer';
import { LeaderboardRankCard } from '../../components/LeaderboardRankCard';
import { CurrentUserLeaderboardRankCard } from '../../components/CurrentUserLeaderboardRankCard';

type LeaderboardTimeFilter = 'weekly' | 'monthly' | 'alltime';
type LeaderboardScope = 'global' | 'friends';

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

type LeaderboardMock = {
  timeTabs: readonly { id: LeaderboardTimeFilter; label: string }[];
  scopeTabs: readonly { id: LeaderboardScope; label: string }[];
  snapshots: Record<LeaderboardTimeFilter, Record<LeaderboardScope, LeaderboardSnapshot>>;
};

const createRankings = (rows: LeaderboardRankRow[]) => rows;

const createSnapshot = (
  podiumUsers: LeaderboardPodiumUser[],
  currentUser: CurrentUserLeaderboardRow,
  rankings: LeaderboardRankRow[],
  playersCount: number,
): LeaderboardSnapshot => ({
  podiumUsers,
  currentUser,
  rankings,
  playersCount,
});

const leaderboardMock: LeaderboardMock = {
  timeTabs: [
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'alltime', label: 'All Time' },
  ],
  scopeTabs: [
    { id: 'global', label: 'Global' },
    { id: 'friends', label: 'Friends' },
  ],
  snapshots: {
    weekly: {
      global: createSnapshot(
        [
          { id: 'second', initials: 'RP', name: 'Dr. Ravi P.', score: 3847 },
          { id: 'first', initials: 'TU', name: 'tusharbaghel', score: 5252 },
          { id: 'third', initials: 'AK', name: 'Dr. Amir K.', score: 3411 },
        ],
        {
          rank: 5,
          initials: 'M',
          name: 'You • Mohsin Ansari',
          specialty: 'Surgery',
          points: 3201,
          trend: 12,
          trendLabel: 'this week',
        },
        createRankings([
          { id: '4', rank: 4, initials: 'SK', name: 'Dr. Sarah K.', specialty: 'Neurology', points: 4892 },
          { id: '5', rank: 5, initials: 'MA', name: 'Mohsin Ansari', specialty: 'Surgery', points: 3201 },
          { id: '6', rank: 6, initials: 'PS', name: 'Dr. Priya S.', specialty: 'Pediatrics', points: 2987 },
          { id: '7', rank: 7, initials: 'JW', name: 'James Wilson', specialty: 'Cardiology', points: 2654 },
          { id: '8', rank: 8, initials: 'AR', name: 'Aisha Rahman', specialty: 'Radiology', points: 2341 },
        ]),
        2341,
      ),
      friends: createSnapshot(
        [
          { id: 'second', initials: 'RP', name: 'Dr. Ravi P.', score: 3010 },
          { id: 'first', initials: 'TU', name: 'tusharbaghel', score: 3624 },
          { id: 'third', initials: 'AK', name: 'Dr. Amir K.', score: 2899 },
        ],
        {
          rank: 3,
          initials: 'M',
          name: 'You • Mohsin Ansari',
          specialty: 'Surgery',
          points: 3201,
          trend: 9,
          trendLabel: 'this week',
        },
        createRankings([
          { id: '4', rank: 4, initials: 'SK', name: 'Dr. Sarah K.', specialty: 'Neurology', points: 3456 },
          { id: '5', rank: 5, initials: 'MA', name: 'Mohsin Ansari', specialty: 'Surgery', points: 3201 },
          { id: '6', rank: 6, initials: 'PS', name: 'Dr. Priya S.', specialty: 'Pediatrics', points: 3012 },
          { id: '7', rank: 7, initials: 'JW', name: 'James Wilson', specialty: 'Cardiology', points: 2710 },
          { id: '8', rank: 8, initials: 'AR', name: 'Aisha Rahman', specialty: 'Radiology', points: 2465 },
        ]),
        1840,
      ),
    },
    monthly: {
      global: createSnapshot(
        [
          { id: 'second', initials: 'RP', name: 'Dr. Ravi P.', score: 10847 },
          { id: 'first', initials: 'TU', name: 'tusharbaghel', score: 12520 },
          { id: 'third', initials: 'AK', name: 'Dr. Amir K.', score: 10111 },
        ],
        {
          rank: 8,
          initials: 'M',
          name: 'You • Mohsin Ansari',
          specialty: 'Surgery',
          points: 8891,
          trend: 41,
          trendLabel: 'this month',
        },
        createRankings([
          { id: '4', rank: 4, initials: 'SK', name: 'Dr. Sarah K.', specialty: 'Neurology', points: 11120 },
          { id: '5', rank: 5, initials: 'MA', name: 'Mohsin Ansari', specialty: 'Surgery', points: 8891 },
          { id: '6', rank: 6, initials: 'PS', name: 'Dr. Priya S.', specialty: 'Pediatrics', points: 8422 },
          { id: '7', rank: 7, initials: 'JW', name: 'James Wilson', specialty: 'Cardiology', points: 7975 },
          { id: '8', rank: 8, initials: 'AR', name: 'Aisha Rahman', specialty: 'Radiology', points: 7741 },
        ]),
        9821,
      ),
      friends: createSnapshot(
        [
          { id: 'second', initials: 'RP', name: 'Dr. Ravi P.', score: 9012 },
          { id: 'first', initials: 'TU', name: 'tusharbaghel', score: 10411 },
          { id: 'third', initials: 'AK', name: 'Dr. Amir K.', score: 8760 },
        ],
        {
          rank: 6,
          initials: 'M',
          name: 'You • Mohsin Ansari',
          specialty: 'Surgery',
          points: 8320,
          trend: 28,
          trendLabel: 'this month',
        },
        createRankings([
          { id: '4', rank: 4, initials: 'SK', name: 'Dr. Sarah K.', specialty: 'Neurology', points: 9870 },
          { id: '5', rank: 5, initials: 'MA', name: 'Mohsin Ansari', specialty: 'Surgery', points: 8320 },
          { id: '6', rank: 6, initials: 'PS', name: 'Dr. Priya S.', specialty: 'Pediatrics', points: 7911 },
          { id: '7', rank: 7, initials: 'JW', name: 'James Wilson', specialty: 'Cardiology', points: 7440 },
          { id: '8', rank: 8, initials: 'AR', name: 'Aisha Rahman', specialty: 'Radiology', points: 7115 },
        ]),
        7120,
      ),
    },
    alltime: {
      global: createSnapshot(
        [
          { id: 'second', initials: 'RP', name: 'Dr. Ravi P.', score: 48847 },
          { id: 'first', initials: 'TU', name: 'tusharbaghel', score: 62520 },
          { id: 'third', initials: 'AK', name: 'Dr. Amir K.', score: 40111 },
        ],
        {
          rank: 14,
          initials: 'M',
          name: 'You • Mohsin Ansari',
          specialty: 'Surgery',
          points: 33201,
          trend: 118,
          trendLabel: 'all time',
        },
        createRankings([
          { id: '4', rank: 4, initials: 'SK', name: 'Dr. Sarah K.', specialty: 'Neurology', points: 51492 },
          { id: '5', rank: 5, initials: 'MA', name: 'Mohsin Ansari', specialty: 'Surgery', points: 33201 },
          { id: '6', rank: 6, initials: 'PS', name: 'Dr. Priya S.', specialty: 'Pediatrics', points: 31987 },
          { id: '7', rank: 7, initials: 'JW', name: 'James Wilson', specialty: 'Cardiology', points: 30254 },
          { id: '8', rank: 8, initials: 'AR', name: 'Aisha Rahman', specialty: 'Radiology', points: 29411 },
        ]),
        39241,
      ),
      friends: createSnapshot(
        [
          { id: 'second', initials: 'RP', name: 'Dr. Ravi P.', score: 35100 },
          { id: 'first', initials: 'TU', name: 'tusharbaghel', score: 40220 },
          { id: 'third', initials: 'AK', name: 'Dr. Amir K.', score: 32975 },
        ],
        {
          rank: 11,
          initials: 'M',
          name: 'You • Mohsin Ansari',
          specialty: 'Surgery',
          points: 29840,
          trend: 90,
          trendLabel: 'all time',
        },
        createRankings([
          { id: '4', rank: 4, initials: 'SK', name: 'Dr. Sarah K.', specialty: 'Neurology', points: 40120 },
          { id: '5', rank: 5, initials: 'MA', name: 'Mohsin Ansari', specialty: 'Surgery', points: 29840 },
          { id: '6', rank: 6, initials: 'PS', name: 'Dr. Priya S.', specialty: 'Pediatrics', points: 28710 },
          { id: '7', rank: 7, initials: 'JW', name: 'James Wilson', specialty: 'Cardiology', points: 27365 },
          { id: '8', rank: 8, initials: 'AR', name: 'Aisha Rahman', specialty: 'Radiology', points: 26408 },
        ]),
        29874,
      ),
    },
  },
};

export default function LeaderboardScreen() {
  const { theme } = useTheme();
  useBottomBar(true, 'leaderboard');

  const [timeFilter, setTimeFilter] = useState<LeaderboardTimeFilter>('weekly');
  const [scopeFilter, setScopeFilter] = useState<LeaderboardScope>('global');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const spin = useRef(new Animated.Value(0)).current;

  const rotate = useMemo(
    () =>
      spin.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      }),
    [spin],
  );

  const refreshLeaderboard = useCallback(() => {
    if (refreshing) return;

    setRefreshing(true);
    spin.setValue(0);

    Animated.timing(spin, {
      toValue: 1,
      duration: 650,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setRefreshKey(prev => prev + 1);
      setRefreshing(false);
    });
  }, [refreshing, spin]);

  const switchScope = useCallback((value: LeaderboardScope) => {
    setScopeFilter(value);
    setRefreshKey(0);
  }, []);

  const activeSnapshot = leaderboardMock.snapshots[timeFilter][scopeFilter];

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.space.md,
          paddingTop: theme.space.md,
          paddingBottom: theme.space.xxl * 2.5,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
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
              Leaderboard
            </Text>

            <Text
              style={{
                marginTop: 2,
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              Compete & climb the ranks
            </Text>
          </View>

          <Pressable
            onPress={refreshLeaderboard}
            disabled={refreshing}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: theme.borderRadius.lg,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: theme.color.border,
              backgroundColor: theme.color.card,
              opacity: pressed ? 0.88 : 1,
              shadowColor: theme.color.accent,
              shadowOpacity: theme.isDark ? 0.16 : 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            })}
          >
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Feather name="refresh-cw" size={17} color={theme.color.accent} />
            </Animated.View>
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: theme.space.xs,
            marginBottom: theme.space.sm,
            alignSelf: 'flex-start',
            width: '100%',
          }}
        >
          {leaderboardMock.timeTabs.map(tab => {
            const active = timeFilter === tab.id;

            return (
              <Pressable
                key={tab.id}
                onPress={() => setTimeFilter(tab.id)}
                style={({ pressed }) => ({
                  minWidth: 88,
                  minHeight: 30,
                  borderRadius: 999,
                  borderWidth: active ? 0 : 1,
                  borderColor: active ? theme.color.accent : theme.color.border,
                  backgroundColor: active ? theme.color.accent : theme.color.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: theme.space.md,
                  paddingVertical: theme.space.xs,
                  opacity: pressed ? 0.9 : 1,
                  shadowColor: active ? theme.color.accent : 'transparent',
                  shadowOpacity: active ? (theme.isDark ? 0.18 : 0.08) : 0,
                  shadowRadius: active ? 8 : 0,
                  shadowOffset: active ? { width: 0, height: 2 } : { width: 0, height: 0 },
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
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: theme.space.md }} />

        <TabContainer
          tabs={leaderboardMock.scopeTabs}
          value={scopeFilter}
          onChange={value => switchScope(value as LeaderboardScope)}
        />

        <View style={{ height: theme.space.md }} />

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
            justifyContent: 'space-between',
            alignItems: 'center',
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
            Rankings
          </Text>

          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {activeSnapshot.playersCount.toLocaleString()} players
          </Text>
        </View>

        <View key={`${timeFilter}-${scopeFilter}-${refreshKey}`}>
          {activeSnapshot.rankings.map(item => (
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
      </ScrollView>
    </View>
  );
}