import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { api } from '../../common/api/api';
import { HomeHeader } from './homeHeader';
import { useTheme } from '../../theme/ThemeContext';
import { Loading } from '../../components/common/loading';
import type { HomeData, User, Contest } from '../../common/types/types';
import { useBottomBar } from '../../common/context/useBottomBar';
import { LevelProgressCard } from '../../components/LevelProgressCard';
import { StatsOverviewCard } from '../../components/StatsOverviewCard';
import { DailyChallengeCard } from '../../components/DailyChallengeCard';
import { ActiveContestsCard } from '../../components/ActiveContestsCard';
import { PerformanceTrendCard } from '../../components/PerformanceTrendCard';
import { SubjectId, SubjectIcon, subjectCatalog } from '../../common/constants/subject';
import { xpRequiredForLevel, computeLevelFromXp } from '../../common/utils/computeLevelXP';

type PracticeSubject = { id: SubjectId; label: string };

function PracticeBySubject({ subjects, onPress }: { subjects?: PracticeSubject[], onPress?: (id: SubjectId) => void }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const allSubjects: PracticeSubject[] = useMemo(() => {
    const allIds = Object.keys(subjectCatalog) as SubjectId[];
    return allIds.map((id) => ({ id, label: theme.i18n.t(subjectCatalog[id].title) }));
  }, [theme.i18n]);

  const iconSize = Math.min(width * 0.13, 58);
  const iconSizeValue = iconSize * 0.42;
  const finalSubjects = subjects ?? allSubjects;
  const getIconSizeValue = (subjectId: SubjectId) => subjectId === 'anatomy' ? iconSizeValue * 1.35 : iconSizeValue;

  // --- horizontal scroll + scrollbar tracking (mirrors ActiveContestsCard) ---
  const scrollRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const maxScroll = Math.max(contentWidth - containerWidth, 1);
  const thumbWidthRatio = Math.min(containerWidth / Math.max(contentWidth, 1), 1);
  const thumbPositionRatio = Math.min(Math.max(scrollX / maxScroll, 0), 1);

  const itemWidth = Math.max(76, iconSize + theme.space.md);

  const handleScroll = (e: any) => {
    setScrollX(e.nativeEvent.contentOffset.x);
  };
  const scrollByItem = (direction: 1 | -1) => {
    const nextX = Math.min(
      Math.max(scrollX + direction * (itemWidth * 2 + theme.space.md), 0),
      maxScroll
    );
    scrollRef.current?.scrollTo({ x: nextX, animated: true });
  };

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        onContentSizeChange={(w) => setContentWidth(w)}
        contentContainerStyle={{
          paddingHorizontal: theme.space.sm,
          gap: theme.space.md,
        }}
      >
        {finalSubjects.map((subject) => {
          const definition = subjectCatalog[subject.id];
          const iconColor = theme.color[definition?.variant ?? 'accent'];
          return (
            <TouchableOpacity
              key={subject.id}
              activeOpacity={0.8}
              onPress={() => onPress?.(subject.id)}
              style={{ alignItems: 'center', width: itemWidth }}
            >
              <View
                style={{
                  width: iconSize,
                  height: iconSize,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: theme.space.xs,
                  borderWidth: 1,
                  borderRadius: iconSize / 3,
                  borderColor: `${iconColor}35`,
                  backgroundColor: `${iconColor}12`,
                }}
              >
                <SubjectIcon
                  id={subject.id}
                  color={iconColor}
                  size={getIconSizeValue(subject.id)}
                />
              </View>

              <Text
                numberOfLines={1}
                style={{
                  textAlign: 'center',
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.xs,
                  fontFamily: theme.fontWeight.medium,
                }}
              >
                {subject.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {contentWidth > containerWidth && (
        <View
          style={{
            gap: theme.space.sm,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.space.sm,
          }}
        >
          <TouchableOpacity activeOpacity={0.7} onPress={() => scrollByItem(-1)} hitSlop={8}>
            <Feather
              name='chevron-left'
              size={theme.fontSize.md}
              color={theme.color.textSecondary}
            />
          </TouchableOpacity>

          <View
            style={{
              flex: 1,
              overflow: 'hidden',
              height: theme.space.xs,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.border,
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: `${thumbPositionRatio * (1 - thumbWidthRatio) * 100}%`,
                width: `${thumbWidthRatio * 100}%`,
                height: '100%',
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.textSecondary,
              }}
            />
          </View>

          <TouchableOpacity activeOpacity={0.7} onPress={() => scrollByItem(1)} hitSlop={8}>
            <Feather
              name='chevron-right'
              size={theme.fontSize.md}
              color={theme.color.textSecondary}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [challengeContest, setChallengeContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(true, 'home');

  useEffect(() => {
    let isMounted = true;

    async function fetchHomeDashboard() {
      try {
        setLoading(true);
        setError(null);
        const [nextHomeData, currentUser, leaderboard] = await Promise.all([
          api.home.getHomeData(),
          api.user.getMe(),
          api.leaderboard.getLeaderboard(),
        ]);

        if (isMounted) {
          setHomeData(nextHomeData);
          setUser(currentUser);
          setMyRank(leaderboard.myRank);
        }
        if (nextHomeData.dailyChallenge?.contestId) {
          const contest = await api.contest.getContest(nextHomeData.dailyChallenge.contestId);
          if (isMounted) setChallengeContest(contest ?? null);
        }
      } catch (err) {
        console.log('Failed to fetch home dashboard:', err);
        if (isMounted) setError(theme.i18n.t('Could not load your dashboard. Pull to retry.'));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchHomeDashboard();
    return () => { isMounted = false };
  }, [theme.i18n]);

  const dailyChallenge = homeData?.dailyChallenge ?? null;

  // Always show the full subject catalog here (not just subjects the user
  // has stats for) so nothing is missing from the horizontal list.
  const practiceSubjects = useMemo(() => {
    const allIds = Object.keys(subjectCatalog) as SubjectId[];
    return allIds.map((id) => ({ id, label: theme.i18n.t(subjectCatalog[id].title) }));
  }, [theme.i18n]);

  const performanceTrend = useMemo(() => {
    const weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
    const trend = {} as Record<(typeof weekDays)[number], number>;

    homeData?.performanceTrend.slice(-7).forEach((point, index) => {
      const key = weekDays[index];
      if (key) trend[key] = point.accuracy;
    });

    return trend;
  }, [homeData]);

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

  // Derive level from XP so it can never drift out of sync with epPoints
  const currentLevel = computeLevelFromXp(user.epPoints);

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <HomeHeader
        name={user.displayName}
        streak={user.currentStreak}
        level={currentLevel}
        lastActiveDate={user.lastActiveDate}
        onNotificationsPress={() => router.push('/notifications')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: theme.space.md,
          paddingTop: theme.space.md,
          paddingBottom: theme.space.xxl * 1.75,
          paddingHorizontal: theme.space.md,
        }}
      >
        <LevelProgressCard
          currentLevel={currentLevel}
          nextLevel={currentLevel + 1}
          currentXP={user.epPoints}
          nextLevelXP={xpRequiredForLevel(currentLevel + 1)}
          remainingXP={Math.max(0, xpRequiredForLevel(currentLevel + 1) - user.epPoints)}
        />

        <StatsOverviewCard
          rank={myRank ?? 0}
          accuracy={Math.round(homeData.subjectGrid.reduce((sum, item) => sum + item.accuracy, 0) / homeData.subjectGrid.length)}
          quizzesTaken={homeData.subjectGrid.reduce((sum, item) => sum + item.totalAttempted, 0)}
          earnedPoints={user.epPoints}
        />

        <DailyChallengeCard
          title={dailyChallenge?.subject ?? 'Anatomy Essentials'}
          questions={challengeContest?.totalQuestions ?? 30}
          duration={challengeContest ? Math.round(challengeContest.timeLimitSecs / 60) : 45}
          difficulty={challengeContest?.difficulty ?? 'medium'}
          endsAt={dailyChallenge?.expiresAt
            ? String(Math.max(1, Math.round((new Date(dailyChallenge.expiresAt).getTime() - Date.now()) / 60000)))
            : '840'
          }
          epReward={dailyChallenge?.epReward ?? 150}
          onStart={() => {}}
        />

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

          <View>
            <ActiveContestsCard
              contests={homeData.activeContests.map((contest) => ({
                title: contest.title,
                subject: contest.subject,
                difficulty: contest.difficulty as 'hard' | 'medium' | 'easy',
                isLive: contest.status === 'active',
                participantsCount: contest.participantCount,
                epReward: contest.epReward,
              }))}
            />
          </View>
        </View>

        <View style={{ gap: theme.space.sm }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('Practice by Subject')}
          </Text>

          <PracticeBySubject
            subjects={practiceSubjects}
            onPress={(subjectId) => {
              console.log('Selected Subject:', subjectId);
            }}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/home/practiceBySubject')}
            style={{
              marginTop: theme.space.md,
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

        <PerformanceTrendCard accuracy={performanceTrend} />
      </ScrollView>
    </View>
  );
}