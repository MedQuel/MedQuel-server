import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
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
let dismissedChallengeContestId: string | null = null;
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
  const fetchHomeDashboard = useCallback(async (isMountedRef: { current: boolean }) => {
    try {
      setError(null);
      const [nextHomeData, currentUser, leaderboard, analyticsData] = await Promise.all([
        api.home.getHomeData(),
        api.user.getMe(),
        api.leaderboard.getLeaderboard(),
        api.analytics.getAnalytics(),
      ]);
      if (isMountedRef.current) {
        setHomeData(nextHomeData);
        setUser(currentUser);
        setMyRank(leaderboard.myRank);
        setAnalytics(analyticsData);
      }

      if (nextHomeData.dailyChallenge?.contestId) {
        try {
          const contest = await api.contest.getContest(nextHomeData.dailyChallenge.contestId);
          if (isMountedRef.current) setChallengeContest(contest ?? null);
        } catch (contestErr) {
          console.log('Failed to fetch challenge contest details:', contestErr);
        }
      }
    } catch (err) {
      console.log('Failed to fetch home dashboard:', err);
      if (isMountedRef.current) setError(theme.i18n.t('Could not load your dashboard. Pull to retry.'));
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [theme.i18n]);
  useFocusEffect(
    useCallback(() => {
      const isMountedRef = { current: true };
      setLoading(true);
      fetchHomeDashboard(isMountedRef);
      return () => { isMountedRef.current = false };
    }, [fetchHomeDashboard])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHomeDashboard({ current: true });
  }, [fetchHomeDashboard]);

  const dailyChallenge = homeData?.dailyChallenge ?? null;
  const quizzesTaken = analytics?.recentAttempts.length ?? 0;
// Played contests IDs from recent attempts (with safe type checking)
const playedContestIds = new Set(
  analytics?.recentAttempts
    ?.map((attempt: any) => attempt?.contestId ?? attempt?.quizId)
    .filter(Boolean) ?? []
);
  // Filter unplayed active contests
  const availableContests = (homeData?.activeContests ?? []).filter((contest) => {
    const isActive = contest.status === 'active' && new Date(contest.endsAt).getTime() > Date.now();
    const isAlreadyPlayed = playedContestIds.has(contest.contestId);
    return isActive && !isAlreadyPlayed;
  });

  const isChallengeCompleted = Boolean(
    dailyChallenge?.contestId && playedContestIds.has(dailyChallenge.contestId)
  );
  const showChallengeCard = Boolean(dailyChallenge) && !(isChallengeCompleted && challengeDismissed);
  useEffect(() => {
    if (dailyChallenge?.contestId && isChallengeCompleted) {
      setChallengeDismissed(dismissedChallengeContestId === dailyChallenge.contestId);
    } else {
      setChallengeDismissed(false);
    }
  }, [dailyChallenge?.contestId, isChallengeCompleted]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background }}>
        <Loading message={theme.i18n.t('Loading your dashboard...')} fullscreen />
      </View>
    );
  }

  if (error || !homeData || !user) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.space.md,
          backgroundColor: theme.color.background,
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {error ?? theme.i18n.t('Home dashboard not found.')}
        </Text>
      </View>
    );
  }

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.color.accent} />
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
        {dailyChallenge && showChallengeCard ? (
          <DailyChallengeCard
            title={dailyChallenge.subject}
            questions={challengeContest?.totalQuestions ?? 30}
            duration={challengeContest ? Math.round(challengeContest.timeLimitSecs / 60) : 45}
            difficulty={challengeContest?.difficulty ?? 'medium'}
            endsAt={String(
              Math.max(1, Math.round((new Date(dailyChallenge.expiresAt).getTime() - Date.now()) / 60000))
            )}
            epReward={dailyChallenge.epReward}
            completed={isChallengeCompleted}
            onDismiss={() => {
              setChallengeDismissed(true);
              if (dailyChallenge.contestId) {
                dismissedChallengeContestId = dailyChallenge.contestId;
              }
            }}
            onStart={() => {
              if (dailyChallenge.contestId) {
                router.push(`/contests/${dailyChallenge.contestId}`);
              }
            }}
          />
        ) : !dailyChallenge ? (
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
            <Feather name="calendar" size={theme.fontSize.xl} color={theme.color.textMuted} />
            <Text
              style={{
                marginTop: theme.space.sm,
                color: theme.color.textMuted,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {theme.i18n.t('No new challenge right now. Check back soon!')}
            </Text>
          </View>
        ) : null}

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
                name='chevron-right'
                size={theme.fontSize.lg}
                color={theme.isDark ? theme.color.info : theme.color.textInverse}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ gap: theme.space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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

        <PerformanceTrendCard data={homeData.performanceTrend.slice(-7)} />
      </ScrollView>
    </View>
  );
}