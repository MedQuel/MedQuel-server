import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeHeader from './homeHeader';
import { useTheme } from '../../theme/ThemeContext';
import { getTodayKey } from '../../common/utils/dateUtils';
import { useAppContext } from '../../common/context/AppContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { useHomeDashboard } from '../../common/hooks/useHomeDashboard';

import { Loading } from '../../components/common/loading';
import { StudyPlanCard } from '../../components/home/StudyPlanCard';
import { ChallengesCard } from '../../components/home/ChallengesCard';
import { LevelProgressCard } from '../../components/home/LevelProgressCard';
import { StatsOverviewCard } from '../../components/home/StatsOverviewCard';
import { DailyChallengeCard } from '../../components/home/DailyChallengeCard';
import { ActiveContestsCard } from '../../components/home/ActiveContestsCard';
import { PerformanceTrendCard } from '../../components/home/PerformanceTrendCard';


const STORAGE_KEY_DISMISSED_CHALLENGE = 'medquel_dismissed_challenge_date';

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
  const [challengeDismissed, setChallengeDismissed] = useState(false);
  const { data, loading, refreshing, error, load } = useHomeDashboard();
  const { authStatus, user, userLoading, userError } = useAppContext();

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  useBottomBar(true, 'home');

  const todayKey = getTodayKey();

  useEffect(() => {
    let isMounted = true;
    getStoredDismissedKey().then((storedVal) => {
      if (isMounted) setChallengeDismissed(storedVal === todayKey);
    });
    return () => {
      isMounted = false;
    };
  }, [todayKey]);

  useFocusEffect(
    useCallback(() => {
      if (authStatus === 'authenticated') load();
    }, [authStatus, load])
  );

  const onRefresh = useCallback(() => {
    load();
  }, [load]);

  const handleDismissChallenge = () => {
    setChallengeDismissed(true);
    setStoredDismissedKey(todayKey);
  };

  const isInitialLoading = (userLoading && !user) || (loading && !data.homeData);
  if (isInitialLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background }}>
        <Loading message={theme.i18n.t('home.loading')} fullscreen />
      </View>
    );
  }

  if (!user || (error && !data.homeData)) {
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.color.accent}
          />
        }
      >
        <Feather
          name='alert-circle'
          size={theme.space.xxl}
          color={theme.color.error}
          style={{ marginBottom: theme.space.md }}
        />
        <Text
          style={{
            textAlign: 'center',
            fontSize: theme.fontSize.sm,
            color: theme.color.textSecondary,
            fontFamily: theme.fontFamily.regular,
            marginBottom: theme.space.lg,
          }}
        >
          {error ?? userError?.message ?? theme.i18n.t('home.loadError')}
        </Text>

        <TouchableOpacity
          onPress={onRefresh}
          style={{
            paddingVertical: theme.space.sm * 1.25,
            paddingHorizontal: theme.space.xl,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.accent,
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              color: theme.color.textInverse,
              fontWeight: theme.fontWeight.bold,
            }}
          >
            {theme.i18n.t('common.retry')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const { homeData, analytics, challenges, friendsById, studyPlan, dailyChallengeContest } = data;
  const dailyChallenge = homeData!.dailyChallenge;
  const quizzesTaken = analytics?.recentAttempts.length ?? 0;
  const activeContests = homeData!.activeContests;

  const renderDailyChallengeSection = () => {
    if (challengeDismissed || !dailyChallenge) return null;
    return (
      <DailyChallengeCard
        title={dailyChallengeContest?.title ?? theme.i18n.t('home.daily_challenge')}
        subject={dailyChallenge?.subject ?? 'General'}
        questions={dailyChallengeContest?.totalQuestions ?? 0}
        duration={Math.round((dailyChallengeContest?.timeLimitSecs ?? 0) / 60)}
        difficulty={dailyChallengeContest?.difficulty ?? 'medium'}
        endsAt={dailyChallenge.expiresAt}
        epReward={dailyChallenge.epReward ?? dailyChallengeContest?.epReward ?? 50}
        completed={false}
        onDismiss={handleDismissChallenge}
        onStart={() => {
          router.push({
            pathname: '/contests/preQuizScreen',
            params: { contestId: dailyChallenge.contestId },
          });
        }}
      />
    );
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
        contentContainerStyle={{
          flexGrow: 1,
          gap: theme.space.md,
          paddingTop: theme.space.md * 0.8,
          paddingBottom: insets.bottom * 2.5,
          paddingHorizontal: theme.space.md,
        }}
      >
        <LevelProgressCard xpPoints={user.xpPoints} />

        <StatsOverviewCard
          rank={data.myRank ?? 0}
          accuracy={analytics ? Math.round(analytics.overallAccuracy) : 0}
          quizzesTaken={quizzesTaken}
          earnedPoints={user.epPoints}
        />

        {renderDailyChallengeSection()}

        <ChallengesCard
          challenges={challenges}
          friendsById={friendsById}
          currentUserId={user.uid}
          currentUserName={user.displayName}
          currentUserPhoto={user.photoURL}
        />

        <StudyPlanCard plan={studyPlan} />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/home/practiceBySubject')}
          style={{ borderRadius: theme.borderRadius.xl, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={theme.isDark
              ? ['#05173d', '#071d4d', '#08205a']
              : ['#2762f7', '#1a56f0', '#0f49db']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: theme.space.md * 1.25,
              borderWidth: 1.5,
              borderRadius: theme.borderRadius.xl,
              borderColor: theme.isDark ? theme.color.border : 'rgba(37,99,235,0.15)',
            }}
          >
            <Text
              style={{
                lineHeight: theme.fontSize.md * 1.25,
                fontSize: theme.fontSize.lg,
                fontFamily: theme.fontFamily.bold,
                color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
              }}
            >
              {theme.i18n.t('home.practice_by_subject')}
            </Text>
            <Feather
              name='chevron-right'
              size={theme.fontSize.lg}
              color={theme.isDark ? theme.color.info : theme.color.textInverse}
            />
          </LinearGradient>
        </TouchableOpacity>

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
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {theme.i18n.t('home.active_contests')}
            </Text>
            <TouchableOpacity onPress={() => router.push('/contests')}>
              <Text
                style={{
                  color: theme.color.accent,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t('home.view_all')}
              </Text>
            </TouchableOpacity>
          </View>

          {activeContests.length > 0 ? (
            <ActiveContestsCard
              contests={activeContests.map((contest) => ({
                contestId: contest.contestId,
                title: contest.title,
                subject: contest.subject,
                difficulty: contest.difficulty,
                contestType: contest.contestType,
                isPremium: contest.isPremium,
                participantsCount: contest.participantCount,
                epReward: contest.epReward,
              }))}
            />
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
              <Feather
                name='inbox'
                size={theme.fontSize.xl}
                color={theme.color.textMuted}
              />
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.color.textMuted,
                  fontFamily: theme.fontFamily.regular,
                  marginTop: theme.space.sm,
                }}
              >
                {theme.i18n.t('home.no_contests_available')}
              </Text>
            </View>
          )}
        </View>

        {homeData!.performanceTrend.length > 0 && (
          <PerformanceTrendCard data={homeData!.performanceTrend.slice(-7)} />
        )}
      </ScrollView>
    </View>
  );
}
