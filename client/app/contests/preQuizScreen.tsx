import type { ComponentProps } from 'react';
import { Feather } from '@expo/vector-icons';
import { View, Text, ScrollView } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Modal, TouchableOpacity, ActivityIndicator } from 'react-native';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import type { Contest } from '../../common/types/types';
import { Loading } from '../../components/common/loading';
import { normalizeError } from '../../common/api/api.errors';
import { useAppContext } from '../../common/context/AppContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { formatRelativeDuration } from '../../common/utils/dateUtils';
import { ContestDetailCard } from '../../components/contests/ContestDetailCard';
import { TopPerformersList } from '../../components/contests/TopPerformersList';
import { ContestDifficultyCard } from '../../components/contests/ContestDifficultyCard';


type ContestPhase = 'upcoming' | 'active' | 'ended';
type RuleColorToken = 'success' | 'error' | 'textMuted' | 'info' | 'accent';

function mapDifficulty(difficulty?: Contest['difficulty']): 'easy' | 'medium' | 'hard' {
  if (difficulty === 'easy' || difficulty === 'hard') return difficulty;
  return 'medium';
}

function getPhase(contest: Contest, nowMs: number): ContestPhase {
  const startMs = Date.parse(contest.startsAt);
  const endMs = Date.parse(contest.endsAt);

  if (contest.status === 'completed' || (Number.isFinite(endMs) && endMs <= nowMs)) {
    return 'ended';
  }
  if (contest.status !== 'active' || (Number.isFinite(startMs) && startMs > nowMs)) {
    return 'upcoming';
  }
  return 'active';
}

function formatPoints(points: number): string {
  if (points > 0) return `+${points}`;
  return String(points);
}


