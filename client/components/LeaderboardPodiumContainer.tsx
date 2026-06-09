import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';

export type PodiumUser = {
  id: string;
  name: string;
  score: number;
  initials: string;
};

export type LeaderboardPodiumContainerProps = {
  users?: PodiumUser[];
} & ViewStyle;

const defaultUsers: PodiumUser[] = [
  { id: 'second', name: 'Dr. Ravi P.', score: 3847, initials: 'RP' },
  { id: 'first', name: 'tusharbaghel', score: 5252, initials: 'TU' },
  { id: 'third', name: 'Dr. Amir K.', score: 3411, initials: 'AK' },
];

export function LeaderboardPodiumContainer({ users = defaultUsers, ...style }: LeaderboardPodiumContainerProps) {
  const { theme } = useTheme();
  const podiumUsers = [users[0], users[1], users[2]];
  const ranks = [
    { n: 2, score: '#7D92B9', border: '#8FA2C9', podium: theme.isDark ? '#10254D' : '#E7EDF8' },
    { n: 1, score: theme.color.warning, border: theme.color.warning, podium: theme.isDark ? '#2B2B31' : '#ECE8E1' },
    { n: 3, score: '#C47A2C', border: '#CD7F32', podium: theme.isDark ? '#10254D' : '#E7EDF8' },
  ];

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
          const isWinner = rank.n === 1;
          const podiumHeight = rank.n === 1 ? 190 : rank.n === 2 ? 145 : 130;

          return (
            <View key={user.id} style={{ flex: isWinner ? 1.15 : 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              <View style={{ alignItems: 'center', marginBottom: theme.space.sm }}>
                {isWinner && <MaterialCommunityIcons name="crown" size={32} color={theme.color.warning} style={{ marginBottom: 12 }} />}

                <View style={{ position: 'relative' }}>
                  <View
                    style={{
                      width: isWinner ? 102 : 84,
                      height: isWinner ? 102 : 84,
                      borderRadius: 999,
                      backgroundColor: index === 0 ? theme.color.premium : index === 1 ? theme.color.accent : '#EF6B6B',
                      borderWidth: isWinner ? 4 : 3,
                      borderColor: rank.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...(isWinner && {
                        shadowColor: theme.color.warning,
                        shadowOpacity: 0.45,
                        shadowRadius: 16,
                        shadowOffset: { width: 0, height: 0 },
                        elevation: 14,
                      }),
                    }}
                  >
                    <Text style={{ color: theme.color.textInverse, fontSize: isWinner ? 24 : 17, fontWeight: '700' }}>{user.initials}</Text>
                  </View>

                  <View
                    style={{
                      position: 'absolute',
                      right: -4,
                      bottom: 2,
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: rank.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>{rank.n}</Text>
                  </View>
                </View>

                <Text
                  style={{
                    marginTop: theme.space.md,
                    color: theme.color.textPrimary,
                    fontSize: isWinner ? theme.fontSize.xl : theme.fontSize.lg,
                    fontWeight: '700',
                    textAlign: 'center',
                    paddingHorizontal: 6,
                  }}
                >
                  {user.name}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <MaterialCommunityIcons name="lightning-bolt" size={16} color={theme.color.warning} />
                  <Text style={{ marginLeft: 3, color: rank.score, fontSize: theme.fontSize.md, fontWeight: '700' }}>
                    {user.score.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  alignSelf: 'stretch',
                  height: podiumHeight,
                  marginHorizontal: 4,
                  backgroundColor: rank.podium,
                  borderTopLeftRadius: theme.borderRadius.lg,
                  borderTopRightRadius: theme.borderRadius.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: rank.n === 1 ? theme.color.warning : theme.color.textMuted,
                    fontSize: rank.n === 1 ? 42 : 28,
                    fontWeight: '700',
                  }}
                >
                  {rank.n}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default LeaderboardPodiumContainer;