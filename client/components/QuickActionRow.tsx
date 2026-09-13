import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';

export type QuickAction = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconBg: string;
  onPress: () => void;
};

type Props = {
  actions: QuickAction[];
};
export function QuickActionList({ actions }: Props) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.space.sm }}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.key}
          activeOpacity={0.75}
          onPress={action.onPress}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.space.sm * 1.25,
            paddingHorizontal: theme.space.md,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.card,
            borderWidth: 1,
            borderColor: theme.color.border,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: theme.borderRadius.md,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: action.iconBg,
              marginRight: theme.space.md,
            }}
          >
            <MaterialCommunityIcons name={action.icon} size={18} color={theme.color.textInverse} />
          </View>

          <Text
            style={{
              flex: 1,
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.md,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {action.label}
          </Text>

          <MaterialCommunityIcons name="chevron-right" size={22} color={theme.color.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  );
}