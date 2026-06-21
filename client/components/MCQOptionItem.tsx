import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


export type MCQOption = {
  label: string;
  text: string;
  isCorrect: boolean;
};

type MCQOptionItemProps = {
  options: MCQOption[];
  onAnswer?: (selectedLabel: string, isCorrect: boolean) => void;
};

export function MCQOptionItem({ options, onAnswer }: MCQOptionItemProps) {
  const { theme } = useTheme();
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const revealed = selectedLabel !== null;

  const handleSelect = (label: string, isCorrect: boolean) => {
    if (revealed) return;
    setSelectedLabel(label);
    onAnswer?.(label, isCorrect);
  };

  return (
    <View>
      {options.map((option) => {
        const selected = selectedLabel === option.label;
        const isCorrectReveal   = revealed && option.isCorrect;
        const isIncorrectReveal = revealed && selected && !option.isCorrect;
        const isActive = selected || isCorrectReveal;

        const borderColor = isCorrectReveal
          ? theme.color.success
          : isIncorrectReveal
            ? theme.color.error
            : selected
              ? theme.color.accent
              : theme.color.border;

        const bgColor = isCorrectReveal
          ? theme.color.success + '18'
          : isIncorrectReveal
            ? theme.color.error + '18'
            : selected
              ? theme.color.accent + '18'
              : theme.color.card;

        const labelBg = isCorrectReveal
          ? theme.color.success
          : isIncorrectReveal
            ? theme.color.error
            : selected
              ? theme.color.accent
              : theme.color.surface;

        const textColor = isCorrectReveal
          ? theme.color.success
          : isIncorrectReveal
            ? theme.color.error
            : selected
              ? theme.color.accent
              : theme.color.textPrimary;

        return (
          <Pressable
            key={option.label}
            onPress={() => handleSelect(option.label, option.isCorrect)}
            disabled={revealed}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.space.md,
              padding: theme.space.md,
              marginBottom: theme.space.sm,
              borderWidth: 2,
              borderRadius: theme.borderRadius.xl,
              borderColor,
              backgroundColor: bgColor,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.borderRadius.lg,
                backgroundColor: labelBg,
              }}
            >
              {isCorrectReveal ? (
                <Feather name="check" size={theme.fontSize.md} color="#FFFFFF" />
              ) : isIncorrectReveal ? (
                <Feather name="x" size={theme.fontSize.md} color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    color: isActive ? '#FFFFFF' : theme.color.textSecondary,
                    fontSize: theme.fontSize.sm,
                    fontWeight: theme.fontWeight.bold as any,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {option.label}
                </Text>
              )}
            </View>

            <Text
              style={{
                flex: 1,
                color: textColor,
                fontSize: theme.fontSize.md,
                fontWeight: isActive ? theme.fontWeight.bold as any : theme.fontWeight.regular as any,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {option.text}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}