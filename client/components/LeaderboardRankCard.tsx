import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../theme/ThemeContext';


type LeaderboardRankCardProps = {
  rank: number;
  name: string;
  specialty: string;
  points: number;
};

export function LeaderboardRankCard({
  rank,
  name,
  specialty,
  points,
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

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.space.sm * 1.5,
        paddingHorizontal: theme.space.md,
        borderWidth: 1.5,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          style={{
            color: theme.color.textMuted,
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
            marginLeft: theme.space.sm * 1.5,
          }}
        >
          <LinearGradient
            colors={[`${theme.color.accent}40`, `${theme.color.accent}10`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: theme.space.xl * 1.25,
              height: theme.space.xl * 1.25,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: theme.color.accent + '88',
              borderRadius: theme.borderRadius.full,
            }}
          >
            <Text
              style={{
                color: theme.color.accent,
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {getInitials(name)}
            </Text>
          </LinearGradient>

          <View style={{ gap: theme.space.xs * 0.5, flexDirection: 'column', justifyContent: 'flex-start' }}>
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {name}
            </Text>
            <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs * 1.1, fontFamily: theme.fontFamily.light }}>
              {specialty}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ gap: theme.space.xs * 0.5, flexDirection: 'column', alignItems: 'flex-end' }}>
        <Text
          style={{
            color: theme.color.textPrimary,
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
