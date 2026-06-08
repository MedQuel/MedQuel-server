import React, { useContext } from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { CardView, Center, Icon, ThemeContext } from 'react-native-boxes';

export type RoleOption = {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
};

export type OnboardingRolePickerProps = {
  value: string;
  title: string;
  subtitle: string;
  icon: string;
  selected?: boolean;
  onSelect?: (key: string) => void;
  iconBackground?: string;
} & ViewStyle;

export const defaultRoleOptions: RoleOption[] = [
  { key: 'mbbs', title: 'MBBS Student', subtitle: 'Undergraduate medical program', icon: 'graduation-cap' },
  { key: 'postgraduate', title: 'Postgraduate', subtitle: 'MD/MS/Residency preparation', icon: 'book' },
  { key: 'doctor', title: 'Practicing Doctor', subtitle: 'Continuing medical education', icon: 'stethoscope' },
];

export function OnboardingRolePicker({
  value,
  title,
  subtitle,
  icon,
  selected = false,
  onSelect,
  iconBackground,
  ...style
}: OnboardingRolePickerProps) {
  const theme = useContext(ThemeContext);
  const isDark = theme.name === 'dark';

  const rowBackground = selected ? theme.colors.accentLight : theme.colors.forground;
  const textColor = selected || isDark ? theme.colors.text : theme.colors.heading;
  const captionColor = selected || isDark ? theme.colors.caption : theme.colors.invert.caption;

  return (
    <CardView
      style={[
        {
          padding: theme.dimens.space.md,
          borderRadius: theme.dimens.space.lg,
          backgroundColor: theme.colors.forground,
          borderWidth: 1,
          borderColor: selected ? theme.colors.accent : theme.colors.background,
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
        },
        style,
      ]}
    >
      <Pressable
        onPress={() => onSelect?.(value)}
        style={({ pressed }) => [
          {
            minHeight: 64,
            borderRadius: theme.dimens.space.md + theme.dimens.space.xs * 4,
            paddingVertical: theme.dimens.space.md,
            paddingHorizontal: theme.dimens.space.md + theme.dimens.space.xs * 2,
            backgroundColor: rowBackground,
            borderWidth: selected ? 1.5 : 1,
            borderColor: selected ? theme.colors.accent : theme.colors.background,
            flexDirection: 'row',
            alignItems: 'center',
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <Center
          style={{
            width: theme.dimens.icon.lg + theme.dimens.space.md,
            height: theme.dimens.icon.lg + theme.dimens.space.md,
            borderRadius: theme.dimens.space.md + theme.dimens.space.xs * 2,
            marginRight: theme.dimens.space.md + theme.dimens.space.xs * 2,
            backgroundColor: iconBackground ?? theme.colors.background,
          }}
        >
          <Icon name={icon} />
        </Center>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: textColor }}>{title}</Text>
          <Text style={{ marginTop: 3, fontSize: 10.5, color: captionColor }}>{subtitle}</Text>
        </View>

        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            borderWidth: 1.5,
            borderColor: selected ? theme.colors.accent : theme.colors.caption,
            backgroundColor: selected ? theme.colors.accent : theme.colors.transparent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {selected ? <Text style={{ color: theme.colors.invert.text, fontSize: 11, fontWeight: '700' }}>✓</Text> : null}
        </View>
      </Pressable>
    </CardView>
  );
}

export default OnboardingRolePicker;
