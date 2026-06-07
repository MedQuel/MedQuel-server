import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CurrentRankCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.rank}>#5</Text>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>M</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>You · Mohsin Ansari</Text>

        <View style={styles.growthRow}>
          <Text style={styles.growthArrow}>↗</Text>
          <Text style={styles.growthText}>↑ 12 this week</Text>
        </View>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.score}>3,201</Text>
        <Text style={styles.ep}>EP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '94%',
    alignSelf: 'center',

    height: 56,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#F4F7FF',
    borderWidth: 1,
    borderColor: '#DCE7FF',
    borderRadius: 12,

    paddingHorizontal: 12,
  },

  rank: {
    width: 28,
    fontSize: 12,
    fontWeight: '600',
    color: '#7B8794',
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5865F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F7CFF',
    marginBottom: 2,
  },

  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  growthArrow: {
    color: '#22C55E',
    fontSize: 9,
    marginRight: 2,
  },

  growthText: {
    color: '#22C55E',
    fontSize: 11,
    fontWeight: '500',
  },

  scoreContainer: {
    alignItems: 'flex-end',
  },

  score: {
    color: '#4F7CFF',
    fontSize: 14,
    fontWeight: '700',
  },

  ep: {
    fontSize: 9,
    color: '#B0BAC9',
    marginTop: 1,
  },
});