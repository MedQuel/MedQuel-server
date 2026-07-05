import { ScrollView, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../theme/ThemeContext';


type SortingChipOption = {
  id: string;
  labelKey: string;
};

type SortingChipContainerProps = {
  options: SortingChipOption[];
  selectedId: string;
  onChange: (id: string) => void;
};

export function SortingChipContainer({ options, selectedId, onChange }: SortingChipContainerProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: theme.space.md,
        paddingVertical: theme.space.md,
        gap: theme.space.sm,
      }}
    >
      {options.map((option) => {
        const isActive = selectedId === option.id;

        return (
          <TouchableOpacity
            key={option.id}
            onPress={() => onChange(option.id)}
            activeOpacity={0.8}
            style={{
              paddingHorizontal: theme.space.md,
              paddingVertical: theme.space.sm,
              borderRadius: theme.borderRadius.full,
              backgroundColor: isActive ? theme.color.accent : theme.color.card,
              borderWidth: 1,
              borderColor: isActive ? theme.color.accent : theme.color.border,
            }}
          >
            <Text
              style={{
                color: isActive ? '#FFFFFF' : theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontWeight: isActive ? theme.fontWeight.bold as any : theme.fontWeight.regular as any,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {theme.i18n.t(option.labelKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}