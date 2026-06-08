import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

export interface ContestData {
  category: string;
  difficulty: string;
  title: string;
  timeLeft: string;
  questionsCount: number | string;
  duration: string;
  participantsCount: number | string;
  epReward: number | string;
  onStartPress: () => void;
}

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ color, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

function InfoPill({ icon, value }: { icon: React.ReactNode; value: string | number }) {
  return (
    <View style={{
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      backgroundColor: 'rgba(219, 234, 254, 0.7)',
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 6,
    }}>
      {icon}
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569' }}>{value}</Text>
    </View>
  );
}

export default function ContestCard({ category, difficulty, title, timeLeft, questionsCount, duration, participantsCount, epReward, onStartPress }: ContestData) {
  return (
    <View style={{
      backgroundColor: '#eef2ff',
      borderRadius: 20,
      padding: 18,
      marginHorizontal: 16,
      marginVertical: 10,
      gap: 12,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Badge label={category} bg="#ffe4e6" color="#be123c" />
          <Badge label={difficulty} bg="#ffedd5" color="#c2410c" />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <MaterialCommunityIcons name="lightning-bolt" size={16} color="#3b82f6" />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#3b82f6' }}>{epReward}</Text>
          </View>
          <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>EP Reward</Text>
        </View>
      </View>

      <Text style={{ fontSize: 17, fontWeight: '800', color: '#0f172a', letterSpacing: -0.3 }}>
        {title}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: -4 }}>
        <Ionicons name="time-outline" size={14} color="#f97316" />
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#f97316' }}>{timeLeft}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <InfoPill icon={<MaterialCommunityIcons name="file-document-outline" size={14} color="#64748b" />} value={`${questionsCount} Qs`} />
        <InfoPill icon={<Ionicons name="time-outline" size={14} color="#64748b" />} value={duration} />
        <InfoPill icon={<FontAwesome5 name="users" size={12} color="#64748b" />} value={String(participantsCount)} />
      </View>

      <TouchableOpacity
        onPress={onStartPress}
        activeOpacity={0.85}
        style={{
          backgroundColor: '#3b6ef8',
          borderRadius: 14,
          paddingVertical: 14,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 2,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 }}>
          Start Contest  ›
        </Text>
      </TouchableOpacity>
    </View>
  );
}