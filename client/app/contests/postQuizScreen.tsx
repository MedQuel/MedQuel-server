import { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useTheme } from '../../theme/ThemeContext';
import { QuizResultCard } from '../../components/QuizResultCard';
import { AchievementBadgeCard } from '../../components/AchievementBadgeCard';
import { TopicPerfomanceCard } from '../../components/TopicPerfomanceCard';

export type MCQOption = { label: string; text: string; isCorrect: boolean };

export type QuizQuestion = {
  id: string; subject: string; question: string; image?: string;
  options: MCQOption[]; explanation: string; points: number;
};

export type QuizData = {
  id: string; title: string; totalQuestions: number; durationMinutes: number;
  epReward: number; pointsPerCorrect: number; pointsPerWrong: number;
  questions: QuizQuestion[];
};

export const quizMockData: QuizData = {
  id: 'cardiology-sprint-001',
  title: 'Cardiology Sprint',
  totalQuestions: 7,
  durationMinutes: 45,
  epReward: 120,
  pointsPerCorrect: 4,
  pointsPerWrong: -1,
  questions: [
    {
      id: 'q1',
      subject: 'Cardiology',
      question: 'A 45-year-old male presents with sudden onset chest pain radiating to the left arm. He has a history of hypertension and smoking. What is the most likely diagnosis?',
      options: [
        { label: 'A', text: 'Pneumothorax',          isCorrect: false },
        { label: 'B', text: 'Myocardial Infarction', isCorrect: true  },
        { label: 'C', text: 'Pulmonary Embolism',    isCorrect: false },
        { label: 'D', text: 'Aortic Dissection',     isCorrect: false },
      ],
      explanation: 'Classic STEMI presentation with ST-elevation and troponin rise. Door-to-balloon <90 min is key.',
      points: 4,
    },
    {
      id: 'q2',
      subject: 'Cardiology',
      question: 'Which ECG finding is most characteristic of hyperkalemia?',
      image: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Hyperkalemia_peaked_T_waves.png',
      options: [
        { label: 'A', text: 'Prolonged QT interval', isCorrect: false },
        { label: 'B', text: 'Delta waves',            isCorrect: false },
        { label: 'C', text: 'Peaked T waves',         isCorrect: true  },
        { label: 'D', text: 'Osborn J waves',         isCorrect: false },
      ],
      explanation: 'Hyperkalemia classically presents with tall, peaked T waves on ECG, progressing to a sine wave pattern in severe cases.',
      points: 4,
    },
    {
      id: 'q3',
      subject: 'Cardiology',
      question: 'A patient presents with syncope, exertional dyspnea, and a systolic ejection murmur. What is the most likely diagnosis?',
      options: [
        { label: 'A', text: 'Mitral Regurgitation',   isCorrect: false },
        { label: 'B', text: 'Aortic Stenosis',        isCorrect: true  },
        { label: 'C', text: 'Tricuspid Stenosis',     isCorrect: false },
        { label: 'D', text: 'Pulmonary Hypertension', isCorrect: false },
      ],
      explanation: 'The classic triad of aortic stenosis is syncope, angina, and heart failure. The systolic ejection murmur radiates to the carotids.',
      points: 4,
    },
    {
      id: 'q4',
      subject: 'Cardiology',
      question: 'Analyze the provided rhythm strip from a patient who suddenly collapsed. What is the immediate recommended management?',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Ventricular_fibrillation.png',
      options: [
        { label: 'A', text: 'Synchronized cardioversion',    isCorrect: false },
        { label: 'B', text: 'Unsynchronized defibrillation', isCorrect: true  },
        { label: 'C', text: 'Intravenous amiodarone bolus',  isCorrect: false },
        { label: 'D', text: 'Carotid sinus massage',         isCorrect: false },
      ],
      explanation: 'The strip shows Ventricular Fibrillation (VF). VF and pulseless VT require immediate unsynchronized defibrillation alongside continuous CPR.',
      points: 4,
    },
    {
      id: 'q5',
      subject: 'Cardiology',
      question: 'A 29-year-old female presents with fatigue and a mid-systolic click followed by a late systolic murmur. What structural abnormality is most likely present?',
      image: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Mitral_valve_prolapse_scheme.jpg',
      options: [
        { label: 'A', text: 'Mitral Valve Prolapse',      isCorrect: true  },
        { label: 'B', text: 'Aortic Regurgitation',       isCorrect: false },
        { label: 'C', text: 'Ventricular Septal Defect',  isCorrect: false },
        { label: 'D', text: 'Bicuspid Aortic Valve',      isCorrect: false },
      ],
      explanation: 'MVP classically presents with a mid-systolic click followed by a late systolic murmur, caused by billowing of leaflets into the left atrium.',
      points: 4,
    },
    {
      id: 'q6',
      subject: 'Cardiology',
      question: 'Which medication is absolutely contraindicated in acute right ventricular myocardial infarction?',
      options: [
        { label: 'A', text: 'Aspirin',       isCorrect: false },
        { label: 'B', text: 'Nitroglycerin', isCorrect: true  },
        { label: 'C', text: 'Heparin',       isCorrect: false },
        { label: 'D', text: 'Clopidogrel',   isCorrect: false },
      ],
      explanation: 'RV infarctions are preload-dependent. Nitroglycerin reduces preload causing profound hypotension.',
      points: 4,
    },
    {
      id: 'q7',
      subject: 'Cardiology',
      question: 'A 60-year-old male presents with worsening dyspnea. His chest X-ray shows a "bat-wing" opacity. What is the underlying pathology?',
      image: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Pulmonary_oedema.jpg',
      options: [
        { label: 'A', text: 'Lobar Pneumonia',       isCorrect: false },
        { label: 'B', text: 'Acute Pulmonary Edema', isCorrect: true  },
        { label: 'C', text: 'Idiopathic Fibrosis',   isCorrect: false },
        { label: 'D', text: 'Bilateral Pneumothorax',isCorrect: false },
      ],
      explanation: 'Bilateral perihilar "bat-wing" infiltrates on CXR is a classic sign of acute alveolar pulmonary edema.',
      points: 4,
    },
  ],
};

