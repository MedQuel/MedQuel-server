import { Pressable, Text, View } from 'react-native';
import { Feather, SimpleLineIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


export type RoleId = 'mbbs' | 'postgraduate' | 'doctor' | 'nursing';
const ROLE_IDS: RoleId[] = ['mbbs', 'postgraduate', 'doctor', 'nursing'];
type OnboardingRolePickerProps = {
  value: RoleId;
  onChange: (value: RoleId) => void;
};

function RoleIcon({ role, size, color }: { role: RoleId; size: number; color: string; }) {
  if (role === 'mbbs') return <SimpleLineIcons name='graduation' size={size} color={color} />;
  else if (role === 'postgraduate') return <Feather name='book-open' size={size} color={color} />;
  else if (role === 'doctor') return <MaterialCommunityIcons name='stethoscope' size={size} color={color} />;
  else if (role === 'nursing') return <Feather name='users' size={size} color={color} />;
}


export function OnboardingRolePicker({ value, onChange }: OnboardingRolePickerProps) {
  const { theme } = useTheme();

  return (
    <View>
      {ROLE_IDS.map((role) => {
        const selected = value === role;

        return (
          <Pressable
            key={role}
            onPress={() => onChange?.(role)}
            style={{
              gap: theme.space.md,
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.space.sm * 1.5,
              paddingHorizontal: theme.space.md,
              marginBottom: theme.space.sm * 1.25,
              borderWidth: 2,
              borderRadius: theme.borderRadius.xl,
              borderColor: selected ? theme.color.accent : theme.color.border,
              backgroundColor: theme.color.card,
            }}
          >
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                padding: theme.space.md,
                borderRadius: theme.borderRadius.xl,
                backgroundColor: theme.color.surface,
              }}
            >
              <RoleIcon
                role={role}
                size={theme.space.lg}
                color={selected ? theme.color.accent : theme.color.textSecondary}
              />
            </View>

            <View style={{ flex: 1, gap: theme.space.xs }}>
              <Text
                style={{
                  color: selected ? theme.color.accent : theme.color.textPrimary,
                  fontSize: theme.fontSize.md,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t(`components.OnboardingRolePicker.${role}.title`)}
              </Text>
              <Text
                style={{
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.sm,
                  fontWeight: theme.fontWeight.regular,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t(`components.OnboardingRolePicker.${role}.subtitle`)}
              </Text>
            </View>

            {selected && (
              <View
                style={{
                  height: theme.space.lg,
                  width: theme.space.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: theme.color.accent,
                }}
              >
                <Feather
                  name='check'
                  size={theme.space.md * 0.9}
                  color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
                />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
