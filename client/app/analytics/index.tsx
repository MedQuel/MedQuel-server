/* eslint-disable no-bitwise */
import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useBottomBar } from '../../common/context/useBottomBar';
import { useTheme } from '../../theme/ThemeContext';

import { AnalyticsKeyStatItems } from '../../components/AnalyticsKeyStatItems';
import { AnalyticsStatsCard } from '../../components/AnalyticsStatsCard';
import { ActivityHeatmapCard } from '../../components/ActivityHeatmapCard';
import { AttemptHistoryCard } from '../../components/AttemptHistoryCard';
import { SubjectPerformanceCard } from '../../components/SubjectPerformanceCard';

type TabKey = 'overview' | 'performance' | 'subjects' | 'attempts';

type SubjectItem = {
  name: string;
  score: number;
};

type AttemptItem = {
  id: string;
  title: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: string;
};

type AnalyticsMock = {
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
  subjects: SubjectItem[];
  heatmap: {
    month: number;
    year: number;
    activity: number[];
  };
  attempts: AttemptItem[];
};

const analyticsMock: AnalyticsMock = {
  stats: {
    accuracy: 64,
    streak: 8,
    questions: 719,
  },
  keyStats: {
    totalCorrect: 517,
    avgScore: 68,
    bestSubject: 'Anatomy',
    studyHours: 172,
    longestStreak: 16,
    weakSubject: 'Forensic',
  },
  subjects: [
    { name: 'Anatomy', score: 92 },
    { name: 'Pharmacology', score: 81 },
    { name: 'Microbiology', score: 81 },
    { name: 'Community Medicine', score: 80 },
    { name: 'Forensic Medicine', score: 62 },
  ],
  heatmap: {
    month: 6,
    year: 2026,
    activity: [
      0, 1, 2, 0, 1, 3, 2, 1, 0, 0,
      2, 3, 1, 2, 0, 1, 2, 3, 0, 1,
      0, 2, 1, 3, 0, 1, 2, 2, 1, 0,
    ],
  },
  attempts: [
    {
      id: '1',
      title: 'Quiz on Biochemistry',
      date: 'Jan 14, 2026',
      totalQuestions: 30,
      correctAnswers: 25,
      timeTaken: '33m',
    },
    {
      id: '2',
      title: 'Quiz on Physiology',
      date: 'Jan 12, 2026',
      totalQuestions: 17,
      correctAnswers: 15,
      timeTaken: '21m',
    },
    {
      id: '3',
      title: 'Quiz on Pathology',
      date: 'Jan 8, 2026',
      totalQuestions: 39,
      correctAnswers: 34,
      timeTaken: '40m',
    },
  ],
};

const tabs: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'performance', label: 'Performance' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'attempts', label: 'Attempts' },
];

