import { View, Text, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../theme/ThemeContext';
import { withAlpha } from '../common/utils/withAlpha';

type LeaderboardRankCardProps = {
  rank: number;
  name: string;
  specialty?: string | null;
  points: number;
  photoURL?: string | null;
  isSimple?: boolean;
  isCurrentUser?: boolean;
};

export function LeaderboardRankCard({
  rank,
  name,
  specialty,
  points,
  photoURL,
  isSimple = false,
  isCurrentUser = false,
}: LeaderboardRankCardProps) {
  const { theme } = useTheme();

  const getInitials = (userName: string) => {
    return userName
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  // Determine dynamic theme styling for Gold (#1), Silver (#2), Bronze (#3), or standard (#4+)
  // In simple mode (e.g. friends leaderboard), top 3 gradients are omitted
  const isGold = !isSimple && rank === 1;
  const isSilver = !isSimple && rank === 2;
  const isBronze = !isSimple && rank === 3;
  const isTop3 = isGold || isSilver || isBronze;

  const mainColor = isGold
    ? theme.color.warning
    : isSilver
    ? theme.color.info
    : isBronze
    ? theme.color.premium
    : isCurrentUser
    ? theme.color.accent
    : theme.color.textMuted;

  const cardGradientColors: [string, string] = isGold
    ? [
        withAlpha(theme.color.warning, theme.isDark ? 0.16 : 0.08),
        withAlpha(theme.color.warning, theme.isDark ? 0.04 : 0.02),
      ]
    : isSilver
    ? [
        withAlpha(theme.color.info, theme.isDark ? 0.14 : 0.07),
        withAlpha(theme.color.info, theme.isDark ? 0.03 : 0.02),
      ]
    : isBronze
    ? [
        withAlpha(theme.color.premium, theme.isDark ? 0.14 : 0.07),
        withAlpha(theme.color.premium, theme.isDark ? 0.03 : 0.02),
      ]
    : [theme.color.card, theme.color.card];

  const borderColor = isCurrentUser
    ? withAlpha(theme.color.accent, 0.45)
    : isGold
    ? withAlpha(theme.color.warning, 0.35)
    : isSilver
    ? withAlpha(theme.color.info, 0.3)
    : isBronze
    ? withAlpha(theme.color.premium, 0.3)
    : theme.color.border;

  const avatarGradientColors: [string, string] = isTop3
    ? [withAlpha(mainColor, 0.28), withAlpha(mainColor, 0.1)]
    : [withAlpha(theme.color.accent, 0.2), withAlpha(theme.color.accent, 0.08)];

  const avatarBorderColor = isTop3 ? withAlpha(mainColor, 0.5) : withAlpha(theme.color.accent, 0.3);
  const avatarTextColor = isTop3 ? mainColor : theme.color.accent;

  return (
    <View
      style={{
        borderRadius: theme.borderRadius.xl,
        borderWidth: isCurrentUser ? 1.5 : 1,
        borderColor,
        overflow: 'hidden',
        backgroundColor: isCurrentUser
          ? withAlpha(theme.color.accent, theme.isDark ? 0.09 : 0.04)
          : theme.color.card,
        elevation: isCurrentUser ? 2 : 1,
        boxShadow: theme.isDark ? 'none' : '0px 2px 6px rgba(0, 0, 0, 0.03)',
      }}
    >
      <LinearGradient
        colors={cardGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: theme.space.sm * 1.5,
          paddingHorizontal: theme.space.md,
          backgroundColor: isTop3 ? 'transparent' : 'transparent',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: theme.space.sm }}>
          {/* Rank Indicator */}
          <View
            style={{
              minWidth: 36,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            {isTop3 ? (
              <Feather
                name="award"
                size={theme.fontSize.md}
                color={mainColor}
                style={{ marginRight: 2 }}
              />
            ) : null}
            <Text
              style={{
                color: isTop3 ? mainColor : isCurrentUser ? theme.color.accent : theme.color.textMuted,
                fontSize: isTop3 ? theme.fontSize.md + 1 : theme.fontSize.md,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.number,
              }}
            >
              #{rank}
            </Text>
          </View>

          {/* Avatar & User Details */}
          <View
            style={{
              gap: theme.space.sm * 1.25,
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: theme.space.xs,
              flex: 1,
            }}
          >
            {photoURL ? (
              <Image
                source={{ uri: photoURL }}
                style={{
                  width: theme.space.xl * 1.25,
                  height: theme.space.xl * 1.25,
                  borderRadius: theme.borderRadius.full,
                  borderWidth: 2,
                  borderColor: avatarBorderColor,
                }}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={avatarGradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: theme.space.xl * 1.25,
                  height: theme.space.xl * 1.25,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: avatarBorderColor,
                  borderRadius: theme.borderRadius.full,
                }}
              >
                <Text
                  style={{
                    color: avatarTextColor,
                    fontSize: theme.fontSize.md,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {getInitials(name)}
                </Text>
              </LinearGradient>
            )}

            <View style={{ gap: theme.space.xs * 0.5, flexDirection: 'column', justifyContent: 'flex-start', flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: isCurrentUser ? theme.color.accent : theme.color.textPrimary,
                    fontSize: theme.fontSize.md,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.regular,
                    flexShrink: 1,
                  }}
                >
                  {name}
                </Text>
                {isCurrentUser && (
                  <View
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      borderRadius: theme.borderRadius.full,
                      backgroundColor: withAlpha(theme.color.accent, 0.15),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: theme.fontWeight.bold,
                        color: theme.color.accent,
                        fontFamily: theme.fontFamily.regular,
                      }}
                    >
                      {theme.i18n.t('common.you') || 'You'}
                    </Text>
                  </View>
                )}
              </View>
              {specialty ? (
                <Text
                  numberOfLines={1}
                  style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs * 1.1, fontFamily: theme.fontFamily.light }}
                >
                  {specialty}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* EP Points */}
        <View style={{ gap: theme.space.xs * 0.5, flexDirection: 'column', alignItems: 'flex-end' }}>
          <Text
            style={{
              color: isTop3 ? mainColor : isCurrentUser ? theme.color.accent : theme.color.textPrimary,
              fontSize: theme.fontSize.md,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.number,
            }}
          >
            {points.toLocaleString()}
          </Text>
          <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs * 1.1, fontFamily: theme.fontFamily.light }}>
            {theme.i18n.t('common.ep') || 'EP'}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}