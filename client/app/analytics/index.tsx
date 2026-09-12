import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { withAlpha } from '../../common/utils/withAlpha';
import { useBottomBar } from '../../common/context/useBottomBar';
import type { AnalyticsData, User } from '../../common/types/types';

import { Loading } from '../../components/common/loading';
import { AnalyticsStatsCard } from '../../components/AnalyticsStatsCard';
import { AttemptHistoryCard } from '../../components/AttemptHistoryCard';
import { ActivityHeatmapCard, type HeatmapDayItem } from '../../components/ActivityHeatmapCard';
import { AnalyticsKeyStatItems } from '../../components/AnalyticsKeyStatItems';
import { SubjectPerformanceCard } from '../../components/SubjectPerformanceCard';


type SubjectPerformanceItem = {
  id: string;
  subject: string;
  correct: number;
  percentage: number;
  colorKey: 'accent' | 'success' | 'premium' | 'warning' | 'error' | 'info';
};
type AttemptItem = {
  id: string;
  title: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: string;
};

const colorKeys = ['success', 'accent', 'premium', 'warning', 'error', 'info'] as const;

type AnalyticsSnapshot = {
  stats: {
    accuracy: number;
    streak: number;
    questions: number;
    totalCorrect: number;
  };
  keyStats: {
    totalCorrect: number;
    avgScore: number;
    bestSubject: string;
    studyHours: number;
    longestStreak: number;
    weakSubject: string;
  };
  subjectPerformance: SubjectPerformanceItem[];
  attempts: AttemptItem[];
  activityHeatmap: {
    activity: number[];
    days: HeatmapDayItem[];
    label: string;
  };
};

