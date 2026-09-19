import { useEffect, useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import type { Contest, User } from '../../common/types/types';
import { Loading } from '../../components/common/loading';
import { useBottomBar } from '@/common/context/useBottomBar';
import { normalizeError } from '../../common/api/api.errors';
import { ContestDetailCard } from '../../components/ContestDetailCard';
import { ContestDifficultyCard } from '../../components/ContestDifficultyCard';
import type { PreQuizData, QuizRule, QuizTopic } from '../../common/types/contestTypes';

function buildRules(markingScheme?: Contest['markingScheme']): QuizRule[] {
  const correct = markingScheme?.correct ?? 4;
  const wrong = markingScheme?.wrong ?? -1;
  const skipped = markingScheme?.skipped ?? 0;

  return [
    { id: '1', points: correct, description: 'points for correct answer', icon: 'plus-circle', color: 'success' },
    { id: '2', points: wrong, description: 'point for wrong answer', icon: 'minus-circle', color: 'error' },
    { id: '3', points: skipped, description: 'points for skipped questions', icon: 'minus-circle', color: 'textMuted' },
    { id: '4', points: 0, description: 'Timer runs from the moment you enter', icon: 'clock', color: 'info' },
  ];
}

function mapDifficulty(difficulty?: Contest['difficulty']): PreQuizData['difficulty'] {
  if (difficulty === 'medium') return 'intermediate';
  if (difficulty === 'easy' || difficulty === 'hard') return difficulty;
  return 'intermediate';
}

function extractTopics(contest: any): QuizTopic[] {
  const rawList: string[] =
    (Array.isArray(contest.topics) && contest.topics.length > 0 && contest.topics) ||
    (Array.isArray(contest.subtopics) && contest.subtopics.length > 0 && contest.subtopics) ||
    (Array.isArray(contest.topicList) && contest.topicList.length > 0 && contest.topicList) ||
    (Array.isArray(contest.tags) && contest.tags.length > 0 && contest.tags) ||
    [];

  if (rawList.length > 0) {
    return rawList.map((label: string, i: number) => ({ id: String(i), label: String(label) }));
  }

  if (contest.subject) {
    return [{ id: '0', label: `${contest.subject} Core Concepts` }];
  }

  return [{ id: '0', label: 'Clinical Knowledge' }];
}

function mapContestToPreQuizData(
  contest: Contest,
  userStats?: { bestScore?: number; attempts?: number; bestRank?: number }
): PreQuizData {
  return {
    contestId: contest.contestId,
    subtitle: (contest.contestType ?? 'CONTEST').toUpperCase(),
    title: contest.title,
    creator: 'MedQuel',
    creatorSpecialty: contest.subject,
    qCount: contest.totalQuestions,
    timeMinutes: Math.round((contest.timeLimitSecs ?? 1200) / 60),
    epReward: contest.epReward,
    passPercentage: contest.passPercent ?? 60,
    bestScore: userStats?.bestScore ?? 0,
    attempts: userStats?.attempts ?? 0,
    bestRank: userStats?.bestRank ?? 0,
    difficulty: mapDifficulty(contest.difficulty),
    recommended: contest.recommendedLevel ?? 'All Levels',
    topics: extractTopics(contest),
    rules: buildRules(contest.markingScheme),
  };
}

export default function PreQuizScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const contestId = params.contestId as string | undefined;
  useBottomBar(false);

  const [data, setData] = useState<PreQuizData | null>(null);
  const [contestRaw, setContestRaw] = useState<Contest | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    if (!contestId) {
      setError('No contest selected.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchContestAndStats() {
      setLoading(true);
      setError(null);
      try {
        const [contestRes, analyticsRes, userRes] = await Promise.allSettled([
          api.contest.getContest(contestId!),
          api.analytics.getAnalytics(),
          typeof (api as any)?.auth?.getCurrentUser === 'function'
            ? (api as any).auth.getCurrentUser()
            : typeof (api as any)?.user?.getProfile === 'function'
            ? (api as any).user.getProfile()
            : Promise.resolve(null),
        ]);

        if (cancelled) return;

        if (userRes.status === 'fulfilled' && userRes.value) {
          setCurrentUser(userRes.value);
        }

        if (contestRes.status === 'fulfilled' && contestRes.value) {
          const contest = contestRes.value;
          setContestRaw(contest);

          let userStats = { bestScore: 0, attempts: 0, bestRank: 0 };
          if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
            const analytics = analyticsRes.value;
            const contestAttempts = (analytics.recentAttempts ?? []).filter(
              (a: any) => a.contestId === contest.contestId || a.quizId === contest.contestId
            );

            if (contestAttempts.length > 0) {
              userStats.attempts = contestAttempts.length;
              userStats.bestScore = Math.max(...contestAttempts.map((a: any) => a.scorePercent ?? a.score ?? 0));
            }
          }

          setData(mapContestToPreQuizData(contest, userStats));
        } else {
          throw new Error('Contest details could not be found.');
        }
      } catch (err) {
        if (cancelled) return;
        const apiErr = normalizeError(err);
        console.log('[preQuiz] fetch failed:', apiErr);
        setError(apiErr.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchContestAndStats();
    return () => {
      cancelled = true;
    };
  }, [contestId]);

  const ruleColor = (color: QuizRule['color']): string => {
    if (color === 'success') return theme.color.success;
    if (color === 'error') return theme.color.error;
    if (color === 'info') return theme.color.info;
    return theme.color.textMuted;
  };

  const handleStartContest = () => {
    if (!data) return;

    const isContestPremium =
      Boolean((contestRaw as any)?.isPremium) ||
      Boolean((contestRaw as any)?.requiresPremium) ||
      contestRaw?.contestType?.toLowerCase() === 'premium' ||
      params.isPremium === 'true' ||
      params.isPremium === '1';

    const userIsPremium = Boolean(currentUser?.isPremium);

    if (isContestPremium && !userIsPremium) {
      setShowPremiumModal(true);
      return;
    }

    router.push({
      pathname: '/contests/[quizId]',
      params: {
        quizId: data.contestId,
        totalQuestions: String(data.qCount),
        difficulty: data.difficulty,
        subject: data.creatorSpecialty,
      },
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.color.background }}>
        <Loading message={theme.i18n.t('contests.loading')} />
      </View>
    );
  }

  if (error || !data) {
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
          {error ?? 'Something went wrong.'}
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
            {theme.i18n.t('common.back_to_contests')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <View
        style={{
          gap: theme.space.md,
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: theme.space.lg,
          paddingBottom: theme.space.sm,
          paddingHorizontal: theme.space.md,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push('/contests')}
          style={{
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            backgroundColor: theme.color.card,
            borderRadius: theme.borderRadius.lg,
            borderColor: theme.color.border,
          }}
        >
          <Feather name="chevron-left" size={theme.fontSize.xl} color={theme.color.textPrimary} />
        </TouchableOpacity>

        <View>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            Contest Details
          </Text>
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.light,
            }}
          >
            Review before you start
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.space.md, padding: theme.space.md, paddingBottom: 160 }}
      >
        <ContestDetailCard
          subtitle={data.subtitle}
          title={data.title}
          creator={data.creator}
          creatorSpecialty={data.creatorSpecialty}
          qCount={data.qCount}
          timeMinutes={data.timeMinutes}
          epReward={data.epReward}
          passPercentage={data.passPercentage}
        />

        <View style={{ flexDirection: 'row', gap: theme.space.md }}>
          <View style={{ flex: 1 }}>
            <ContestDifficultyCard difficulty={data.difficulty} />
          </View>
          <View
            style={{
              flex: 1,
              gap: theme.space.sm,
              justifyContent: 'center',
              padding: theme.space.md,
              borderWidth: 1,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.xl,
              backgroundColor: theme.color.card,
            }}
          >
            <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
              Recommended
            </Text>
            <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.regular }}>
              {data.recommended}
            </Text>
          </View>
        </View>

        <View
          style={{
            gap: theme.space.md,
            padding: theme.space.md,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.xl,
            backgroundColor: theme.color.card,
          }}
        >
          <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="book-open" size={theme.fontSize.md} color={theme.color.accent} />
            <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.regular }}>
              Topics Covered
            </Text>
          </View>

          <View style={{ gap: theme.space.sm, flexDirection: 'row', flexWrap: 'wrap' }}>
            {data.topics.map((topic) => (
              <View
                key={topic.id}
                style={{
                  paddingVertical: theme.space.xs,
                  paddingHorizontal: theme.space.sm,
                  borderWidth: 1,
                  borderColor: theme.color.border,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.color.surface,
                }}
              >
                <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
                  {topic.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            gap: theme.space.md,
            padding: theme.space.md,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.xl,
            backgroundColor: theme.color.card,
          }}
        >
          <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="info" size={theme.fontSize.md} color={theme.color.accent} />
            <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.regular }}>
              Rules
            </Text>
          </View>

          <View style={{ gap: theme.space.sm }}>
            {data.rules.map((rule) => (
              <View key={rule.id} style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: theme.borderRadius.md,
                    backgroundColor: ruleColor(rule.color) + '18',
                  }}
                >
                  <Text style={{ color: ruleColor(rule.color), fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.number }}>
                    {rule.points > 0 ? `+${rule.points}` : rule.points === 0 ? '0' : rule.points}
                  </Text>
                </View>
                <Text style={{ flex: 1, color: theme.color.textSecondary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
                  {rule.description}
                </Text>
              </View>
            ))}
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
          borderTopWidth: 1,
          borderTopColor: theme.color.border,
          backgroundColor: theme.color.background,
        }}
      >
        <TouchableOpacity
          onPress={handleStartContest}
          activeOpacity={0.85}
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
          <Feather name="zap" size={theme.fontSize.lg} color={theme.color.textPrimary} />
          <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.regular }}>
            Start Contest
          </Text>
          <Feather name="chevron-right" size={theme.fontSize.lg} color={theme.color.textPrimary} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPremiumModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPremiumModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.color.accent,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: theme.space.lg,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 340,
              backgroundColor: theme.color.card,
              borderRadius: theme.borderRadius.xl,
              borderWidth: 1,
              borderColor: theme.color.border,
              padding: theme.space.xl,
              alignItems: 'center',
              gap: theme.space.md,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.warning + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="lock" size={28} color={theme.color.warning} />
            </View>

            <View style={{ alignItems: 'center', gap: theme.space.xs }}>
              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.lg,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.bold,
                  textAlign: 'center',
                }}
              >
                Premium Contest
              </Text>
              <Text
                style={{
                  color: theme.color.textMuted,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.regular,
                  textAlign: 'center',
                  lineHeight: theme.fontSize.sm * 1.5,
                }}
              >
                This contest requires an active premium subscription. Unlock premium access to participate and earn rewards.
              </Text>
            </View>

            <View style={{ width: '100%', gap: theme.space.sm, marginTop: theme.space.xs }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setShowPremiumModal(false);
                  router.push('/subscription');
                }}
                style={{
                  paddingVertical: theme.space.md * 0.9,
                  borderRadius: theme.borderRadius.lg,
                  backgroundColor: theme.color.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: theme.color.textInverse,
                    fontSize: theme.fontSize.sm,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  Get Premium
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowPremiumModal(false)}
                style={{
                  paddingVertical: theme.space.sm,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: theme.color.textSecondary,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  Maybe Later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}