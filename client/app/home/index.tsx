
import { useRouter } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { HomeHeader } from './homeHeader';
import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { LevelProgressCard } from '../../components/LevelProgressCard';
import { StatsOverviewCard } from '../../components/StatsOverviewCard';
import { DailyChallengeCard } from '../../components/DailyChallengeCard';
import { ActiveContestsCard } from '../../components/ActiveContestsCard';
import { PerformanceTrendCard } from '../../components/PerformanceTrendCard';
import { Loading } from '../../components/common/loading';
import { subjectCatalog, SubjectIcon, SubjectId } from '../../common/constants/subject';
import { MOCK_HOME_DATA, MOCK_USER } from '../../common/constants/mockData';

type PracticeSubject = { id: SubjectId, label: string };
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
  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(true, 'home');
  const [loading, setLoading] = useState(true);
  const [mockHomeData, setMockHomeData] = useState(MOCK_HOME_DATA);
console.log(mockHomeData);
  useEffect(() => {
    let isMounted = true;
    async function fetchHomeData() {
      try {
        setLoading(true);
        const data = await new Promise<typeof MOCK_HOME_DATA>((resolve) => {
          setTimeout(() => resolve(MOCK_HOME_DATA), 1200);
        });

        if (isMounted) {
          setMockHomeData(data);
        }
      } catch (error) {
        console.log('Failed to fetch home data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const dailyChallenge = mockHomeData.dailyChallenge;

  const practiceSubjects = useMemo(() => {
    return (mockHomeData.subjectGrid ?? []).slice(0, 6).map((item) => {
      const normalized = item.subject.toLowerCase();
      const match = Object.entries(subjectCatalog).find(([, def]) => def.title.toLowerCase() === normalized);
      return match
        ? { id: match[0] as SubjectId, label: item.subject }
        : { id: 'anatomy' as SubjectId, label: item.subject };
    });
  }, [mockHomeData]);

  const performanceTrend = useMemo(() => {
    const weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
    const trend = {} as Record<(typeof weekDays)[number], number>;

    mockHomeData.performanceTrend.slice(-7).forEach((point, index) => {
      const key = weekDays[index];
      if (key) trend[key] = point.accuracy;
    });

    return trend;
  }, [mockHomeData]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <HomeHeader
        name={MOCK_USER.displayName}
        streak={MOCK_USER.currentStreak}
        level={MOCK_USER.currentLevel}
        onNotificationsPress={() => router.push('/notifications')}
      />

      {loading ? (
        <Loading message={theme.i18n.t('Loading your dashboard...')} fullscreen />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            gap: theme.space.md,
            paddingTop: theme.space.md,
            paddingBottom: theme.space.xxl + theme.space.xl,
            paddingHorizontal: theme.space.md,
          }}
        >
          <LevelProgressCard
            currentLevel={MOCK_USER.currentLevel}
            nextLevel={MOCK_USER.currentLevel + 1}
            currentEP={MOCK_USER.epPoints}
            nextLevelEP={MOCK_USER.epPoints + 650}
            remainingEP={Math.max(0, MOCK_USER.epPoints + 650 - MOCK_USER.epPoints)}
          />
          <StatsOverviewCard
            rank={5}
            accuracy={Math.round((mockHomeData.subjectGrid.reduce((sum, item) => sum + item.accuracy, 0) / mockHomeData.subjectGrid.length))}
            quizzesTaken={mockHomeData.subjectGrid.reduce((sum, item) => sum + item.totalAttempted, 0)}
            earnedPoints={MOCK_USER.epPoints}
          />
          <DailyChallengeCard
            title={dailyChallenge?.subject ?? 'Anatomy Essentials'}
            questions={30}
            duration={45}
            difficulty='medium'
            endsAt={dailyChallenge?.expiresAt ? String(Math.max(1, Math.round((new Date(dailyChallenge.expiresAt).getTime() - Date.now()) / 60000))) : '840'}
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
                contests={mockHomeData.activeContests.map((contest) => ({
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
            <PracticeBySubject subjects={practiceSubjects} onPress={(subjectId) => { console.log('Selected Subject:', subjectId) }} />
          </View>
          <PerformanceTrendCard accuracy={performanceTrend} />
        </ScrollView>
      )}
    </View>
  );
}