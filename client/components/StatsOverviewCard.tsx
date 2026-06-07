import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function StatsOverviewCard() {
  const stats = [
    {
      icon: 'star-outline',
      value: '#127',
      label: 'Rank',
      color: '#F59E0B',
    },
    {
      icon: 'pulse-outline',
      value: '87%',
      label: 'Accuracy',
      color: '#22C55E',
    },
    {
      icon: 'bulb-outline',
      value: '246',
      label: 'Quizzes',
      color: '#4F7CFF',
    },
    {
      icon: 'flash-outline',
      value: '2.8K',
      label: 'EP Points',
      color: '#4F7CFF',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stats Overview</Text>

      <View style={styles.cardsRow}>
        {stats.map((item, index) => (
          <View key={index} style={styles.card}>
            <Ionicons
              name={item.icon as any}
              size={15}
              color={item.color}
            />

            <Text
              style={[
                styles.value,
                { color: item.color },
              ]}
            >
              {item.value}
            </Text>

            <Text style={styles.label}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const CARD_WIDTH = 88;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },

  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  card: {
    width: CARD_WIDTH,
    height: 76,
    marginHorizontal: 6,

    borderWidth: 1,
    borderColor: '#D9E4FF',
    borderRadius: 14,

    backgroundColor: '#F8FAFF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  value: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
    lineHeight: 18,
  },

  label: {
    marginTop: 2,
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 13,
  },
});