export default function PreQuizScreen() {
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());

  const startingRef = useRef(false);

  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAppContext();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ contestId?: string }>();
  const contestId = params.contestId;
  useBottomBar(false);

  const t = (key: string, opts?: Record<string, unknown>) => theme.i18n.t(key, opts);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!contestId) {
      setError(t('contests.preQuiz.no_contest'));
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.contest.getContest(contestId);
        if (cancelled) return;
        if (!result) throw new Error(t('contests.preQuiz.not_found'));
        setContest(result);
      } catch (err) {
        if (!cancelled) setError(normalizeError(err).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contestId]);

  const view = useMemo(() => {
    if (!contest) return null;

    const marking = contest.markingScheme ?? {
      correct: 4,
      wrong: -1,
      skipped: 0,
    };
    const passPercent = contest.passPercent ?? 60;

    const rules: {
      id: string;
      icon: ComponentProps<typeof Feather>['name'];
      color: RuleColorToken;
      value?: string;
      text: string;
    }[] = [
      {
        id: 'correct',
        icon: 'plus-circle',
        color: 'success',
        value: formatPoints(marking.correct),
        text: t('contests.preQuiz.rule_correct'),
      },
      {
        id: 'wrong',
        icon: 'minus-circle',
        color: 'error',
        value: formatPoints(marking.wrong),
        text: t('contests.preQuiz.rule_wrong'),
      },
      {
        id: 'skipped',
        icon: 'minus-circle',
        color: 'textMuted',
        value: formatPoints(marking.skipped),
        text: t('contests.preQuiz.rule_skipped'),
      },
      {
        id: 'pass',
        icon: 'target',
        color: 'accent',
        text: t('contests.preQuiz.rule_pass', { percent: passPercent }),
      },
      {
        id: 'timer',
        icon: 'clock',
        color: 'info',
        text: t('contests.preQuiz.rule_timer'),
      },
      {
        id: 'best',
        icon: 'award',
        color: 'info',
        text: t('contests.preQuiz.rule_best'),
      },
    ];

    const topics = contest.topics?.length > 0
      ? contest.topics
      : [t('contests.preQuiz.topic_fallback', { subject: contest.subject })];

    const myPerformer = (contest.topPerformers ?? []).find(
      (p) => p.userId === user?.uid
    );

    return {
      subtitle: t(`contests.preQuiz.type.${contest.contestType}`),
      timeMinutes: Math.max(1, Math.round((contest.timeLimitSecs || 1200)/60)),
      passPercent,
      difficulty: mapDifficulty(contest.difficulty),
      recommended: contest.recommendedLevel ?? t('contests.preQuiz.all_levels'),
      rules,
      topics,
      myRank: myPerformer?.rank ?? null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contest, user?.uid]);

  const phase: ContestPhase = contest ? getPhase(contest, nowMs) : 'ended';
  const needsPremium = !!contest?.isPremium && !user?.isPremium;
  const canStart = phase === 'active' && !starting;

  const handleStart = async () => {
    if (!contest || startingRef.current || phase !== 'active') return;
    if (needsPremium) {
      setShowPremiumModal(true);
      return;
    }

    startingRef.current = true;
    setStarting(true);
    setStartError(null);

    try {
      const session = await api.contest.joinContest(contest.contestId);
      router.push({
        pathname: '/contests/[quizId]',
        params: {
          quizId: session.sessionId,
          quizType: session.quizType,
          contestId: contest.contestId,
          subject: contest.subject,
          passPercent: String(contest.passPercent ?? 60),
          sessionData: encodeURIComponent(JSON.stringify(session)),
        },
      });
    } catch (err) {
      setStartError(normalizeError(err).message);
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  };

  const ruleColor = (token: RuleColorToken): string => theme.color[token];

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
        <Loading message={t('contests.loading')} />
      </View>
    );
  }

  if (error || !contest || !view) {
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
          {error ?? t('contests.preQuiz.generic_error')}
        </Text>

        <TouchableOpacity
          onPress={() => router.replace('/contests')}
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
            {t('common.back_to_contests')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const endMs = Date.parse(contest.endsAt);
  const startMs = Date.parse(contest.startsAt);
  const statusColor = phase === 'active'
    ? theme.color.warning
    : phase === 'upcoming' ? theme.color.info : theme.color.error;
  const statusText = phase === 'active'
    ? t('contests.preQuiz.ends_in', { time: formatRelativeDuration(endMs - nowMs) })
    : phase === 'upcoming'
      ? t('contests.preQuiz.starts_in', { time: formatRelativeDuration(startMs - nowMs) })
      : t('contests.preQuiz.ended');

  const buttonLabel = starting
    ? t('contests.preQuiz.starting')
    : phase === 'ended'
      ? t('contests.preQuiz.btn_ended')
      : phase === 'upcoming'
        ? t('contests.preQuiz.btn_upcoming')
        : needsPremium ? t('common.unlock_and_start') : t('common.start_contest');
  const buttonColor = needsPremium && phase === 'active' ? theme.color.premium : theme.color.accent;

  const sectionStyle = {
    gap: theme.space.md,
    padding: theme.space.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.color.card,
  } as const;

  const sectionTitle = (icon: ComponentProps<typeof Feather>['name'], label: string, right?: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
        <Feather name={icon} size={theme.fontSize.md} color={theme.color.accent} />
        <Text
          style={{
            fontSize: theme.fontSize.md,
            color: theme.color.textPrimary,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {label}
        </Text>
      </View>

      {right ? (
        <Text
          style={{
            fontSize: theme.fontSize.sm,
            color: theme.color.textMuted,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {right}
        </Text>
      ) : null}
    </View>
  );


  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScreenHeader
        title={t('contests.preQuiz.title')}
        subtitle={t('contests.preQuiz.subtitle')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: theme.space.md,
          padding: theme.space.md,
          paddingBottom: insets.bottom * 3.1,
        }}
      >
        <ContestDetailCard
          subtitle={view.subtitle}
          title={contest.title}
          creator='MedQuel'
          creatorSpecialty={contest.subject}
          qCount={contest.totalQuestions}
          timeMinutes={view.timeMinutes}
          epReward={contest.epReward}
          passPercentage={view.passPercent}
        />

        <View
          style={{
            gap: theme.space.sm,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: theme.space.sm,
            paddingHorizontal: theme.space.md,
            borderWidth: 1,
            borderColor: statusColor + '44',
            borderRadius: theme.borderRadius.lg,
            backgroundColor: statusColor + '12',
          }}
        >
          <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
            <Feather name='clock' size={theme.fontSize.md} color={statusColor} />
            <Text
              style={{
                color: statusColor,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {statusText}
            </Text>
          </View>

          <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
            <Feather
              name='users'
              size={theme.fontSize.md}
              color={theme.color.textMuted}
            />
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.color.textSecondary,
                fontFamily: theme.fontFamily.number,
              }}
            >
              {(contest.participantCount ?? 0).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={{ gap: theme.space.md, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <ContestDifficultyCard difficulty={view.difficulty} />
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
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.color.textSecondary,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {t('contests.preQuiz.recommended')}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.md,
                color: theme.color.textPrimary,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {view.recommended}
            </Text>
          </View>
        </View>

        <View style={sectionStyle}>
          {sectionTitle(
            'award',
            t('contests.topPerformers.title'),
            view.myRank ? t('contests.topPerformers.your_rank', { rank: view.myRank }) : undefined
          )}
          <TopPerformersList
            performers={contest.topPerformers ?? []}
            currentUserId={user?.uid}
          />
        </View>

        <View style={sectionStyle}>
          {sectionTitle('book-open', t('contests.preQuiz.topics'))}
          <View style={{ flexWrap: 'wrap', gap: theme.space.sm, flexDirection: 'row' }}>
            {view.topics.map((topic) => (
              <View
                key={topic}
                style={{
                  paddingVertical: theme.space.xs,
                  paddingHorizontal: theme.space.sm,
                  borderWidth: 1,
                  borderColor: theme.color.border,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.color.surface,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.color.textSecondary,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {topic}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={sectionStyle}>
          {sectionTitle('info', t('contests.preQuiz.rules'))}
          <View style={{ gap: theme.space.sm }}>
            {view.rules.map((rule) => (
              <View
                key={rule.id}
                style={{
                  gap: theme.space.sm,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Feather name={rule.icon} size={theme.fontSize.md} color={ruleColor(rule.color)} />
                {rule.value !== undefined && (
                  <Text
                    style={{
                      minWidth: theme.space.lg + 4,
                      color: ruleColor(rule.color),
                      fontSize: theme.fontSize.md,
                      fontFamily: theme.fontFamily.numberBold,
                    }}
                  >
                    {rule.value}
                  </Text>
                )}

                <Text
                  style={{
                    flex: 1,
                    fontSize: theme.fontSize.sm,
                    color: theme.color.textSecondary,
                    fontFamily: theme.fontFamily.regular,
                    lineHeight: theme.fontSize.sm * 1.25,
                  }}
                >
                  {rule.text}
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
          paddingBottom: insets.bottom * 1.25,
          borderTopWidth: 1,
          borderTopColor: theme.color.border,
          backgroundColor: theme.color.background,
        }}
      >
        {startError && (
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
              {startError}
            </Text>

            <TouchableOpacity onPress={() => setStartError(null)} hitSlop={8}>
              <Feather name='x' size={theme.fontSize.md} color={theme.color.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={handleStart}
          disabled={!canStart}
          activeOpacity={0.85}
          accessibilityRole='button'
          accessibilityState={{ disabled: !canStart }}
          style={{
            gap: theme.space.xs,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.md,
            borderRadius: theme.borderRadius.xl,
            backgroundColor: canStart ? buttonColor : theme.color.surface,
            opacity: canStart || starting ? 1 : 0.7,
          }}
        >
          {starting ? (
            <ActivityIndicator
              size='small'
              color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
            />
          ) : (
            <Feather
              name={phase !== 'active' ? 'lock' : needsPremium ? 'award' : 'zap'}
              size={theme.fontSize.lg}
              color={canStart
                ? theme.isDark ? theme.color.textPrimary : theme.color.textInverse
                : theme.color.textMuted
              }
            />
          )}

          <Text
            style={{
              color: canStart
                ? theme.isDark ? theme.color.textPrimary : theme.color.textInverse
                : theme.color.textMuted,
              fontSize: theme.fontSize.lg,
              fontFamily: theme.fontFamily.bold,
              lineHeight: theme.fontSize.lg * 1.25,
            }}
          >
            {buttonLabel}
          </Text>

          {canStart && !starting && (
            <Feather
              name='chevron-right'
              size={theme.fontSize.lg}
              color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
            />
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPremiumModal}
        transparent
        animationType='fade'
        onRequestClose={() => setShowPremiumModal(false)}
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
                backgroundColor: theme.color.premium + '22',
              }}
            >
              <Feather name='lock' size={theme.fontSize.xxl} color={theme.color.premium} />
            </View>

            <Text
              style={{
                fontSize: theme.fontSize.xl,
                color: theme.color.textPrimary,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {t('contests.preQuiz.premium_title')}
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
              {t('contests.preQuiz.premium_body')}
            </Text>

            <View style={{ width: '100%', gap: theme.space.sm }}>
              <TouchableOpacity
                onPress={() => {
                  setShowPremiumModal(false);
                  router.push('/premium');
                }}
                activeOpacity={0.85}
                style={{
                  alignItems: 'center',
                  paddingVertical: theme.space.sm * 1.5,
                  borderRadius: theme.borderRadius.lg,
                  backgroundColor: theme.color.premium,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.md,
                    fontFamily: theme.fontFamily.bold,
                    color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                  }}
                >
                  {t('contests.preQuiz.get_premium')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowPremiumModal(false)}
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
                  {t('contests.preQuiz.maybe_later')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
