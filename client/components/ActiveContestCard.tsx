import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export interface ActiveContestData {
  difficulty: string;
  isLive: boolean;
  title: string;
  subject: string;
  participantsCount: number;
  epReward: number;
  onPress: () => void;
}

export default function ActiveContestsSection({ activeContests }: { activeContests: ActiveContestData[] }) {
  const difficultyColors: Record<string, { bg: string; color: string }> = {
    Hard: { bg: '#ffe4e6', color: '#be123c' },
    Medium: { bg: '#ffedd5', color: '#c2410c' },
    Easy: { bg: '#dcfce7', color: '#15803d' },
  };

  return (
    <View style={{ marginVertical: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>Active Contests</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#3b82f6' }}>View All</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {activeContests?.map(({ difficulty, isLive, title, subject, participantsCount, epReward, onPress }, index) => {
          const diff = difficultyColors[difficulty] ?? { bg: '#f1f5f9', color: '#475569' };

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: 14,
                boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.06)',
                gap: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ backgroundColor: diff.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: diff.color }}>{difficulty}</Text>
                </View>

                {isLive && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff0f0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444' }} />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#ef4444' }}>LIVE</Text>
                  </View>
                )}
              </View>

              <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f172a', letterSpacing: -0.2 }}>
                {title}
              </Text>

              <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '500', marginTop: -4 }}>
                {subject}
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <FontAwesome5 name="users" size={11} color="#94a3b8" />
                  <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '500' }}>{participantsCount}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#3b82f6' }}>+{epReward}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}