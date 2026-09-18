import { View, Text, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../theme/ThemeContext';
import { withAlpha } from '../common/utils/withAlpha';

type CurrentUserLeaderboardRankCardProps = {
  name: string;
  rank: number;
  points: number;
  weeklyGrowth: number;
  photoURL?: string | null;
};

export function CurrentUserLeaderboardRankCard({ name, rank, points, weeklyGrowth, photoURL }: CurrentUserLeaderboardRankCardProps) {
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
        borderWidth: 1.5,
        borderColor: withAlpha(theme.color.accent, theme.isDark ? 0.45 : 0.4),
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
        elevation: 2,
        boxShadow: theme.isDark ? 'none' : '0px 2px 8px rgba(37, 99, 235, 0.08)',
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
          {photoURL ? (
            <Image
              source={{ uri: photoURL }}
              style={{
                width: theme.space.xl * 1.25,
                height: theme.space.xl * 1.25,
                borderRadius: theme.borderRadius.full,
                borderWidth: 1.5,
                borderColor: theme.color.accent,
              }}
              resizeMode="cover"
            />
          ) : (
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
                  color: '#FFFFFF',
                  fontSize: theme.fontSize.md,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {avatarInitial}
              </Text>
            </LinearGradient>
          )}

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