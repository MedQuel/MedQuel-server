import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function TabContainer() {
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f4f7fc',
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 12,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setActiveTab('global')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          borderRadius: 24,
          backgroundColor: '#ffffff',
          borderWidth: activeTab === 'global' ? 2 : 1,
          borderColor: activeTab === 'global' ? '#3b82f6' : '#e2e8f0',
          paddingVertical: 12,
          gap: 8,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: activeTab === 'global' ? '#3b82f6' : '#94a3b8',
          }}
        />
        <Text
          style={{
            fontSize: 15,
            fontWeight: activeTab === 'global' ? '700' : '500',
            color: activeTab === 'global' ? '#3b82f6' : '#475569',
          }}
        >
          Global
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setActiveTab('friends')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          borderRadius: 24,
          backgroundColor: '#ffffff',
          borderWidth: activeTab === 'friends' ? 2 : 1,
          borderColor: activeTab === 'friends' ? '#3b82f6' : '#e2e8f0',
          paddingVertical: 12,
          gap: 8,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: activeTab === 'friends' ? '#3b82f6' : '#94a3b8',
          }}
        />
        <Text
          style={{
            fontSize: 15,
            fontWeight: activeTab === 'friends' ? '700' : '500',
            color: activeTab === 'friends' ? '#3b82f6' : '#475569',
          }}
        >
          Friends
        </Text>
      </TouchableOpacity>
    </View>
  );
}