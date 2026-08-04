import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { api } from '../../common/api/api';
import { HomeHeader } from './homeHeader';
import { useTheme } from '../../theme/ThemeContext';
import { Loading } from '../../components/common/loading';
import { useBottomBar } from '../../common/context/useBottomBar';
import { LevelProgressCard } from '../../components/LevelProgressCard';
import { StatsOverviewCard } from '../../components/StatsOverviewCard';
import { DailyChallengeCard } from '../../components/DailyChallengeCard';
import { ActiveContestsCard } from '../../components/ActiveContestsCard';
import { PerformanceTrendCard } from '../../components/PerformanceTrendCard';
import { SubjectId, SubjectIcon, subjectCatalog } from '../../common/constants/subject';
import type { HomeData, User } from '../../common/types/types';

type PracticeSubject = { id: SubjectId; label: string };
function PracticeBySubject({ subjects, onPress }: { subjects?: PracticeSubject[], onPress?: (id: SubjectId) => void }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const randomSubjects: PracticeSubject[] = useMemo(() => {
    const allIds = Object.keys(subjectCatalog) as SubjectId[];
    const shuffled: SubjectId[] = [...allIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const current = shuffled[i];
      const next = shuffled[j];
      if (current !== undefined && next !== undefined) {
        [shuffled[i], shuffled[j]] = [next, current];
      }
    }
    return shuffled.slice(0, 6).map((id) => ({
      id,
      label: theme.i18n.t(subjectCatalog[id].title),
    }));
  }, []);

  const iconSize = Math.min(width * 0.13, 58);
  const iconSizeValue = iconSize * 0.42;
  const finalSubjects = subjects ?? randomSubjects;
  const getIconSizeValue = (subjectId: SubjectId) => subjectId === 'anatomy' ? iconSizeValue * 1.35 : iconSizeValue;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: theme.space.sm,
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
            style={{
              flex: 1,
              alignItems: 'center',
              paddingHorizontal: theme.space.xs * 0.5,
            }}
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
              <SubjectIcon id={subject.id} color={iconColor} size={getIconSizeValue(subject.id)} />
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
    </View>
  );
}
export default function HomeScreen() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [user, setUser] = useState<User | null>(null);
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
        const [nextHomeData, currentUser] = await Promise.all([
          api.home.getHomeData(),
          api.user.getMe(),
        ]);

        if (isMounted) {
          setHomeData(nextHomeData);
          setUser(currentUser);
        }
      } catch (err) {
        console.log('Failed to fetch home dashboard:', err);
        if (isMounted) {
          setError(theme.i18n.t('Could not load your dashboard. Pull to retry.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchHomeDashboard();
    return () => { isMounted = false };
  }, [theme.i18n]);

  const dailyChallenge = homeData?.dailyChallenge ?? null;

  const practiceSubjects = useMemo(() => {
    return (homeData?.subjectGrid ?? []).slice(0, 6).map((item) => {
      const normalized = item.subject.toLowerCase();
      const match = Object.entries(subjectCatalog).find(([, def]) => def.title.toLowerCase() === normalized);
      return match
        ? { id: match[0] as SubjectId, label: item.subject }
        : { id: 'anatomy' as SubjectId, label: item.subject };
    });
  }, [homeData]);

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
  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <HomeHeader
        name={user.displayName}
        streak={user.currentStreak}
        level={user.currentLevel}
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
          currentLevel={user.currentLevel}
          nextLevel={user.currentLevel + 1}
          currentEP={user.epPoints}
          nextLevelEP={user.epPoints + 650}
          remainingEP={Math.max(0, user.epPoints + 650 - user.epPoints)}
        />

        <StatsOverviewCard
          rank={5}
          accuracy={Math.round(
            homeData.subjectGrid.reduce((sum, item) => sum + item.accuracy, 0) / homeData.subjectGrid.length
          )}
          quizzesTaken={homeData.subjectGrid.reduce((sum, item) => sum + item.totalAttempted, 0)}
          earnedPoints={user.epPoints}
        />

        <DailyChallengeCard
          title={dailyChallenge?.subject ?? 'Anatomy Essentials'}
          questions={30}
          duration={45}
          difficulty='medium'
          endsAt={
            dailyChallenge?.expiresAt
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
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
            <TouchableOpacity onPress={() => router.push('/home/practiceBySubject')}>
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

          <PracticeBySubject
            subjects={practiceSubjects}
            onPress={(subjectId) => { console.log('Selected Subject:', subjectId) }}
          />
        </View>
        <PerformanceTrendCard accuracy={performanceTrend} />
      </ScrollView>
    </View>
  );
}