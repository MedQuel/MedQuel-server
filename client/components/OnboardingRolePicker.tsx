import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';

export type RoleOption = {
  key: 'mbbs' | 'postgraduate' | 'doctor' | 'nursing';
  icon: 'graduation-cap' | 'book' | 'stethoscope' | 'group';
};

type Props = {
  value: string;
  selected?: boolean;
  onSelect?: (value: string) => void;
};

export const roleOptions: RoleOption[] = [
  { key: 'mbbs', icon: 'graduation-cap' },
  { key: 'postgraduate', icon: 'book' },
  { key: 'doctor', icon: 'stethoscope' },
  { key: 'nursing', icon: 'group' },
];

function RoleIcon({ icon, color }: { icon: RoleOption['icon']; color: string }) {
  switch (icon) {
    case 'graduation-cap':
      return <FontAwesome5 name="graduation-cap" size={24} color={color} />;

    case 'book':
      return <Ionicons name="book-outline" size={24} color={color} />;

    case 'stethoscope':
      return <MaterialCommunityIcons name="stethoscope" size={24} color={color} />;

    case 'group':
      return <MaterialCommunityIcons name="account-group-outline" size={24} color={color} />;

    default:
      return null;
  }
}

export function OnboardingRolePicker({ value, selected = false, onSelect }: Props) {
  const { theme } = useTheme();

  const role = roleOptions.find(item => item.key === value);

  if (!role) return null;

  const title = theme.i18n.t(`components.OnboardingRolePicker.${role.key}.title`);
  const subtitle = theme.i18n.t(`components.OnboardingRolePicker.${role.key}.subtitle`);

  return (
    <Pressable
      onPress={() => onSelect?.(value)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.space.md,
        marginBottom: theme.space.md,
        backgroundColor: theme.color.card,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1.5,
        borderColor: selected ? theme.color.accent : theme.color.border,

        ...(theme.isDark &&
          selected && {
            shadowColor: theme.color.accent,
            shadowOpacity: 0.12,
            shadowRadius: 12,
          }),
      }}
    >
      <View
        style={{
          height: 68,
          aspectRatio: 1,
          borderRadius: theme.borderRadius.xl,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: theme.space.md,
          backgroundColor: theme.isDark
            ? 'rgba(59,123,248,0.08)'
            : 'rgba(37,99,235,0.08)',
        }}
      >
        <RoleIcon
          icon={role.icon}
          color={selected ? theme.color.accent : theme.color.textSecondary}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '700',
            color: selected ? theme.color.accent : theme.color.textPrimary,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            marginTop: 4,
            fontSize: 13,
            color: theme.color.textSecondary,
          }}
        >
          {subtitle}
        </Text>
      </View>

      {selected && (
        <View
          style={{
            height: 34,
            aspectRatio: 1,
            borderRadius: 999,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.color.accent,
          }}
        >
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
        </View>
      )}
    </Pressable>
  );
}

export default OnboardingRolePicker;