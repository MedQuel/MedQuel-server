import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import type { AnalyticsData, User } from '../../common/types/types';

import { Loading } from '../../components/common/loading';
import { EmptyStateCard } from '../../components/EmptyStateCard';
import { AnalyticsStatsCard } from '../../components/AnalyticsStatsCard';
import { AttemptHistoryCard } from '../../components/AttemptHistoryCard';
import { ActivityHeatmapCard } from '../../components/ActivityHeatmapCard';
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
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const formatMonthLabel = (month: number, year: number) => {
  const index = Math.max(0, Math.min(11, month - 1));
  return `${monthNames[index]} ${year}`;
};

const colorKeys = ['success', 'accent', 'premium', 'warning', 'error', 'info'] as const;
type AnalyticsSnapshot = {
  stats: {
    accuracy: number;
    streak: number;
    questions: number;
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
    month: number;
    year: number;
    grid: number[][];
  };
};

const buildAnalyticsSnapshot = (user: User, analytics: AnalyticsData): AnalyticsSnapshot => {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const daysInMonth = new Date(year, month, 0).getDate();
  const activityArray = Array.from({ length: daysInMonth }, () => 0);

  analytics.heatmap.forEach((entry) => {
    const date = new Date(entry.date);
    if (date.getMonth() + 1 === month && date.getFullYear() === year) {
      const day = date.getDate();
      let level = 0;

      if (entry.questionsAttempted > 20) level = 4;
      else if (entry.questionsAttempted > 10) level = 3;
      else if (entry.questionsAttempted > 5) level = 2;
      else if (entry.questionsAttempted > 0) level = 1;
      activityArray[day - 1] = level;
    }
  });

  const sortedByAccuracy = [...analytics.subjectPerformance].sort((a, b) => b.accuracy - a.accuracy);
  const bestSubject = sortedByAccuracy[0]?.subject ?? '';
  const weakSubject = sortedByAccuracy[sortedByAccuracy.length - 1]?.subject ?? '';

  return {
    stats: {
      accuracy: user.totalQuestions > 0
        ? Math.round((user.totalCorrect / user.totalQuestions) * 100)
        : Math.round(analytics.overallAccuracy || 0),
      streak: user.currentStreak || 0,
      questions: user.totalQuestions || 0,
    },
    keyStats: {
      totalCorrect: user.totalCorrect || 0,
      avgScore: Math.round(analytics.overallAccuracy) || 0,
      bestSubject,
      studyHours: user.studyHours || 0,
      longestStreak: user.longestStreak || 0,
      weakSubject,
    },
    subjectPerformance: analytics.subjectPerformance.map((item, index) => ({
      id: `subj-${index}`,
      subject: item.subject,
      correct: item.totalCorrect,
      percentage: item.accuracy,
      colorKey: colorKeys[index % colorKeys.length] ?? 'accent',
    })),
    attempts: analytics.recentAttempts.map((item) => ({
      id: item.sessionId,
      title: `Quiz on ${item.subject}`,
      date: new Date(item.completedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      totalQuestions: 10,
      correctAnswers: Math.round((item.scorePercent / 100) * 10),
      timeTaken: '15m',
    })),
    activityHeatmap: {
      month,
      year,
      grid: [activityArray],
    },
  };
};

const emptyAnalyticsSnapshot: AnalyticsSnapshot = {
  stats: {
    accuracy: 0,
    streak: 0,
    questions: 0,
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
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    grid: [[] as number[]],
  },
};


export default function AnalyticsScreen() {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const { theme } = useTheme();
  useBottomBar(true, 'analytics');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [user, analytics] = await Promise.all([
          api.user.getMe(),
          api.analytics.getAnalytics(),
        ]);
        if (isMounted) {
          setUserData(user);
          setAnalyticsData(analytics);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const data = useMemo(() => {
    if (!userData || !analyticsData) return emptyAnalyticsSnapshot;
    return buildAnalyticsSnapshot(userData, analyticsData);
  }, [userData, analyticsData]);

  const hasStats = data.stats.accuracy > 0 || data.stats.streak > 0 || data.stats.questions > 0;
  const hasKeyStats =
    data.keyStats.totalCorrect > 0 ||
    data.keyStats.avgScore > 0 ||
    data.keyStats.bestSubject.trim().length > 0 ||
    data.keyStats.studyHours > 0 ||
    data.keyStats.longestStreak > 0 ||
    data.keyStats.weakSubject.trim().length > 0;

  const hasAttempts = data.attempts.length > 0;
  const hasSubjects = data.subjectPerformance.length > 0;
  const hasHeatmap = data.activityHeatmap.grid.some((row: number[]) => row.some((level: number) => level > 0));

  const subjectPerformanceItems = data.subjectPerformance.map((item: SubjectPerformanceItem) => ({ name: item.subject, score: item.percentage }));

  const activity = data.activityHeatmap.grid.flat();
  const currentMonthLabel = formatMonthLabel(data.activityHeatmap.month, data.activityHeatmap.year);

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
            contentContainerStyle={{
              paddingTop: theme.space.sm,
              paddingBottom: theme.space.xxl * 1.75,
              paddingHorizontal: theme.space.md,
            }}
          >
            <View style={{ gap: theme.space.md }}>
              {hasStats ? (
                <AnalyticsStatsCard
                  accuracy={data.stats.accuracy}
                  streak={data.stats.streak}
                  questions={data.stats.questions}
                />
              ) : (
                <EmptyStateCard
                  title={theme.i18n.t('analytics.empty_states.overview.title')}
                  description={theme.i18n.t('analytics.empty_states.overview.description')}
                  icon='bar-chart-2'
                />
              )}

              {hasKeyStats ? (
                <AnalyticsKeyStatItems
                  totalCorrect={data.keyStats.totalCorrect}
                  avgScore={data.keyStats.avgScore}
                  bestSubject={data.keyStats.bestSubject}
                  studyHours={data.keyStats.studyHours}
                  longestStreak={data.keyStats.longestStreak}
                  weakSubject={data.keyStats.weakSubject}
                />
              ) : (
                <EmptyStateCard
                  icon='grid'
                  title={theme.i18n.t('analytics.empty_states.key_stats.title')}
                  description={theme.i18n.t('analytics.empty_states.key_stats.description')}
                />
              )}

              {hasSubjects ? (
                <SubjectPerformanceCard subjects={subjectPerformanceItems} />
              ) : (
                <EmptyStateCard
                  icon='book-open'
                  title={theme.i18n.t('analytics.empty_states.subject.title')}
                  description={theme.i18n.t('analytics.empty_states.subject.description')}
                />
              )}

              {hasHeatmap ? (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: theme.space.xs }}>
                    <Text
                      style={{
                        color: theme.color.textMuted,
                        fontSize: theme.fontSize.xs,
                        fontFamily: theme.fontFamily.regular,
                      }}
                    >
                      {currentMonthLabel}
                    </Text>
                  </View>

                  <ActivityHeatmapCard
                    month={data.activityHeatmap.month}
                    year={data.activityHeatmap.year}
                    activity={activity}
                  />
                </View>
              ) : (
                <EmptyStateCard
                  icon='calendar'
                  title={theme.i18n.t('analytics.empty_states.activity.title')}
                  description={theme.i18n.t('analytics.empty_states.activity.description')}
                />
              )}

              {hasAttempts ? (
                <AttemptHistoryCard attempts={data.attempts} />
              ) : (
                <EmptyStateCard
                  title={theme.i18n.t('analytics.empty_states.attempts.title')}
                  description={theme.i18n.t('analytics.empty_states.attempts.description')}
                  icon='file-text'
                />
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
