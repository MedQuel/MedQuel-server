import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { CardView } from 'react-native-boxes';

export type PerformanceTrendCardProps = {
  title?: string;
  subtitle?: string;
  data?: number[];
  mode?: 'light' | 'dark';
} & ViewStyle;

const defaultData = [20, 42, 34, 60, 48, 72, 55, 88];

export function PerformanceTrendCard(props: PerformanceTrendCardProps) {
  const mode = props.mode ?? 'light';
  const isDark = mode === 'dark';
  const data = props.data ?? defaultData;
  const maxValue = Math.max(...data, 1);

  return (
    <CardView
      style={{
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 0,
        backgroundColor: isDark ? '#101b2f' : '#3e7df2',
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '800' }}>{props.title ?? 'Performance Trend'}</Text>
          <Text style={{ marginTop: 4, color: 'rgba(255,255,255,0.8)', fontSize: 11.5 }}>{props.subtitle ?? 'Weekly progress overview'}</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.16)' }} />
          <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.16)' }} />
        </View>
      </View>

      <View
        style={{
          marginTop: 16,
          height: 140,
          borderRadius: 18,
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)',
          paddingHorizontal: 10,
          paddingTop: 10,
          justifyContent: 'flex-end',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 112 }}>
          {data.map((value, index) => {
            const barHeight = Math.max((value / maxValue) * 92, 14);
            const barColor = isDark
              ? index % 2 === 0
                ? '#4fd1c5'
                : '#7da6ff'
              : index % 2 === 0
                ? '#73c8ff'
                : '#1e3f95';

            return (
              <View key={index} style={{ alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                <View
                  style={{
                    width: 18,
                    height: barHeight,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4,
                    backgroundColor: barColor,
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>
    </CardView>
  );
}

export default PerformanceTrendCard;
