import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { api } from '../../common/api/api';
import { HomeHeader } from './homeHeader';
import { useTheme } from '../../theme/ThemeContext';
import { Loading } from '../../components/common/loading';
import type { HomeData, User, Contest, AnalyticsData } from '../../common/types/types';
import { useBottomBar } from '../../common/context/useBottomBar';
import { LevelProgressCard } from '../../components/LevelProgressCard';
import { StatsOverviewCard } from '../../components/StatsOverviewCard';
import { DailyChallengeCard } from '../../components/DailyChallengeCard';
import { ActiveContestsCard } from '../../components/ActiveContestsCard';
import { PerformanceTrendCard } from '../../components/PerformanceTrendCard';

const STORAGE_KEY_DISMISSED_CHALLENGE = 'medquel_dismissed_challenge_date';

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

async function getStoredDismissedKey(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY_DISMISSED_CHALLENGE);
  } catch {
    return null;
  }
}

async function setStoredDismissedKey(val: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_DISMISSED_CHALLENGE, val);
  } catch {}
}

export default function HomeScreen() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [challengeContest, setChallengeContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challengeDismissed, setChallengeDismissed] = useState(false);

  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(true, 'home');

  const todayKey = getTodayKey();

  useEffect(() => {
    let isMounted = true;
    getStoredDismissedKey().then((storedVal) => {
      if (isMounted) {
        setChallengeDismissed(storedVal === todayKey);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [todayKey]);

  const fetchHomeDashboard = useCallback(
    async (isMountedRef: { current: boolean }, retries = 2) => {
      try {
        setError(null);

        const [homeRes, userRes, leaderboardRes, analyticsRes] = await Promise.allSettled([
          api.home.getHomeData(),
          api.user.getMe(),
          api.leaderboard.getLeaderboard(),
          api.analytics.getAnalytics(),
        ]);

        if (!isMountedRef.current) return;

        const nextHome = homeRes.status === 'fulfilled' ? homeRes.value : null;
        const currentUser = userRes.status === 'fulfilled' ? userRes.value : null;
        const leaderboard = leaderboardRes.status === 'fulfilled' ? leaderboardRes.value : null;
        const analyticsData = analyticsRes.status === 'fulfilled' ? analyticsRes.value : null;

        if (!currentUser && !nextHome && retries > 0) {
          await new Promise<void>((resolve) => setTimeout(resolve, 400));
          return fetchHomeDashboard(isMountedRef, retries - 1);
        }

        if (!currentUser && !nextHome) {
          throw new Error('Could not load dashboard data');
        }

        setHomeData(nextHome);
        setUser(currentUser);
        setMyRank(leaderboard?.myRank ?? 0);
        setAnalytics(analyticsData);

        const challengeId =
          nextHome?.dailyChallenge?.contestId ||
          (nextHome?.dailyChallenge as any)?.id ||
          (nextHome?.dailyChallenge as any)?._id;

        if (challengeId) {
          try {
            const contest = await api.contest.getContest(challengeId);
            if (isMountedRef.current) setChallengeContest(contest ?? null);
          } catch {}
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(theme.i18n.t('Could not load your dashboard. Pull to retry.'));
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [theme.i18n]
  );

  useFocusEffect(
    useCallback(() => {
      const isMountedRef = { current: true };
      fetchHomeDashboard(isMountedRef);
      return () => {
        isMountedRef.current = false;
      };
    }, [fetchHomeDashboard])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHomeDashboard({ current: true });
  }, [fetchHomeDashboard]);

  const dailyChallenge = homeData?.dailyChallenge ?? null;
  const challengeId =
    dailyChallenge?.contestId ||
    (dailyChallenge as any)?.id ||
    (dailyChallenge as any)?._id;

  const quizzesTaken = analytics?.recentAttempts.length ?? 0;

  const playedContestIds = new Set(
    analytics?.recentAttempts
      ?.map((attempt: any) => attempt?.contestId ?? attempt?.quizId)
      .filter(Boolean) ?? []
  );

  const availableContests = (homeData?.activeContests ?? []).filter((contest) => {
    const isActive =
      contest.status === 'active' && new Date(contest.endsAt).getTime() > Date.now();
    const isAlreadyPlayed = playedContestIds.has(contest.contestId);
    return isActive && !isAlreadyPlayed;
  });

  const isChallengeCompleted = Boolean(
    (challengeId && playedContestIds.has(challengeId)) ||
    (homeData && !dailyChallenge)
  );

  const handleDismissChallenge = () => {
    setChallengeDismissed(true);
    setStoredDismissedKey(todayKey);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background }}>
        <Loading message={theme.i18n.t('Loading your dashboard...')} fullscreen />
      </View>
    );
  }

  if (error || !user) {
    return (
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.space.md,
          backgroundColor: theme.color.background,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.color.accent} />
        }
      >
        <Feather name="alert-circle" size={48} color={theme.color.error} style={{ marginBottom: theme.space.md }} />
        <Text
          style={{
            textAlign: 'center',
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.regular,
            marginBottom: theme.space.lg,
          }}
        >
          {error ?? theme.i18n.t('Could not load your dashboard. Pull to retry.')}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setLoading(true);
            fetchHomeDashboard({ current: true });
          }}
          style={{
            paddingVertical: theme.space.sm * 1.25,
            paddingHorizontal: theme.space.xl,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.accent,
          }}
        >
          <Text style={{ color: theme.color.textInverse, fontWeight: '700', fontSize: theme.fontSize.sm }}>
            {theme.i18n.t('Retry')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const renderDailyChallengeSection = () => {
    if (challengeDismissed) {
      return null;
    }

    if (isChallengeCompleted) {
      return (
        <DailyChallengeCard
          title=""
          questions={0}
          duration={0}
          difficulty="medium"
          endsAt="0"
          epReward={0}
          completed={true}
          onDismiss={handleDismissChallenge}
          onStart={() => {}}
        />
      );
    }

    if (dailyChallenge) {
      const expiresAt = dailyChallenge.expiresAt ? new Date(dailyChallenge.expiresAt).getTime() : 0;
      const minutesLeft = expiresAt > Date.now() ? Math.round((expiresAt - Date.now()) / 60000) : 45;

      return (
        <DailyChallengeCard
          title={dailyChallenge.subject || challengeContest?.subject || 'Clinical Challenge'}
          questions={challengeContest?.totalQuestions ?? 20}
          duration={challengeContest ? Math.round(challengeContest.timeLimitSecs / 60) : 15}
          difficulty={(challengeContest?.difficulty as any) || 'medium'}
          endsAt={String(Math.max(1, minutesLeft))}
          epReward={dailyChallenge.epReward ?? challengeContest?.epReward ?? 50}
          completed={false}
          onStart={() => {
            if (challengeId) {
              router.push({
                pathname: '/contests/preQuizScreen',
                params: { contestId: challengeId },
              });
            }
          }}
        />
      );
    }

    return null;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <HomeHeader
        name={user.displayName}
        streak={user.currentStreak}
        xpPoints={user.xpPoints}
        lastActiveDate={user.lastActiveDate}
        photoURL={user.photoURL}
        onNotificationsPress={() => router.push('/notifications')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.color.accent}
          />
        }
        contentContainerStyle={{
          gap: theme.space.md,
          paddingTop: theme.space.md,
          paddingBottom: theme.space.xxl * 1.75,
          paddingHorizontal: theme.space.md,
        }}
      >
        <LevelProgressCard epPoints={user.xpPoints} />

        <StatsOverviewCard
          rank={myRank ?? 0}
          accuracy={analytics ? Math.round(analytics.overallAccuracy) : 0}
          quizzesTaken={quizzesTaken}
          earnedPoints={user.epPoints}
        />

        {renderDailyChallengeSection()}

        <View style={{ gap: theme.space.sm }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/home/practiceBySubject')}
            style={{
              borderRadius: theme.borderRadius.xl,
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={
                theme.isDark
                  ? ['#05173d', '#071d4d', '#08205a']
                  : ['#2762f7', '#1a56f0', '#0f49db']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: theme.space.md,
                borderWidth: 1.5,
                borderColor: theme.isDark ? theme.color.border : 'rgba(37,99,235,0.15)',
                borderRadius: theme.borderRadius.xl,
              }}
            >
              <Text
                style={{
                  color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                  fontSize: theme.fontSize.md,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {theme.i18n.t('Explore Practice Subjects')}
              </Text>
              <Feather
                name="chevron-right"
                size={theme.fontSize.lg}
                color={theme.isDark ? theme.color.info : theme.color.textInverse}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ gap: theme.space.sm }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.lg,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {theme.i18n.t('Active Contests')}
            </Text>

            <TouchableOpacity onPress={() => router.push('/contests')}>
              <Text
                style={{
                  color: theme.color.accent,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t('View All')}
              </Text>
            </TouchableOpacity>
          </View>

          {availableContests.length > 0 ? (
            <View>
              <ActiveContestsCard
                contests={availableContests.map((contest) => ({
                  contestId: contest.contestId,
                  title: contest.title,
                  subject: contest.subject,
                  difficulty: contest.difficulty as 'hard' | 'medium' | 'easy',
                  isLive: contest.status === 'active',
                  participantsCount: contest.participantCount,
                  epReward: contest.epReward,
                }))}
              />
            </View>
          ) : (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: theme.space.lg,
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.xl,
                backgroundColor: theme.color.card,
              }}
            >
              <Feather name="inbox" size={theme.fontSize.xl} color={theme.color.textMuted} />
              <Text
                style={{
                  marginTop: theme.space.sm,
                  color: theme.color.textMuted,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t('No contest available to play')}
              </Text>
            </View>
          )}
        </View>

        {homeData?.performanceTrend && (
          <PerformanceTrendCard data={homeData.performanceTrend.slice(-7)} />
        )}
      </ScrollView>
    </View>
  );
}