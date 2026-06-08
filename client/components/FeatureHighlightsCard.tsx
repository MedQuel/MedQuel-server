import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

const features = [
  {
    id: 1,
    label: 'Earn EP',
    icon: <MaterialCommunityIcons name="lightning-bolt" size={28} color="#3b82f6" />,
  },
  {
    id: 2,
    label: 'Win contests',
    icon: <FontAwesome5 name="trophy" size={24} color="#f59e0b" />,
  },
  {
    id: 3,
    label: 'Build streaks',
    icon: <Ionicons name="flame" size={26} color="#f43f5e" />,
  },
  {
    id: 4,
    label: 'Climb ranks',
    icon: <MaterialCommunityIcons name="chart-bar" size={26} color="#10b981" />,
  },
];

export default function FeatureHighlightsCard() {
  return (
    <View style={{
      backgroundColor: '#eff4ff',
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: '#e0e8ff',
    }}>
      <Text style={{
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
        letterSpacing: -0.3,
      }}>
        What awaits you
      </Text>

      <View style={{
        flexDirection: 'row',
        gap: 10,
      }}>
        {features.map((feature) => (
          <View
            key={feature.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 4,
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <View style={{ marginBottom: 8, alignItems: 'center' }}>
              {feature.icon}
            </View>
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: '#475569',
              textAlign: 'center',
            }}>
              {feature.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}