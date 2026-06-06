import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { CardView } from 'react-native-boxes';

export type PodiumUser = {
  key: string;
  name: string;
  score: string | number;
  initials: string;
  color: string;
};

export type LeaderboardPodiumContainerProps = {
  users?: PodiumUser[];
  mode?: 'light' | 'dark';
  title?: string;
} & ViewStyle;

const defaultUsers: PodiumUser[] = [
  { key: 'second', name: 'Dr. Raj M.', score: '3,847', initials: 'RP', color: '#8e7bff' },
  { key: 'first', name: 'tusharbaghel', score: '5,252', initials: 'TU', color: '#5db4ff' },
  { key: 'third', name: 'Dr. Amit K.', score: '3,419', initials: 'AK', color: '#f39b63' },
];

export function LeaderboardPodiumContainer(props: LeaderboardPodiumContainerProps) {
  const mode = props.mode ?? 'dark';
  const isDark = mode === 'dark';
  const users = props.users ?? defaultUsers;
  const orderedUsers = [users[0], users[1], users[2]].filter(Boolean) as PodiumUser[];

  const background = isDark ? '#0f1d47' : '#eef4ff';
  const cardBorder = isDark ? '#203570' : '#d7e5ff';

  return (
    <CardView
      style={{
        width: '100%',
        maxWidth: 360,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: cardBorder,
        backgroundColor: background,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      }}
    >
      <Text style={{ color: isDark ? '#f6f8ff' : '#16325c', fontSize: 18, fontWeight: '800', marginBottom: 18 }}>
        {props.title ?? 'LeaderboardPodiumContainer'}
      </Text>

      <View style={{ height: 190, justifyContent: 'flex-end' }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' }}>
          {orderedUsers.map((user, index) => {
            const podiumHeights = [94, 120, 78];
            const podiumWidths = [70, 78, 70];
            const isWinner = index === 1;
            const podiumHeight = podiumHeights[index] ?? 80;
            const podiumWidth = podiumWidths[index] ?? 70;

            return (
              <View key={user.key} style={{ alignItems: 'center', width: 100 }}>
                {isWinner ? (
                  <View style={{ marginBottom: 8, alignItems: 'center' }}>
                    <Text style={{ fontSize: 18 }}>👑</Text>
                  </View>
                ) : null}

                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: user.color,
                    borderWidth: 3,
                    borderColor: isDark ? '#f4f7ff' : '#ffffff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: -18,
                    zIndex: 2,
                  }}
                >
                  <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '800' }}>{user.initials}</Text>
                </View>

                <View
                  style={{
                    width: podiumWidth,
                    height: podiumHeight,
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 14,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    backgroundColor: isWinner ? '#ffd166' : user.color,
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingBottom: 12,
                    paddingHorizontal: 6,
                  }}
                >
                  <Text style={{ color: isWinner ? '#1c2333' : '#ffffff', fontSize: 11, fontWeight: '800', textAlign: 'center' }}>
                    {user.name}
                  </Text>
                  <Text style={{ color: isWinner ? '#1c2333' : 'rgba(255,255,255,0.9)', fontSize: 10, marginTop: 4 }}>
                    {user.score}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </CardView>
  );
}

export default LeaderboardPodiumContainer;