const buildAnalyticsSnapshot = (user: User, analytics: AnalyticsData): AnalyticsSnapshot => {
  // 35 continuous days (5 full weeks: Mon -> Sun) ending on current week's Sunday
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const daysUntilSunday = (7 - (currentDayOfWeek === 0 ? 7 : currentDayOfWeek)) % 7;
  const endOfWeek = new Date(now.getTime() + daysUntilSunday * 86400000);

  const heatmapMap = new Map<string, { questions: number; minutes: number }>();
  if (Array.isArray(analytics?.heatmap)) {
    analytics.heatmap.forEach((entry) => {
      const key = entry.date ? entry.date.split('T')[0] : '';
      if (key) {
        heatmapMap.set(key, {
          questions: entry.questionsAttempted || 0,
          minutes: entry.minutesStudied || 0,
        });
      }
    });
  }

  const heatmapDays: HeatmapDayItem[] = [];
  const activityLevels: number[] = [];

  for (let i = 34; i >= 0; i--) {
    const dayDate = new Date(endOfWeek.getTime() - i * 86400000);
    const dayKey = dayDate.toISOString().split('T')[0] ?? '';
    const info = heatmapMap.get(dayKey);
    const qCount = info?.questions ?? 0;
    const minutes = info?.minutes ?? 0;

    let level = 0;
    if (qCount > 20) level = 4;
    else if (qCount > 10) level = 3;
    else if (qCount > 5) level = 2;
    else if (qCount > 0) level = 1;

    activityLevels.push(level);
    heatmapDays.push({
      date: dayKey,
      dayNumber: dayDate.getDate(),
      dayOfWeek: dayDate.getDay(),
      dayName: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
      formattedDate: dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      questionsAttempted: qCount,
      minutesStudied: minutes,
      level,
    });
  }

  const sortedByAccuracy = Array.isArray(analytics?.subjectPerformance)
    ? [...analytics.subjectPerformance].sort((a, b) => b.accuracy - a.accuracy)
    : [];

  const bestSubject = analytics?.bestSubject || sortedByAccuracy[0]?.subject || '';
  let weakSubject = analytics?.weakSubject || sortedByAccuracy[sortedByAccuracy.length - 1]?.subject || '';

  // Requirement: If best and weak subject are the same, don't show weak subject, just show a hyphen (-)
  if (bestSubject && weakSubject && bestSubject.trim().toLowerCase() === weakSubject.trim().toLowerCase()) {
    weakSubject = '-';
  }

  const totalCorrectVal = user.totalCorrect || 0;

  return {
    stats: {
      accuracy: user.totalQuestions > 0
        ? Math.round((totalCorrectVal / user.totalQuestions) * 100)
        : Math.round(analytics?.overallAccuracy || 0),
      streak: user.currentStreak || 0,
      questions: user.totalQuestions || 0,
      totalCorrect: totalCorrectVal,
    },
    keyStats: {
      totalCorrect: totalCorrectVal,
      avgScore: Math.round(analytics?.avgScore || analytics?.overallAccuracy || 0),
      bestSubject,
      studyHours: user.studyHours || 0,
      longestStreak: user.longestStreak || 0,
      weakSubject,
    },
    subjectPerformance: (analytics?.subjectPerformance || []).map((item, index) => ({
      id: `subj-${index}`,
      subject: item.subject,
      correct: item.totalCorrect,
      percentage: item.accuracy,
      colorKey: colorKeys[index % colorKeys.length] ?? 'accent',
    })),
    attempts: (analytics?.recentAttempts || []).map((item) => ({
      id: item.sessionId,
      title: `Quiz on ${item.subject}`,
      date: new Date(item.completedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      totalQuestions: item.totalQuestions || 10,
      correctAnswers: item.correctCount || Math.round(((item.scorePercent || 0) / 100) * (item.totalQuestions || 10)),
      timeTaken: `${Math.max(1, Math.round((item.timeTaken || 0) / 60))}m`,
    })),
    activityHeatmap: {
      activity: activityLevels,
      days: heatmapDays,
      label: 'Last 35 Days',
    },
  };
};

const emptyAnalyticsSnapshot: AnalyticsSnapshot = {
  stats: {
    accuracy: 0,
    streak: 0,
    questions: 0,
    totalCorrect: 0,
  },
  keyStats: {
    totalCorrect: 0,
    avgScore: 0,
    bestSubject: '',
    studyHours: 0,
    longestStreak: 0,
    weakSubject: '',
  },
  subjectPerformance: [],
  attempts: [],
  activityHeatmap: {
    activity: Array.from({ length: 35 }, () => 0),
    days: [],
    label: 'Last 35 Days',
  },
};

export default function AnalyticsScreen() {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const router = useRouter();
  const { theme } = useTheme();
  useBottomBar(true, 'analytics');

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const [user, analytics] = await Promise.all([
        api.user.getMe().catch(() => null),
        api.analytics.getAnalytics().catch((err) => {
          if (err?.name !== 'AuthenticationError' && err?.code !== 'UNAUTHENTICATED') {
            console.warn('Could not fetch analytics:', err?.message || err);
          }
          return null;
        }),
      ]);

      if (user) setUserData(user);
      if (analytics) setAnalyticsData(analytics);
    } catch (error: any) {
      if (error?.name !== 'AuthenticationError' && error?.code !== 'UNAUTHENTICATED') {
        console.warn('Error fetching analytics data:', error?.message || error);
      }
    } finally {
      if (showLoader) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData(false);
    }, [fetchData])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  const data = useMemo(() => {
    if (!userData || !analyticsData) return emptyAnalyticsSnapshot;
    return buildAnalyticsSnapshot(userData, analyticsData);
  }, [userData, analyticsData]);

  const hasCompletedContest =
    (userData?.totalQuestions || 0) > 0 ||
    data.attempts.length > 0 ||
    (analyticsData?.recentAttempts && analyticsData.recentAttempts.length > 0) ||
    (analyticsData?.heatmap && analyticsData.heatmap.some((h) => (h.questionsAttempted || 0) > 0));

  const hasSubjects = data.subjectPerformance.length > 0;
  const hasAttempts = data.attempts.length > 0;

  const subjectPerformanceItems = data.subjectPerformance.map((item: SubjectPerformanceItem) => ({ name: item.subject, score: item.percentage }));

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <View
        style={{
          gap: theme.space.sm,
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: theme.space.lg,
          paddingBottom: theme.space.sm,
          paddingHorizontal: theme.space.md,
          backgroundColor: theme.color.background,
        }}
      >
        <View style={{ flexDirection: 'column', gap: theme.space.xs * 0.5 }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg * 1.1,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('analytics.title')}
          </Text>
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm * 1.05,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {theme.i18n.t('analytics.subtitle')}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: theme.space.xl }}>
            <Loading message={theme.i18n.t('analytics.loading')} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme.color.accent}
                colors={[theme.color.accent]}
              />
            }
            contentContainerStyle={{
              paddingTop: theme.space.sm,
              paddingBottom: theme.space.xxl * 1.75,
              paddingHorizontal: theme.space.md,
            }}
          >
            {!hasCompletedContest ? (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: theme.space.lg,
                  paddingHorizontal: theme.space.xl,
                  paddingVertical: theme.space.xxl,
                  borderWidth: 1,
                  borderColor: theme.color.border,
                  borderRadius: theme.borderRadius.xl,
                  backgroundColor: theme.color.card,
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: theme.space.md,
                    borderRadius: theme.borderRadius.full,
                    backgroundColor: withAlpha(theme.color.accent, 0.12),
                    borderWidth: 1,
                    borderColor: withAlpha(theme.color.accent, 0.25),
                  }}
                >
                  <Feather name="bar-chart-2" size={28} color={theme.color.accent} />
                </View>

                <Text
                  style={{
                    textAlign: 'center',
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.lg,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.bold,
                    marginBottom: theme.space.xs,
                  }}
                >
                  No attempts yet
                </Text>

                <Text
                  style={{
                    textAlign: 'center',
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.regular,
                    lineHeight: theme.fontSize.sm * 1.5,
                    marginBottom: theme.space.lg,
                    paddingHorizontal: theme.space.sm,
                  }}
                >
                  Once you start taking quizzes and contests, your complete performance overview, accuracy trends, and activity calendar will appear here.
                </Text>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push('/contests')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.space.xs,
                    paddingVertical: theme.space.sm,
                    paddingHorizontal: theme.space.lg,
                    borderRadius: theme.borderRadius.full,
                    backgroundColor: theme.color.accent,
                  }}
                >
                  <Text
                    style={{
                      color: theme.color.textInverse,
                      fontSize: theme.fontSize.sm,
                      fontWeight: theme.fontWeight.bold,
                      fontFamily: theme.fontFamily.bold,
                    }}
                  >
                    Explore Contests
                  </Text>
                  <Feather name="arrow-right" size={14} color={theme.color.textInverse} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: theme.space.md }}>
                <AnalyticsStatsCard
                  accuracy={data.stats.accuracy}
                  streak={data.stats.streak}
                  questions={data.stats.questions}
                  totalQuestions={data.stats.questions}
                  totalCorrect={data.stats.totalCorrect}
                />

                <AnalyticsKeyStatItems
                  totalCorrect={data.keyStats.totalCorrect}
                  avgScore={data.keyStats.avgScore}
                  bestSubject={data.keyStats.bestSubject}
                  studyHours={data.keyStats.studyHours}
                  longestStreak={data.keyStats.longestStreak}
                  weakSubject={data.keyStats.weakSubject}
                />

                <ActivityHeatmapCard
                  heatmap={analyticsData?.heatmap}
                  days={data.activityHeatmap.days}
                />

                {hasSubjects && (
                  <SubjectPerformanceCard subjects={subjectPerformanceItems} />
                )}

                {hasAttempts && (
                  <AttemptHistoryCard attempts={data.attempts} />
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
