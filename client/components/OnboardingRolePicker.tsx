import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';

type RoleKey = 'mbbs' | 'postgraduate' | 'doctor' | 'nursing';
type RoleIcon = 'graduation-cap' | 'book' | 'stethoscope' | 'group';
type RoleOption = { key: RoleKey; icon: RoleIcon };
type Props = { value: RoleKey; selected?: boolean; onSelect?: (value: RoleKey) => void };

const roleOptions: RoleOption[] = [
  { key: 'mbbs', icon: 'graduation-cap' },
  { key: 'postgraduate', icon: 'book' },
  { key: 'doctor', icon: 'stethoscope' },
  { key: 'nursing', icon: 'group' },
];

const roleFallbacks: Record<RoleKey, { title: string; subtitle: string }> = {
  mbbs: { title: 'MBBS Student', subtitle: 'Undergraduate medical program' },
  postgraduate: { title: 'Postgraduate', subtitle: 'MD/MS/Residency preparation' },
  doctor: { title: 'Practicing Doctor', subtitle: 'Continuing medical education' },
  nursing: { title: 'Nursing / Allied', subtitle: 'Nursing education & licensing' },
};

const resolveText = (translated: string, fallback: string, key: string) => {
  const value = String(translated ?? '').trim();
  return !value || value === key ? fallback : value;
};

const RoleIcon = ({ icon, color }: { icon: RoleIcon; color: string }) => {
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
};

export function OnboardingRolePicker({ value, selected = false, onSelect }: Props) {
  const { theme } = useTheme();
  const role = roleOptions.find(item => item.key === value);

  if (!role) return null;

  const titleKey = `components.OnboardingRolePicker.${role.key}.title`;
  const subtitleKey = `components.OnboardingRolePicker.${role.key}.subtitle`;
  const title = resolveText(theme.i18n.t(titleKey), roleFallbacks[role.key].title, titleKey);
  const subtitle = resolveText(theme.i18n.t(subtitleKey), roleFallbacks[role.key].subtitle, subtitleKey);
  const accent = theme.color.accent;
  const iconBg = theme.isDark ? 'rgba(59,123,248,0.08)' : 'rgba(37,99,235,0.08)';
  const fw = {
    regular: String(theme.fontWeight.regular) as any,
    medium: String(theme.fontWeight.medium) as any,
    bold: String(theme.fontWeight.bold) as any,
  };

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
        borderColor: selected ? accent : theme.color.border,
        ...(theme.isDark && selected ? { shadowColor: accent, shadowOpacity: 0.12, shadowRadius: 12 } : {}),
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
          backgroundColor: iconBg,
        }}
      >
        <RoleIcon icon={role.icon} color={selected ? accent : theme.color.textSecondary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: theme.fontSize.lg,
            fontWeight: fw.bold,
            fontFamily: theme.fontFamily.regular,
            color: selected ? accent : theme.color.textPrimary,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            marginTop: 4,
            fontSize: theme.fontSize.sm,
            fontWeight: fw.regular,
            fontFamily: theme.fontFamily.regular,
            color: theme.color.textSecondary,
          }}
        >
          {subtitle}
        </Text>
      </View>

      {selected ? (
        <View
          style={{
            height: 34,
            aspectRatio: 1,
            borderRadius: theme.borderRadius.full,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: accent,
          }}
        >
          <Ionicons name="checkmark" size={20} color={theme.color.textInverse} />
        </View>
      ) : null}
    </Pressable>
  );
}