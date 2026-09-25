import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { Loading } from '../../components/common/loading';
import { hasValidPhoto } from '../../common/utils/imageUrl';
import { getInitials } from '../../common/utils/getInitials';
import { normalizeError } from '../../common/api/api.errors';
import { useAppContext } from '../../common/context/AppContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { didIWin, getOpponentUid } from '../../common/utils/challengeHelpers';
import { formatShortDate, formatRelativeDuration } from '../../common/utils/dateUtils';
import { isActiveForMe, isPendingInviteForMe } from '../../common/utils/challengeHelpers';
import type { Challenge, FriendSummary, ParticipantState } from '../../common/types/types';
import { getMyParticipantState, getOpponentParticipantState } from '../../common/utils/challengeHelpers';


const COUNTDOWN_TICK_MS = 60_000;
const ME_GRADIENT = ['#5B7FFF', '#6D4CFF'] as const;
const OPPONENT_GRADIENT = ['#FF8A65', '#FF6F91'] as const;

function computeAccuracy(correctCount: number | null, questionCount: number): number | null {
  if (correctCount == null || questionCount <= 0) return null;
  return Math.round((correctCount/questionCount) * 100);
}

export default function ChallengeDetailScreen() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [opponent, setOpponent] = useState<FriendSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [starting, setStarting] = useState(false);
  const [responding, setResponding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAppContext();
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  useBottomBar(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoadError(null);
      const [challengeResult, friendsResult] = await Promise.all([
        api.challenge.getChallenge(challengeId),
        api.friends.getFriends(),
      ]);
      if (!challengeResult) {
        setLoadError(theme.i18n.t('challenges.notFound'));
        return;
      }

      setChallenge(challengeResult);
      const opponentUid = getOpponentUid(challengeResult, user.uid);
      setOpponent(friendsResult.find((f) => f.uid === opponentUid) ?? null);
    } catch (err) {
      setLoadError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  }, [challengeId, user, theme.i18n]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (challenge?.status !== 'pending') return;
    const id = setInterval(() => setNowTick(Date.now()), COUNTDOWN_TICK_MS);
    return () => clearInterval(id);
  }, [challenge?.status]);

  useEffect(() => {
    if (!actionError) return;
    const timeoutId = setTimeout(() => setActionError(null), 5000);
    return () => clearTimeout(timeoutId);
  }, [actionError]);

  const handleRespond = async (accept: boolean) => {
    if (!challenge) return;
    setActionError(null);
    setResponding(true);
    try {
      const updated = await api.challenge.respondChallenge(challenge.challengeId, accept);
      setChallenge(updated);
    } catch (err) {
      setActionError(normalizeError(err).message);
    } finally {
      setResponding(false);
    }
  };

  const handlePlay = async () => {
    if (!challenge) return;
    setActionError(null);
    setStarting(true);
    try {
      const result = await api.quiz.startQuizSession({
        quizType: 'challenge',
        challengeId: challenge.challengeId,
      });
      router.push({
        pathname: '/contests/[quizId]',
        params: {
          quizId: result.sessionId,
          mode: 'challenge',
          challengeId: challenge.challengeId,
          sessionData: encodeURIComponent(JSON.stringify(result)),
        },
      });
    } catch (err) {
      setActionError(normalizeError(err).message);
    } finally {
      setStarting(false);
    }
  };

  const goToOpponentProfile = (opponentUid?: string) => {
    if (!opponentUid) return;
    router.push({ pathname: '/friends/UserProfileScreen', params: { uid: opponentUid } });
  };

  if (loading || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background }}>
        <Loading message={theme.i18n.t('challenges.loading')} fullscreen />
      </View>
    );
  }

  if (loadError || !challenge) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background }}>
        <ScreenHeader
          title={theme.i18n.t('challenges.title')}
          onBack={() => router.canGoBack() ? router.back() : router.replace('/challenges')}
        />

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.space.md,
          }}
        >
          <Feather
            name='alert-circle'
            size={theme.space.xl * 1.25}
            color={theme.color.error}
          />
          <Text
            style={{
              textAlign: 'center',
              marginTop: theme.space.sm,
              color: theme.color.textSecondary,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {loadError ?? theme.i18n.t('challenges.notFound')}
          </Text>
        </View>
      </View>
    );
  }

  const me = getMyParticipantState(challenge, user.uid);
  const opp = getOpponentParticipantState(challenge, user.uid);
  const opponentUid = getOpponentUid(challenge, user.uid);
  const pending = isPendingInviteForMe(challenge, user.uid);
  const active = isActiveForMe(challenge, user.uid);
  const waitingOnOpponent = challenge.status === 'active' && !active;
  const completed = challenge.status === 'completed';
  const settled = challenge.status === 'declined' || challenge.status === 'expired' || challenge.status === 'cancelled';
  const iWon = didIWin(challenge, user.uid);
  const opponentName = opponent?.displayName ?? theme.i18n.t('challenges.unknownOpponent');

  const myAccuracy = computeAccuracy(me?.correctCount ?? null, challenge.questionCount);
  const oppAccuracy = computeAccuracy(opp?.correctCount ?? null, challenge.questionCount);
  const bothFinished = myAccuracy != null && oppAccuracy != null;
  const accuracyDelta = bothFinished ? oppAccuracy!-myAccuracy! : null;

  const resultColor = iWon === true
    ? theme.color.success
    : iWon === false ? theme.color.error : theme.color.textMuted;
  const resultLabel = iWon === null
    ? theme.i18n.t('challenges.status.draw')
    : iWon ? theme.i18n.t('challenges.status.won') : theme.i18n.t('challenges.status.lost');

  const expiresInMs = new Date(challenge.expiresAt).getTime() - nowTick;
  const difficultyColor = challenge.difficulty === 'easy'
    ? theme.color.success
    : challenge.difficulty === 'hard' ? theme.color.error : theme.color.warning;

  const renderParticipant = (opts: {
    photoURL?: string | null;
    displayName: string;
    state: ParticipantState | null;
    gradientColors: readonly [string, string];
    onPressName?: () => void;
  }) => {
    const { photoURL, displayName, state, gradientColors, onPressName } = opts;
    const accuracy = computeAccuracy(state?.correctCount ?? null, challenge.questionCount);
    const finished = state?.completedAt != null;
    const ringColor = state?.status === 'declined'
      ? theme.color.error
      : finished ? theme.color.border : 'transparent';

    return (
      <View style={{ flex: 1, gap: theme.space.xs, alignItems: 'center' }}>
        <View
          style={{
            width: theme.space.xxl * 1.5,
            height: theme.space.xxl * 1.5,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: ringColor,
            borderRadius: theme.borderRadius.full,
          }}
        >
          {hasValidPhoto(photoURL) ? (
            <Image
              source={{ uri: photoURL! }}
              style={{
                width: theme.space.xxl * 1.25,
                height: theme.space.xxl * 1.25,
                borderRadius: theme.borderRadius.full,
              }}
            />
          ) : (
            <LinearGradient
              colors={gradientColors}
              style={{
                width: theme.space.xxl * 1.25,
                height: theme.space.xxl * 1.25,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.borderRadius.full,
              }}
            >
              <Text style={{ color: theme.color.textInverse, fontFamily: theme.fontFamily.bold }}>
                {getInitials(displayName)}
              </Text>
            </LinearGradient>
          )}

          {finished && (
            <View
              style={{
                position: 'absolute',
                bottom: 2,
                right: -2,
                width: theme.space.md,
                height: theme.space.md,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: theme.color.background,
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.success,
              }}
            >
              <Feather name='check' size={theme.fontSize.xs * 0.5} color={theme.color.textInverse} />
            </View>
          )}
        </View>

        <TouchableOpacity
          disabled={!onPressName}
          onPress={onPressName}
          hitSlop={6}
          style={{
            gap: theme.space.xs * 0.5,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              maxWidth: 100,
              fontSize: theme.fontSize.sm,
              color: theme.color.textPrimary,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {displayName}
          </Text>

          {onPressName && (
            <Feather
              name='external-link'
              size={theme.fontSize.xs}
              color={theme.color.textMuted}
            />
          )}
        </TouchableOpacity>

        <Text
          style={{
            fontSize: theme.fontSize.lg,
            color: theme.color.textPrimary,
            fontFamily: theme.fontFamily.numberBold,
          }}
        >
          {state?.score ?? 0}
        </Text>
        <Text
          style={{
            fontSize: theme.fontSize.xs,
            color: theme.color.textMuted,
            fontFamily: theme.fontFamily.regular,
            marginTop: -theme.space.xs,
          }}
        >
          {theme.i18n.t('challenges.detail.points')}
        </Text>

        <View
          style={{
            gap: theme.space.xs * 0.5,
            alignItems: 'center',
            marginTop: theme.space.xs,
          }}
        >
          {finished ? (
            <>
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.color.textSecondary,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t('common.accuracy')}
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSize.md,
                  color: theme.color.textPrimary,
                  fontFamily: theme.fontFamily.numberBold,
                }}
              >
                {accuracy}%
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSize.sm * 0.9,
                  color: theme.color.textPrimary,
                  fontFamily: theme.fontFamily.numberBold,
                }}
              >
                {theme.i18n.t('challenges.detail.correct')}{' '}{state!.correctCount}/{challenge.questionCount}
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSize.xs,
                  color: theme.color.textPrimary,
                  fontFamily: theme.fontFamily.numberBold,
                }}
              >
                {formatShortDate(state!.completedAt!)}
              </Text>
            </>
          ) : (
            <Text
              style={{
                fontSize: theme.fontSize.xs,
                color: theme.color.textMuted,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {theme.i18n.t('challenges.detail.notCompleted')}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderInfoRow = (label: string, value: string, valueColor?: string) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: theme.color.textSecondary, fontFamily: theme.fontFamily.regular }}>
        {label}
      </Text>
      <Text style={{ fontFamily: theme.fontFamily.numberBold, color: valueColor ?? theme.color.textPrimary }}>
        {value}
      </Text>
    </View>
  );


  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScreenHeader
        title={theme.i18n.t('challenges.title')}
        subtitle={`${challenge.subject} · ${theme.i18n.t('challenges.vsOpponent', { name: opponentName })}`}
        onBack={() => router.canGoBack() ? router.back() : router.replace('/challenges')}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          gap: theme.space.md,
          padding: theme.space.md,
          paddingBottom: theme.space.md,
        }}
      >
        {pending && (
          <View
            style={{
              gap: theme.space.xs,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name='clock' size={theme.fontSize.xs} color={theme.color.warning} />
            <Text
              style={{
                fontSize: theme.fontSize.xs,
                color: theme.color.warning,
                fontFamily: theme.fontFamily.numberBold,
              }}
            >
              {theme.i18n.t('challenges.detail.expiresIn', { time: formatRelativeDuration(expiresInMs) })}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.xs,
                color: theme.color.textMuted,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              ·{' '}{theme.i18n.t('challenges.detail.sentAgo', { time: formatRelativeDuration(nowTick - new Date(challenge.createdAt).getTime()) })}
            </Text>
          </View>
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-around',
            paddingVertical: theme.space.md,
          }}
        >
          {renderParticipant({
            photoURL: user.photoURL,
            displayName: theme.i18n.t('common.you'),
            state: me,
            gradientColors: ME_GRADIENT,
          })}

          <Text
            style={{
              fontSize: theme.fontSize.xl,
              color: theme.color.textMuted,
              fontFamily: theme.fontFamily.numberBold,
              marginTop: theme.space.xxl/2 - theme.fontSize.lg/2,
            }}
          >
            VS
          </Text>

          {renderParticipant({
            photoURL: opponent?.photoURL,
            displayName: opponentName ?? theme.i18n.t('challenges.unknownOpponent'),
            state: opp,
            gradientColors: OPPONENT_GRADIENT,
            onPressName: opponentUid ? () => goToOpponentProfile(opponentUid) : undefined,
          })}
        </View>

        {bothFinished && (
          <View style={{ gap: theme.space.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text
                style={{
                  color: resultColor,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {resultLabel}
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSize.xs,
                  color: theme.color.textSecondary,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {accuracyDelta === 0
                  ? theme.i18n.t('challenges.detail.tied')
                  : theme.i18n.t('challenges.detail.leadBy', {
                      name: accuracyDelta! > 0 ? opponentName : theme.i18n.t('common.you'),
                      percent: Math.abs(accuracyDelta!),
                    })}
              </Text>
            </View>

            <View
              style={{
                overflow: 'hidden',
                height: theme.space.sm,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: theme.color.border,
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${Math.max(myAccuracy!, oppAccuracy!)}%`,
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: resultColor,
                }}
              />
            </View>

            <Text
              style={{
                alignSelf: 'flex-end',
                fontSize: theme.fontSize.xs,
                color: theme.color.textMuted,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {challenge.questionCount} {theme.i18n.t('common.questions')}
            </Text>
          </View>
        )}

        <View
          style={{
            gap: theme.space.sm,
            padding: theme.space.md,
            borderWidth: 1.5,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.xl,
            backgroundColor: theme.color.card,
          }}
        >
          {renderInfoRow(theme.i18n.t('common.subject'), challenge.subject)}
          {renderInfoRow(theme.i18n.t('common.difficulty'), theme.i18n.t(`common.${challenge.difficulty}`), difficultyColor)}
          {renderInfoRow(theme.i18n.t('common.questions'), String(challenge.questionCount))}
          {renderInfoRow(
            theme.i18n.t('challenges.detail.timeLimit'),
            `${Math.round(challenge.timeLimitSecs/60)} ${theme.i18n.t('common.min')}`
)}
          {renderInfoRow(
            theme.i18n.t('challenges.reward'),
            `+${challenge.rewards.winnerEp} / +${challenge.rewards.participationEp} ${theme.i18n.t('common.ep')}`,
            theme.color.accent
          )}
        </View>

        {settled && (
          <View
            style={{
              alignItems: 'center',
              padding: theme.space.md,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.textMuted + '18',
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSize.md,
                color: theme.color.textMuted,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {theme.i18n.t(`challenges.status.${challenge.status}`)}
            </Text>
          </View>
        )}

        {actionError && (
          <View
            style={{
              gap: theme.space.xs,
              flexDirection: 'row',
              alignItems: 'center',
              padding: theme.space.sm,
              borderWidth: 1,
              borderColor: theme.color.error,
              borderRadius: theme.borderRadius.md,
              backgroundColor: `${theme.color.error}15`,
            }}
          >
            <Feather name='alert-circle' size={theme.fontSize.sm} color={theme.color.error} />
            <Text
              style={{
                flex: 1,
                color: theme.color.error,
                fontSize: theme.fontSize.xs,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {actionError}
            </Text>

            <TouchableOpacity onPress={() => setActionError(null)} hitSlop={8}>
              <Feather
                name='x'
                size={theme.fontSize.sm}
                color={theme.color.error}
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View
        style={{
          paddingTop: theme.space.sm,
          paddingBottom: insets.bottom * 1.25,
          paddingHorizontal: theme.space.lg,
          backgroundColor: theme.color.background,
        }}
      >
        {pending && (
          <View style={{ gap: theme.space.sm, flexDirection: 'row' }}>
            <TouchableOpacity
              disabled={responding}
              onPress={() => handleRespond(false)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: theme.space.sm * 1.25,
                borderWidth: 1.5,
                borderColor: theme.color.error,
                borderRadius: theme.borderRadius.lg,
                opacity: responding ? 0.6 : 1,
              }}
            >
              <Text style={{ color: theme.color.error, fontFamily: theme.fontFamily.bold }}>
                {theme.i18n.t('challenges.decline')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={responding}
              onPress={() => handleRespond(true)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: theme.space.sm * 1.25,
                borderRadius: theme.borderRadius.lg,
                backgroundColor: theme.color.success,
                opacity: responding ? 0.6 : 1,
              }}
            >
              {responding ? (
                <ActivityIndicator color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse} />
              ) : (
                <Text
                  style={{
                    fontFamily: theme.fontFamily.bold,
                    color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                  }}
                >
                  {theme.i18n.t('challenges.accept')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {active && (
          <TouchableOpacity
            disabled={starting}
            onPress={handlePlay}
            style={{
              alignItems: 'center',
              paddingVertical: theme.space.md * 0.9,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.accent,
              opacity: starting ? 0.6 : 1,
            }}
          >
            {starting ? (
              <ActivityIndicator color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse} />
            ) : (
              <Text
                style={{
                  fontSize: theme.fontSize.lg,
                  fontFamily: theme.fontFamily.bold,
                  color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                }}
              >
                {theme.i18n.t('common.play')} →
              </Text>
            )}
          </TouchableOpacity>
        )}

        {waitingOnOpponent && (
          <View
            style={{
              gap: theme.space.xs,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.md * 0.9,
              borderWidth: 1.5,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.card,
            }}
          >
            <Feather name='clock' size={theme.fontSize.md} color={theme.color.textMuted} />
            <Text style={{ color: theme.color.textMuted, fontFamily: theme.fontFamily.bold }}>
              {theme.i18n.t('challenges.waitingForOpponent')}
            </Text>
          </View>
        )}

        {completed && (
          <View
            style={{
              gap: theme.space.xs,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.md * 0.9,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: resultColor + '18',
            }}
          >
            <Feather
              name={iWon === null ? 'minus-circle' : iWon ? 'award' : 'frown'}
              size={theme.fontSize.lg}
              color={resultColor}
            />
            <Text
              style={{
                color: resultColor,
                fontSize: theme.fontSize.lg,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {resultLabel}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
