import type { ComponentProps } from 'react';
import { Feather } from '@expo/vector-icons';
import { View, Text, Modal, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Animated, ScrollView, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { normalizeError } from '../../common/api/api.errors';
import { formatDuration } from '../../common/utils/dateUtils';
import { useAppContext } from '../../common/context/AppContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { computeLevelProgress } from '../../common/utils/computeLevelXP';
import { QuizResultCard } from '../../components/contests/QuizResultCard';
import { AnimatedStatChange } from '../../components/common/AnimatedStatChange';
import type { ReviewItem, ReviewQuestion } from '../../common/types/contestTypes';
import { getQuizModeConfig, resolveQuizModeKey } from '../../common/constants/quizModes';
import type { QuizType, Difficulty, SelectedOption, SubmitQuizSessionResult } from '../../common/types/types';


const DEFAULT_PASS_PERCENT = 60;
type ChallengeOutcome = 'won' | 'lost' | 'tied' | 'pending';
type Translate = (key: string, opts?: Record<string, unknown>) => string;
type StudyPlanSyncState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; preparationPercent: number }
  | { status: 'error'; message: string };

function buildReviewItems(submission: SubmitQuizSessionResult, questions: ReviewQuestion[]): ReviewItem[] {
  return questions.map((q, idx) => {
    const graded = (submission.results ?? []).find(
      (g) => g.questionId === q.id
    );
    const isSkipped = !graded || graded.selectedOption === null;
    const selectedLabel: SelectedOption | null = isSkipped
      ? null
      : (graded!.selectedOption as SelectedOption);
    const correctOption = q.options.find((o) => o.label === graded?.correctAnswer);
    const selectedOption = q.options.find((o) => o.label === selectedLabel);

    return {
      id: q.id,
      index: idx + 1,
      question: q.question,
      isCorrect: graded?.isCorrect ?? false,
      isSkipped,
      selectedLabel,
      selectedText: selectedOption?.text ?? null,
      correctLabel: graded?.correctAnswer ?? '',
      correctText: correctOption?.text ?? '',
      explanation: graded?.explanation ?? '',
    };
  });
}

function resolveChallengeOutcome(submission: SubmitQuizSessionResult, uid: string): ChallengeOutcome {
  if (submission.challengeStatus !== 'completed') return 'pending';
  if (submission.challengeWinnerUid === null) return 'tied';
  return submission.challengeWinnerUid === uid ? 'won' : 'lost';
}

function LevelUpBadge({ level, delayMs }: { level: number; delayMs: number }) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delayMs),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, delayMs]);

  return (
    <Animated.View
      style={{
        gap: theme.space.xs,
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
        transform: [{ scale }],
        paddingVertical: theme.space.xs * 1.25,
        paddingHorizontal: theme.space.md,
        borderWidth: 1.5,
        borderColor: theme.color.warning,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.color.warning + '22',
      }}
    >
      <Feather name='award' size={theme.fontSize.md} color={theme.color.warning} />
      <Text
        style={{
          color: theme.color.warning,
          fontSize: theme.fontSize.sm,
          fontFamily: theme.fontFamily.bold,
        }}
      >
        {theme.i18n.t('contests.postQuizScreen.level_up', { level, defaultValue: `Level ${level}!` })}
      </Text>
    </Animated.View>
  );
}


