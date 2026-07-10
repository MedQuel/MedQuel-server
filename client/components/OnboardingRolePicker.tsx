import { Pressable, Text, View } from 'react-native';
import { Feather, SimpleLineIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import type { DescribesYou } from '../common/types/types'


export type RoleId = DescribesYou;
const ROLE_IDS: RoleId[] = ['MBBS Student', 'Postgraduate', 'Practicing Doctor', 'Nursing / Allied'];

type OnboardingRolePickerProps = {
  value: RoleId;
  onChange: (value: RoleId) => void;
};

function RoleIcon({ role, size, color }: { role: RoleId; size: number; color: string; }) {
  if (role === 'MBBS Student') return <SimpleLineIcons name='graduation' size={size} color={color} />;
  else if (role === 'Postgraduate') return <Feather name='book-open' size={size} color={color} />;
  else if (role === 'Practicing Doctor') return <MaterialCommunityIcons name='stethoscope' size={size} color={color} />;
  else if (role === 'Nursing / Allied') return <Feather name='users' size={size} color={color} />;
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
              gap: theme.space.sm * 1.75,
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.space.sm * 1.3,
              paddingHorizontal: theme.space.sm * 1.75,
              marginBottom: theme.space.sm * 1.1,
              borderWidth: 1.75,
              borderRadius: theme.borderRadius.lg,
              borderColor: selected ? theme.color.accent : theme.color.border,
              backgroundColor: theme.color.card,
            }}
          >
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                padding: theme.space.sm * 1.5,
                borderRadius: theme.borderRadius.lg,
                backgroundColor: theme.color.surface,
              }}
            >
              <RoleIcon
                role={role}
                size={theme.space.md * 1.5}
                color={selected ? theme.color.accent : theme.color.textSecondary}
              />
            </View>

            <View style={{ flex: 1, gap: theme.space.xs }}>
              <Text
                style={{
                  color: selected ? theme.color.accent : theme.color.textPrimary,
                  fontSize: theme.fontSize.sm * 1.1,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.regular
                }}
              >
                {theme.i18n.t(`components.OnboardingRolePicker.${role.replace(/\s*\/\s*|\s+/g, '_')}.title`)}
              </Text>
              <Text
                style={{
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.xs * 1.1,
                  fontWeight: theme.fontWeight.regular,
                  fontFamily: theme.fontFamily.regular
                }}
              >
                {theme.i18n.t(`components.OnboardingRolePicker.${role.replace(/\s*\/\s*|\s+/g, '_')}.subtitle`)}
              </Text>
            </View>

            {selected && (
              <View
                style={{
                  height: theme.space.md * 1.3,
                  width: theme.space.md * 1.3,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: theme.color.accent
                }}
              >
                <Feather
                  name='check'
                  size={theme.space.sm * 1.5}
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
