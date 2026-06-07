import React from 'react';
import { View, Text } from 'react-native';

export default function CurrentRankCard() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F7FF',
        borderWidth: 1,
        borderColor: '#DCE7FF',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: '#7B8794',
          marginRight: 12,
        }}
      >
        #5
      </Text>
      <View
        style={{
          backgroundColor: '#5865F2',
          borderRadius: 999,
          paddingVertical: 8,
          paddingHorizontal: 10,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 10,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
          M
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#4F7CFF',
            marginBottom: 2,
          }}
        >
          You · Mohsin Ansari
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#22C55E', fontSize: 9, marginRight: 2 }}>
            ↗
          </Text>
          <Text style={{ color: '#22C55E', fontSize: 11, fontWeight: '500' }}>
            ↑ 12 this week
          </Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={{
            color: '#4F7CFF',
            fontSize: 14,
            fontWeight: '700',
          }}
        >
          3,201
        </Text>
        <Text style={{ fontSize: 9, color: '#B0BAC9', marginTop: 1 }}>
          EP
        </Text>
      </View>
    </View>
  );
}
