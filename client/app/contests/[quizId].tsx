import { Feather } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { View, Text, Image, Modal } from 'react-native';
import { Animated, ActivityIndicator } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { Loading } from '../../components/common/loading';
import { normalizeError } from '../../common/api/api.errors';
import { useQuizTimer } from '../../common/hooks/useQuizTimer';
import { formatCountdown } from '../../common/utils/dateUtils';
import { useAppContext } from '../../common/context/AppContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { QuestionCard } from '../../components/contests/QuestionCard';
import { playSound, releaseSounds } from '../../common/utils/soundManager';
import { QuizProgressBar } from '../../components/contests/QuizProgressBar';
import type { QuizType, StartQuizSessionResult } from '../../common/types/types';
import type { QuizQuestion, AnswerRecord } from '../../common/types/contestTypes';
import { getQuizModeConfig, resolveQuizModeKey } from '../../common/constants/quizModes';
import type { ClientQuestion, SelectedOption, SubmittedAnswer } from '../../common/types/types';


const NON_CONTEST_TYPES = ['practice', 'subject', 'challenge'];

type ActiveModal = 'summary' | 'submit' | 'exit' | 'timeUp' | null;
interface LoadedSession {
  sessionId: string;
  quizType: QuizType;
  subject: string;
  difficulty: string;
  topic: string | null;
  timeLimitSecs: number;
  contestId: string | null;
  questions: QuizQuestion[];
}

type DialogModalProps = {
  visible: boolean;
  icon: ComponentProps<typeof Feather>['name'];
  tone: string;
  title: string;
  body: string;
  extra?: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onRequestClose?: () => void;
};

function mapClientQuestion(q: ClientQuestion, fallbackSubject: string, fallbackDifficulty: string): QuizQuestion {
  return {
    id: q.questionId,
    subject: q.subject ?? fallbackSubject,
    question: q.questionText,
    image: q.imageUrl ?? undefined,
    options: [
      { label: 'A', text: q.optionA },
      { label: 'B', text: q.optionB },
      { label: 'C', text: q.optionC },
      { label: 'D', text: q.optionD },
    ],
    points: q.marks,
    difficulty: (q.difficulty ?? fallbackDifficulty) as QuizQuestion['difficulty'],
  };
}

function toLoadedSession(raw: StartQuizSessionResult, contestId: string | null): LoadedSession {
  return {
    sessionId: raw.sessionId,
    quizType: raw.quizType,
    subject: raw.subject,
    difficulty: raw.difficulty,
    topic: raw.topic ?? null,
    timeLimitSecs: raw.timeLimitSecs ?? 0,
    contestId,
    questions: (raw.questions ?? []).map((q) =>
      mapClientQuestion(q, raw.subject, raw.difficulty)
    ),
  };
}

function buildEmptyAnswers(questions: QuizQuestion[]): Record<string, AnswerRecord> {
  return Object.fromEntries(
    questions.map((q) => [
      q.id,
      {
        questionId: q.id,
        selectedLabel: null,
        isBookmarked: false,
        isFlagged: false,
      } as AnswerRecord,
    ])
  );
}

