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
import type { Challenge, FriendSummary } from '../../common/types/types';
import { didIWin, getOpponentUid } from '../../common/utils/challengeHelpers';
import { isActiveForMe, isPendingInviteForMe } from '../../common/utils/challengeHelpers';
import { getMyParticipantState, getOpponentParticipantState } from '../../common/utils/challengeHelpers';


export default function ChallengeDetailScreen() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [opponent, setOpponent] = useState<FriendSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAppContext();
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  useBottomBar(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const [challengeResult, friendsResult] = await Promise.all([
        api.challenge.getChallenge(challengeId),
        api.friends.getFriends(),
      ]);
      if (!challengeResult) {
        setError(theme.i18n.t('challenges.notFound'));
        return;
      }

      setChallenge(challengeResult);
      const opponentUid = getOpponentUid(challengeResult, user.uid);
      setOpponent(friendsResult.find((f) => f.uid === opponentUid) ?? null);
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  }, [challengeId, user, theme.i18n]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRespond = async (accept: boolean) => {
    if (!challenge) return;
    setResponding(true);
    try {
      const updated = await api.challenge.respondChallenge(challenge.challengeId, accept);
      setChallenge(updated);
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setResponding(false);
    }
  };

  const handlePlay = async () => {
    if (!challenge) return;
    setStarting(true);
    setError(null);
    try {
      const result = await api.quiz.startQuizSession({
        quizType: 'challenge',
        challengeId: challenge.challengeId,
      } as never);
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
      setError(normalizeError(err).message);
    } finally {
      setStarting(false);
    }
  };

  if (loading || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background }}>
        <Loading message={theme.i18n.t('challenges.loading')} fullscreen />
      </View>
    );
  }

  if (error || !challenge) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.background }}>
        <ScreenHeader title={theme.i18n.t('challenges.title')} />
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
            {error ?? theme.i18n.t('challenges.notFound')}
          </Text>
        </View>
      </View>
    );
  }

  const me = getMyParticipantState(challenge, user.uid);
  const oppState = getOpponentParticipantState(challenge, user.uid);
  const pending = isPendingInviteForMe(challenge, user.uid);
  const active = isActiveForMe(challenge, user.uid);
  const iWon = didIWin(challenge, user.uid);
  const opponentName = opponent?.displayName ?? theme.i18n.t('challenges.unknownOpponent');

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScreenHeader
        title={theme.i18n.t('challenges.title')}
        subtitle={challenge.subject}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          gap: theme.space.md,
          padding: theme.space.md,
          paddingBottom: insets.bottom * 1.5,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            paddingVertical: theme.space.md,
          }}
        >
          <View style={{ gap: theme.space.xs, alignItems: 'center' }}>
            {hasValidPhoto(user.photoURL) ? (
              <Image
                source={{ uri: user.photoURL! }}
                style={{
                  width: theme.space.xxl,
                  height: theme.space.xxl,
                  borderRadius: theme.borderRadius.full,
                }}
              />
            ) : (
              <LinearGradient
                colors={['#5B7FFF', '#6D4CFF']}
                style={{
                  width: theme.space.xxl,
                  height: theme.space.xxl,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: theme.borderRadius.full,
                }}
              >
                <Text style={{ color: theme.color.textInverse, fontFamily: theme.fontFamily.bold }}>
                  {getInitials(user.displayName ?? theme.i18n.t('common.you'))}
                </Text>
              </LinearGradient>
            )}

            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.color.textPrimary,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {theme.i18n.t('common.you')}
            </Text>
            {me?.score != null && (
              <Text
                style={{
                  color: theme.color.accent,
                  fontSize: theme.fontSize.lg,
                  fontFamily: theme.fontFamily.numberBold,
                }}
              >
                {me.score}
              </Text>
            )}
          </View>

          <Text
            style={{
              fontSize: theme.fontSize.lg,
              color: theme.color.textMuted,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            VS
          </Text>

          <View style={{ gap: theme.space.xs, alignItems: 'center' }}>
            {hasValidPhoto(opponent?.photoURL) ? (
              <Image
                source={{ uri: opponent!.photoURL! }}
                style={{
                  width: theme.space.xxl,
                  height: theme.space.xxl,
                  borderRadius: theme.borderRadius.full,
                }}
              />
            ) : (
              <LinearGradient
                colors={['#FF8A65', '#FF6F91']}
                style={{
                  width: theme.space.xxl,
                  height: theme.space.xxl,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: theme.borderRadius.full,
                }}
              >
                <Text style={{ color: theme.color.textInverse, fontFamily: theme.fontFamily.bold }}>
                  {getInitials(opponentName ?? '')}
                </Text>
              </LinearGradient>
            )}

            <Text
              numberOfLines={1}
              style={{
                maxWidth: 100,
                fontSize: theme.fontSize.sm,
                color: theme.color.textPrimary,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {opponentName}
            </Text>
            {oppState?.score != null && (
              <Text
                style={{
                  fontSize: theme.fontSize.lg,
                  color: theme.color.textSecondary,
                  fontFamily: theme.fontFamily.numberBold,
                }}
              >
                {oppState.score}
              </Text>
            )}
          </View>
        </View>

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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.color.textSecondary, fontFamily: theme.fontFamily.regular }}>
              {theme.i18n.t('common.subject')}
            </Text>
            <Text style={{ color: theme.color.textPrimary, fontFamily: theme.fontFamily.bold }}>
              {challenge.subject}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.color.textSecondary, fontFamily: theme.fontFamily.regular }}>
              {theme.i18n.t('common.difficulty')}
            </Text>
            <Text style={{ color: theme.color.textPrimary, fontFamily: theme.fontFamily.bold }}>
              {theme.i18n.t(`common.${challenge.difficulty}`)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.color.textSecondary, fontFamily: theme.fontFamily.regular }}>
              {theme.i18n.t('common.questions')}
            </Text>
            <Text style={{ color: theme.color.textPrimary, fontFamily: theme.fontFamily.bold }}>
              {challenge.questionCount}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.color.textSecondary, fontFamily: theme.fontFamily.regular }}>
              {theme.i18n.t('challenges.reward')}
            </Text>
            <Text style={{ color: theme.color.accent, fontFamily: theme.fontFamily.numberBold }}>
              +{challenge.rewards.winnerEp} / +{challenge.rewards.participationEp} {theme.i18n.t('common.ep')}
            </Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {pending && (
          <View style={{ gap: theme.space.sm, flexDirection: 'row' }}>
            <TouchableOpacity
              disabled={responding}
              onPress={() => handleRespond(false)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: theme.space.sm,
                borderWidth: 1.5,
                borderColor: theme.color.error,
                borderRadius: theme.borderRadius.lg,
                opacity: responding ? 0.6 : 1,
              }}
            >
              <Text style={{ color: theme.color.error, fontFamily: theme.fontFamily.bold }}>
                {theme.i18n.t('common.cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={responding}
              onPress={() => handleRespond(true)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: theme.space.sm,
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
                  {theme.i18n.t('common.done')}
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

        {challenge.status === 'active' && !active && (
          <View style={{ alignItems: 'center', padding: theme.space.md }}>
            <Feather name='clock' size={theme.space.lg} color={theme.color.textMuted} />
            <Text
              style={{
                color: theme.color.textMuted,
                fontFamily: theme.fontFamily.regular,
                marginTop: theme.space.xs,
              }}
            >
              {theme.i18n.t('challenges.waitingForOpponent')}
            </Text>
          </View>
        )}

        {challenge.status === 'completed' && (
          <View
            style={{
              alignItems: 'center',
              padding: theme.space.md,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: (iWon
                ? theme.color.success
                : iWon === false ? theme.color.error : theme.color.textMuted) + '18',
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSize.lg,
                fontFamily: theme.fontFamily.bold,
                color: iWon
                  ? theme.color.success
                  : iWon === false ? theme.color.error : theme.color.textMuted,
              }}
            >
              {iWon === null
                ? theme.i18n.t('challenges.status.draw')
                : iWon ? theme.i18n.t('challenges.status.won') : theme.i18n.t('challenges.status.lost')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
