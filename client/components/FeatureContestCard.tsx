import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { CardView } from 'react-native-boxes';

export type FeatureContestCardProps = {
  title?: string;
  subtitle?: string;
  status?: string;
  difficulty?: string;
  mode?: 'light' | 'dark';
} & ViewStyle;

export function FeatureContestCard(props: FeatureContestCardProps) {
  const mode = props.mode ?? 'dark';
  const isDark = mode === 'dark';

  return (
    <CardView
      style={{
        width: '100%',
        maxWidth: 340,
        minHeight: 170,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 0,
        backgroundColor: isDark ? '#1b1450' : '#6c5ef7',
        shadowColor: '#000',
        shadowOpacity: 0.14,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      }}
    >
      <View style={{ flex: 1, padding: 18, justifyContent: 'space-between' }}>
        <View>
          <View
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.14)',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>{props.status ?? 'COMPETING'}</Text>
          </View>

          <Text style={{ color: '#fff', fontSize: 21, fontWeight: '800', lineHeight: 26 }}>
            {props.title ?? 'Medical Championship'}
          </Text>

          <Text style={{ marginTop: 8, color: 'rgba(255,255,255,0.82)', fontSize: 12 }}>
            {props.subtitle ?? 'All India contest prep'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Neon</Text>
            </View>
            <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{props.difficulty ?? 'Hard'}</Text>
            </View>
          </View>

          <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#ffffff' }} />
        </View>
      </View>
    </CardView>
  );
}

export default FeatureContestCard;
