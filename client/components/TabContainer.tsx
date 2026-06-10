import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function TabContainer() {
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');

  const { theme } = useTheme();
  const { color, space, fontSize, fontWeight, borderRadius, fontFamily, i18n, isDark } = theme;

  const inactiveText = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)';
  const inactiveDot = isDark ? 'rgba(255,255,255,0.25)' : color.border;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color.background,
        paddingVertical: space.sm,
        paddingHorizontal: space.md,
        gap: space.sm,
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
          borderRadius: borderRadius.md,
          backgroundColor: color.card,
          borderWidth: activeTab === 'global' ? 2 : 1,
          borderColor: activeTab === 'global' ? color.accent : color.border,
          paddingVertical: space.sm,
          gap: space.xs,
        }}
      >
        <View
          style={{
            width: 8,
            aspectRatio: 1,
            borderRadius: borderRadius.full,
            backgroundColor: activeTab === 'global' ? color.accent : inactiveDot,
          }}
        />
        <Text
          style={{
            fontSize: fontSize.md,
            fontWeight: activeTab === 'global' ? fontWeight.bold.toString() as any : fontWeight.medium.toString() as any,
            color: activeTab === 'global' ? color.accent : inactiveText,
            fontFamily: fontFamily.text,
          }}
        >
          {i18n.t('components.TabContainer.global')}
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
          borderRadius: borderRadius.md,
          backgroundColor: color.card,
          borderWidth: activeTab === 'friends' ? 2 : 1,
          borderColor: activeTab === 'friends' ? color.accent : color.border,
          paddingVertical: space.sm,
          gap: space.xs,
        }}
      >
        <View
          style={{
            width: 8,
            aspectRatio: 1,
            borderRadius: borderRadius.full,
            backgroundColor: activeTab === 'friends' ? color.accent : inactiveDot,
          }}
        />
        <Text
          style={{
            fontSize: fontSize.md,
            fontWeight: activeTab === 'friends' ? fontWeight.bold.toString() as any : fontWeight.medium.toString() as any,
            color: activeTab === 'friends' ? color.accent : inactiveText,
            fontFamily: fontFamily.text,
          }}
        >
          {i18n.t('components.TabContainer.friends')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}