export default function PostQuizScreen() {
  const [showReview, setShowReview] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [studyPlanSync, setStudyPlanSync] = useState<StudyPlanSyncState>({ status: 'idle' });

  const t: Translate = (key, opts) => theme.i18n.t(key, opts);

  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAppContext();
  const insets = useSafeAreaInsets();
  useBottomBar(false);

  const params = useLocalSearchParams<{
    title?: string;
    subject?: string;
    difficulty?: string;
    questions?: string;
    submission?: string;
    quizType?: string;
    mode?: string;
    practice?: string;
    isPractice?: string;
    contestId?: string;
    quizId?: string;
    studyPlanSessionId?: string;
    passPercent?: string;
  }>();

  const { submission, reviewQuestions, parseError } = useMemo(() => {
    try {
      return {
        submission: (params.submission
          ? JSON.parse(String(params.submission))
          : null) as SubmitQuizSessionResult | null,
        reviewQuestions: (params.questions
          ? JSON.parse(String(params.questions))
          : []) as ReviewQuestion[],
        parseError: false,
      };
    } catch {
      return {
        submission: null as SubmitQuizSessionResult | null,
        reviewQuestions: [] as ReviewQuestion[],
        parseError: true,
      };
    }
  }, [params.submission, params.questions]);

  const legacyIsPractice =
    params.practice === '1' ||
    params.practice === 'true' ||
    params.isPractice === '1' ||
    params.isPractice === 'true' ||
    params.mode === 'practice' ||
    params.mode === 'subject';
  const derivedQuizType: QuizType | undefined =
    (submission?.challengeId ? 'challenge' : undefined) ??
    (params.quizType as QuizType | undefined) ??
    (legacyIsPractice ? 'practice' : undefined) ??
    (params.mode as QuizType | undefined);

  const modeKey = resolveQuizModeKey({ quizType: derivedQuizType, studyPlanSessionId: params.studyPlanSessionId });
  const modeConfig = getQuizModeConfig(modeKey);
  const contestId = params.contestId;
  const title = params.title ?? t('contests.postQuizScreen.default_title');
  const passPercent = params.passPercent ? Number(params.passPercent) : DEFAULT_PASS_PERCENT;

  const reviewItems = useMemo(
    () => (submission ? buildReviewItems(submission, reviewQuestions) : []),
    [submission, reviewQuestions]
  );

  const earnedXp = submission?.xpEarned ?? 0;
  const earnedEp = submission?.epEarned ?? 0;
  const updatedXpPoints = submission?.updatedXpPoints ?? 0;
  const updatedEpPoints = submission?.updatedEpPoints ?? 0;
  const leveledUp = submission?.leveledUp ?? false;
  const previousXpPoints = Math.max(0, updatedXpPoints-earnedXp);
  const previousLevelProgress = computeLevelProgress(previousXpPoints);
  const currentLevelProgress = computeLevelProgress(updatedXpPoints);
  const targetRatio = leveledUp ? 1 : currentLevelProgress.progressRatio;

  const barAnim = useRef(new Animated.Value(previousLevelProgress.progressRatio)).current;
  const hasAnimatedBarRef = useRef(false);
  useEffect(() => {
    if (!submission || hasAnimatedBarRef.current) return;
    hasAnimatedBarRef.current = true;

    Animated.timing(barAnim, {
      toValue: targetRatio,
      duration: 1100,
      delay: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);
  const barWidthPercent = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const backTarget = modeConfig.key === 'challenge' && submission?.challengeId
      ? { pathname: '/challenges/[challengeId]', params: { challengeId: submission.challengeId } }
      : modeConfig.backCta.route;

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace(backTarget as any);
      return true;
    });
    return () => sub.remove();
  }, [router, modeConfig.key, modeConfig.backCta.route, submission?.challengeId]);

  const syncStudyPlan = useCallback(async () => {
    if (!submission || !params.studyPlanSessionId) return;
    setStudyPlanSync({ status: 'loading' });
    try {
      const result = await api.studyPlan.markStudySessionComplete({
        sessionId: params.studyPlanSessionId,
        quizSessionId: submission.sessionId,
      });
      setStudyPlanSync({
        status: 'success',
        preparationPercent: result.plan.preparationPercent,
      });
    } catch (err) {
      setStudyPlanSync({
        status: 'error',
        message: normalizeError(err).message,
      });
    }
  }, [submission, params.studyPlanSessionId]);

  const studyPlanSyncFiredRef = useRef(false);
  useEffect(() => {
    if (modeKey !== 'studyPlan' || studyPlanSyncFiredRef.current) return;
    if (!submission || !params.studyPlanSessionId) return;
    studyPlanSyncFiredRef.current = true;
    syncStudyPlan();
  }, [modeKey, submission, params.studyPlanSessionId, syncStudyPlan]);

  if (parseError || !submission) {
    return (
      <View
        style={{
          flex: 1,
          gap: theme.space.sm,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.space.xl,
          backgroundColor: theme.color.background,
        }}
      >
        <Feather name='alert-circle' size={theme.space.xl} color={theme.color.error} />
        <Text
          style={{
            textAlign: 'center',
            fontSize: theme.fontSize.sm,
            color: theme.color.textMuted,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {parseError ? t('contests.postQuizScreen.parse_error') : t('contests.postQuizScreen.no_result')}
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
          <Text style={{ color: theme.color.textInverse, fontFamily: theme.fontFamily.bold }}>
            {t('common.back_to_contests')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    scorePercent,
    correctCount,
    wrongCount,
    skippedCount,
    timeTaken,
    challengeId,
    totalQuestions,
  } = submission;

  const isPassed = scorePercent >= passPercent;
  const colorFor = (token: 'success' | 'error' | 'textPrimary' | 'accent') => {
    if (token === 'success') return theme.color.success;
    if (token === 'error') return theme.color.error;
    if (token === 'accent') return theme.color.accent;
    return theme.color.textPrimary;
  };

  const statBoxes = [
    {
      key: 'correct' as const,
      icon: 'check' as const,
      value: String(correctCount),
      labelKey: 'contests.postQuizScreen.correct',
      colorToken: 'success' as const,
    },
    {
      key: 'wrong' as const,
      icon: 'x' as const,
      value: String(wrongCount),
      labelKey: 'contests.postQuizScreen.wrong',
      colorToken: 'error' as const,
    },
    {
      key: 'time' as const,
      icon: 'clock' as const,
      value: formatDuration(timeTaken),
      labelKey: 'contests.postQuizScreen.time',
      colorToken: 'textPrimary' as const,
    },
    {
      key: 'xp' as const,
      icon: 'trending-up' as const,
      value: `+${earnedXp}`,
      labelKey: 'contests.postQuizScreen.xp_earned',
      colorToken: 'accent' as const,
    },
  ];

  let rewardBadge: {
    bg: string;
    border: string;
    color: string;
    icon: ComponentProps<typeof Feather>['name'];
    text: string;
  };

  const accentColor = theme.color[modeConfig.accentToken];
  if (modeConfig.key === 'subject' || modeConfig.key === 'practice') {
    rewardBadge = {
      icon: 'book-open',
      text: t('contests.postQuizScreen.practice_mode'),
      color: accentColor,
      border: accentColor,
      bg: accentColor + '22',
    };
  } else if (modeConfig.key === 'studyPlan') {
    rewardBadge = {
      icon: 'calendar',
      text: t('contests.postQuizScreen.study_plan_session', { defaultValue: 'Study Plan Session' }),
      color: accentColor,
      border: accentColor,
      bg: accentColor + '22',
    };
  } else if (modeConfig.key === 'challenge') {
    rewardBadge = {
      icon: 'flag',
      text: `+${earnedEp} ${t('contests.postQuizScreen.ep_earned')}`,
      color: accentColor,
      border: accentColor,
      bg: accentColor + '22',
    };
  } else if (earnedEp > 0) {
    rewardBadge = {
      icon: 'zap',
      text: `+${earnedEp} ${t('contests.postQuizScreen.ep_earned')}`,
      color: theme.color.warning,
      border: theme.color.warning,
      bg: theme.color.warning + '22',
    };
  } else {
    rewardBadge = {
      text: t('contests.postQuizScreen.qualifying_needed', {
        percent: passPercent,
        defaultValue: `Score ${passPercent}%+ to earn Contest EP`,
      }),
      icon: 'award',
      color: theme.color.warning,
      border: theme.color.warning + '55',
      bg: theme.color.warning + '18',
    };
  }

  const challengeOutcome = modeConfig.showsChallengeResult
    ? resolveChallengeOutcome(submission, user?.uid ?? '')
    : null;
  const goToChallenge = () => {
    if (!challengeId) return;
    router.replace({
      pathname: '/challenges/[challengeId]',
      params: { challengeId },
    });
  };

  const handleBack = () => {
    if (modeConfig.key === 'challenge' && challengeId) {
      goToChallenge();
      return;
    }
    router.replace(modeConfig.backCta.route as any);
  };

  const handleRetry = async () => {
    if (!modeConfig.showsRetrySameSet || retrying) return;
    setRetryError(null);

    if (modeConfig.key === 'contest' || modeConfig.key === 'daily') {
      if (contestId) {
        router.replace({
          pathname: '/contests/preQuizScreen',
          params: { contestId },
        });
      } else {
        router.replace('/contests');
      }
      return;
    }

    if (modeConfig.key === 'subject' || modeConfig.key === 'practice') {
      setRetrying(true);
      try {
        const fresh = await api.quiz.startQuizSession({
          quizType: 'subject',
          subject: params.subject || title,
          difficulty: (params.difficulty as Difficulty) || 'medium',
          questionCount: totalQuestions,
        });
        router.replace({
          pathname: '/contests/[quizId]',
          params: {
            quizId: fresh.sessionId,
            quizType: 'subject',
            mode: 'subject',
            subject: fresh.subject,
            difficulty: fresh.difficulty,
            sessionData: encodeURIComponent(JSON.stringify(fresh)),
          },
        });
      } catch (err) {
        setRetryError(normalizeError(err).message);
      } finally {
        setRetrying(false);
      }
    }
  };


  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
      >
        <View
          style={{
            overflow: 'hidden',
            gap: theme.space.lg,
            alignItems: 'center',
            padding: theme.space.xl,
            backgroundColor: theme.isDark ? theme.color.card : accentColor,
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 180,
              height: 180,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.isDark ? accentColor + '18' : theme.color.surface + '20',
              pointerEvents: 'none'
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: 130,
              height: 130,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.isDark ? accentColor + '10' : theme.color.surface + '10',
              pointerEvents: 'none'
            }}
          />

          <View style={{ gap: theme.space.xs, alignItems: 'center' }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: theme.fontSize.xxl,
                color: theme.color.textPrimary,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {t(`contests.postQuizScreen.completed_title.${modeConfig.key}`, {
                defaultValue: t('contests.postQuizScreen.quiz_completed'),
              })}
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontSize: theme.fontSize.md,
                color: theme.color.textSecondary,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {`${title} · ${totalQuestions} ${t('contests.questions')}`}
            </Text>
          </View>

          <QuizResultCard scorePercent={scorePercent} />

          <View
            style={{
              gap: theme.space.sm,
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.space.sm + 2,
              paddingHorizontal: theme.space.xl,
              borderWidth: 1.5,
              borderColor: rewardBadge.border,
              borderRadius: theme.borderRadius.full,
              backgroundColor: rewardBadge.bg,
            }}
          >
            <Feather name={rewardBadge.icon} size={theme.fontSize.lg} color={rewardBadge.color} />
            <Text
              style={{
                color: rewardBadge.color,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {rewardBadge.text}
            </Text>
          </View>
        </View>

        <View
          style={{
            gap: theme.space.sm,
            flexDirection: 'row',
            paddingTop: theme.space.md,
            paddingHorizontal: theme.space.md,
          }}
        >
          {statBoxes.map((stat) => (
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
              <Text
                style={{
                  fontSize: theme.fontSize.lg,
                  color: colorFor(stat.colorToken),
                  fontFamily: theme.fontFamily.numberBold,
                }}
              >
                {stat.value}
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSize.xs,
                  color: theme.color.textSecondary,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {t(stat.labelKey)}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', paddingTop: theme.space.lg }}>
          {modeConfig.showsEp && (
            <AnimatedStatChange
              icon='zap'
              color={theme.color.warning}
              label={t('common.ep')}
              value={updatedEpPoints}
              delta={earnedEp}
            />
          )}
          <AnimatedStatChange
            icon='trending-up'
            color={theme.color.info}
            label={t('common.xp')}
            value={updatedXpPoints}
            delta={earnedXp}
          />
          {leveledUp && (
            <AnimatedStatChange
              icon='star'
              color={theme.color.premium}
              label={t('common.level')}
              value={currentLevelProgress.level}
              delta={currentLevelProgress.level - previousLevelProgress.level}
            />
          )}
        </View>

        {modeConfig.showsPassThreshold && (
          <View
            style={{
              gap: theme.space.sm,
              flexDirection: 'row',
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
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.bold,
                color: isPassed ? theme.color.success : theme.color.warning,
              }}
            >
              {isPassed
                ? t('contests.postQuizScreen.percentile_high')
                : t('contests.postQuizScreen.percentile_low', { percent: passPercent })}
            </Text>
          </View>
        )}

        {modeConfig.showsChallengeResult && challengeOutcome && (
          <View
            style={{
              gap: theme.space.sm,
              padding: theme.space.md,
              marginTop: theme.space.md,
              marginHorizontal: theme.space.md,
              borderRadius: theme.borderRadius.xl,
              backgroundColor: (challengeOutcome === 'won'
                ? theme.color.success
                : challengeOutcome === 'lost' ? theme.color.error : theme.color.textMuted) + '18',
            }}
          >
            <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
              <Feather
                name={challengeOutcome === 'won'
                  ? 'award'
                  : challengeOutcome === 'lost'
                    ? 'frown'
                    : challengeOutcome === 'tied' ? 'minus-circle' : 'clock'
                }
                size={theme.fontSize.lg}
                color={challengeOutcome === 'won'
                  ? theme.color.success
                  : challengeOutcome === 'lost' ? theme.color.error : theme.color.textMuted
                }
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: theme.fontSize.md,
                  fontFamily: theme.fontFamily.bold,
                  color: challengeOutcome === 'won'
                  ? theme.color.success
                  : challengeOutcome === 'lost' ? theme.color.error : theme.color.textMuted,
                }}
              >
                {t(`contests.postQuizScreen.challenge_outcome.${challengeOutcome}`)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={goToChallenge}
              style={{
                gap: theme.space.xs,
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'flex-start',
                paddingVertical: theme.space.xs,
              }}
            >
              <Text
                style={{
                  color: theme.color.accent,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {t('contests.postQuizScreen.view_challenge')}
              </Text>
              <Feather name='chevron-right' size={theme.fontSize.sm} color={theme.color.accent} />
            </TouchableOpacity>
          </View>
        )}

        {modeKey === 'studyPlan' && (
          <View
            style={{
              gap: theme.space.sm,
              padding: theme.space.md,
              marginTop: theme.space.md,
              marginHorizontal: theme.space.md,
              borderWidth: 1,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.xl,
              backgroundColor: theme.color.card,
            }}
          >
            {studyPlanSync.status === 'loading' && (
              <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size='small' color={theme.color.accent} />
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.color.textSecondary,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {t('contests.postQuizScreen.study_plan_syncing')}
                </Text>
              </View>
            )}

            {studyPlanSync.status === 'success' && (
              <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
                <Feather name='check-circle' size={theme.fontSize.md} color={theme.color.success} />
                <Text
                  style={{
                    flex: 1,
                    fontSize: theme.fontSize.sm,
                    color: theme.color.textPrimary,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {t('contests.postQuizScreen.study_plan_synced', { percent: studyPlanSync.preparationPercent })}
                </Text>
              </View>
            )}

            {studyPlanSync.status === 'error' && (
              <View style={{ gap: theme.space.xs }}>
                <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name='alert-circle' size={theme.fontSize.md} color={theme.color.error} />
                  <Text
                    style={{
                      flex: 1,
                      color: theme.color.error,
                      fontSize: theme.fontSize.sm,
                      fontFamily: theme.fontFamily.regular,
                    }}
                  >
                    {studyPlanSync.message}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={syncStudyPlan}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <Text
                    style={{
                      color: theme.color.accent,
                      fontSize: theme.fontSize.sm,
                      fontFamily: theme.fontFamily.bold,
                    }}
                  >
                    {t('common.retry')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View
          style={{
            gap: theme.space.md,
            padding: theme.space.md,
            paddingBottom: theme.space.lg,
            marginTop: theme.space.md,
            marginHorizontal: theme.space.md,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.xl,
            backgroundColor: theme.color.card,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
              <Feather name='zap' size={theme.fontSize.md} color={theme.color.accent} />
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.color.textPrimary,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {t('contests.postQuizScreen.xp_progress')}
              </Text>
            </View>

            <View
              style={{
                paddingVertical: theme.space.xs * 0.5,
                paddingHorizontal: theme.space.sm,
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.accent + '20',
              }}
            >
              <Text
                style={{
                  color: theme.color.accent,
                  fontSize: theme.fontSize.xs,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                +{earnedXp} XP
              </Text>
            </View>
          </View>

          {leveledUp && (
            <LevelUpBadge level={currentLevelProgress.level} delayMs={1400} />
          )}

          <View style={{ width: '100%' }}>
            <View
              style={{
                height: 10,
                overflow: 'hidden',
                borderRadius: theme.borderRadius.sm,
                backgroundColor: theme.color.surface,
              }}
            >
              <Animated.View
                style={{
                  height: '100%',
                  width: barWidthPercent,
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: theme.color.accent,
                }}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              style={{
                fontSize: theme.fontSize.xs,
                color: theme.color.textSecondary,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {previousLevelProgress.floorXp} XP · Lv{' '}{previousLevelProgress.level}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.xs,
                color: theme.color.textSecondary,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {previousLevelProgress.ceilingXp} XP · Lv{' '}{previousLevelProgress.level + 1}
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
          gap: theme.space.sm,
          padding: theme.space.md,
          paddingBottom: theme.space.md + insets.bottom,
          borderTopWidth: 1,
          borderTopColor: theme.color.border,
          backgroundColor: theme.color.background,
        }}
      >
        {reviewItems.length > 0 && (
          <TouchableOpacity
            onPress={() => setShowReview(true)}
            style={{
              gap: theme.space.sm,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.md,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.accent,
            }}
          >
            <Feather name='book-open' size={theme.fontSize.lg} color={theme.color.textInverse} />
            <Text
              style={{
                fontSize: theme.fontSize.md,
                color: theme.color.textInverse,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {t('contests.postQuizScreen.review_answers')}
            </Text>
          </TouchableOpacity>
        )}

        {retryError && (
          <Text
            style={{
              color: theme.color.error,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {retryError}
          </Text>
        )}

        <View style={{ gap: theme.space.sm, flexDirection: 'row' }}>
          {modeConfig.showsRetrySameSet && (
            <TouchableOpacity
              onPress={handleRetry}
              disabled={retrying}
              style={{
                flex: 1,
                gap: theme.space.xs,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: theme.space.sm * 1.5,
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.lg,
                backgroundColor: theme.color.card,
                opacity: retrying ? 0.6 : 1,
              }}
            >
              {retrying ? (
                <ActivityIndicator size='small' color={theme.color.textPrimary} />
              ) : (
                <>
                  <Feather name='rotate-ccw' size={theme.fontSize.sm} color={theme.color.textPrimary} />
                  <Text
                    style={{
                      fontSize: theme.fontSize.sm,
                      color: theme.color.textPrimary,
                      fontFamily: theme.fontFamily.regular,
                    }}
                  >
                    {t('common.retry')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleBack}
            style={{
              flex: 1,
              gap: theme.space.xs,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.sm * 1.5,
              borderWidth: 1,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.card,
            }}
          >
            <Feather name='chevron-left' size={theme.fontSize.sm} color={theme.color.textPrimary} />
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.color.textPrimary,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {t(modeConfig.backCta.labelKey)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showReview}
        transparent
        animationType='slide'
        onRequestClose={() => setShowReview(false)}
      >
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
            <Text
              style={{
                fontSize: theme.fontSize.lg,
                color: theme.color.textPrimary,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {t('contests.postQuizScreen.review_answers')}
            </Text>

            <TouchableOpacity onPress={() => setShowReview(false)} hitSlop={8}>
              <Feather name='x' size={theme.fontSize.xl} color={theme.color.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={{ gap: theme.space.sm, flexDirection: 'row' }}>
            {[
              {
                label: `${correctCount} ${t('contests.postQuizScreen.correct')}`,
                color: theme.color.success,
                bg: theme.color.success + '18',
              },
              {
                label: `${wrongCount} ${t('contests.postQuizScreen.wrong')}`,
                color: theme.color.error,
                bg: theme.color.error + '18',
              },
              {
                label: `${skippedCount} ${t('contests.postQuizScreen.skipped')}`,
                color: theme.color.textMuted,
                bg: theme.color.surface,
              },
            ].map((p) => (
              <View
                key={p.label}
                style={{
                  paddingVertical: theme.space.xs,
                  paddingHorizontal: theme.space.md,
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: p.bg,
                }}
              >
                <Text
                  style={{
                    color: p.color,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {p.label}
                </Text>
              </View>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ gap: theme.space.sm }}>
              {reviewItems.map((item) => {
                const statusColor = item.isSkipped
                  ? theme.color.textMuted
                  : item.isCorrect ? theme.color.success : theme.color.error;
                const statusIcon = item.isSkipped
                  ? 'minus-circle'
                  : item.isCorrect ? 'check-circle' : 'x-circle';

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
                      <Feather
                        name={statusIcon}
                        size={theme.fontSize.md}
                        color={statusColor}
                        style={{ marginTop: theme.space.xs / 2 }}
                      />
                      <Text
                        style={{
                          flex: 1,
                          fontSize: theme.fontSize.sm,
                          color: theme.color.textPrimary,
                          fontFamily: theme.fontFamily.regular,
                        }}
                      >
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
                        <Text
                          style={{
                            color: theme.color.error,
                            fontSize: theme.fontSize.xs,
                            fontFamily: theme.fontFamily.bold,
                          }}
                        >
                          ✗ {t('contests.postQuizScreen.your_answer')} :{' '}{item.selectedLabel}. {item.selectedText}
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
                      <Text
                        style={{
                          color: theme.color.success,
                          fontSize: theme.fontSize.xs,
                          fontFamily: theme.fontFamily.bold,
                        }}
                      >
                        ✓ {item.correctLabel}. {item.correctText}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontSize: theme.fontSize.xs,
                        color: theme.color.textSecondary,
                        fontFamily: theme.fontFamily.regular,
                        lineHeight: theme.fontSize.xs * 1.25,
                      }}
                    >
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
