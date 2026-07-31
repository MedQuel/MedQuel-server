import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '@/common/context/useBottomBar';
import { QuestionCard } from '../../components/QuestionCard';
import { QuizProgressBar } from '../../components/QuizProgressBar';


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

type ModalType = 'summary' | null;
type AnswerRecord = {
  questionId: string;
  selectedLabel: string | null;
  isCorrect: boolean;
  isBookmarked: boolean;
  isFlagged: boolean;
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}


export default function QuizScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const isPractice = params.practice === '1';
  const quiz = quizMockData;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.durationMinutes * 60);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [displayedEp, setDisplayedEp] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>(() =>
    Object.fromEntries(
      quiz.questions.map(q => [
        q.id,
        { questionId: q.id, selectedLabel: null, isCorrect: false, isBookmarked: false, isFlagged: false },
      ])
    )
  );

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentQuestion: QuizQuestion = quiz.questions[currentIndex]!;
  const currentAnswer = answers[currentQuestion.id]!;

  useEffect(() => {
    if (activeModal !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [activeModal]);

  const updateAnswer = (questionId: string, patch: Partial<AnswerRecord>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId]!, ...patch },
    }));
  };

  const handleSelect = (label: string) => {
    const option = currentQuestion.options.find(o => o.label === label);
    if (!option) return;
    updateAnswer(currentQuestion.id, {
      selectedLabel: label,
      isCorrect: option.isCorrect,
    });
  };

  const calculateCurrentEp = (latestAnswers: Record<string, AnswerRecord>) => {
    return Math.max(
      0,
      Object.values(latestAnswers).filter(a => a.isCorrect).length * quiz.pointsPerCorrect +
      Object.values(latestAnswers).filter(a => a.selectedLabel !== null && !a.isCorrect).length * quiz.pointsPerWrong
    );
  };

  const handleFinish = () => {
    clearInterval(timerRef.current!);
    const timeTaken = quiz.durationMinutes * 60 - timeLeft;
    const correct = Object.values(answers).filter(a => a.isCorrect).length;
    const wrong   = Object.values(answers).filter(a => a.selectedLabel !== null && !a.isCorrect).length;
    const skipped = Object.values(answers).filter(a => a.selectedLabel === null).length;

    router.push({
      pathname: '/contests/postQuizScreen',
      params: {
        quizId:   quiz.id,
        title:    quiz.title,
        total:    quiz.totalQuestions,
        correct,
        wrong,
        skipped,
        timeTaken,
        epEarned: isPractice ? 0 : Math.max(0, correct * quiz.pointsPerCorrect + wrong * quiz.pointsPerWrong),
        answers:   JSON.stringify(answers),
        practice:  isPractice ? '1' : '0',
      },
    });
  };

  const goTo = (index: number) => {
    setDisplayedEp(calculateCurrentEp(answers));
    setCurrentIndex(index);
    setActiveModal(null);
  };

  const answeredCount = Object.values(answers).filter(a => a.selectedLabel !== null).length;
  const skippedCount  = quiz.questions.length - answeredCount;
  const bookmarkedQuestions = quiz.questions.filter(q => answers[q.id]?.isBookmarked);
  const flaggedQuestions    = quiz.questions.filter(q => answers[q.id]?.isFlagged);

  const getQuestionStatus = (qId: string) => {
    const a = answers[qId]!;
    if (a.isFlagged)            return { icon: 'flag'     as const, color: theme.color.error   };
    if (a.isBookmarked)         return { icon: 'bookmark' as const, color: theme.color.accent  };
    if (a.selectedLabel !== null) return { icon: 'check'    as const, color: theme.color.success };
    return { icon: 'minus' as const, color: theme.color.textMuted };
  };


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
          <Text
            style={{
              color: theme.color.info,
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {formatTime(timeLeft)}
          </Text>
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
            {isPractice ? 'Practice Mode' : `+${displayedEp} EP`}
          </Text>
        </View>
      </View>

      <View style={{ paddingBottom: theme.space.sm, paddingHorizontal: theme.space.md }}>
        <QuizProgressBar current={currentIndex + 1} total={quiz.questions.length} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.space.md, padding: theme.space.md, paddingBottom: 140 }}
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
          <View
            style={{
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.xl,
            }}
          >
            <Image
              resizeMode="cover"
              source={{ uri: currentQuestion.image }}
              style={{ width: '100%', height: 200 }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: theme.space.sm,
                right: theme.space.sm,
                paddingVertical: theme.space.xs/2,
                paddingHorizontal: theme.space.sm,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: 'rgba(0,0,0,0.6)',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: theme.fontSize.xs }}>FIGURE 1.A</Text>
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
                      color: selected ? '#FFFFFF' : theme.color.textSecondary,
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
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          gap: theme.space.sm,
          flexDirection: 'row',
          paddingBottom: theme.space.md + insets.bottom,
          padding: theme.space.md,
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
          <Feather name="chevron-left" size={theme.fontSize.md} color={theme.color.textSecondary} />
          <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>Prev</Text>
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
          <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>Review</Text>
        </TouchableOpacity>

        {currentIndex === quiz.questions.length - 1 ? (
          <TouchableOpacity
            onPress={handleFinish}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.sm * 1.5,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.accent,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.regular }}>Finish</Text>
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
            <Text style={{ color: '#FFFFFF', fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.regular }}>Next</Text>
            <Feather name="chevron-right" size={theme.fontSize.md} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={activeModal === 'summary'} transparent animationType="slide">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setActiveModal(null)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
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
              Review
            </Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Feather name="x" size={theme.fontSize.xl} color={theme.color.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.space.md }}>
            {[
              { label: 'Answered', value: answeredCount, color: theme.color.success },
              { label: 'Skipped',  value: skippedCount,  color: theme.color.textMuted },
              { label: 'Flagged',  value: flaggedQuestions.length, color: theme.color.error },
              { label: 'Saved',    value: bookmarkedQuestions.length, color: theme.color.accent },
            ].map(stat => (
              <View key={stat.label} style={{ gap: theme.space.xs/2, flex: 1, alignItems: 'center' }}>
                <Text style={{ color: stat.color, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.number }}>
                  {stat.value}
                </Text>
                <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ gap: theme.space.sm, flexWrap: 'wrap', flexDirection: 'row' }}>
              {quiz.questions.map((q, idx) => {
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
                { icon: 'check'    as const, color: theme.color.success,  label: 'Answered' },
                { icon: 'minus'    as const, color: theme.color.textMuted, label: 'Skipped'  },
                { icon: 'flag'     as const, color: theme.color.error,     label: 'Flagged'  },
                { icon: 'bookmark' as const, color: theme.color.accent,    label: 'Saved'    },
              ].map(item => (
                <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
                  <Feather name={item.icon} size={theme.fontSize.sm} color={item.color} />
                  <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.xs }}>{item.label}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={handleFinish}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.md,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.accent,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold }}>
              Submit Quiz
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}