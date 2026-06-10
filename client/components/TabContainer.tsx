import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../theme/ThemeContext';


type TabItem<T extends string = string> = {
  id: T;
  label: string;
};
type TabContainerProps<T extends string = string> = {
  tabs: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function TabContainer<T extends string>({ tabs, value, onChange }: TabContainerProps<T>) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        gap: theme.space.sm * 1.25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {tabs.map((tab) => {
        const isActive = value === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.85}
            onPress={() => onChange(tab.id)}
            style={{
              flex: 1,
              gap: theme.space.sm,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.sm * 1.5,
              borderWidth: isActive ? 2.5 : 1.5,
              borderRadius: theme.borderRadius.lg,
              borderColor: isActive ? theme.color.accent : theme.color.border,
              backgroundColor: theme.color.card,
            }}
          >
            <View
              style={{
                width: theme.space.sm * 1.3,
                height: theme.space.sm * 1.3,
                borderRadius: theme.borderRadius.full,
                backgroundColor: isActive
                  ? theme.color.accent
                  : theme.color.textMuted,
              }}
            />
            <Text
              style={{
                color: isActive ? theme.color.accent : theme.color.textMuted,
                fontSize: theme.fontSize.md,
                fontWeight: isActive
                  ? (theme.fontWeight.bold.toString() as any)
                  : (theme.fontWeight.medium.toString() as any),
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
