import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

const features = [
  {
    id: 1,
    label: 'Earn EP',
    icon: <MaterialCommunityIcons name="lightning-bolt" size={32} color="#3b82f6" />,
  },
  {
    id: 2,
    label: 'Win contests',
    icon: <FontAwesome5 name="trophy" size={26} color="#f59e0b" />,
  },
  {
    id: 3,
    label: 'Build streaks',
    icon: <Ionicons name="flame" size={30} color="#f43f5e" />,
  },
  {
    id: 4,
    label: 'Climb ranks',
    icon: <MaterialCommunityIcons name="chart-bar" size={30} color="#10b981" />,
  },
];

function FeatureCard({ icon, label }) {
  return (
    <View style={{
      backgroundColor: '#ffffff',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 4,
      flex: 1, 
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 1,
    }}>
      <View style={{
        marginBottom: 8,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {icon}
      </View>
      <Text style={{
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        textAlign: 'center',
      }}>
        {label}
      </Text>
    </View>
  );
}

export default function FeatureHighlightsCard() {
  return (
    <View style={{
      backgroundColor: '#eff4ff',
      borderRadius: 24,
      padding: 20,
      width: '100%',
      maxWidth: 500,
      alignSelf: 'center',
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
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between', 
          gap: 10, 
        }}
      >
        {features.map((feature) => (
          <FeatureCard key={feature.id} icon={feature.icon} label={feature.label} />
        ))}
      </View>
    </View>
  );
}