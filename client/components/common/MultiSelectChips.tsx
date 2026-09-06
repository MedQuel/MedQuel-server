import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


interface MultiSelectChipsProps<T extends string> {
  options: readonly T[];
  selected: T[];
  max: number;
  onToggle: (value: T) => void;
}

export function MultiSelectChips<T extends string>({ options, selected, max, onToggle }: MultiSelectChipsProps<T>) {
  const { theme } = useTheme();
  const atCap = selected.length >= max;

  return (
    <View style={{ gap: theme.space.sm, flexDirection: 'row', flexWrap: 'wrap' }}>
      {options.map((value) => {
        const active = selected.includes(value);
        const disabled = !active && atCap;

        return (
          <TouchableOpacity
            key={value}
            onPress={() => onToggle(value)}
            disabled={disabled}
            style={{
              paddingVertical: theme.space.sm - 1,
              paddingHorizontal: theme.space.sm * 1.5,
              borderWidth: 1,
              borderRadius: theme.borderRadius.full,
              borderColor: active ? theme.color.accent : theme.color.border,
              backgroundColor: active ? theme.color.accent : theme.color.card,
              opacity: disabled ? 0.4 : 1,
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: active ? theme.color.textPrimary : theme.color.textSecondary,
                fontWeight: active ? theme.fontWeight.medium : theme.fontWeight.regular,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {value}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
