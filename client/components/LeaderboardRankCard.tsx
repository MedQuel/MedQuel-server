import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
    <View style={styles.card}>
    
      <Text style={styles.rank}>#{rank}</Text>

    
      <LinearGradient
        colors={[`${color}40`, `${color}10`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.avatar,
          {
            borderColor: color,
          },
        ]}
      >
        <Text style={[styles.avatarText, { color }]}>{initials}</Text>
      </LinearGradient>

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.specialty}>{specialty}</Text>
      </View>

      <View style={styles.pointsContainer}>
        <Text style={styles.points}>
          {points.toLocaleString()}
        </Text>
        <Text style={styles.ep}>EP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E5FF',
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    width: '100%',
    maxWidth: 420,
  },

  rank: {
    width: 35,
    fontSize: 16,
    fontWeight: '600',
    color: '#7A7A7A',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    fontWeight: '700',
    fontSize: 14,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },

  specialty: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },

  pointsContainer: {
    alignItems: 'flex-end',
  },

  points: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  ep: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
});