function parseSessionData(raw: string): StartQuizSessionResult | null {
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

function DialogModal(props: DialogModalProps) {
  const { theme } = useTheme();

  return (
    <Modal
      transparent
      animationType='fade'
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
      visible={props.visible}
      onRequestClose={props.onRequestClose}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.space.lg,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 380,
            gap: theme.space.md,
            alignItems: 'center',
            padding: theme.space.lg,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.xl,
            backgroundColor: theme.color.card,
          }}
        >
          <View
            style={{
              width: theme.space.xxl * 1.4,
              height: theme.space.xxl * 1.4,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.borderRadius.full,
              backgroundColor: props.tone + '22',
            }}
          >
            <Feather name={props.icon} size={theme.fontSize.xxl} color={props.tone} />
          </View>

          <Text
            style={{
              textAlign: 'center',
              fontSize: theme.fontSize.xl,
              color: theme.color.textPrimary,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {props.title}
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: theme.fontSize.md,
              color: theme.color.textSecondary,
              fontFamily: theme.fontFamily.regular,
              lineHeight: theme.fontSize.md * 1.25,
            }}
          >
            {props.body}
          </Text>

          {props.extra}

          <View style={{ width: '100%', gap: theme.space.sm, marginTop: theme.space.xs }}>
            <TouchableOpacity
              onPress={props.onPrimary}
              activeOpacity={0.85}
              style={{
                alignItems: 'center',
                paddingVertical: theme.space.sm * 1.5,
                borderRadius: theme.borderRadius.lg,
                backgroundColor: props.tone,
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.md,
                  fontFamily: theme.fontFamily.bold,
                  color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                }}
              >
                {props.primaryLabel}
              </Text>
            </TouchableOpacity>

            {props.secondaryLabel && props.onSecondary && (
              <TouchableOpacity
                onPress={props.onSecondary}
                activeOpacity={0.85}
                style={{
                  alignItems: 'center',
                  paddingVertical: theme.space.sm * 1.5,
                  borderWidth: 1,
                  borderColor: theme.color.border,
                  borderRadius: theme.borderRadius.lg,
                  backgroundColor: theme.color.surface,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.md,
                    color: theme.color.textPrimary,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {props.secondaryLabel}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}


export default function QuizScreen() {
  const [session, setSession] = useState<LoadedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [expired, setExpired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadStartedRef = useRef(false);
  const submittingRef = useRef(false);
  const submittedRef = useRef(false);
  const expiredRef = useRef(false);
  const allowExitRef = useRef(false);
  const guardActiveRef = useRef(false);
  const pendingExitActionRef = useRef<unknown>(null);
  const submitQuizRef = useRef<() => void>(() => {});

  const router = useRouter();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAppContext();
  useBottomBar(false);

  const t = (key: string, opts?: Record<string, unknown>) => theme.i18n.t(key, opts);
  const timerSound = user?.quizPrefs?.timerSound ?? false;
  const autoSubmit = user?.quizPrefs?.autoSubmit ?? false;

  const params = useLocalSearchParams<{
    quizId?: string;
    quizType?: string;
    mode?: string;
    contestId?: string;
    title?: string;
    subject?: string;
    difficulty?: string;
    topic?: string;
    sessionData?: string;
    studyPlanSessionId?: string;
    passPercent?: string;
  }>();

  const modeKey = resolveQuizModeKey({
    quizType: session?.quizType ?? params.quizType ?? params.mode,
    studyPlanSessionId: params.studyPlanSessionId,
  });
  const modeConfig = getQuizModeConfig(modeKey);

  const loadSession = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      if (params.sessionData) {
        const parsed = parseSessionData(params.sessionData);
        if (!parsed?.sessionId) throw new Error(t('contests.quizScreen.session_missing'));

        const loaded = toLoadedSession(parsed, params.contestId ?? null);
        if (loaded.questions.length === 0) throw new Error(t('contests.quizScreen.load_error'));
        setAnswers(buildEmptyAnswers(loaded.questions));
        setSession(loaded);
        return;
      }

      const declaredType = params.quizType ?? params.mode;
      const startedElsewhere = !!params.studyPlanSessionId || (!!declaredType && NON_CONTEST_TYPES.includes(declaredType));
      const contestId = params.contestId ?? params.quizId;
      if (startedElsewhere || !contestId) throw new Error(t('contests.quizScreen.session_missing'));

      const started = await api.contest.joinContest(contestId);
      const loaded = toLoadedSession(started, contestId);
      if (loaded.questions.length === 0) throw new Error(t('contests.quizScreen.load_error'));
      setAnswers(buildEmptyAnswers(loaded.questions));
      setSession(loaded);
    } catch (err) {
      setLoadError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.sessionData, params.contestId, params.quizId, params.quizType, params.mode, params.studyPlanSessionId]);

  useEffect(() => {
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;
    loadSession();
  }, [loadSession]);

  useEffect(() => () => releaseSounds(), []);

  const submitQuiz = useCallback(async () => {
    if (!session || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    setActiveModal(null);

    try {
      const answerInputs: SubmittedAnswer[] = session.questions.map((q) => {
        const label = answers[q.id]?.selectedLabel;
        return {
          questionId: q.id,
          selectedOption: label && label !== 'SKIPPED' ? label : null,
        };
      });
      const result = await api.quiz.submitQuizSession({
        sessionId: session.sessionId,
        answers: answerInputs,
      });

      submittedRef.current = true;
      allowExitRef.current = true;

      const isContestMode = session.quizType === 'contest' || session.quizType === 'daily';
      const nextParams: Record<string, string> = {
        title: params.title ?? session.subject ?? t('contests.postQuizScreen.default_title'),
        subject: session.subject,
        difficulty: session.difficulty,
        quizType: session.quizType,
        questions: JSON.stringify(
          session.questions.map((q) => ({
            id: q.id,
            subject: q.subject,
            question: q.question,
            options: q.options,
          }))
        ),
        submission: JSON.stringify(result),
      };

      if (session.topic) nextParams.topic = session.topic;
      if (session.timeLimitSecs > 0) nextParams.timeLimitSecs = String(session.timeLimitSecs);
      if (isContestMode && session.contestId) nextParams.contestId = session.contestId;
      if (isContestMode && params.passPercent) nextParams.passPercent = params.passPercent;
      if (params.studyPlanSessionId) nextParams.studyPlanSessionId = params.studyPlanSessionId;

      router.replace({
        pathname: '/contests/postQuizScreen',
        params: nextParams,
      });
    } catch (err) {
      setSubmitError(normalizeError(err).message);
      submittingRef.current = false;
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, answers, params.title, params.passPercent, params.studyPlanSessionId, router]);

  useEffect(() => {
    submitQuizRef.current = submitQuiz;
  }, [submitQuiz]);

  const hasTimer = (session?.timeLimitSecs ?? 0) > 0;
  const handleExpire = useCallback(() => {
    if (expiredRef.current) return;
    expiredRef.current = true;
    setExpired(true);

    if (modeConfig.hardTimerStop || autoSubmit) {
      setTimeout(() => submitQuizRef.current(), 0);
    } else {
      setTimeout(() => setActiveModal('timeUp'), 0);
    }
  }, [modeConfig.hardTimerStop, autoSubmit]);

  const handleLowTime = useCallback(() => {
    playSound('lowTime', timerSound);
  }, [timerSound]);

  const timerPaused = !session || !hasTimer || expired || submitting || (!modeConfig.hardTimerStop && activeModal !== null);

  const { timeLeft, isLowTime } = useQuizTimer({
    totalSeconds: hasTimer ? session!.timeLimitSecs : 1,
    paused: timerPaused,
    onExpire: handleExpire,
    onLowTime: handleLowTime,
  });

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isLowTime || expired) {
      pulse.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isLowTime, expired, pulse]);

  useEffect(() => {
    guardActiveRef.current = !!session && !submitting;
  }, [session, submitting]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!guardActiveRef.current || allowExitRef.current || submittedRef.current) return;
      e.preventDefault();
      pendingExitActionRef.current = e.data?.action ?? null;
      setActiveModal('exit');
    });

    return unsubscribe;
  }, [navigation]);

  const requestExit = () => {
    if (router.canGoBack()) router.back();
    else router.replace(modeConfig.backCta.route as any);
  };

  const confirmExit = () => {
    allowExitRef.current = true;
    setActiveModal(null);
    const action = pendingExitActionRef.current;
    pendingExitActionRef.current = null;

    if (action) navigation.dispatch(action as any);
    else requestExit();
  };

  const questions = session?.questions ?? [];
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const locked = submitting || (expired && modeConfig.hardTimerStop);

  const stats = useMemo(() => {
    const list = Object.values(answers);
    const answered = list.filter((a) => a.selectedLabel !== null).length;

    return {
      answered,
      unanswered: questions.length - answered,
      flagged: list.filter((a) => a.isFlagged).length,
      saved: list.filter((a) => a.isBookmarked).length,
    };
  }, [answers, questions.length]);

  const updateAnswer = (questionId: string, patch: Partial<AnswerRecord>) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId]!, ...patch },
    }));
  };

  const handleSelect = (label: SelectedOption) => {
    if (!currentQuestion || locked) return;
    const alreadySelected = answers[currentQuestion.id]?.selectedLabel === label;
    if (!alreadySelected) playSound('select', timerSound);
    updateAnswer(currentQuestion.id, { selectedLabel: alreadySelected ? null : label });
  };

  const goTo = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    setCurrentIndex(index);
    setActiveModal(null);
  };

  const getQuestionStatus = (qId: string) => {
    const a = answers[qId];
    if (a?.isFlagged) return { color: theme.color.error };
    if (a?.isBookmarked) return { color: theme.color.accent };
    if (a?.selectedLabel) return { color: theme.color.success };
    return { color: theme.color.textMuted };
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.color.background,
        }}
      >
        <Loading message={t('contests.quizScreen.loading')} />
      </View>
    );
  }

  if (loadError || !session || !currentQuestion || !currentAnswer) {
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
          {loadError ?? t('contests.quizScreen.load_error')}
        </Text>

        <TouchableOpacity
          onPress={() => router.replace(modeConfig.backCta.route as any)}
          style={{
            marginTop: theme.space.sm,
            paddingVertical: theme.space.sm,
            paddingHorizontal: theme.space.lg,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.accent,
          }}
        >
          <Text
            style={{
              fontFamily: theme.fontFamily.bold,
              color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
            }}
          >
            {t(modeConfig.backCta.labelKey)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayTitle = params.title || session.subject || currentQuestion.subject || t('common.quizzes');
  const timerColor = expired || isLowTime ? theme.color.error : theme.color.info;
  const isLast = currentIndex === questions.length - 1;


  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <View
        style={{
          gap: theme.space.sm,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: theme.space.sm,
          paddingBottom: theme.space.md,
          paddingHorizontal: theme.space.md,
        }}
      >
        <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            hitSlop={10}
            onPress={requestExit}
            accessibilityRole='button'
            accessibilityLabel={t('contests.quizScreen.close_quiz')}
            style={{
              padding: theme.space.xs,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.surface,
            }}
          >
            <Feather name='x' size={theme.fontSize.lg} color={theme.color.textSecondary} />
          </TouchableOpacity>

          <Animated.View
            style={{
              gap: theme.space.xs,
              flexDirection: 'row',
              alignItems: 'center',
              opacity: pulse,
            }}
          >
            <Feather name='clock' size={theme.fontSize.md} color={timerColor} />
            <Text
              style={{
                color: timerColor,
                fontSize: theme.fontSize.lg,
                fontFamily: theme.fontFamily.numberBold,
              }}
            >
              {hasTimer ? formatCountdown(expired ? 0 : timeLeft) : t('contests.quizScreen.untimed')}
            </Text>
          </Animated.View>
        </View>

        <View
          style={{
            flexShrink: 1,
            gap: theme.space.xs,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.space.xs,
            paddingHorizontal: theme.space.md,
            borderWidth: 1,
            borderRadius: theme.borderRadius.full,
            borderColor: theme.color[modeConfig.accentToken] + '55',
            backgroundColor: theme.color[modeConfig.accentToken] + '22',
          }}
        >
          <Feather name={modeConfig.icon} size={theme.fontSize.sm} color={theme.color[modeConfig.accentToken]} />
          <Text
            numberOfLines={1}
            style={{
              flexShrink: 1,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.bold,
              color: theme.color[modeConfig.accentToken],
              lineHeight: theme.fontSize.sm * 1.25,
            }}
          >
            {displayTitle}
          </Text>
        </View>
      </View>

      <View style={{ paddingBottom: theme.space.sm, paddingHorizontal: theme.space.md }}>
        <QuizProgressBar current={currentIndex + 1} total={questions.length} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: theme.space.md,
          padding: theme.space.md,
          paddingBottom: insets.bottom,
        }}
      >
        <QuestionCard
          difficulty={currentQuestion.difficulty}
          question={currentQuestion.question}
          isBookmarked={currentAnswer.isBookmarked}
          isFlagged={currentAnswer.isFlagged}
          onBookmark={() => updateAnswer(currentQuestion.id, { isBookmarked: !currentAnswer.isBookmarked })}
          onFlag={() => updateAnswer(currentQuestion.id, { isFlagged: !currentAnswer.isFlagged })}
        />

        {currentQuestion.image && (
          <View
            style={{
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.xl,
              backgroundColor: theme.color.surface,
            }}
          >
            <Image
              resizeMode='contain'
              source={{ uri: currentQuestion.image }}
              style={{ width: '100%', height: 220 }}
            />

            <View
              style={{
                position: 'absolute',
                bottom: theme.space.sm,
                right: theme.space.sm,
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.xs * 0.5,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: theme.color.textPrimary + '99',
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.xs,
                  color: theme.color.background,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {t('contests.quizScreen.figure_label')}
              </Text>
            </View>
          </View>
        )}

        <View style={{ gap: theme.space.sm }}>
          {currentQuestion.options.map((option) => {
            const selected = currentAnswer.selectedLabel === option.label;
            return (
              <TouchableOpacity
                key={option.label}
                disabled={locked}
                onPress={() => handleSelect(option.label as SelectedOption)}
                activeOpacity={0.75}
                accessibilityRole='button'
                accessibilityState={{ selected, disabled: locked }}
                style={{
                  gap: theme.space.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: theme.space.md,
                  borderWidth: 2,
                  borderRadius: theme.borderRadius.xl,
                  borderColor: selected ? theme.color.accent : theme.color.border,
                  backgroundColor: selected ? theme.color.accent + '18' : theme.color.card,
                  opacity: locked && !selected ? 0.6 : 1,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: theme.borderRadius.lg,
                    backgroundColor: selected ? theme.color.accent : theme.color.surface,
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.fontSize.sm,
                      fontFamily: theme.fontFamily.bold,
                      color: selected
                        ? theme.isDark ? theme.color.textPrimary : theme.color.textInverse
                        : theme.color.textSecondary,
                    }}
                  >
                    {option.label}
                  </Text>
                </View>

                <Text
                  style={{
                    flex: 1,
                    fontSize: theme.fontSize.md,
                    color: selected ? theme.color.accent : theme.color.textPrimary,
                    fontFamily: selected ? theme.fontFamily.bold : theme.fontFamily.regular,
                  }}
                >
                  {option.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {submitError && (
          <View
            accessibilityRole='alert'
            style={{
              gap: theme.space.sm,
              flexDirection: 'row',
              alignItems: 'center',
              padding: theme.space.sm,
              borderWidth: 1,
              borderColor: theme.color.error + '55',
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.error + '12',
            }}
          >
            <Feather name='alert-circle' size={theme.fontSize.md} color={theme.color.error} />
            <Text
              style={{
                flex: 1,
                color: theme.color.error,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {submitError}
            </Text>

            <TouchableOpacity onPress={submitQuiz} hitSlop={8}>
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
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          gap: theme.space.sm,
          flexDirection: 'row',
          padding: theme.space.md,
          paddingBottom: theme.space.md + insets.bottom,
          borderTopWidth: 1,
          borderTopColor: theme.color.border,
          backgroundColor: theme.color.background,
        }}
      >
        <TouchableOpacity
          onPress={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
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
            opacity: currentIndex === 0 ? 0.4 : 1,
          }}
        >
          <Feather name='chevron-left' size={theme.fontSize.md} color={theme.color.textPrimary} />
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              color: theme.color.textPrimary,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {t('common.prev')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveModal('summary')}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.sm * 1.5,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.card,
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              color: theme.color.textPrimary,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {t('common.review')}
          </Text>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity
            onPress={() => setActiveModal('submit')}
            disabled={submitting}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.sm * 1.5,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.accent,
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator
                size='small'
                color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
              />
            ) : (
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.bold,
                  color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                }}
              >
                {t('contests.quizScreen.finish')}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => goTo(currentIndex + 1)}
            style={{
              flex: 1,
              gap: theme.space.xs,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.sm * 1.5,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.accent,
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.bold,
                color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
              }}
            >
              {t('common.next')}
            </Text>
            <Feather
              name='chevron-right'
              size={theme.fontSize.md}
              color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
            />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={activeModal === 'summary'}
        transparent
        animationType='slide'
        statusBarTranslucent={true}
        navigationBarTranslucent={true}
        onRequestClose={() => setActiveModal(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setActiveModal(null)}
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '75%',
            gap: theme.space.md,
            padding: theme.space.lg,
            paddingBottom: theme.space.lg + insets.bottom,
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
              {t('common.review')}
            </Text>

            <TouchableOpacity onPress={() => setActiveModal(null)} hitSlop={8}>
              <Feather name='x' size={theme.fontSize.xl} color={theme.color.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={{ gap: theme.space.md, flexDirection: 'row' }}>
            {[
              {
                label: t('contests.quizScreen.answered'),
                value: stats.answered,
                color: theme.color.success,
              },
              {
                label: t('contests.quizScreen.skipped'),
                value: stats.unanswered,
                color: theme.color.textMuted,
              },
              {
                label: t('contests.quizScreen.flagged'),
                value: stats.flagged,
                color: theme.color.error,
              },
              {
                label: t('contests.quizScreen.saved'),
                value: stats.saved,
                color: theme.color.accent,
              },
            ].map((stat) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  gap: theme.space.xs * 0.5,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: stat.color,
                    fontSize: theme.fontSize.lg,
                    fontFamily: theme.fontFamily.numberBold,
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    fontSize: theme.fontSize.xs,
                    color: theme.color.textMuted,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ flexWrap: 'wrap', gap: theme.space.sm, flexDirection: 'row' }}>
              {questions.map((q, idx) => {
                const status = getQuestionStatus(q.id);
                const isCurrent = idx === currentIndex;
                return (
                  <TouchableOpacity
                    key={q.id}
                    onPress={() => goTo(idx)}
                    style={{
                      width: 44,
                      height: 44,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: isCurrent ? 2 : 1,
                      borderRadius: theme.borderRadius.md,
                      borderColor: isCurrent ? theme.color.accent : status.color + '55',
                      backgroundColor: status.color + '18',
                    }}
                  >
                    <Text
                      style={{
                        color: status.color,
                        fontSize: theme.fontSize.sm,
                        fontFamily: theme.fontFamily.numberBold,
                      }}
                    >
                      {idx + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </Modal>

      <DialogModal
        visible={activeModal === 'submit'}
        icon='check-circle'
        tone={theme.color.accent}
        title={t('contests.quizScreen.submit_title')}
        body={t('contests.quizScreen.submit_body', { answered: stats.answered, total: questions.length })}
        extra={
          stats.unanswered > 0 || stats.flagged > 0 ? (
            <View style={{ gap: theme.space.xs, alignSelf: 'stretch' }}>
              {stats.unanswered > 0 && (
                <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name='minus-circle' size={theme.fontSize.sm} color={theme.color.warning} />
                  <Text
                    style={{
                      flex: 1,
                      color: theme.color.warning,
                      fontSize: theme.fontSize.sm,
                      fontFamily: theme.fontFamily.regular,
                    }}
                  >
                    {t('contests.quizScreen.submit_unanswered', { count: stats.unanswered })}
                  </Text>
                </View>
              )}

              {stats.flagged > 0 && (
                <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name='flag' size={theme.fontSize.sm} color={theme.color.error} />
                  <Text
                    style={{
                      flex: 1,
                      color: theme.color.error,
                      fontSize: theme.fontSize.sm,
                      fontFamily: theme.fontFamily.regular,
                    }}
                  >
                    {t('contests.quizScreen.submit_flagged', { count: stats.flagged })}
                  </Text>
                </View>
              )}
            </View>
          ) : null
        }
        primaryLabel={t('contests.quizScreen.submit_confirm')}
        onPrimary={submitQuiz}
        secondaryLabel={t('contests.quizScreen.submit_review')}
        onSecondary={() => setActiveModal('summary')}
        onRequestClose={() => setActiveModal(null)}
      />

      <DialogModal
        visible={activeModal === 'exit'}
        icon='log-out'
        tone={theme.color.error}
        title={t('contests.quizScreen.exit_title')}
        body={t('contests.quizScreen.exit_body')}
        primaryLabel={t('contests.quizScreen.exit_leave')}
        onPrimary={confirmExit}
        secondaryLabel={t('contests.quizScreen.exit_stay')}
        onSecondary={() => {
          pendingExitActionRef.current = null;
          setActiveModal(null);
        }}
        onRequestClose={() => {
          pendingExitActionRef.current = null;
          setActiveModal(null);
        }}
      />

      <DialogModal
        visible={activeModal === 'timeUp'}
        icon='clock'
        tone={theme.color.warning}
        title={t('contests.quizScreen.times_up_title')}
        body={t('contests.quizScreen.times_up_body_soft')}
        primaryLabel={t('contests.quizScreen.times_up_submit')}
        onPrimary={submitQuiz}
        secondaryLabel={t('contests.quizScreen.times_up_continue')}
        onSecondary={() => setActiveModal(null)}
      />

      {submitting && expired && modeConfig.hardTimerStop && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            gap: theme.space.sm,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.color.background + 'E6',
            pointerEvents: 'none',
          }}
        >
          <Feather name='clock' size={theme.space.xl} color={theme.color.warning} />
          <Text
            style={{
              fontSize: theme.fontSize.xl,
              color: theme.color.textPrimary,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {t('contests.quizScreen.times_up_title')}
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize.md,
              color: theme.color.textSecondary,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {t('contests.quizScreen.times_up_body_hard')}
          </Text>
        </View>
      )}
    </View>
  );
}
