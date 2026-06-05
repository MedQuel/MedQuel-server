import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'; // Fixed: Added ScrollView here
import { FontAwesome5 } from '@expo/vector-icons';

export interface ActiveContestData {
  difficulty: string;
  isLive: boolean;
  title: string;
  subject: string;
  participantsCount: number | string;
  epReward: number | string;
  onPress: () => void;
}

export function ActiveContestCard({ contestData }: { contestData: ActiveContestData }) {
  const { difficulty, isLive, title, subject, participantsCount, epReward, onPress } = contestData;

  const difficultyColors: Record<string, { bg: string; color: string }> = {
    Hard: { bg: '#ffe4e6', color: '#be123c' },
    Medium: { bg: '#ffedd5', color: '#c2410c' },
    Easy: { bg: '#dcfce7', color: '#15803d' },
  };

  const diff = difficultyColors[difficulty] ?? { bg: '#f1f5f9', color: '#475569' };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 14,
        width: 170,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
        gap: 8,
      }}
    >
      {/* Top Row: Difficulty + Live badge */}
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

      {/* Title */}
      <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f172a', letterSpacing: -0.2 }}>
        {title}
      </Text>

      {/* Subject */}
      <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '500', marginTop: -4 }}>
        {subject}
      </Text>

      {/* Bottom Row: Participants + EP Reward */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <FontAwesome5 name="users" size={11} color="#94a3b8" />
          <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '500' }}>{participantsCount}</Text>
        </View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#3b82f6' }}>+{epReward}</Text>
      </View>
    </TouchableOpacity>
  );
}
export default function ActiveContestsSection({ activeContests }: { activeContests: ActiveContestData[] }) {
  return (
    <TouchableOpacity
    activeOpacity={0.9}
      style={{ marginVertical: 12 }}
      onPress={() => console.log('Section pressed')}
    >
    <View style={{ marginVertical: 12 }}>

      {/* Section Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>Active Contests</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#3b82f6' }}>View All</Text>
      </View>

      {/* Horizontal Scroll of Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {activeContests?.map((contest, index) => (
          <ActiveContestCard key={index} contestData={contest} />
        ))}
      </ScrollView>

    </View>
    
    </TouchableOpacity>
  );
}