export type ReviewItem = {
  id: string; index: number; question: string; isCorrect: boolean;
  isSkipped: boolean; selectedLabel: string | null; selectedText: string | null;
  correctLabel: string; correctText: string; explanation: string;
};

export type StatBox = {
  key: 'correct' | 'wrong' | 'time' | 'rank';
  icon: 'check' | 'x' | 'clock' | 'trending-up';
  value: string; labelKey: string; colorToken: 'success' | 'error' | 'textPrimary' | 'accent';
};

export type QuizResultData = {
  title: string; totalQuestions: number; scorePercent: number; epEarned: number;
  rank: number; formattedTime: string; percentileMessage: string; showBadge: boolean;
  badge: { label: string; title: string; subtitle: string } | null;
  weakTopics: { name: string; score: number }[];
  statBoxes: StatBox[]; reviewItems: ReviewItem[];
  reviewSummary: { correct: number; wrong: number; skipped: number };
  isPractice: boolean;
};

type RawQuizSubmission = {
  quizId?: string; title?: string; total?: number; correct: number; wrong: number;
  skipped: number; timeTaken: number; epEarned: number; isPractice?: boolean;
  answers: Record<string, { selectedLabel: string | null; isCorrect: boolean }>;
};

function getQuizResult(raw: RawQuizSubmission): QuizResultData {
  const total = raw.total ?? quizMockData.totalQuestions;
  const scorePercent = Math.round((raw.correct / total) * 100);
  const isPractice = raw.isPractice ?? false;
  const epEarned = isPractice ? 0 : raw.epEarned;
  const showBadge = !isPractice && scorePercent >= 80;
  const rank = 42;

  const reviewItems: ReviewItem[] = quizMockData.questions.map((q, idx) => {
    const answer = raw.answers[q.id];
    const correctOption = q.options.find(o => o.isCorrect)!;
    const selectedOption = q.options.find(o => o.label === answer?.selectedLabel);
    return {
      id: q.id, index: idx + 1, question: q.question, isCorrect: answer?.isCorrect ?? false,
      isSkipped: answer?.selectedLabel === null, selectedLabel: answer?.selectedLabel ?? null,
      selectedText: selectedOption?.text ?? null, correctLabel: correctOption.label,
      correctText: correctOption.text, explanation: q.explanation,
    };
  });

  return {
    title: raw.title ?? quizMockData.title,
    totalQuestions: total, scorePercent, epEarned, rank,
    formattedTime: `${Math.floor(raw.timeTaken / 60)}m ${raw.timeTaken % 60}s`,
    percentileMessage: scorePercent >= 80 ? 'Better than 78% of all participants' : 'Keep practicing!',
    showBadge,
    badge: showBadge ? { label: 'NEW BADGE', title: 'Cardiology Champion', subtitle: 'Scored 80%+ in Cardiology' } : null,
    weakTopics: [
      { name: 'Arrhythmias', score: 60 },
      { name: 'Valve Disorders', score: 40 },
      { name: 'Pericarditis', score: 50 },
    ],
    statBoxes: [
      { key: 'correct', icon: 'check', value: String(raw.correct), labelKey: 'components.PostQuizScreen.correct', colorToken: 'success' },
      { key: 'wrong', icon: 'x', value: String(raw.wrong), labelKey: 'components.PostQuizScreen.wrong', colorToken: 'error' },
      { key: 'time', icon: 'clock', value: `${Math.floor(raw.timeTaken / 60)}m`, labelKey: 'components.PostQuizScreen.time', colorToken: 'textPrimary' },
      { key: 'rank', icon: 'trending-up', value: `#${rank}`, labelKey: 'components.PostQuizScreen.rank', colorToken: 'accent' },
    ],
    reviewItems,
    reviewSummary: { correct: raw.correct, wrong: raw.wrong, skipped: raw.skipped },
    isPractice,
  };
}

