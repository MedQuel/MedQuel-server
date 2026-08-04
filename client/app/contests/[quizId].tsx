import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { QuizProgressBar } from '../../components/QuizProgressBar';
import { QuestionCard } from '../../components/QuestionCard';
import { api } from '../../common/api/api';
import { normalizeError } from '../../common/api/api.errors';
import { Loading } from '../../components/common/loading';
import type { ClientQuestion, QuizQuestion, ModalType, AnswerRecord, SubmittedAnswer, SelectedOption } from '../../common/types/types';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function mapClientQuestion(q: ClientQuestion): QuizQuestion {
  return {
    id: q.questionId,
    subject: q.subject,
    question: q.questionText,
    image: q.imageUrl ?? undefined,
    options: [
      { label: 'A', text: q.optionA },
      { label: 'B', text: q.optionB },
      { label: 'C', text: q.optionC },
      { label: 'D', text: q.optionD },
    ],
    points: q.marks,
  };
}

type QuizTimerProps = {
  totalSeconds: number;
  paused: boolean;
  currentQuestionId?: string;
  timeSpentRef: React.MutableRefObject<Record<string, number>>;
  onExpire: () => void;
  color: string;
  fontSize: number;
  fontWeight: any;
  fontFamily: string;
};

function QuizTimer({ totalSeconds, paused, currentQuestionId, timeSpentRef, onExpire, color, fontSize, fontWeight, fontFamily }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  const questionIdRef = useRef(currentQuestionId);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    questionIdRef.current = currentQuestionId;
  }, [currentQuestionId]);

  useEffect(() => {
    setTimeLeft(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (paused) return;

    intervalRef.current = setInterval(() => {
      const qId = questionIdRef.current;
      if (qId) {
        timeSpentRef.current[qId] = (timeSpentRef.current[qId] ?? 0) + 1;
      }
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onExpireRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [paused, timeSpentRef]);

  return <Text style={{ color, fontSize, fontWeight, fontFamily }}>{formatTime(timeLeft)}</Text>;
}

export default function QuizScreen() {
  const params = useLocalSearchParams<{ quizId: string; practice?: string; totalQuestions?: string }>();
  const { theme } = useTheme();
  useBottomBar(false);
  const router = useRouter();
  const t = (key: string, opts?: Record<string, unknown>) => theme.i18n.t(key, opts);

  const quizId = params.quizId;
  const isPractice = params.practice === '1';

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [sessionTimeLimitSecs, setSessionTimeLimitSecs] = useState(0);
  const timeSpentRef = useRef<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      setLoading(true);
      setLoadError(null);
      try {
        const session = await api.contest.joinContest(quizId);
        if (cancelled) return;

        const mapped = session.questions.map(mapClientQuestion);
        setSessionId(session.sessionId);
        setSessionTimeLimitSecs(session.timeLimitSecs);
        setQuestions(mapped);
        setAnswers(
          Object.fromEntries(
            mapped.map((q) => [q.id, { questionId: q.id, selectedLabel: null, isBookmarked: false, isFlagged: false }])
          )
        );
      } catch (err) {
        if (cancelled) return;
        const apiErr = normalizeError(err);
        console.log('[quiz] session load failed:', apiErr);
        setLoadError(apiErr.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSession();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  const handleFinish = useCallback(async () => {
    if (submitting || !sessionId) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const answerInputs: SubmittedAnswer[] = Object.values(answers).map((a) => ({
        questionId: a.questionId,
        selected: (a.selectedLabel ?? 'SKIPPED') as SelectedOption,
        timeSpent: timeSpentRef.current[a.questionId] ?? 0,
      }));
      const result = await api.quiz.submitQuizSession({ sessionId, answers: answerInputs });

      router.push({
        pathname: '/contests/postQuizScreen',
        params: {
          title: currentQuestion?.subject ?? t('contests.postQuizScreen.default_title'),
          questions: JSON.stringify(
            questions.map((q) => ({ id: q.id, subject: q.subject, question: q.question, options: q.options }))
          ),
          submission: JSON.stringify(result),
          practice: isPractice ? '1' : '0',
          contestId: quizId,
        },
      });
    } catch (err) {
      const apiErr = normalizeError(err);
      console.log('[quiz] submit failed:', apiErr);
      setSubmitError(apiErr.message);
      setSubmitting(false);
    }
  }, [answers, currentQuestion?.subject, isPractice, questions, quizId, router, sessionId, submitting, t]);

  const updateAnswer = (questionId: string, patch: Partial<AnswerRecord>) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId]!, ...patch } }));
  };

  const handleSelect = (label: SelectedOption) => {
    if (!currentQuestion) return;
    updateAnswer(currentQuestion.id, { selectedLabel: label });
  };

  const goTo = (index: number) => {
    setCurrentIndex(index);
    setActiveModal(null);
  };

  const answeredCount = Object.values(answers).filter((a) => a.selectedLabel !== null).length;
  const skippedCount = questions.length - answeredCount;
  const bookmarkedQuestions = questions.filter((q) => answers[q.id]?.isBookmarked);
  const flaggedQuestions = questions.filter((q) => answers[q.id]?.isFlagged);

  const getQuestionStatus = (qId: string) => {
    const a = answers[qId];
    if (a?.isFlagged) return { icon: 'flag' as const, color: theme.color.error };
    if (a?.isBookmarked) return { icon: 'bookmark' as const, color: theme.color.accent };
    if (a?.selectedLabel !== null && a?.selectedLabel !== undefined) return { icon: 'check' as const, color: theme.color.success };
    return { icon: 'minus' as const, color: theme.color.textMuted };
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background, justifyContent: 'center', alignItems: 'center' }}>
        <Loading message={t('contests.quizScreen.loading')} />
      </View>
    );
  }

  if (loadError || !currentQuestion || !currentAnswer) {
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
          {loadError ?? t('contests.quizScreen.load_error')}
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

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: theme.space.md,
          paddingBottom: theme.space.sm,
          paddingHorizontal: theme.space.md,
        }}
      >
        <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="clock" size={theme.fontSize.md} color={theme.color.info} />
          <QuizTimer
            totalSeconds={sessionTimeLimitSecs}
            paused={activeModal !== null || submitting}
            currentQuestionId={currentQuestion.id}
            timeSpentRef={timeSpentRef}
            onExpire={handleFinish}
            color={theme.color.info}
            fontSize={theme.fontSize.lg}
            fontWeight={theme.fontWeight.bold}
            fontFamily={theme.fontFamily.number}
          />
        </View>

        <View
          style={{
            paddingVertical: theme.space.xs,
            paddingHorizontal: theme.space.md,
            borderWidth: 1,
            borderRadius: theme.borderRadius.full,
            borderColor: isPractice ? theme.color.info + '55' : theme.color.warning + '55',
            backgroundColor: isPractice ? theme.color.info + '22' : theme.color.warning + '22',
          }}
        >
          <Text
            style={{
              color: isPractice ? theme.color.info : theme.color.warning,
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {isPractice
              ? t('contests.quizScreen.practice_mode')
              : t('contests.quizScreen.answered_count', { answered: answeredCount, total: questions.length })}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: theme.space.md, paddingBottom: theme.space.sm }}>
        <QuizProgressBar current={currentIndex + 1} total={questions.length} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: theme.space.md, gap: theme.space.md, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <QuestionCard
          subject={currentQuestion.subject}
          question={currentQuestion.question}
          isBookmarked={currentAnswer.isBookmarked}
          isFlagged={currentAnswer.isFlagged}
          onBookmark={() => updateAnswer(currentQuestion.id, { isBookmarked: !currentAnswer.isBookmarked })}
          onFlag={() => updateAnswer(currentQuestion.id, { isFlagged: !currentAnswer.isFlagged })}
        />

        {currentQuestion.image && (
          <View style={{ overflow: 'hidden', borderWidth: 1, borderColor: theme.color.border, borderRadius: theme.borderRadius.xl }}>
            <Image resizeMode="cover" source={{ uri: currentQuestion.image }} style={{ width: '100%', height: 200 }} />
            <View
              style={{
                position: 'absolute',
                bottom: theme.space.sm,
                right: theme.space.sm,
                paddingHorizontal: theme.space.sm,
                paddingVertical: 2,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: theme.color.textPrimary + '99',
              }}
            >
              <Text style={{ color: theme.color.background, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>
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
                onPress={() => handleSelect(option.label)}
                activeOpacity={0.75}
                style={{
                  gap: theme.space.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: theme.space.md,
                  borderWidth: 2,
                  borderRadius: theme.borderRadius.xl,
                  borderColor: selected ? theme.color.accent : theme.color.border,
                  backgroundColor: selected ? theme.color.accent + '18' : theme.color.card,
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
                      color: selected ? theme.color.textInverse : theme.color.textSecondary,
                      fontSize: theme.fontSize.sm,
                      fontWeight: theme.fontWeight.bold,
                      fontFamily: theme.fontFamily.regular,
                    }}
                  >
                    {option.label}
                  </Text>
                </View>
                <Text
                  style={{
                    flex: 1,
                    color: selected ? theme.color.accent : theme.color.textPrimary,
                    fontSize: theme.fontSize.md,
                    fontWeight: selected ? theme.fontWeight.bold : theme.fontWeight.regular,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {option.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {submitError && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
            <Feather name="alert-circle" size={theme.fontSize.md} color={theme.color.error} />
            <Text style={{ flex: 1, color: theme.color.error, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>{submitError}</Text>
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
          backgroundColor: theme.color.background,
          borderTopWidth: 1,
          borderTopColor: theme.color.border,
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
          <Feather name="chevron-left" size={theme.fontSize.md} color={theme.color.textSecondary} />
          <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
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
          <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
            {t('common.review')}
          </Text>
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity
            onPress={handleFinish}
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
              <ActivityIndicator size="small" color={theme.color.textInverse} />
            ) : (
              <Text style={{ color: theme.color.textInverse, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold as any, fontFamily: theme.fontFamily.regular }}>
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
            <Text style={{ color: theme.color.textInverse, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold as any, fontFamily: theme.fontFamily.regular }}>
              {t('common.next')}
            </Text>
            <Feather name="chevron-right" size={theme.fontSize.md} color={theme.color.textInverse} />
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={activeModal === 'summary'} transparent animationType="slide">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setActiveModal(null)}
          style={{ flex: 1, backgroundColor: theme.color.textPrimary + '80' }}
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
            borderTopLeftRadius: theme.borderRadius.xl + 4,
            borderTopRightRadius: theme.borderRadius.xl + 4,
            backgroundColor: theme.color.card,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.regular }}>
              {t('common.review')}
            </Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Feather name="x" size={theme.fontSize.xl} color={theme.color.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.space.md }}>
            {[
              { label: t('contests.quizScreen.answered'), value: answeredCount, color: theme.color.success },
              { label: t('contests.quizScreen.skipped'), value: skippedCount, color: theme.color.textMuted },
              { label: t('contests.quizScreen.flagged'), value: flaggedQuestions.length, color: theme.color.error },
              { label: t('contests.quizScreen.saved'), value: bookmarkedQuestions.length, color: theme.color.accent },
            ].map((stat) => (
              <View key={stat.label} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
                <Text style={{ color: stat.color, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold as any, fontFamily: theme.fontFamily.number }}>
                  {stat.value}
                </Text>
                <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}>
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
                    <Text style={{ color: status.color, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.number }}>
                      {idx + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ gap: theme.space.md, flexWrap: 'wrap', flexDirection: 'row', marginTop: theme.space.lg }}>
              {[
                { icon: 'check' as const, color: theme.color.success, label: t('contests.quizScreen.answered') },
                { icon: 'minus' as const, color: theme.color.textMuted, label: t('contests.quizScreen.skipped') },
                { icon: 'flag' as const, color: theme.color.error, label: t('contests.quizScreen.flagged') },
                { icon: 'bookmark' as const, color: theme.color.accent, label: t('contests.quizScreen.saved') },
              ].map((item) => (
                <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
                  <Feather name={item.icon} size={theme.fontSize.sm} color={item.color} />
                  <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>{item.label}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={handleFinish}
            disabled={submitting}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.md,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.accent,
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={theme.color.textInverse} />
            ) : (
              <Text style={{ color: theme.color.textInverse, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold as any, fontFamily: theme.fontFamily.regular }}>
                {t('contests.quizScreen.submit_quiz')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}