import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, Image, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { hasValidPhoto } from '../../common/utils/imageUrl';
import { getInitials } from '../../common/utils/getInitials';
import type { Challenge, FriendSummary } from '../../common/types/types';
import { didIWin, isActiveForMe, isPendingInviteForMe } from '../../common/utils/challengeHelpers';


type ChallengeMatchRowProps = {
  challenge: Challenge;
  currentUserId: string;
  opponent?: FriendSummary;
  onPress: () => void;
};

export function ChallengeMatchRow({ challenge, currentUserId, opponent, onPress }: ChallengeMatchRowProps) {
  const { theme } = useTheme();

  const opponentName = opponent?.displayName ?? theme.i18n.t('challenges.unknownOpponent');
  const pendingForMe = isPendingInviteForMe(challenge, currentUserId);
  const activeForMe = isActiveForMe(challenge, currentUserId);
  const iWon = didIWin(challenge, currentUserId);

  const badge = (() => {
    if (challenge.status === 'pending') {
      return pendingForMe
        ? { label: theme.i18n.t('challenges.respond'), color: theme.color.accent, solid: true }
        : { label: theme.i18n.t('challenges.waitingOnThem'), color: theme.color.textMuted, solid: false };
    }
    if (challenge.status === 'active') {
      return activeForMe
        ? { label: theme.i18n.t('common.play'), color: theme.color.accent, solid: true }
        : { label: theme.i18n.t('challenges.status.waiting'), color: theme.color.textMuted, solid: false };
    }
    if (challenge.status === 'completed') {
      if (iWon === true) {
        return { label: theme.i18n.t('challenges.status.won'), color: theme.color.success, solid: false };
      }
      if (iWon === false) {
        return { label: theme.i18n.t('challenges.status.lost'), color: theme.color.error, solid: false };
      }

      return { label: theme.i18n.t('challenges.status.draw'), color: theme.color.textMuted, solid: false };
    }

    return { label: theme.i18n.t(`challenges.status.${challenge.status}`), color: theme.color.textMuted, solid: false };
  })();


  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        gap: theme.space.sm,
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.space.sm * 1.1,
        paddingHorizontal: theme.space.md,
        borderWidth: 1.5,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
      }}
    >
      {hasValidPhoto(opponent?.photoURL) ? (
        <Image
          source={{ uri: opponent!.photoURL! }}
          style={{
            width: theme.space.xxl * 0.75,
            height: theme.space.xxl * 0.75,
            borderRadius: theme.borderRadius.full,
          }}
        />
      ) : (
        <LinearGradient
          colors={theme.isDark ? ['#4F7CFF', '#7C3AED'] : ['#5B7FFF', '#6D4CFF']}
          style={{
            width: theme.space.xxl * 0.75,
            height: theme.space.xxl * 0.75,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.borderRadius.full,
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              color: theme.color.textInverse,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {getInitials(opponentName ?? '')}
          </Text>
        </LinearGradient>
      )}

      <View style={{ flex: 1, gap: theme.space.xs * 0.4 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: theme.fontSize.md,
            color: theme.color.textPrimary,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {opponentName}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {challenge.subject} · {theme.i18n.t(`common.${challenge.difficulty}`)}{' '}
          · {challenge.questionCount} {theme.i18n.t('common.questions')}
        </Text>
      </View>

      <View
        style={{
          paddingVertical: theme.space.xs,
          paddingHorizontal: theme.space.sm,
          borderRadius: badge.solid ? theme.borderRadius.md : theme.borderRadius.full,
          backgroundColor: badge.solid ? badge.color + 'CC': badge.color + '18',
        }}
      >
        <Text
          style={{
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.bold,
            color: badge.solid
              ? theme.isDark ? theme.color.textPrimary : theme.color.textInverse
              : badge.color,
          }}
        >
          {badge.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
