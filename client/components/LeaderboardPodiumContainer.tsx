import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import { withAlpha } from '../common/utils/withAlpha';


type User = {
  id: string;
  name: string;
  score: number;
};
type LeaderboardPodiumContainerProps = {
  users: User[];
};

function getInitials(name: string) {
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function LeaderboardPodiumContainer({ users }: LeaderboardPodiumContainerProps) {
  const { theme } = useTheme();

  const topThree = [...users].sort((a, b) => b.score - a.score).slice(0, 3);
  const podium = [
    { rank: 2, user: topThree[1] },
    { rank: 1, user: topThree[0] },
    { rank: 3, user: topThree[2] },
  ].filter((item): item is { rank: 1 | 2 | 3; user: User } => item.user !== undefined);

  const rankStyles = {
    1: {
      color: theme.color.warning,
      avatarSize: theme.space.xxl * 1.5,
      podiumHeight: theme.space.xxl * 2,
    },
    2: {
      color: theme.color.info,
      avatarSize: theme.space.xxl * 1.25,
      podiumHeight: theme.space.xxl * 1.5,
    },
    3: {
      color: theme.color.premium,
      avatarSize: theme.space.xxl * 1.2,
      podiumHeight: theme.space.xxl,
    },
  } as const;

  return (
    <LinearGradient
      colors={[theme.color.card, theme.color.surface]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        overflow: 'hidden',
        paddingTop: theme.space.lg,
        paddingHorizontal: theme.space.lg,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
        {podium.map((item) => {
          const user = item.user;
          const rank = item.rank;
          const isWinner = rank === 1;
          const style = rankStyles[rank as keyof typeof rankStyles];

          return (
            <View
              key={user.id}
              style={{ flex: isWinner ? 1.25 : 1.1, alignItems: 'center', justifyContent: 'flex-end' }}
            >
              <View style={{ alignItems: 'center', marginBottom: theme.space.sm }}>
                {isWinner && (
                  <MaterialCommunityIcons
                    name='crown'
                    size={theme.space.lg}
                    color={theme.color.warning}
                  />
                )}

                <View style={{ position: 'relative' }}>
                  <View
                    style={{
                      width: style.avatarSize,
                      height: style.avatarSize,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginVertical: theme.space.xs,
                      borderWidth: 2.5,
                      borderRadius: theme.borderRadius.full,
                      borderColor: style.color,
                      backgroundColor: theme.color.surface,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                        fontSize: isWinner ? theme.fontSize.xl : theme.fontSize.lg,
                        fontWeight: theme.fontWeight.bold,
                        fontFamily: theme.fontFamily.regular,
                      }}
                    >
                      {getInitials(user.name)}
                    </Text>
                  </View>

                  <View
                    style={{
                      position: 'absolute',
                      right: -4,
                      bottom: 6,
                      width: theme.space.md * 1.25,
                      height: theme.space.md * 1.25,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: theme.borderRadius.full,
                      backgroundColor: style.color,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                        fontSize: theme.fontSize.xs,
                        fontWeight: theme.fontWeight.bold,
                        fontFamily: theme.fontFamily.number,
                      }}
                    >
                      {rank}
                    </Text>
                  </View>
                </View>

                <View
                  style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: theme.color.textPrimary,
                      textAlign: 'center',
                      fontSize: theme.fontSize.sm * 1.15,
                      fontWeight: theme.fontWeight.bold,
                    }}
                  >
                    {user.name}
                  </Text>

                  <View
                    style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
                    <Feather
                      name='zap'
                      size={theme.space.sm * 1.5}
                      color={style.color}
                    />
                    <Text
                      style={{
                        color: style.color,
                        fontSize: theme.fontSize.xs,
                        fontWeight: theme.fontWeight.bold,
                        fontFamily: theme.fontFamily.number,
                      }}
                    >
                      {user.score.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={{
                  width: '92%',
                  height: style.podiumHeight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTopLeftRadius: theme.borderRadius.lg,
                  borderTopRightRadius: theme.borderRadius.lg,
                  backgroundColor: withAlpha(style.color, 0.16),
                  borderWidth: 1,
                  borderBottomWidth: 0,
                  borderColor: withAlpha(style.color, 0.28),
                }}
              >
                <Text
                  style={{
                    color: style.color,
                    fontSize: isWinner ? theme.fontSize.xxxl : theme.fontSize.xxl,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.number,
                  }}
                >
                  {rank}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </LinearGradient>
  );
}