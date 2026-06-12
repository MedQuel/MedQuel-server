import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';

export type PodiumUser = { id: string; name: string; score: number; initials: string };

export type LeaderboardPodiumContainerProps = { users?: PodiumUser[] } & ViewStyle;

const defaultUsers: PodiumUser[] = [
  { id: 'second', name: 'Dr. Ravi P.', score: 3847, initials: 'RP' },
  { id: 'first', name: 'tusharbaghel', score: 5252, initials: 'TU' },
  { id: 'third', name: 'Dr. Amir K.', score: 3411, initials: 'AK' },
];

const rankStyles = (theme: ReturnType<typeof useTheme>['theme']) => [
  { rank: 2, scoreColor: '#7D92B9', borderColor: '#8FA2C9', podiumColor: theme.isDark ? '#10254D' : '#E7EDF8' },
  { rank: 1, scoreColor: theme.color.warning, borderColor: theme.color.warning, podiumColor: theme.isDark ? '#2B2B31' : '#ECE8E1' },
  { rank: 3, scoreColor: '#C47A2C', borderColor: '#CD7F32', podiumColor: theme.isDark ? '#10254D' : '#E7EDF8' },
];

const initialsBg = (index: number, theme: ReturnType<typeof useTheme>['theme']) => [
  theme.color.premium,
  theme.color.accent,
  '#EF6B6B',
][index];

export function LeaderboardPodiumContainer({ users = defaultUsers, ...style }: LeaderboardPodiumContainerProps) {
  const { theme } = useTheme();
  const podiumUsers = [users[0], users[1], users[2]];
  const ranks = rankStyles(theme);

  return (
    <View
      style={{
        backgroundColor: theme.isDark ? '#041634' : theme.color.card,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        padding: theme.space.xl,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: theme.isDark ? 0.25 : 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
        ...style,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', minHeight: 360 }}>
        {podiumUsers.map((user, index) => {
          const rank = ranks[index];
          const isWinner = rank.rank === 1;
          const podiumHeight = rank.rank === 1 ? 190 : rank.rank === 2 ? 145 : 130;
          const avatarSize = isWinner ? 102 : 84;

          return (
            <View
              key={user.id}
              style={{
                flex: isWinner ? 1.15 : 1,
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <View style={{ alignItems: 'center', marginBottom: theme.space.sm }}>
                {isWinner ? <MaterialCommunityIcons name="crown" size={32} color={theme.color.warning} style={{ marginBottom: 12 }} /> : null}

                <View style={{ position: 'relative' }}>
                  <View
                    style={{
                      width: avatarSize,
                      height: avatarSize,
                      borderRadius: theme.borderRadius.full,
                      backgroundColor: initialsBg(index, theme),
                      borderWidth: isWinner ? 4 : 3,
                      borderColor: rank.borderColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...(isWinner
                        ? {
                            shadowColor: theme.color.warning,
                            shadowOpacity: 0.45,
                            shadowRadius: 16,
                            shadowOffset: { width: 0, height: 0 },
                            elevation: 14,
                          }
                        : {}),
                    }}
                  >
                    <Text
                      style={{
                        color: theme.color.textInverse,
                        fontSize: isWinner ? theme.fontSize.xl : theme.fontSize.lg,
                        fontWeight: theme.fontWeight.bold,
                        fontFamily: theme.fontFamily.number,
                      }}
                    >
                      {user.initials}
                    </Text>
                  </View>

                  <View
                    style={{
                      position: 'absolute',
                      right: -4,
                      bottom: 2,
                      width: 34,
                      height: 34,
                      borderRadius: theme.borderRadius.full,
                      backgroundColor: rank.borderColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: theme.color.textInverse,
                        fontSize: theme.fontSize.md,
                        fontWeight: theme.fontWeight.bold,
                        fontFamily: theme.fontFamily.number,
                      }}
                    >
                      {rank.rank}
                    </Text>
                  </View>
                </View>

                <Text
                  numberOfLines={1}
                  style={{
                    marginTop: theme.space.md,
                    color: theme.color.textPrimary,
                    fontSize: isWinner ? theme.fontSize.xl : theme.fontSize.lg,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.regular,
                    textAlign: 'center',
                    paddingHorizontal: 6,
                  }}
                >
                  {user.name}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <MaterialCommunityIcons name="lightning-bolt" size={16} color={theme.color.warning} />
                  <Text
                    style={{
                      marginLeft: 3,
                      color: rank.scoreColor,
                      fontSize: theme.fontSize.md,
                      fontWeight: theme.fontWeight.bold,
                      fontFamily: theme.fontFamily.number,
                    }}
                  >
                    {user.score.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  alignSelf: 'stretch',
                  height: podiumHeight,
                  marginHorizontal: 4,
                  backgroundColor: rank.podiumColor,
                  borderTopLeftRadius: theme.borderRadius.lg,
                  borderTopRightRadius: theme.borderRadius.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: isWinner ? theme.color.warning : theme.color.textMuted,
                    fontSize: isWinner ? 42 : 28,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.number,
                  }}
                >
                  {rank.rank}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}