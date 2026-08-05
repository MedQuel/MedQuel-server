import { useEffect, useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { Loading } from '../../components/common/loading';
import { normalizeError } from '../../common/api/api.errors';
import { useBottomBar } from '../../common/context/useBottomBar';
import { QuizResultCard } from '../../components/QuizResultCard';
import { TopicPerfomanceCard } from '../../components/TopicPerfomanceCard';
import { AchievementBadgeCard } from '../../components/AchievementBadgeCard';
import type { QuizResultData, ReviewQuestion } from '../../common/types/contestTypes';
import type { SubmitQuizSessionResult, SelectedOption } from '../../common/types/types';
import { achievementCatalog, type AchievementId } from '../../common/constants/achievements';


type Translate = (key: string, opts?: Record<string, unknown>) => string;

function buildQuizResult(
  submission: SubmitQuizSessionResult,
  reviewQuestions: ReviewQuestion[],
  isPractice: boolean,
  title: string,
  t: Translate
): QuizResultData {
  const total = reviewQuestions.length;
  const scorePercent = Math.round(submission.session.scorePercent);
  const epEarned = isPractice ? 0 : submission.session.epEarned;
  const showBadge = !isPractice && submission.badgesUnlocked.length > 0;

  const badgeId = submission.badgesUnlocked[0] as AchievementId | undefined;
  const badgeDef = badgeId ? achievementCatalog[badgeId] : undefined;

  const reviewItems = reviewQuestions.map((q, idx) => {
    const graded = submission.gradedAnswers.find((g) => g.questionId === q.id);
    const isSkipped = !graded || graded.selected === 'SKIPPED';
    const selectedLabel: SelectedOption | null = isSkipped ? null : graded!.selected;
    const correctLabel: SelectedOption | '' = graded?.correctAnswer ?? '';
    const correctOption = q.options.find((o) => o.label === correctLabel);
    const selectedOption = q.options.find((o) => o.label === selectedLabel);

    return {
      id: q.id,
      index: idx + 1,
      question: q.question,
      isCorrect: graded?.isCorrect ?? false,
      isSkipped,
      selectedLabel,
      selectedText: selectedOption?.text ?? null,
      correctLabel,
      correctText: correctOption?.text ?? '',
      explanation: graded?.explanation ?? '',
    };
  });

  return {
    title,
    totalQuestions: total,
    scorePercent,
    epEarned,
    formattedTime: `${Math.floor(submission.session.timeTaken / 60)}m ${submission.session.timeTaken % 60}s`,
    percentileMessage: scorePercent >= 80
      ? t('contests.postQuizScreen.percentile_high')
      : t('contests.postQuizScreen.percentile_low'),
    showBadge,
    badge: showBadge && badgeDef
      ? { label: t('contests.postQuizScreen.new_badge'), title: badgeDef.title, subtitle: badgeDef.subtitle }
      : null,
    statBoxes: [
      { key: 'correct', icon: 'check', value: String(submission.session.correctCount), labelKey: 'contests.postQuizScreen.correct', colorToken: 'success' },
      { key: 'wrong', icon: 'x', value: String(submission.session.wrongCount), labelKey: 'contests.postQuizScreen.wrong', colorToken: 'error' },
      { key: 'time', icon: 'clock', value: `${Math.floor(submission.session.timeTaken / 60)}m`, labelKey: 'contests.postQuizScreen.time', colorToken: 'textPrimary' },
      { key: 'xp', icon: 'trending-up', value: `+${submission.session.xpEarned}`, labelKey: 'contests.postQuizScreen.xp_earned', colorToken: 'accent' },
    ],
    reviewItems,
    reviewSummary: {
      correct: submission.session.correctCount,
      wrong: submission.session.wrongCount,
      skipped: total - submission.session.correctCount - submission.session.wrongCount,
    },
    isPractice,
  };
}

export default function PostQuizScreen() {
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  useBottomBar(false);
  const router = useRouter();
  const t: Translate = (key, opts) => theme.i18n.t(key, opts);

  const [showReview, setShowReview] = useState(false);
  const [weakTopics, setWeakTopics] = useState<{ name: string; score: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const contestId = params.contestId as string | undefined;
  const isPractice = params.practice === '1';
  const title = (params.title as string) ?? t('contests.postQuizScreen.default_title');

  let submission: SubmitQuizSessionResult | null = null;
  let reviewQuestions: ReviewQuestion[] = [];
  let parseError: string | null = null;
  try {
    submission = params.submission ? JSON.parse(String(params.submission)) : null;
    reviewQuestions = params.questions ? JSON.parse(String(params.questions)) : [];
  } catch {
    parseError = t('contests.postQuizScreen.parse_error');
  }

  useEffect(() => {
    let cancelled = false;
    async function fetchWeakTopics() {
      setLoading(true);
      try {
        const analytics = await api.analytics.getAnalytics();
        if (cancelled) return;
        setWeakTopics(
          analytics.subjectPerformance
            .filter((s) => s.accuracy < 70)
            .map((s) => ({ name: s.subject, score: Math.round(s.accuracy) }))
        );
      } catch (err) {
        if (cancelled) return;
        const apiErr = normalizeError(err);
        console.log('[postQuiz] analytics fetch failed:', apiErr);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchWeakTopics();
    return () => {
      cancelled = true;
    };
  }, []);

  if (parseError || !submission) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.space.sm,
          backgroundColor: theme.color.background,
          padding: theme.space.xl,
        }}
      >
        <Feather name="alert-circle" size={32} color={theme.color.error} />
        <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular, textAlign: 'center' }}>
          {parseError ?? t('contests.postQuizScreen.no_result')}
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/contests')}
          style={{
            paddingVertical: theme.space.sm,
            paddingHorizontal: theme.space.lg,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.accent,
          }}
        >
          <Text style={{ color: theme.color.textInverse, fontWeight: theme.fontWeight.bold as any, fontFamily: theme.fontFamily.regular }}>
            {t('common.back_to_contests')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const result = buildQuizResult(submission, reviewQuestions, isPractice, title, t);

  const cardBg = theme.isDark ? theme.color.card : theme.color.accent;
  const subText = theme.color.textSecondary;
  const epBg = theme.color.warning + '22';
  const epBorder = theme.color.warning;
  const epColor = theme.color.warning;

  const colorFor = (token: string) => {
    if (token === 'success') return theme.color.success;
    if (token === 'error') return theme.color.error;
    if (token === 'accent') return theme.color.accent;
    return theme.color.textPrimary;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <View style={{ flex: 1, opacity: loading ? 0 : 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 145 }} showsVerticalScrollIndicator={false}>
        <View
          style={{
            overflow: 'hidden',
            gap: theme.space.lg,
            alignItems: 'center',
            padding: theme.space.xl,
            backgroundColor: cardBg,
          }}
        >
          <View
            pointerEvents='none'
            style={{
              position: 'absolute', top: -60, right: -60, width: 180, height: 180,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.isDark ? theme.color.accent + '18' : theme.color.surface + '20',
            }}
          />
          <View
            pointerEvents='none'
            style={{
              position: 'absolute', bottom: -40, left: -40, width: 130, height: 130,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.isDark ? theme.color.accent + '10' : theme.color.surface + '10',
            }}
          />

          <View style={{ gap: theme.space.xs, alignItems: 'center' }}>
            <Text
              style={{
                color: theme.color.textInverse,
                fontSize: theme.fontSize.xxl,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {t('contests.postQuizScreen.quiz_completed')}
            </Text>
            <Text style={{ color: subText, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.light }}>
              {`${result.title} · ${result.totalQuestions} ${t('contests.questions')}`}
            </Text>
          </View>

          <QuizResultCard scorePercent={result.scorePercent} />

          <View
            style={{
              flexDirection: 'row', gap: theme.space.sm, alignItems: 'center',
              paddingVertical: theme.space.sm + 2, paddingHorizontal: theme.space.xl,
              borderWidth: 1.5, borderColor: epBorder, borderRadius: theme.borderRadius.full,
              backgroundColor: epBg,
            }}
          >
            <Feather name={result.isPractice ? 'book-open' : 'zap'} size={theme.fontSize.lg} color={epColor} />
            <Text style={{ color: epColor, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.number }}>
              {result.isPractice ? t('contests.postQuizScreen.practice_mode') : `+${result.epEarned} ${t('contests.postQuizScreen.ep_earned')}`}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: theme.space.sm, paddingTop: theme.space.md, paddingHorizontal: theme.space.md }}>
          {result.statBoxes.map((stat) => (
            <View
              key={stat.key}
              style={{
                flex: 1, gap: theme.space.xs, alignItems: 'center', paddingVertical: theme.space.md,
                borderWidth: 1, borderColor: theme.color.border, borderRadius: theme.borderRadius.xl,
                backgroundColor: theme.color.card,
              }}
            >
              <Feather name={stat.icon} size={theme.fontSize.md} color={colorFor(stat.colorToken)} />
              <Text style={{ color: colorFor(stat.colorToken), fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.number }}>
                {stat.value}
              </Text>
              <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.light }}>
                {t(stat.labelKey)}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            flexDirection: 'row', gap: theme.space.sm, alignItems: 'center', padding: theme.space.md,
            marginTop: theme.space.md, marginHorizontal: theme.space.md,
            borderWidth: 1, borderRadius: theme.borderRadius.xl,
            borderColor: theme.color.success + '44', backgroundColor: theme.color.success + '12',
          }}
        >
          <Feather name='trending-up' size={theme.fontSize.md} color={theme.color.success} />
          <Text style={{ color: theme.color.success, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.regular }}>
            {result.percentileMessage}
          </Text>
        </View>

        <View style={{ gap: theme.space.md, paddingTop: theme.space.md, paddingHorizontal: theme.space.md }}>
          {result.showBadge && result.badge && (
            <AchievementBadgeCard label={result.badge.label} title={result.badge.title} subtitle={result.badge.subtitle} />
          )}

          {weakTopics.length > 0 && (
            <TopicPerfomanceCard title={t('contests.postQuizScreen.needs_improvement')} topics={weakTopics} />
          )}
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: theme.space.md, gap: theme.space.sm,
          borderTopWidth: 1, borderTopColor: theme.color.border,
          backgroundColor: theme.color.background,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowReview(true)}
          style={{
            flexDirection: 'row', gap: theme.space.sm, alignItems: 'center', justifyContent: 'center',
            paddingVertical: theme.space.md, borderRadius: theme.borderRadius.lg, backgroundColor: theme.color.accent,
          }}
        >
          <Feather name='book-open' size={theme.fontSize.lg} color={theme.color.textInverse} />
          <Text style={{ color: theme.color.textInverse, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.regular }}>
            {t('contests.postQuizScreen.review_answers')}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
          <TouchableOpacity
            onPress={() => {
              if (contestId) {
                router.push({ pathname: '/contests/preQuizScreen', params: { contestId } });
              } else {
                router.push('/contests');
              }
            }}
            style={{
              flex: 1, flexDirection: 'row', gap: theme.space.xs, alignItems: 'center', justifyContent: 'center',
              paddingVertical: theme.space.sm * 1.5, borderWidth: 1, borderColor: theme.color.border,
              borderRadius: theme.borderRadius.lg, backgroundColor: theme.color.card,
            }}
          >
            <Feather name='rotate-ccw' size={theme.fontSize.sm} color={theme.color.textSecondary} />
            <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
              {t('common.retry')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {}}
            style={{
              flex: 1, flexDirection: 'row', gap: theme.space.xs, alignItems: 'center', justifyContent: 'center',
              paddingVertical: theme.space.sm * 1.5, borderWidth: 1, borderColor: theme.color.border,
              borderRadius: theme.borderRadius.lg, backgroundColor: theme.color.card,
            }}
          >
            <Feather name='share-2' size={theme.fontSize.sm} color={theme.color.textSecondary} />
            <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
              {t('common.share')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/contests')}
            style={{
              flex: 1, flexDirection: 'row', gap: theme.space.xs, alignItems: 'center', justifyContent: 'center',
              paddingVertical: theme.space.sm * 1.5, borderWidth: 1, borderColor: theme.color.border,
              borderRadius: theme.borderRadius.lg, backgroundColor: theme.color.card,
            }}
          >
            <Feather name='chevron-left' size={theme.fontSize.sm} color={theme.color.textSecondary} />
            <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
              {t('common.back')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showReview} transparent animationType='slide'>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowReview(false)}
          style={{ flex: 1, backgroundColor: theme.color.textPrimary + '80' }}
        />
        <View
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '80%',
            gap: theme.space.md, padding: theme.space.lg,
            borderTopLeftRadius: theme.borderRadius.xl + 4, borderTopRightRadius: theme.borderRadius.xl + 4,
            backgroundColor: theme.color.card,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.regular }}>
              {t('contests.postQuizScreen.review_answers')}
            </Text>
            <TouchableOpacity onPress={() => setShowReview(false)}>
              <Feather name='x' size={theme.fontSize.xl} color={theme.color.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
            {[
              { label: `${result.reviewSummary.correct} ${t('contests.postQuizScreen.correct')}`, color: theme.color.success, bg: theme.color.success + '18' },
              { label: `${result.reviewSummary.wrong} ${t('contests.postQuizScreen.wrong')}`, color: theme.color.error, bg: theme.color.error + '18' },
              { label: `${result.reviewSummary.skipped} ${t('contests.postQuizScreen.skipped')}`, color: theme.color.textMuted, bg: theme.color.surface },
            ].map((p) => (
              <View key={p.label} style={{ paddingHorizontal: theme.space.md, paddingVertical: theme.space.xs, borderRadius: theme.borderRadius.full, backgroundColor: p.bg }}>
                <Text style={{ color: p.color, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold as any, fontFamily: theme.fontFamily.regular }}>{p.label}</Text>
              </View>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ gap: theme.space.sm }}>
              {result.reviewItems.map((item) => {
                const statusColor = item.isSkipped ? theme.color.textMuted : item.isCorrect ? theme.color.success : theme.color.error;
                const statusIcon = item.isSkipped ? 'minus-circle' : item.isCorrect ? 'check-circle' : 'x-circle';

                return (
                  <View
                    key={item.id}
                    style={{
                      gap: theme.space.sm, padding: theme.space.md, borderWidth: 1,
                      borderColor: statusColor + '44', borderRadius: theme.borderRadius.xl,
                      backgroundColor: statusColor + '0C',
                    }}
                  >
                    <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'flex-start' }}>
                      <Feather name={statusIcon} size={theme.fontSize.md} color={statusColor} style={{ marginTop: theme.space.xs / 2 }} />
                      <Text style={{ flex: 1, color: theme.color.textPrimary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
                        {`Q${item.index}. ${item.question}`}
                      </Text>
                    </View>

                    {item.selectedText && !item.isCorrect && (
                      <View
                        style={{
                          alignSelf: 'flex-start', paddingVertical: theme.space.xs, paddingHorizontal: theme.space.sm,
                          borderRadius: theme.borderRadius.md, backgroundColor: theme.color.error + '18',
                        }}
                      >
                        <Text style={{ color: theme.color.error, fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.regular }}>
                          ✗ {t('contests.postQuizScreen.your_answer')} : {item.selectedLabel}. {item.selectedText}
                        </Text>
                      </View>
                    )}

                    <View
                      style={{
                        alignSelf: 'flex-start', paddingVertical: theme.space.xs, paddingHorizontal: theme.space.sm,
                        borderRadius: theme.borderRadius.md, backgroundColor: theme.color.success + '18',
                      }}
                    >
                      <Text style={{ color: theme.color.success, fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.regular }}>
                        ✓ {item.correctLabel}. {item.correctText}
                      </Text>
                    </View>

                    <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.light, lineHeight: theme.fontSize.xs * 1.6 }}>
                      {item.explanation}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </Modal>
      </View>
      {loading && (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 999, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.color.background }}>
          <Loading message={t('contests.postQuizScreen.loading')} />
        </View>
      )}
    </View>
  );
}