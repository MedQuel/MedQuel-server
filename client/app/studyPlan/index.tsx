import { View,Text,Modal,Platform,TextInput,ScrollView, TouchableOpacity, KeyboardAvoidingView,} from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StudyHeader } from './studyPlanHeader';
import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { ProjectionCard } from '../../components/ProjectionCard';
import { GoalProgressCard } from '../../components/GoalProgressCard';
import { StudyTimelineCard } from '../../components/StudySessionItem';
import { WeeklyProgressCard } from '../../components/WeeklyTrackerCard';
import { Loading } from '../../components/common/loading';
import { api } from '../../common/api/api';
import type { StudyPlan, TargetExam } from '../../common/types/types';
type SessionIconName = 'book-open' | 'edit-3' | 'clipboard';
const SUBJECT_ICON_MAP: Record<string, SessionIconName> = {
  surgery: 'edit-3',
  cardiology: 'book-open',
  pathology: 'clipboard',
  pharmacology: 'clipboard',
  medicine: 'book-open',
  anatomy: 'book-open',
};
const getSessionIcon = (subject: string): SessionIconName =>
  SUBJECT_ICON_MAP[subject.trim().toLowerCase()] ?? 'book-open';
type SessionUiStatus = 'completed' | 'current' | 'upcoming';
const deriveSessionStatuses = (
  sessions: StudyPlan['sessions']
): (StudyPlan['sessions'][number] & { uiStatus: SessionUiStatus })[] => {
  let currentAssigned = false;
  return sessions.map((s) => {
    if (s.status === 'completed') {
      return { ...s, uiStatus: 'completed' as const };
    }
    if (!currentAssigned) {
      currentAssigned = true;
      return { ...s, uiStatus: 'current' as const };
    }
    return { ...s, uiStatus: 'upcoming' as const };
  });
};
const daysUntil = (isoDate: string): number => {
  const diffMs = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / 86400000));
};
const formatExamDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
function EditPlanModal({ visible, onSave, onClose, initialExamName, initialExamDate }: {
  visible: boolean;
  onSave: (examName: string, examDate: string) => void;
  onClose: () => void;
  initialExamName: string;
  initialExamDate: string;
}) {
  const [examName, setExamName] = useState(initialExamName);
  const [examDate, setExamDate] = useState(initialExamDate);
  const { theme } = useTheme();
  const handleSave = () => {
    onSave(examName, examDate);
    onClose();
  };
  return (
    <Modal
      visible={visible}
      animationType='slide'
      onRequestClose={onClose}
      transparent
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: theme.isDark ? theme.color.textInverse : theme.color.textPrimary,
        }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'height' : undefined}>
          <View
            style={{
              padding: theme.space.lg,
              borderTopLeftRadius: theme.borderRadius.lg,
              borderTopRightRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.card,
            }}
          >
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.lg,
                fontFamily: theme.fontFamily.bold,
                marginBottom: theme.space.md,
              }}
            >
              {theme.i18n.t('Edit Study Plan')}
            </Text>

            <Text
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                marginBottom: theme.space.xs,
              }}
            >
              {theme.i18n.t('Exam Name')}
            </Text>
            <TextInput
              value={examName}
              onChangeText={setExamName}
              placeholder='e.g. USMLE Step 1'
              placeholderTextColor={theme.color.textSecondary}
              style={{
                color: theme.color.textPrimary,
                marginBottom: theme.space.md,
                paddingVertical: theme.space.sm,
                paddingHorizontal: theme.space.md,
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.md,
              }}
            />
            <Text
              style={{
                color: theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                marginBottom: theme.space.xs,
              }}
            >
              {theme.i18n.t('Exam Date')}
            </Text>
            <TextInput
              value={examDate}
              onChangeText={setExamDate}
              placeholder='e.g. Aug 15, 2026'
              placeholderTextColor={theme.color.textSecondary}
              style={{
                color: theme.color.textPrimary,
                marginBottom: theme.space.lg,
                paddingVertical: theme.space.sm,
                paddingHorizontal: theme.space.md,
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.md,
              }}
            />
            <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: theme.space.sm,
                  borderWidth: 1,
                  borderColor: theme.color.border,
                  borderRadius: theme.borderRadius.md,
                }}
              >
                <Text
                  style={{
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {theme.i18n.t('Cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: theme.space.sm,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.color.textPrimary,
                }}
              >
                <Text
                  style={{
                    color: theme.color.background,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {theme.i18n.t('Save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
export default function StudyPlanScreen() {
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  useBottomBar(true, 'profile');
  useEffect(() => {
    let isMounted = true;
    async function fetchStudyPlan() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.studyPlan.getStudyPlan();
        if (isMounted) setPlan(data);
      } catch (err) {
        console.log('Failed to fetch study plan:', err);
        if (isMounted) {
          setError(theme.i18n.t('Could not load your study plan. Pull to retry.'));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStudyPlan();

    return () => {
      isMounted = false;
    };
  }, []);

  // generateStudyPlan mutation only accepts examDate (+ optional weakSubjects/hoursPerDay) -
  // there's no backend field to change targetExam via this call, so the edited exam name
  // is tracked locally and re-applied on top of whatever the mutation returns.
  const handleSavePlan = async (newExamName: string, newExamDate: string) => {
    if (!plan) return;
    const previousPlan = plan;

    // TargetExam is a closed union server-side, but the edit modal takes free text.
    const nextTargetExam = newExamName as TargetExam;

    setPlan({ ...plan, targetExam: nextTargetExam, examDate: newExamDate });

    try {
      const updated = await api.studyPlan.generateStudyPlan({
        examDate: newExamDate,
      });
      setPlan({ ...updated, targetExam: nextTargetExam });
    } catch (err) {
      console.log('Failed to update study plan:', err);
      setPlan(previousPlan);
    }
  };

  const sessionsWithStatus = useMemo(
    () => (plan ? deriveSessionStatuses(plan.sessions) : []),
    [plan]
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background }}>
        <Loading message={theme.i18n.t('Loading your study plan...')} fullscreen />
      </View>
    );
  }

  if (error || !plan) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background, alignItems: 'center', justifyContent: 'center', padding: theme.space.md }}>
        <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular, textAlign: 'center' }}>
          {error ?? theme.i18n.t('Study plan not found.')}
        </Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <StudyHeader
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/home');
          }
        }}
        onEdit={() => setEditModalVisible(true)}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: theme.space.md,
          paddingTop: theme.space.md,
          paddingBottom: insets.bottom + theme.space.xxl + theme.space.xl,
          paddingHorizontal: theme.space.md,
        }}
      >
        <GoalProgressCard
          examName={plan.targetExam}
          examDate={formatExamDate(plan.examDate)}
          preparationPercent={plan.preparationPercent}
          daysLeft={daysUntil(plan.examDate)}
        />

        <WeeklyProgressCard
          title={theme.i18n.t('This Week')}
          date={formatExamDate(new Date().toISOString())}
          completedDays={Array.from(
            { length: plan.currentWeekProgress.daysCompleted },
            (_, i) => i
          )}
          currentDay={plan.currentWeekProgress.daysCompleted}
          reward={plan.weeklyEpTarget}
        />

        <StudyTimelineCard
          sessions={sessionsWithStatus.map((s) => ({
            id: s.sessionId,
            time: s.scheduledTime,
            title: s.topic,
            subject: s.subject,
            questionsCount: s.questionCount,
            reward: s.epReward,
            status: s.uiStatus,
            iconName: getSessionIcon(s.subject),
          }))}
          onPress={() => {}}
        />

        <ProjectionCard
          title={theme.i18n.t('Weekly Projection')}
          subtitle={theme.i18n.t('Keep your current pace to maximize rewards')}
          projectedEP={plan.weeklyEpTarget}
        />
      </ScrollView>

      <EditPlanModal
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSavePlan}
        initialExamName={plan.targetExam}
        initialExamDate={formatExamDate(plan.examDate)}
      />
    </View>
  );
}