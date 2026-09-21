import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View, Text, ScrollView } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { normalizeError } from '../../common/api/api.errors';
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

  const [startingSessionId, setStartingSessionId] = useState<string | null>(null);
  const [startSessionError, setStartSessionError] = useState<string | null>(null);

  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  useBottomBar(false);

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

  useEffect(() => {
    if (!startSessionError) return;
    const timeoutId = setTimeout(() => setStartSessionError(null), 5000);
    return () => clearTimeout(timeoutId);
  }, [startSessionError]);

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
    async (session: StudyPlanSession) => {
      if (session.sessionType === 'read') {
        setActiveReadSession(session);
        return;
      }
      if (session.status === 'completed' || startingSessionId) return;

      setStartSessionError(null);
      setStartingSessionId(session.sessionId);
      try {
        const result = await api.quiz.startQuizSession({
          quizType: 'subject',
          subject: session.subject,
          difficulty: session.difficulty!,
          questionCount: session.questionCount!,
        });
        const encodedSessionData = encodeURIComponent(JSON.stringify(result));

        router.push({
          pathname: '/contests/[quizId]',
          params: {
            quizId: result.sessionId,
            mode: 'subject',
            subject: session.subject,
            sessionData: encodedSessionData,
            studyPlanSessionId: session.sessionId,
          },
        });
      } catch (err) {
        setStartSessionError(normalizeError(err).message);
      } finally {
        setStartingSessionId(null);
      }
    },
    [router, startingSessionId]
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

          {startSessionError && (
            <View
              accessibilityRole='alert'
              style={{
                gap: theme.space.sm,
                flexDirection: 'row',
                alignItems: 'flex-start',
                padding: theme.space.sm,
                marginTop: theme.space.xs,
                borderWidth: 1,
                borderColor: theme.color.error + '55',
                borderRadius: theme.borderRadius.lg,
                backgroundColor: theme.color.error + '12',
              }}
            >
              <View
                style={{
                  width: theme.space.lg,
                  height: theme.space.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: theme.color.error + '22',
                }}
              >
                <Feather name='alert-circle' size={theme.fontSize.md} color={theme.color.error} />
              </View>

              <View style={{ flex: 1, gap: theme.space.xs * 0.5 }}>
                <Text
                  style={{
                    color: theme.color.error,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {theme.i18n.t('studyPlan.sessionErrorTitle')}
                </Text>
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.color.textSecondary,
                    fontFamily: theme.fontFamily.regular,
                    lineHeight: theme.fontSize.sm * 1.35,
                  }}
                >
                  {startSessionError}{' '}{theme.i18n.t('studyPlan.sessionErrorBody')}
                </Text>
              </View>

              <TouchableOpacity
                accessibilityRole='button'
                accessibilityLabel='Dismiss error'
                onPress={() => setStartSessionError(null)}
                hitSlop={8}
                style={{ padding: theme.space.xs * 0.5 }}
              >
                <Feather name='x' size={theme.fontSize.md} color={theme.color.textMuted} />
              </TouchableOpacity>
            </View>
          )}

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
