import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../theme/ThemeContext';
import { withAlpha } from '../common/utils/withAlpha';

type CurrentUserLeaderboardRankCardProps = {
  name: string;
  rank: number;
  points: number;
  weeklyGrowth: number;
};

export function CurrentUserLeaderboardRankCard({ name, rank, points, weeklyGrowth }: CurrentUserLeaderboardRankCardProps) {
  const avatarInitial = name.trim().charAt(0).toUpperCase();
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.space.sm * 1.5,
        paddingHorizontal: theme.space.md,
        borderWidth: 1,
        borderColor: withAlpha(theme.color.accent, 0.35),
        borderRadius: theme.borderRadius.xl,
        backgroundColor: withAlpha(theme.color.accent, theme.isDark ? 0.08 : 0.04),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          style={{
            color: theme.color.accent,
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.number,
          }}
        >
          #{rank}
        </Text>

        <View
          style={{
            gap: theme.space.sm * 1.25,
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: theme.space.md,
          }}
        >
          <LinearGradient
            colors={[theme.color.accent, withAlpha(theme.color.accent, 0.75)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: theme.space.xl * 1.25,
              height: theme.space.xl * 1.25,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.borderRadius.full,
            }}
          >
            <Text
              style={{
                color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {avatarInitial}
            </Text>
          </LinearGradient>

          <View style={{ gap: theme.space.xs * 0.5, flexDirection: 'column', justifyContent: 'flex-start' }}>
            <Text
              style={{
                color: theme.color.accent,
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {theme.i18n.t('common.you')} · {name}
            </Text>
            <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
              {weeklyGrowth >= 0 ? (
                <Feather name='trending-up' size={theme.space.sm * 1.5} color={theme.color.success} />
              ) : (
                <Feather name='trending-down' size={theme.space.sm * 1.5} color={theme.color.error} />
              )}

              <Text
                style={{
                  color: weeklyGrowth >= 0 ? theme.color.success : theme.color.error,
                  fontSize: theme.fontSize.xs * 1.1,
                  fontFamily: theme.fontFamily.light,
                }}
              >
                {Math.abs(weeklyGrowth)} {theme.i18n.t('common.this_week')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ gap: theme.space.xs * 0.5, flexDirection: 'column', alignItems: 'flex-end' }}>
        <Text
          style={{
            color: theme.color.accent,
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.number,
          }}
        >
          {points.toLocaleString()}
        </Text>
        <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs * 1.1, fontFamily: theme.fontFamily.light }}>
          {theme.i18n.t('common.ep')}
        </Text>
      </View>
    </View>
  );
}