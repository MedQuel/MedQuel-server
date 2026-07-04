/* eslint-disable no-bitwise */
import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { LeaderboardPodiumContainer } from '../../components/LeaderboardPodiumContainer';
import { LeaderboardRankCard } from '../../components/LeaderboardRankCard';
import { CurrentUserLeaderboardRankCard } from '../../components/CurrentUserLeaderboardRankCard';

import {
  leaderboardMock,
  type LeaderboardScope,
  type LeaderboardTimeFilter,
} from '../../common/constants/leaderboardMock';

const withAlpha = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(ch => ch + ch).join('')
    : clean.slice(0, 6);
  const int = Number.parseInt(full, 16);
  return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`;
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
    () => spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }),
    [spin]
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

  const handleTimeFilterChange = useCallback((value: LeaderboardTimeFilter) => {
    setTimeFilter(value);
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
          <View style={{ flex: 1 }}>
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
              Leaderboard
            </Text>
            <Text
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              Compete & climb the ranks
            </Text>
          </View>
          <Pressable
            disabled={refreshing}
            onPress={refreshLeaderboard}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: theme.borderRadius.xl,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: theme.isDark
                ? 'rgba(96,165,250,0.38)'
                : 'rgba(37,99,235,0.24)',
              backgroundColor: theme.isDark
                ? 'rgba(59,130,246,0.14)'
                : 'rgba(37,99,235,0.08)',
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
            justifyContent: 'flex-start',
            alignSelf: 'flex-start',
            width: '100%',
          }}
        >
          {leaderboardMock.timeTabs.map(tab => {
            const active = timeFilter === tab.id;

            return (
              <Pressable
                key={tab.id}
                onPress={() => handleTimeFilterChange(tab.id)}
                style={({ pressed }) => ({
                  flexGrow: 0,
                  flexShrink: 1,
                  minWidth: 88,
                  minHeight: 30,
                  borderRadius: theme.borderRadius.lg,
                  borderWidth: active ? 0 : 1,
                  borderColor: active ? theme.color.accent : theme.color.border,
                  backgroundColor: active
                    ? theme.color.accent
                    : theme.color.card,
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

        <View
          style={{
            flexDirection: 'row',
            gap: theme.space.sm,
            marginBottom: theme.space.md,
          }}
        >
          {leaderboardMock.scopeTabs.map(item => {
            const active = scopeFilter === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => switchScope(item.id)}
                style={({ pressed }) => ({
                  flex: 1,
                  minHeight: 36,
                  borderWidth: 1.5,
                  borderRadius: theme.borderRadius.lg,
                  borderColor: active ? theme.color.accent : theme.color.border,
                  backgroundColor: active
                    ? withAlpha(theme.color.accent, theme.isDark ? 0.15 : 0.09)
                    : theme.color.card,
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  gap: theme.space.xs + 2,
                  paddingHorizontal: theme.space.sm + 2,
                  opacity: pressed ? 0.92 : 1,
                  shadowColor: active ? theme.color.accent : 'transparent',
                  shadowOpacity: active ? (theme.isDark ? 0.14 : 0.06) : 0,
                  shadowRadius: active ? 8 : 0,
                  shadowOffset: active ? { width: 0, height: 2 } : { width: 0, height: 0 },
                  elevation: active ? 1 : 0,
                })}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: theme.borderRadius.full,
                    backgroundColor: active ? theme.color.accent : theme.color.textMuted,
                  }}
                />
                <Text
                  style={{
                    color: active ? theme.color.accent : theme.color.textSecondary,
                    fontSize: theme.fontSize.xs,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

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
