import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
type LeaderboardRankCardProps = {
  rank: number;
  initials: string;
  name: string;
  specialty: string;
  points: number;
  color: string;
};
export default function LeaderboardRankCard({
  rank,
  initials,
  name,
  specialty,
  points,
  color,
}: LeaderboardRankCardProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D9E5FF',
        borderRadius: 16,
        padding: 14,
        marginVertical: 6,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#7A7A7A',
          marginRight: 12,
        }}
      >
        #{rank}
      </Text>
      <LinearGradient
        colors={[`${color}40`, `${color}10`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderColor: color,
          borderWidth: 2,
          borderRadius: 999,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
          paddingHorizontal: 12,
          paddingVertical: 12,
        }}
      >
        <Text
          style={{
            fontWeight: '700',
            fontSize: 14,
            color,
          }}
        >
          {initials}
        </Text>
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#1E293B',
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#94A3B8',
            marginTop: 2,
          }}
        >
          {specialty}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: '#111827',
          }}
        >
          {points.toLocaleString()}
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: '#94A3B8',
            marginTop: 2,
          }}
        >
          EP
        </Text>
      </View>
    </View>
  );
}