const withAlpha = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean.split('').map(ch => ch + ch).join('')
      : clean.slice(0, 6);

  const int = Number.parseInt(full, 16);

  return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`;
};

function EmptyStateCard({
  title,
  description,
  icon = 'info',
}: {
  title: string;
  description: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
}) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        padding: theme.space.md,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.color.border,
        backgroundColor: theme.color.card,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: theme.borderRadius.lg,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: withAlpha(theme.color.accent, theme.isDark ? 0.10 : 0.06),
            borderWidth: 1,
            borderColor: withAlpha(theme.color.accent, theme.isDark ? 0.20 : 0.14),
          }}
        >
          <Feather name={icon} size={18} color={theme.color.accent} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.md,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              marginTop: 2,
              color: theme.color.textMuted,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  useBottomBar(true, 'analytics');

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const hasStats =
    analyticsMock.stats.accuracy > 0 ||
    analyticsMock.stats.streak > 0 ||
    analyticsMock.stats.questions > 0;

  const hasKeyStats =
    analyticsMock.keyStats.totalCorrect > 0 ||
    analyticsMock.keyStats.avgScore > 0 ||
    analyticsMock.keyStats.bestSubject.trim().length > 0 ||
    analyticsMock.keyStats.studyHours > 0 ||
    analyticsMock.keyStats.longestStreak > 0 ||
    analyticsMock.keyStats.weakSubject.trim().length > 0;

  const hasSubjects = analyticsMock.subjects.length > 0;
  const hasHeatmap = analyticsMock.heatmap.activity.some(value => value > 0);
  const hasAttempts = analyticsMock.attempts.length > 0;

  const headerSubtitle = 'Track your learning progress';

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <View
        style={{
          paddingHorizontal: theme.space.md,
          paddingTop: theme.space.md,
          paddingBottom: theme.space.sm,
          backgroundColor: theme.color.background,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: theme.space.sm }}>
            <Pressable
              onPress={() => {}}
              style={{
                width: 36,
                height: 36,
                borderRadius: theme.borderRadius.lg,
                borderWidth: 1,
                borderColor: theme.color.border,
                backgroundColor: theme.color.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="chevron-left" size={18} color={theme.color.textSecondary} />
            </Pressable>

            <View style={{ flex: 1, paddingRight: theme.space.sm }}>
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
                Analytics
              </Text>

              <Text
                style={{
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {headerSubtitle}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.space.md,
          paddingTop: theme.space.sm,
          paddingBottom: theme.space.xxl * 2.5,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: theme.space.xs,
            marginBottom: theme.space.md,
          }}
        >
          {tabs.map(tab => {
            const active = activeTab === tab.key;

            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 999,
                  borderWidth: active ? 0 : 1,
                  borderColor: active ? theme.color.accent : theme.color.border,
                  backgroundColor: active
                    ? theme.color.accent
                    : theme.color.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: theme.space.sm + 2,
                  shadowColor: active ? theme.color.accent : 'transparent',
                  shadowOpacity: active ? (theme.isDark ? 0.18 : 0.08) : 0,
                  shadowRadius: active ? 8 : 0,
                  shadowOffset: active ? { width: 0, height: 2 } : { width: 0, height: 0 },
                  elevation: active ? 2 : 0,
                }}
              >
                <Text
                  style={{
                    color: active ? theme.color.textInverse : theme.color.textSecondary,
                    fontSize: theme.fontSize.sm,
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

        <View style={{ gap: theme.space.md }}>
          {hasStats ? (
            <AnalyticsStatsCard
              accuracy={analyticsMock.stats.accuracy}
              streak={analyticsMock.stats.streak}
              questions={analyticsMock.stats.questions}
            />
          ) : (
            <EmptyStateCard
              title="No analytics data yet"
              description="Start completing quizzes to see your overview here."
              icon="bar-chart-2"
            />
          )}

          {hasKeyStats ? (
            <AnalyticsKeyStatItems
              totalCorrect={analyticsMock.keyStats.totalCorrect}
              avgScore={analyticsMock.keyStats.avgScore}
              bestSubject={analyticsMock.keyStats.bestSubject}
              studyHours={analyticsMock.keyStats.studyHours}
              longestStreak={analyticsMock.keyStats.longestStreak}
              weakSubject={analyticsMock.keyStats.weakSubject}
            />
          ) : (
            <EmptyStateCard
              title="No key statistics yet"
              description="Your performance summary will appear after a few attempts."
              icon="grid"
            />
          )}

          {hasSubjects ? (
            <SubjectPerformanceCard
              title="Subject Performance"
              subjects={analyticsMock.subjects}
            />
          ) : (
            <EmptyStateCard
              title="No subject performance yet"
              description="Add subject-wise results to see the chart here."
              icon="book-open"
            />
          )}

          {hasHeatmap ? (
            <ActivityHeatmapCard
              month={analyticsMock.heatmap.month}
              year={analyticsMock.heatmap.year}
              activity={analyticsMock.heatmap.activity}
            />
          ) : (
            <EmptyStateCard
              title="No activity yet"
              description="Your learning activity heatmap will show up here."
              icon="calendar"
            />
          )}

          {hasAttempts ? (
            <AttemptHistoryCard attempts={analyticsMock.attempts} />
          ) : (
            <EmptyStateCard
              title="No attempts yet"
              description="Once you start taking quizzes, your history will appear here."
              icon="file-text"
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}