export default function PostQuizScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showReview, setShowReview] = useState(false);

  const result = getQuizResult({
    quizId: params.quizId as string,
    title: params.title as string,
    total: Number(params.total),
    correct: Number(params.correct) || 0,
    wrong: Number(params.wrong) || 0,
    skipped: Number(params.skipped) || 0,
    timeTaken: Number(params.timeTaken) || 0,
    epEarned: Number(params.epEarned) || 0,
    isPractice: params.practice === '1',
    answers: params.answers ? JSON.parse(String(params.answers)) : {},
  });

  const cardBg   = theme.isDark ? theme.color.card : theme.color.accent;
  const subText  = theme.isDark ? theme.color.textSecondary : 'rgba(255,255,255,0.75)';
  const epBg     = theme.isDark ? theme.color.warning + '22' : 'rgba(255,255,255,0.18)';
  const epBorder = theme.isDark ? theme.color.warning : 'rgba(255,255,255,0.40)';
  const epColor  = theme.isDark ? theme.color.warning : '#FFFFFF';

  const colorFor = (token: string) => {
    if (token === 'success') return theme.color.success;
    if (token === 'error') return theme.color.error;
    if (token === 'accent') return theme.color.accent;
    return theme.color.textPrimary;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        <View
          style={{
            backgroundColor: cardBg,
            padding: theme.space.xl,
            alignItems: 'center',
            gap: theme.space.lg,
            overflow: 'hidden',
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute', top: -60, right: -60,
              width: 180, height: 180, borderRadius: theme.borderRadius.full,
              backgroundColor: theme.isDark ? theme.color.accent + '18' : 'rgba(255,255,255,0.12)',
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute', bottom: -40, left: -40,
              width: 130, height: 130, borderRadius: theme.borderRadius.full,
              backgroundColor: theme.isDark ? theme.color.accent + '10' : 'rgba(255,255,255,0.08)',
            }}
          />

          <View style={{ alignItems: 'center', gap: theme.space.xs }}>
            <Text style={{ color: '#FFFFFF', fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold as any, fontFamily: theme.fontFamily.regular }}>
              {theme.i18n.t('components.PostQuizScreen.quiz_complete')}
            </Text>
            <Text style={{ color: subText, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.light }}>
              {`${result.title} · ${result.totalQuestions} ${theme.i18n.t('contests.questions')}`}
            </Text>
          </View>

          <QuizResultCard scorePercent={result.scorePercent} />

          <View
            style={{
              flexDirection: 'row', alignItems: 'center', gap: theme.space.sm,
              paddingHorizontal: theme.space.xl, paddingVertical: theme.space.sm + 2,
              borderRadius: theme.borderRadius.full, borderWidth: 1.5,
              borderColor: epBorder, backgroundColor: epBg,
            }}
          >
            <Feather name={result.isPractice ? 'book-open' : 'zap'} size={theme.fontSize.lg} color={epColor} />
            <Text style={{ color: epColor, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold as any, fontFamily: theme.fontFamily.number }}>
              {result.isPractice
                ? theme.i18n.t('components.PostQuizScreen.practice_mode')
                : `+${result.epEarned} ${theme.i18n.t('components.PostQuizScreen.ep_earned')}`}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row', gap: theme.space.sm,
            paddingHorizontal: theme.space.md, paddingTop: theme.space.md,
          }}
        >
          {result.statBoxes.map((stat) => (
            <View
              key={stat.key}
              style={{
                flex: 1, alignItems: 'center', gap: theme.space.xs,
                paddingVertical: theme.space.md,
                borderRadius: theme.borderRadius.xl,
                borderWidth: 1, borderColor: theme.color.border,
                backgroundColor: theme.color.card,
              }}
            >
              <Feather name={stat.icon} size={theme.fontSize.md} color={colorFor(stat.colorToken)} />
              <Text style={{ color: colorFor(stat.colorToken), fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold as any, fontFamily: theme.fontFamily.number }}>
                {stat.value}
              </Text>
              <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.light }}>
                {theme.i18n.t(stat.labelKey)}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            marginHorizontal: theme.space.md, marginTop: theme.space.md,
            flexDirection: 'row', alignItems: 'center', gap: theme.space.sm,
            padding: theme.space.md,
            borderRadius: theme.borderRadius.xl,
            borderWidth: 1, borderColor: theme.color.success + '44',
            backgroundColor: theme.color.success + '12',
          }}
        >
          <Feather name="trending-up" size={theme.fontSize.md} color={theme.color.success} />
          <Text style={{ color: theme.color.success, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold as any }}>
            {result.percentileMessage}
          </Text>
        </View>

        <View style={{ paddingHorizontal: theme.space.md, paddingTop: theme.space.md, gap: theme.space.md }}>
          {result.showBadge && result.badge && (
            <AchievementBadgeCard
              label={result.badge.label}
              title={result.badge.title}
              subtitle={result.badge.subtitle}
            />
          )}

          <TopicPerfomanceCard title={theme.i18n.t('components.PostQuizScreen.needs_improvement')} topics={result.weakTopics} />
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: theme.space.md, gap: theme.space.sm,
          backgroundColor: theme.color.background,
          borderTopWidth: 1, borderTopColor: theme.color.border,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowReview(true)}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            gap: theme.space.sm, paddingVertical: theme.space.md,
            borderRadius: theme.borderRadius.lg, backgroundColor: theme.color.accent,
          }}
        >
          <Feather name="book-open" size={theme.fontSize.lg} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold as any }}>
            {theme.i18n.t('components.PostQuizScreen.review_answers')}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
          <TouchableOpacity
            onPress={() => router.push('/contests/preQuizScreen')}
            style={{
              flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              gap: theme.space.xs, paddingVertical: theme.space.sm * 1.5,
              borderRadius: theme.borderRadius.lg, borderWidth: 1,
              borderColor: theme.color.border, backgroundColor: theme.color.card,
            }}
          >
            <Feather name="rotate-ccw" size={theme.fontSize.sm} color={theme.color.textSecondary} />
            <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm }}>
              {theme.i18n.t('components.PostQuizScreen.retry')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {}}
            style={{
              flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              gap: theme.space.xs, paddingVertical: theme.space.sm * 1.5,
              borderRadius: theme.borderRadius.lg, borderWidth: 1,
              borderColor: theme.color.border, backgroundColor: theme.color.card,
            }}
          >
            <Feather name="share-2" size={theme.fontSize.sm} color={theme.color.textSecondary} />
            <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm }}>
              {theme.i18n.t('components.PostQuizScreen.share')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/contests')}
            style={{
              flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              gap: theme.space.xs, paddingVertical: theme.space.sm * 1.5,
              borderRadius: theme.borderRadius.lg, borderWidth: 1,
              borderColor: theme.color.border, backgroundColor: theme.color.card,
            }}
          >
            <Feather name="chevron-left" size={theme.fontSize.sm} color={theme.color.textSecondary} />
            <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm }}>
              {theme.i18n.t('components.PostQuizScreen.back')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showReview} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          activeOpacity={1}
          onPress={() => setShowReview(false)}
        />
        <View
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            backgroundColor: theme.color.card,
            borderTopLeftRadius: theme.borderRadius.xl + 4,
            borderTopRightRadius: theme.borderRadius.xl + 4,
            padding: theme.space.lg,
            gap: theme.space.md,
            maxHeight: '80%',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold as any }}>
              {theme.i18n.t('components.PostQuizScreen.review_answers')}
            </Text>
            <TouchableOpacity onPress={() => setShowReview(false)}>
              <Feather name="x" size={theme.fontSize.xl} color={theme.color.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
            {[
              { label: `${result.reviewSummary.correct} ${theme.i18n.t('components.PostQuizScreen.correct')}`, color: theme.color.success, bg: theme.color.success + '18' },
              { label: `${result.reviewSummary.wrong} ${theme.i18n.t('components.PostQuizScreen.wrong')}`, color: theme.color.error, bg: theme.color.error + '18' },
              { label: `${result.reviewSummary.skipped} ${theme.i18n.t('components.PostQuizScreen.skipped')}`, color: theme.color.textMuted, bg: theme.color.surface },
            ].map(p => (
              <View key={p.label} style={{ paddingHorizontal: theme.space.md, paddingVertical: theme.space.xs, borderRadius: theme.borderRadius.full, backgroundColor: p.bg }}>
                <Text style={{ color: p.color, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold as any }}>{p.label}</Text>
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
                      padding: theme.space.md,
                      borderRadius: theme.borderRadius.xl,
                      borderWidth: 1,
                      borderColor: statusColor + '44',
                      backgroundColor: statusColor + '0C',
                      gap: theme.space.sm,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.space.sm }}>
                      <Feather name={statusIcon} size={theme.fontSize.md} color={statusColor} style={{ marginTop: 2 }} />
                      <Text style={{ flex: 1, color: theme.color.textPrimary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
                        {`Q${item.index}. ${item.question}`}
                      </Text>
                    </View>

                    {item.selectedText && !item.isCorrect && (
                      <View
                        style={{
                          paddingHorizontal: theme.space.sm,
                          paddingVertical: theme.space.xs,
                          borderRadius: theme.borderRadius.md,
                          backgroundColor: theme.color.error + '18',
                          alignSelf: 'flex-start',
                        }}
                      >
                        <Text style={{ color: theme.color.error, fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold as any }}>
                          ✗ {theme.i18n.t('components.PostQuizScreen.your_answer')}: {item.selectedLabel}. {item.selectedText}
                        </Text>
                      </View>
                    )}

                    <View
                      style={{
                        paddingHorizontal: theme.space.sm,
                        paddingVertical: theme.space.xs,
                        borderRadius: theme.borderRadius.md,
                        backgroundColor: theme.color.success + '18',
                        alignSelf: 'flex-start',
                      }}
                    >
                      <Text style={{ color: theme.color.success, fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold as any }}>
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