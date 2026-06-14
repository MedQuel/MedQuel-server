import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


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
  ].filter((item) => item.user);

  const rankStyles = {
    1: {
      color: theme.color.warning,
      avatarSize: theme.space.xxl * 1.5,
      podiumHeight: theme.space.xxl * 2,
    },
    2: {
      color: '#94A3B8',
      avatarSize: theme.space.xxl * 1.25,
      podiumHeight: theme.space.xxl * 1.5,
    },
    3: {
      color: '#CD7F32',
      avatarSize: theme.space.xxl * 1.2,
      podiumHeight: theme.space.xxl,
    },
  } as const;

  return (
    <LinearGradient
      colors={
        theme.isDark ? ['#102753', '#0e1d3d', '#070e1d'] : ['#dfeafc', '#e0e8f5', '#eef0f7']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        overflow: 'hidden',
        paddingTop: theme.space.md,
        paddingHorizontal: theme.space.xl,
        borderWidth: 2,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl * 2,
        boxShadow: theme.isDark
          ? '0px 10px 24px rgba(0,0,0,0.35)'
          : '0px 8px 20px rgba(15,23,42,0.06)',
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
                      backgroundColor: style.color + '88',
                      boxShadow: isWinner
                        ? `0px 0px 14px ${theme.color.warning}99`
                        : undefined,
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
                  backgroundColor: style.color + '22',
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
