import React from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { CardView, Center, Icon } from 'react-native-boxes';

export type RoleOption = {
  key: string;
  title: string;
  subtitle: string;
  icon?: string;
};

export type OnboardingRolePickerProps = {
  options?: RoleOption[];
  selectedKey?: string;
  onSelect?: (key: string) => void;
  mode?: 'light' | 'dark';
  icon?: string;
  title?: string;
  subtitle?: string;
  iconBackground?: string;
} & ViewStyle;

const defaultOptions: RoleOption[] = [
  { key: 'mbbs', title: 'MBBS Student', subtitle: 'Undergraduate medical program', icon: 'graduation-cap' },
  { key: 'postgraduate', title: 'Postgraduate', subtitle: 'MD/MS/Residency preparation', icon: 'book' },
  { key: 'doctor', title: 'Practicing Doctor', subtitle: 'Continuing medical education', icon: 'stethoscope' },
];

export function OnboardingRolePicker(props: OnboardingRolePickerProps) {
  const mode = props.mode ?? 'light';
  const options = props.options ?? defaultOptions;
  const selectedKey = props.selectedKey ?? options[0]?.key;
  const isDark = mode === 'dark';

  const containerBackground = isDark ? '#0f172a' : '#ffffff';
  const borderColor = isDark ? '#3559c7' : '#d7e4f5';

  return (
    <View style={{ width: '100%', maxWidth: 360 }}>
      <CardView
        style={{
          padding: 10,
          borderRadius: 20,
          backgroundColor: containerBackground,
          borderWidth: 1,
          borderColor,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 2,
        }}
      >
        <View style={{ gap: 10 }}>
          {options.map((option) => {
            const selected = option.key === selectedKey;
            const rowBackground = selected
              ? isDark
                ? 'rgba(53, 89, 199, 0.22)'
                : '#edf4ff'
              : isDark
                ? '#111d33'
                : '#ffffff';

            return (
              <Pressable
                key={option.key}
                onPress={() => props.onSelect?.(option.key)}
                style={({ pressed }) => [
                  {
                    minHeight: 64,
                    borderRadius: 14,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    backgroundColor: rowBackground,
                    borderWidth: selected ? 1.5 : 1,
                    borderColor: selected ? '#4d79ff' : isDark ? '#22314f' : '#dbe6f3',
                    flexDirection: 'row',
                    alignItems: 'center',
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
              >
                <Center
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    marginRight: 12,
                    backgroundColor: isDark ? '#122543' : '#f2f7ff',
                  }}
                >
                  {option.icon ? <Icon name={option.icon} /> : null}
                </Center>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#f8fbff' : '#1f2a44' }}>
                    {option.title}
                  </Text>
                  <Text style={{ marginTop: 3, fontSize: 10.5, color: isDark ? '#9fb0d4' : '#7b8aa6' }}>
                    {option.subtitle}
                  </Text>
                </View>

                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    borderWidth: 1.5,
                    borderColor: selected ? '#4d79ff' : isDark ? '#41506d' : '#c8d5e7',
                    backgroundColor: selected ? '#4d79ff' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selected ? <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>✓</Text> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </CardView>
    </View>
  );
}

export default OnboardingRolePicker;
