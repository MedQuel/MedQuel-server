import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, Image, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { hasValidPhoto } from '../../common/utils/imageUrl';
import { getInitials } from '../../common/utils/getInitials';
import { getTimeRemaining } from '../../common/utils/dateUtils';
import type { Challenge, FriendSummary } from '../../common/types/types';
import { didIWin, getOpponentUid } from '../../common/utils/challengeHelpers';
import { isActiveForMe, isPendingInviteForMe } from '../../common/utils/challengeHelpers';


type ChallengesCardProps = {
  challenges: Challenge[];
  friendsById: Map<string, FriendSummary>;
  currentUserId: string;
  currentUserName: string;
  currentUserPhoto?: string | null;
};

function Avatar({ photoURL, name, size, theme }: {
  photoURL?: string | null;
  name: string;
  size: number;
  theme: any;
}) {
  if (hasValidPhoto(photoURL)) {
    return (
      <Image
        source={{ uri: photoURL! }}
        style={{
          width: size,
          height: size,
          borderWidth: 2,
          borderColor: theme.color.card,
          borderRadius: theme.borderRadius.full,
        }}
      />
    );
  }

  return (
    <LinearGradient
      colors={theme.isDark ? ['#4F7CFF', '#7C3AED'] : ['#5B7FFF', '#6D4CFF']}
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.color.card,
        borderRadius: theme.borderRadius.full,
      }}
    >
      <Text
        style={{
          fontSize: size * 0.36,
          color: theme.color.textInverse,
          fontFamily: theme.fontFamily.bold,
        }}
      >
        {getInitials(name)}
      </Text>
    </LinearGradient>
  );
}


export function ChallengesCard({ challenges, friendsById, currentUserId, currentUserName, currentUserPhoto }: ChallengesCardProps) {
  const router = useRouter();
  const { theme } = useTheme();

  const { highlighted, opponentName, opponentPhoto, pendingCount } = useMemo(() => {
    const pending = challenges.filter((c) => isPendingInviteForMe(c, currentUserId));
    const active = challenges.filter((c) => isActiveForMe(c, currentUserId));
    const recentCompleted = challenges
      .filter((c) => c.status === 'completed')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const top = pending[0] ?? active[0] ?? recentCompleted[0] ?? null;
    const opponentUid = top ? getOpponentUid(top, currentUserId) : undefined;
    const opponent = opponentUid ? friendsById.get(opponentUid) : undefined;

    return {
      highlighted: top,
      opponentName: opponent?.displayName ?? theme.i18n.t('challenges.unknownOpponent'),
      opponentPhoto: opponent?.photoURL ?? null,
      pendingCount: pending.length,
    };
  }, [challenges, currentUserId, friendsById, theme.i18n]);

  if (!highlighted) return null;
  const pending = isPendingInviteForMe(highlighted, currentUserId);
  const active = isActiveForMe(highlighted, currentUserId);
  const iWon = didIWin(highlighted, currentUserId);
  const remaining = getTimeRemaining(highlighted.expiresAt);

  const rightBadge = (() => {
    if (active) {
      return { label: theme.i18n.t('common.play'), color: theme.color.accent, solid: true };
    }

    if (highlighted.status === 'completed') {
      if (iWon === true)
        return { label: theme.i18n.t('challenges.status.won'), color: theme.color.success, solid: false };
      if (iWon === false)
        return { label: theme.i18n.t('challenges.status.lost'), color: theme.color.error, solid: false };

      return {
        label: theme.i18n.t('challenges.status.draw'),
        color: theme.color.textMuted,
        solid: false,
      };
    }

    return null;
  })();


  return (
    <View style={{ gap: theme.space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: theme.fontSize.lg,
              color: theme.color.textPrimary,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('home.challenges.title')}
          </Text>

          {pendingCount > 0 && (
            <View
              style={{
                minWidth: theme.space.md,
                height: theme.space.md,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.borderRadius.full,
                paddingHorizontal: theme.space.xs * 0.6,
                backgroundColor: theme.color.error,
              }}
            >
              <Text
                style={{
                  color: theme.color.textInverse,
                  fontSize: theme.fontSize.xs * 0.9,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {pendingCount}
              </Text>
            </View>
          )}
        </View>

        {challenges.length > 1 && (
          <TouchableOpacity onPress={() => router.push('/challenges')}>
            <Text
              style={{
                color: theme.color.accent,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {theme.i18n.t('home.view_all')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: '/challenges/[challengeId]',
            params: { challengeId: highlighted.challengeId },
          })
        }
        style={{
          padding: theme.space.md,
          borderWidth: 1.5,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.xl,
          backgroundColor: theme.color.card,
          boxShadow: theme.isDark ? '0px 8px 20px rgba(0,0,0,0.22)' : '0px 8px 18px rgba(15,23,42,0.06)',
        }}
      >
        <View style={{ gap: theme.space.sm, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar
              photoURL={currentUserPhoto}
              name={currentUserName}
              size={theme.space.xxl * 0.85}
              theme={theme}
            />
            <View
              style={{
                zIndex: 2,
                width: theme.space.lg,
                height: theme.space.lg,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: -theme.space.sm,
                marginRight: -theme.space.sm,
                borderWidth: 2,
                borderColor: theme.color.card,
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.warning,
              }}
            >
              <Feather name='zap' size={theme.fontSize.sm} color={theme.color.textInverse} />
            </View>
            <Avatar
              photoURL={opponentPhoto}
              name={opponentName}
              size={theme.space.xxl * 0.85}
              theme={theme}
            />
          </View>

          <View style={{ flex: 1, gap: theme.space.xs * 0.5 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: theme.fontSize.md,
                color: theme.color.textPrimary,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {theme.i18n.t('challenges.vsOpponent', { name: opponentName })}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.color.textSecondary,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {highlighted.subject} ·{' '}
              {theme.i18n.t(`common.${highlighted.difficulty}`)} ·{' '}
              {highlighted.questionCount} {theme.i18n.t('common.questions')}
            </Text>

            {pending && remaining.kind !== 'expired' && (
              <Text
                style={{
                  color: theme.color.warning,
                  fontSize: theme.fontSize.xs,
                  fontFamily: theme.fontFamily.light,
                }}
              >
                {remaining.kind === 'hours'
                  ? theme.i18n.t('challenges.timeLeftHours', { count: remaining.value })
                  : theme.i18n.t('challenges.timeLeftMinutes', { count: remaining.value })
                }
              </Text>
            )}
          </View>

          {rightBadge && (
            <View
              style={{
                paddingVertical: theme.space.xs,
                paddingHorizontal: theme.space.sm,
                borderRadius: rightBadge.solid ? theme.borderRadius.md : theme.borderRadius.full,
                backgroundColor: rightBadge.solid ? rightBadge.color : rightBadge.color + '18',
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.bold,
                  color: rightBadge.solid ? theme.color.textInverse : rightBadge.color,
                }}
              >
                {rightBadge.label}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}
