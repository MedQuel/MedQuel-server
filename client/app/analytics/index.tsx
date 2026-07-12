import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { EmptyStateCard } from '../../components/EmptyStateCard';
import { AnalyticsStatsCard } from '../../components/AnalyticsStatsCard';
import { AttemptHistoryCard } from '../../components/AttemptHistoryCard';
import { ActivityHeatmapCard } from '../../components/ActivityHeatmapCard';
import { AnalyticsKeyStatItems } from '../../components/AnalyticsKeyStatItems';
import { SubjectPerformanceCard } from '../../components/SubjectPerformanceCard';


type TabKey = 'overview' | 'performance' | 'subjects' | 'attempts';
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
type AnalyticsMock = {
  header: { title: string, subtitle: string };
  tabs: { key: TabKey, label: string }[];
  stats: { accuracy: number, streak: number, questions: number };
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

const analyticsMock: AnalyticsMock = {
  header: { title: 'Analytics', subtitle: 'Track your learning progress' },

  tabs: [
    { key: 'overview', label: 'Overview' },
    { key: 'performance', label: 'Performance' },
    { key: 'subjects', label: 'Subjects' },
    { key: 'attempts', label: 'Attempts' },
  ],

  stats: { accuracy: 64, streak: 8, questions: 719 },

  keyStats: {
    totalCorrect: 517,
    avgScore: 68,
    bestSubject: 'Anatomy',
    studyHours: 172,
    longestStreak: 16,
    weakSubject: 'Forensic',
  },

  subjectPerformance: [
    { id: '1', subject: 'Anatomy', correct: 127, percentage: 92, colorKey: 'success' },
    { id: '2', subject: 'Pharmacology', correct: 117, percentage: 81, colorKey: 'accent' },
    { id: '3', subject: 'Microbiology', correct: 127, percentage: 81, colorKey: 'premium' },
    { id: '4', subject: 'Community Medicine', correct: 101, percentage: 80, colorKey: 'warning' },
    { id: '5', subject: 'Forensic Medicine', correct: 78, percentage: 62, colorKey: 'error' },
  ],

  activityHeatmap: {
    month: 6,
    year: 2026,
    grid: [
      [0, 1, 2, 0, 1, 3, 2, 1, 0, 0, 2, 3, 1, 2, 0, 1, 2, 3],
      [0, 1, 0, 2, 1, 0, 3, 2, 1, 0, 2, 1, 3, 0, 1, 2, 0, 1],
      [1, 0, 2, 1, 3, 0, 1, 2, 2, 1, 0, 1, 3, 2, 1, 0, 2, 1],
    ],
  },

  attempts: [
    { id: '1', title: 'Quiz on Biochemistry', date: 'Jan 14, 2026', totalQuestions: 30, correctAnswers: 25, timeTaken: '33m' },
    { id: '2', title: 'Quiz on Physiology', date: 'Jan 12, 2026', totalQuestions: 17, correctAnswers: 15, timeTaken: '21m' },
    { id: '3', title: 'Quiz on Pathology', date: 'Jan 8, 2026', totalQuestions: 39, correctAnswers: 34, timeTaken: '40m' },
  ],
};

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const formatMonthLabel = (month: number, year: number) => {
  const index = Math.max(0, Math.min(11, month - 1));
  return `${monthNames[index]} ${year}`;
};

const tText = (value: string, fallback: string, key: string) => {
  const text = String(value ?? '').trim();
  const placeholderTexts = new Set([
    'title',
    'subtitle',
    'overview',
    'performance',
    'subjects',
    'attempts',
  ]);

  return !text || text === key || placeholderTexts.has(text.toLowerCase()) ? fallback : text;
};

function SubjectEmptyState() {
  useTheme();

  return (
    <EmptyStateCard
      title='No subject performance yet'
      description='Add subject-wise results to see the chart here.'
      icon='book-open'
    />
  );
}

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  useBottomBar(true, 'profile');

  const headerTitle = tText(
    theme.i18n.t('screens.Analytics.title'),
    analyticsMock.header.title,
    'screens.Analytics.title'
  );
  const headerSubtitle = tText(
    theme.i18n.t('screens.Analytics.subtitle'),
    analyticsMock.header.subtitle,
    'screens.Analytics.subtitle'
  );

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

  const hasSubjects = analyticsMock.subjectPerformance.length > 0;
  const hasHeatmap = analyticsMock.activityHeatmap.grid.some((row) =>
    row.some((level) => level > 0)
  );
  const hasAttempts = analyticsMock.attempts.length > 0;

  const subjectPerformanceItems = analyticsMock.subjectPerformance.map(
    (item) => ({
      name: item.subject,
      score: item.percentage,
    })
  );

  const activity = analyticsMock.activityHeatmap.grid.flat();

  const currentMonthLabel = formatMonthLabel(
    analyticsMock.activityHeatmap.month,
    analyticsMock.activityHeatmap.year
  );


  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <View
        style={{
          paddingTop: theme.space.md,
          paddingBottom: theme.space.sm,
          paddingHorizontal: theme.space.md,
          backgroundColor: theme.color.background,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View
            style={{
              flex: 1,
              gap: theme.space.sm,
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}
          >
            <Pressable
              onPress={() => {}}
              style={{
                width: theme.space.xl,
                height: theme.space.xl,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: theme.space.xs * 0.5,
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.lg,
                backgroundColor: theme.color.card,
              }}
            >
              <Feather
                name='chevron-left'
                size={18}
                color={theme.color.textSecondary}
              />
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
                {headerTitle}
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
          paddingTop: theme.space.sm,
          paddingBottom: theme.space.xxl * 2.5,
          paddingHorizontal: theme.space.md,
        }}
      >
        <View style={{ gap: theme.space.md }}>
          {hasStats ? (
            <AnalyticsStatsCard
              accuracy={analyticsMock.stats.accuracy}
              streak={analyticsMock.stats.streak}
              questions={analyticsMock.stats.questions}
            />
          ) : (
            <EmptyStateCard
              title='No analytics data yet'
              description='Start completing quizzes to see your overview here.'
              icon='bar-chart-2'
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
              title='No key statistics yet'
              description='Your performance summary will appear after a few attempts.'
              icon='grid'
            />
          )}

          {hasSubjects ? (
            <SubjectPerformanceCard
              title={tText(
                theme.i18n.t('components.SubjectPerformanceCard.title'),
                'Subject Performance',
                'components.SubjectPerformanceCard.title'
              )}
              subjects={subjectPerformanceItems}
            />
          ) : (
            <SubjectEmptyState />
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
                month={analyticsMock.activityHeatmap.month}
                year={analyticsMock.activityHeatmap.year}
                activity={activity}
              />
            </View>
          ) : (
            <EmptyStateCard
              title='No activity yet'
              description='Your learning activity heatmap will show up here.'
              icon='calendar'
            />
          )}

          {hasAttempts ? (
            <AttemptHistoryCard attempts={analyticsMock.attempts} />
          ) : (
            <EmptyStateCard
              title='No attempts yet'
              description='Once you start taking quizzes, your history will appear here.'
              icon='file-text'
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
