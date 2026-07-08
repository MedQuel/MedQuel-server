import { useTheme } from '../../theme/ThemeContext';
import { ScrollView, Text, TouchableOpacity } from 'react-native';


type SortingChipOption = {
  id: string;
  labelKey: string;
};
type ChipProps = {
  selectedId: string;
  options: SortingChipOption[];
  onChange: (id: string) => void;
};

export function ChipContainer({ options, selectedId, onChange }: ChipProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: theme.space.sm,
        paddingHorizontal: theme.space.md,
        paddingVertical: theme.space.md,
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
              paddingVertical: theme.space.sm,
              paddingHorizontal: theme.space.md,
              borderWidth: 1,
              borderRadius: theme.borderRadius.full,
              borderColor: isActive ? theme.color.accent : theme.color.border,
              backgroundColor: isActive ? theme.color.accent : theme.color.card,
            }}
          >
            <Text
              style={{
                color: isActive ? '#FFFFFF' : theme.color.textSecondary,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                fontWeight: isActive ? theme.fontWeight.bold : theme.fontWeight.regular,
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
