import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { EMPTY_STUDY_PLAN } from '../../common/utils/createEmptyStudyPlan';
import type { StudyPlan, StudyPlanSession, GenerateStudyPlanInput } from '../../common/types/types';

import { Loading } from '../../components/common/loading';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { WeeklyDayTracker } from '../../components/studyPlan/WeeklyDayTracker';
import { PlanOverviewCard } from '../../components/studyPlan/PlanOverviewCard';
import { ReadSessionModal } from '../../components/studyPlan/ReadSessionModal';
import { MilestoneTimeline } from '../../components/studyPlan/MilestoneTimeline';
import { GeneratePlanWizard } from '../../components/studyPlan/GeneratePlanWizard';
import { StudyPlanStateCard } from '../../components/studyPlan/StudyPlanStateCard';
import { SessionTimelineList } from '../../components/studyPlan/SessionTimelineList';


export default function StudyPlanScreen() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const [wizardVisible, setWizardVisible] = useState(false);
  const [wizardSubmitting, setWizardSubmitting] = useState(false);
  const [wizardError, setWizardError] = useState<string | null>(null);

  const [activeReadSession, setActiveReadSession] = useState<StudyPlanSession | null>(null);
  const [completingSessionId, setCompletingSessionId] = useState<string | null>(null);

  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  useBottomBar(true, 'profile');

  const loadPlan = useCallback(async () => {
    try {
      setError(false);
      const data = await api.studyPlan.getStudyPlan();
      setPlan(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPlan();
  }, [loadPlan]);

  const handleGenerate = useCallback(
    async (input: GenerateStudyPlanInput) => {
      setWizardSubmitting(true);
      setWizardError(null);
      try {
        const updated = await api.studyPlan.generateStudyPlan(input);
        setPlan(updated);
        setWizardVisible(false);
      } catch (err: any) {
        setWizardError(err?.message ?? theme.i18n.t('studyPlan.wizard.genericError'));
      } finally {
        setWizardSubmitting(false);
      }
    },
    [theme]
  );

  const handleSessionPress = useCallback(
    (session: StudyPlanSession) => {
      if (session.sessionType === 'read') {
        setActiveReadSession(session);
        return;
      }
      if (session.status === 'completed') return;

      // Integration point: hand off to your practice-quiz launch flow. I don't
      // have that screen's route/params in context — wire this to wherever
      // startQuizSession normally gets triggered from (e.g. home/practiceBySubject.tsx),
      // passing subject/difficulty/questionCount, then call
      // api.studyPlan.markStudySessionComplete({ sessionId, quizSessionId }) once that quiz is submitted.
      router.push({
        pathname: '/contests/preQuizScreen',
        params: {
          subject: session.subject,
          difficulty: session.difficulty,
          questionCount: String(session.questionCount),
          studyPlanSessionId: session.sessionId,
        },
      } as never);
    },
    [router]
  );

  const handleMarkReadComplete = useCallback(async () => {
    if (!activeReadSession) return;
    setCompletingSessionId(activeReadSession.sessionId);
    try {
      const result = await api.studyPlan.markStudySessionComplete({
        sessionId: activeReadSession.sessionId,
      });
      setPlan(result.plan);
      setActiveReadSession(result.plan.sessions.find(
        (s) => s.sessionId === activeReadSession.sessionId) ?? null
      );
    } catch {
      // Leave modal open; the button just resets — user can retry.
    } finally {
      setCompletingSessionId(null);
    }
  }, [activeReadSession]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background }}>
        <Loading message={theme.i18n.t('studyPlan.loading')} fullscreen />
      </View>
    );
  }


  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScreenHeader
        title={theme.i18n.t('studyPlan.header.title')}
        subtitle={theme.i18n.t('studyPlan.header.subtitle')}
        onBack={() => router.canGoBack()
          ? router.back()
          : router.replace('/home')
        }
        rightActions={[
          {
            icon: 'edit-2',
            onPress: () => setWizardVisible(true),
            accessibilityLabel: 'Edit study plan',
          },
        ]}
      />

      {error || !plan ? (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: theme.space.md,
            paddingBottom: insets.bottom * 2.75,
            paddingHorizontal: theme.space.md,
          }}
        >
          {error ? (
            <StudyPlanStateCard variant='error' onAction={() => loadPlan()} />
          ) : !plan ? (
            <>
              <View style={{ gap: theme.space.md, opacity: 0.6 }}>
                <PlanOverviewCard plan={EMPTY_STUDY_PLAN} />
                <WeeklyDayTracker plan={EMPTY_STUDY_PLAN} />
              </View>
              <View style={{ alignItems: 'center', marginTop: theme.space.xl }}>
                <StudyPlanStateCard
                  variant='empty'
                  onAction={() => setWizardVisible(true)}
                />
              </View>
            </>
          ) : null}
        </ScrollView>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.color.accent}
            />
          }
          contentContainerStyle={{
            gap: theme.space.md,
            paddingTop: theme.space.md,
            paddingBottom: insets.bottom * 2.75,
            paddingHorizontal: theme.space.md,
          }}
        >
          <PlanOverviewCard plan={plan} />
          <WeeklyDayTracker plan={plan} />
          <MilestoneTimeline plan={plan} />
          <SessionTimelineList sessions={plan.sessions} onSessionPress={handleSessionPress} />
        </ScrollView>
      )}

      <GeneratePlanWizard
        visible={wizardVisible}
        initialPlan={plan}
        onClose={() => setWizardVisible(false)}
        onSubmit={handleGenerate}
        submitting={wizardSubmitting}
        submitError={wizardError}
      />

      <ReadSessionModal
        session={activeReadSession}
        onClose={() => setActiveReadSession(null)}
        onMarkComplete={handleMarkReadComplete}
        completing={completingSessionId === activeReadSession?.sessionId}
      />
    </View>
  );
}
