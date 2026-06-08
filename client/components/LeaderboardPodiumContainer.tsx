import React, { useContext } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { CardView, ThemeContext } from 'react-native-boxes';

export type PodiumUser = {
  key: string;
  name: string;
  score: string | number;
  initials: string;
  color: string;
};

export type LeaderboardPodiumContainerProps = {
  users?: PodiumUser[];
  title: string;
} & ViewStyle;

const defaultUsers: PodiumUser[] = [
  { key: 'second', name: 'Dr. Raj M.', score: '3,847', initials: 'RP', color: '#8e7bff' },
  { key: 'first', name: 'tusharbaghel', score: '5,252', initials: 'TU', color: '#5db4ff' },
  { key: 'third', name: 'Dr. Amit K.', score: '3,419', initials: 'AK', color: '#f39b63' },
];

export function LeaderboardPodiumContainer({ users = defaultUsers, title, ...style }: LeaderboardPodiumContainerProps) {
  const theme = useContext(ThemeContext);
  const isDark = theme.name === 'dark';
  const orderedUsers = [users[0], users[1], users[2]].filter(Boolean) as PodiumUser[];

  const background = isDark ? theme.colors.forground : theme.colors.background;
  const cardBorder = isDark ? theme.colors.background : theme.colors.accentLight;

  return (
    <CardView
      style={[
        {
          borderRadius: theme.dimens.space.lg + theme.dimens.space.sm,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: cardBorder,
          backgroundColor: background,
          padding: theme.dimens.space.lg - theme.dimens.space.xs * 4,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)',
        },
        style,
      ]}
    >
      <Text style={{ color: theme.colors.heading, fontSize: 18, fontWeight: '800', marginBottom: 18 }}>
        {title}
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
                    borderColor: theme.colors.invert.text,
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
                    backgroundColor: isWinner ? theme.colors.warning : user.color,
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingBottom: 12,
                    paddingHorizontal: 6,
                  }}
                >
                  <Text style={{ color: isWinner ? theme.colors.heading : theme.colors.invert.text, fontSize: 11, fontWeight: '800', textAlign: 'center' }}>
                    {user.name}
                  </Text>
                  <Text style={{ color: isWinner ? theme.colors.heading : theme.colors.invert.heading, fontSize: 10, marginTop: 4 }}>
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
