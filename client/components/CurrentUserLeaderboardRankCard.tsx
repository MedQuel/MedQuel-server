import React from 'react';
import { View, Text } from 'react-native';

import { useTheme } from '../theme/ThemeContext';

type CurrentUserLeaderboardRankCardProps = {
  rank: number;
  name: string;
  points: number;
  weeklyGrowth: number;
};

export default function CurrentUserLeaderboardRankCard({
  rank,
  name,
  points,
  weeklyGrowth,
}: CurrentUserLeaderboardRankCardProps) {
  const { theme } = useTheme();
  const avatarInitial = name.trim().charAt(0).toUpperCase() || '?';
  const youLabel = theme.i18n.t('common.you');
  const thisWeekLabel = theme.i18n.t('components.CurrentUserLeaderboardRankCard.this_week');

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F7FF',
        borderWidth: 1,
        borderColor: '#DCE7FF',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: '#7B8794',
          marginRight: 12,
        }}
      >
        #{rank}
      </Text>
      <View
        style={{
          backgroundColor: '#5865F2',
          width: 32,
          height: 32,
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 10,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
          {avatarInitial}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#4F7CFF',
            marginBottom: 2,
          }}
        >
          {youLabel} · {name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#22C55E', fontSize: 9, marginRight: 2 }}>
            ↗
          </Text>
          <Text style={{ color: '#22C55E', fontSize: 11, fontWeight: '500' }}>
            ↑ {weeklyGrowth} {thisWeekLabel}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={{
            color: '#4F7CFF',
            fontSize: 14,
            fontWeight: '700',
          }}
        >
          {points.toLocaleString()}
        </Text>
        <Text style={{ fontSize: 9, color: '#B0BAC9', marginTop: 1 }}>
          {theme.i18n.t('components.LeaderboardRankCard.ep')}
        </Text>
      </View>
    </View>
  );
} 
