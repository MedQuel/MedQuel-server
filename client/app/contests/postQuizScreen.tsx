import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { QuizResultCard } from '../../components/QuizResultCard';
import type { QuizResultData, ReviewQuestion } from '../../common/types/contestTypes';
import type { SubmitQuizSessionResult, SelectedOption } from '../../common/types/types';

type Translate = (key: string, opts?: Record<string, unknown>) => string;

const TIER_SIZE = 1000;

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

function buildQuizResult(
  submission: SubmitQuizSessionResult,
  reviewQuestions: ReviewQuestion[],
  isPractice: boolean,
  title: string,
  formattedTime: string,
  t: Translate
): QuizResultData {
  const total = reviewQuestions.length;
  const scorePercent = Math.round(submission.scorePercent ?? 0);
  const epEarned = isPractice ? 0 : (submission.epEarned ?? 0);

  const reviewItems = reviewQuestions.map((q, idx) => {
    const graded = (submission.results ?? []).find((g) => g.questionId === q.id);
    const isSkipped = !graded || graded.selectedOption === null || (graded.selectedOption as string) === 'SKIPPED';
    const selectedLabel: SelectedOption | null = isSkipped ? null : (graded!.selectedOption as SelectedOption);
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

  const correctCount = submission.correctCount ?? 0;
  const wrongCount = submission.wrongCount ?? 0;
  const skippedCount = submission.skippedCount ?? Math.max(0, total - correctCount - wrongCount);

  return {
    title,
    totalQuestions: total,
    scorePercent,
    epEarned,
    formattedTime,
    percentileMessage: scorePercent >= 60
      ? t('contests.postQuizScreen.percentile_high', { defaultValue: 'Great performance! You passed the qualifying cutoff.' })
      : t('contests.postQuizScreen.percentile_low', { defaultValue: 'Keep practicing to hit the qualifying score!' }),
    showBadge: false,
    badge: null,
    statBoxes: [
      { key: 'correct', icon: 'check', value: String(correctCount), labelKey: 'contests.postQuizScreen.correct', colorToken: 'success' },
      { key: 'wrong', icon: 'x', value: String(wrongCount), labelKey: 'contests.postQuizScreen.wrong', colorToken: 'error' }, 
      { key: 'time', icon: 'clock', value: formattedTime, labelKey: 'contests.postQuizScreen.time', colorToken: 'textPrimary' },
      { key: 'xp', icon: 'trending-up', value: `+${submission.xpEarned ?? 0}`, labelKey: 'contests.postQuizScreen.xp_earned', colorToken: 'accent' },
    ],
    reviewItems,
    reviewSummary: {
      correct: correctCount,
      wrong: wrongCount,
      skipped: skippedCount,
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

  const contestId = (params.contestId ?? params.quizId) as string | undefined;
  const isPractice =
    params.practice === '1' ||
    params.practice === 'true' ||
    params.isPractice === '1' ||
    params.isPractice === 'true' ||
    params.mode === 'practice' ||
    params.mode === 'subject';

  const title = (params.title as string) ?? t('contests.postQuizScreen.default_title');

  const timeTakenSecs = Number(params.timeTaken ?? 0);
  const formattedTime = timeTakenSecs > 0 ? formatDuration(timeTakenSecs) : 'N/A';

  let submission: SubmitQuizSessionResult | null = null;
  let reviewQuestions: ReviewQuestion[] = [];
  let parseError: string | null = null;
  try {
    submission = params.submission ? JSON.parse(String(params.submission)) : null;
    reviewQuestions = params.questions ? JSON.parse(String(params.questions)) : [];
  } catch {
    parseError = t('contests.postQuizScreen.parse_error');
  }

  const earnedXp = submission?.xpEarned ?? 0;
  const totalUpdatedXp = (submission as any)?.updatedXpPoints ?? ((submission as any)?.updatedTotalXp ?? 0);
  const previousXp = Math.max(0, totalUpdatedXp - earnedXp);

  const currentTierMin = Math.floor(totalUpdatedXp / TIER_SIZE) * TIER_SIZE;
  const currentTierMax = currentTierMin + TIER_SIZE;

  const [displayXp, setDisplayXp] = useState(previousXp);
  const [barWidth, setBarWidth] = useState(0);

  const animatedXp = useRef(new Animated.Value(previousXp)).current;
  const animatedOnceRef = useRef(false);

  useEffect(() => {
    if (!submission || animatedOnceRef.current) return;
    animatedOnceRef.current = true;

    const listenerId = animatedXp.addListener(({ value }) => {
      setDisplayXp(Math.round(value));
    });

    Animated.timing(animatedXp, {
      toValue: totalUpdatedXp,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      animatedXp.removeListener(listenerId);
    };
  }, [animatedXp, previousXp, submission, totalUpdatedXp]);

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

  const result = buildQuizResult(submission, reviewQuestions, isPractice, title, formattedTime, t);

  const cardBg = theme.isDark ? theme.color.card : theme.color.accent;
  const subText = theme.color.textSecondary;

  const isPassed = result.scorePercent >= 60;
  const hasEarnedEp = result.epEarned > 0;

  let rewardBadgeBg = theme.color.warning + '22';
  let rewardBadgeBorder = theme.color.warning;
  let rewardBadgeColor = theme.color.warning;
  let rewardBadgeIcon: any = 'zap';
  let rewardBadgeText = `+${result.epEarned} ${t('contests.postQuizScreen.ep_earned')}`;

  if (result.isPractice) {
    rewardBadgeBg = theme.color.accent + '22';
    rewardBadgeBorder = theme.color.accent;
    rewardBadgeColor = theme.color.accent;
    rewardBadgeIcon = 'book-open';
    rewardBadgeText = t('contests.postQuizScreen.practice_mode');
  } else if (!hasEarnedEp) {
    rewardBadgeBg = theme.color.warning + '18';
    rewardBadgeBorder = theme.color.warning + '55';
    rewardBadgeColor = theme.color.warning;
    rewardBadgeIcon = 'award';
    rewardBadgeText = t('contests.postQuizScreen.qualifying_needed', { defaultValue: 'Score 60%+ to earn Contest EP' });
  }

  const colorFor = (token: string) => {
    if (token === 'success') return theme.color.success;
    if (token === 'error') return theme.color.error;
    if (token === 'accent') return theme.color.accent;
    return theme.color.textPrimary;
  };

  const handleBack = () => {
    router.push('/contests');
  };

  const handleRetry = () => {
    if (contestId) {
      router.push({
        pathname: '/contests/[quizId]',
        params: {
          quizId: contestId,
          title: result.title,
          totalQuestions: String(result.totalQuestions),
          subject: (params.subject as string) || '',
          difficulty: (params.difficulty as string) || '',
          practice: '0',
          mode: 'contest',
        },
      });
    } else {
      router.push('/contests');
    }
  };

  const progressPercent = animatedXp.interpolate({
    inputRange: [currentTierMin, currentTierMax],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const xpIndicatorLeft = animatedXp.interpolate({
    inputRange: [currentTierMin, currentTierMax],
    outputRange: [0, Math.max(0, barWidth - 54)],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
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
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 180,
              height: 180,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.isDark ? theme.color.accent + '18' : theme.color.surface + '20',
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: 130,
              height: 130,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.isDark ? theme.color.accent + '10' : theme.color.surface + '10',
            }}
          />

          <View style={{ gap: theme.space.xs, alignItems: 'center' }}>
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.xxl,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.bold ?? theme.fontFamily.regular,
                textAlign: 'center',
              }}
            >
              {t('contests.postQuizScreen.quiz_completed')}
            </Text>
            <Text
              style={{
                color: subText,
                fontSize: theme.fontSize.md,
                fontFamily: theme.fontFamily.bold?? theme.fontFamily.light,
                textAlign: 'center',
              }}
            >
              {`${result.title} · ${result.totalQuestions} ${t('contests.questions')}`}
            </Text>
          </View>

          <QuizResultCard scorePercent={result.scorePercent} />

          <View
            style={{
              flexDirection: 'row',
              gap: theme.space.sm,
              alignItems: 'center',
              paddingVertical: theme.space.sm + 2,
              paddingHorizontal: theme.space.xl,
              borderWidth: 1.5,
              borderColor: rewardBadgeBorder,
              borderRadius: theme.borderRadius.full,
              backgroundColor: rewardBadgeBg,
            }}
          >
            <Feather name={rewardBadgeIcon} size={theme.fontSize.lg} color={rewardBadgeColor} />
            <Text style={{ color: rewardBadgeColor, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.bold }}>
              {rewardBadgeText}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: theme.space.sm, paddingTop: theme.space.md, paddingHorizontal: theme.space.md }}>
          {result.statBoxes.map((stat) => (
            <View
              key={stat.key}
              style={{
                flex: 1,
                gap: theme.space.xs,
                alignItems: 'center',
                paddingVertical: theme.space.md,
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.xl,
                backgroundColor: theme.color.card,
              }}
            >
              <Feather name={stat.icon} size={theme.fontSize.md} color={colorFor(stat.colorToken)} />
              <Text style={{ color: colorFor(stat.colorToken), fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.number }}>
                {stat.value}
              </Text>
              <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.light }}>
                {t(stat.labelKey)}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: theme.space.sm,
            alignItems: 'center',
            padding: theme.space.md,
            marginTop: theme.space.md,
            marginHorizontal: theme.space.md,
            borderWidth: 1,
            borderRadius: theme.borderRadius.xl,
            borderColor: isPassed ? theme.color.success + '44' : theme.color.warning + '44',
            backgroundColor: isPassed ? theme.color.success + '12' : theme.color.warning + '12',
          }}
        >
          <Feather
            name={isPassed ? 'trending-up' : 'info'}
            size={theme.fontSize.md}
            color={isPassed ? theme.color.success : theme.color.warning}
          />
          <Text
            style={{
              flex: 1,
              color: isPassed ? theme.color.success : theme.color.warning,
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {result.percentileMessage}
          </Text>
        </View>

        <View
          style={{
            marginTop: theme.space.md,
            marginHorizontal: theme.space.md,
            padding: theme.space.md,
            paddingBottom: theme.space.lg,
            borderRadius: theme.borderRadius.xl,
            borderWidth: 1,
            borderColor: theme.color.border,
            backgroundColor: theme.color.card,
            gap: theme.space.md,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
              <Feather name="zap" size={theme.fontSize.md} color={theme.color.accent} />
              <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.bold }}>
                {t('contests.postQuizScreen.xp_progress', { defaultValue: 'Experience Gained' })}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: theme.space.sm,
                paddingVertical: 2,
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.accent + '20',
              }}
            >
              <Text style={{ color: theme.color.accent, fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.bold }}>
                +{earnedXp} XP
              </Text>
            </View>
          </View>

          <View
            onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
            style={{ width: '100%', position: 'relative', marginTop: 18 }}
          >
            {barWidth > 0 && (
              <Animated.View
                style={{
                  position: 'absolute',
                  top: -24,
                  left: xpIndicatorLeft,
                  backgroundColor: theme.color.accent,
                  paddingHorizontal: theme.space.xs * 1.5,
                  paddingVertical: 2,
                  borderRadius: theme.borderRadius.sm,
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <Text
                  style={{
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.xs,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.number,
                  }}
                >
                  {displayXp}
                </Text>
              </Animated.View>
            )}

            <View style={{ height: 10, borderRadius: 5, backgroundColor: theme.color.surface, overflow: 'hidden' }}>
              <Animated.View
                style={{
                  height: '100%',
                  backgroundColor: theme.color.accent,
                  borderRadius: 5,
                  width: progressPercent,
                }}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>
              {currentTierMin} XP
            </Text>
            <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>
              {currentTierMax} XP
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: theme.space.md,
          gap: theme.space.sm,
          borderTopWidth: 1,
          borderTopColor: theme.color.border,
          backgroundColor: theme.color.background,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowReview(true)}
          style={{
            flexDirection: 'row',
            gap: theme.space.sm,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.md,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.accent,
          }}
        >
          <Feather name="book-open" size={theme.fontSize.lg} color={theme.color.textInverse} />
          <Text style={{ color: theme.color.textInverse, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.regular }}>
            {t('contests.postQuizScreen.review_answers')}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
          {!isPractice && (
            <TouchableOpacity
              onPress={handleRetry}
              style={{
                flex: 1,
                flexDirection: 'row',
                gap: theme.space.xs,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: theme.space.sm * 1.5,
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.lg,
                backgroundColor: theme.color.card,
              }}
            >
              <Feather name="rotate-ccw" size={theme.fontSize.sm} color={theme.color.textSecondary} />
              <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
                {t('common.retry')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleBack}
            style={{
              flex: 1,
              flexDirection: 'row',
              gap: theme.space.xs,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.sm * 1.5,
              borderWidth: 1,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.card,
            }}
          >
            <Feather name="chevron-left" size={theme.fontSize.sm} color={theme.color.textSecondary} />
            <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
              {t('common.back')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showReview} transparent animationType="slide">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowReview(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '80%',
            gap: theme.space.md,
            padding: theme.space.lg,
            borderTopLeftRadius: theme.borderRadius.xl + 4,
            borderTopRightRadius: theme.borderRadius.xl + 4,
            backgroundColor: theme.color.card,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.regular }}>
              {t('contests.postQuizScreen.review_answers')}
            </Text>
            <TouchableOpacity onPress={() => setShowReview(false)}>
              <Feather name="x" size={theme.fontSize.xl} color={theme.color.textMuted} />
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
                      gap: theme.space.sm,
                      padding: theme.space.md,
                      borderWidth: 1,
                      borderColor: statusColor + '44',
                      borderRadius: theme.borderRadius.xl,
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
                          alignSelf: 'flex-start',
                          paddingVertical: theme.space.xs,
                          paddingHorizontal: theme.space.sm,
                          borderRadius: theme.borderRadius.md,
                          backgroundColor: theme.color.error + '18',
                        }}
                      >
                        <Text style={{ color: theme.color.error, fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.regular }}>
                          ✗ {t('contests.postQuizScreen.your_answer')} : {item.selectedLabel}. {item.selectedText}
                        </Text>
                      </View>
                    )}

                    <View
                      style={{
                        alignSelf: 'flex-start',
                        paddingVertical: theme.space.xs,
                        paddingHorizontal: theme.space.sm,
                        borderRadius: theme.borderRadius.md,
                        backgroundColor: theme.color.success + '18',
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
  );
}