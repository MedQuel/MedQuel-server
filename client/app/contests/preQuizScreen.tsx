import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import type { Contest } from '../../common/types/types';
import { Loading } from '../../components/common/loading';
import { useBottomBar } from '@/common/context/useBottomBar';
import { normalizeError } from '../../common/api/api.errors';
import { ContestDetailCard } from '../../components/ContestDetailCard';
import { ContestDifficultyCard } from '../../components/ContestDifficultyCard';
import type { PreQuizData, QuizRule, StatItemProps } from '../../common/types/contestTypes';


function buildRules(markingScheme: Contest['markingScheme']): QuizRule[] {
  const { correct, wrong, skipped } = markingScheme;
  return [
    { id: '1', points: correct, description: 'points for correct answer', icon: 'plus-circle', color: 'success' },
    { id: '2', points: wrong, description: 'point for wrong answer', icon: 'minus-circle', color: 'error' },
    { id: '3', points: skipped, description: 'points for skipped questions', icon: 'minus-circle', color: 'textMuted' },
    { id: '4', points: 0, description: 'Timer runs from the moment you enter', icon: 'clock', color: 'info' },
  ];
}

function mapDifficulty(difficulty: Contest['difficulty']): PreQuizData['difficulty'] {
  return difficulty === 'medium' ? 'intermediate' : difficulty;
}

function mapContestToPreQuizData(contest: Contest): PreQuizData {
  return {
    contestId: contest.contestId,
    subtitle: contest.contestType.toUpperCase(),
    title: contest.title,
    creator: 'MedQuel',
    creatorSpecialty: contest.subject,
    qCount: contest.totalQuestions,
    timeMinutes: Math.round(contest.timeLimitSecs / 60),
    epReward: contest.epReward,
    passPercentage: contest.passPercent,
    bestScore: 0,
    attempts: 0,
    bestRank: 0,
    difficulty: mapDifficulty(contest.difficulty),
    recommended: contest.recommendedLevel,
    topics: contest.topics.map((label, i) => ({ id: String(i), label })),
    rules: buildRules(contest.markingScheme),
  };
}

function StatItem({ value, label, color }: StatItemProps) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: theme.space.xs }}>
      <Text style={{ color, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.number }}>
        {value}
      </Text>
      <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.light }}>
        {label}
      </Text>
    </View>
  );
}

export default function PreQuizScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const contestId = params.contestId as string | undefined;
  useBottomBar(false);

  const [data, setData] = useState<PreQuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!contestId) {
      setError('No contest selected.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchContest() {
      setLoading(true);
      setError(null);
      try {
        const contest = await api.contest.getContest(contestId!);
        if (cancelled) return;
        if (contest) {
          setData(mapContestToPreQuizData(contest));
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

    fetchContest();
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

        <View
          style={{
            flexDirection: 'row',
            padding: theme.space.md,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.xl,
            backgroundColor: theme.color.card,
          }}
        >
          <StatItem value={`${data.bestScore}%`} label="Best Score" color={theme.color.success} />
          <View style={{ width: 1, backgroundColor: theme.color.border }} />
          <StatItem label="Attempts" value={String(data.attempts)} color={theme.color.textPrimary} />
          <View style={{ width: 1, backgroundColor: theme.color.border }} />
          <StatItem label="Best Rank" value={`#${data.bestRank}`} color={theme.color.warning} />
        </View>

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
          onPress={() =>
            router.push({
              pathname: '/contests/[quizId]',
              params: { quizId: data.contestId, totalQuestions: String(data.qCount) },
            })
          }
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
          <Feather name="zap" size={theme.fontSize.lg} color={theme.color.textInverse} />
          <Text style={{ color: theme.color.textInverse, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.regular }}>
            Start Contest
          </Text>
          <Feather name="chevron-right" size={theme.fontSize.lg} color={theme.color.textInverse} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/contests/[quizId]',
              params: { quizId: data.contestId, totalQuestions: String(data.qCount), practice: '1' },
            })
          }
          activeOpacity={0.85}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.md,
            borderRadius: theme.borderRadius.lg,
            borderWidth: 1,
            borderColor: theme.color.border,
            backgroundColor: theme.color.card,
          }}
        >
          <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.md, fontFamily: theme.fontFamily.regular }}>
            Practice Mode (No EP)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}