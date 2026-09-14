import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import type { StudyPlanWeekday } from '../../common/types/types';
import { WEEKDAY_OPTIONS } from '../../common/constants/studyPlanOptions';


export function WeekdayChips({ selected, onToggle }: {
  selected: StudyPlanWeekday[];
  onToggle: (v: StudyPlanWeekday) => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={{ gap: theme.space.sm, flexDirection: 'row', flexWrap: 'wrap' }}>
      {WEEKDAY_OPTIONS.map(({ value, label }) => {
        const active = selected.includes(value);
        return (
          <TouchableOpacity
            key={value}
            onPress={() => onToggle(value)}
            style={{
              paddingVertical: theme.space.sm - 1,
              paddingHorizontal: theme.space.sm * 1.4,
              borderWidth: 1,
              borderRadius: theme.borderRadius.full,
              borderColor: active ? theme.color.accent : theme.color.border,
              backgroundColor: active ? theme.color.accent : theme.color.card,
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: active ? theme.color.textPrimary : theme.color.textSecondary,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
