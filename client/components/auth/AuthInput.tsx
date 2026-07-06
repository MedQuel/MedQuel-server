import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { View, Text, TextInput, Pressable } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


interface AuthInputProps {
  label: string;
  icon: LucideIcon;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  rightElement?: ReactNode;
  rightLabel?: { text: string; onPress: () => void };
  error?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words';
}

export function AuthInput({
  label,
  icon: Icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  rightElement,
  rightLabel,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: AuthInputProps) {
  const { theme } = useTheme();

  return (
    <View style={{ marginBottom: theme.space.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.space.xs }}>
        <Text
          style={{
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.xs,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {label}
        </Text>
        {rightLabel && (
          <Pressable onPress={rightLabel.onPress} hitSlop={8}>
            <Text
              style={{
                color: theme.color.accent,
                fontSize: theme.fontSize.xs,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {rightLabel.text}
            </Text>
          </Pressable>
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1.5,
          borderRadius: theme.borderRadius.md,
          borderColor: error ? theme.color.error : theme.color.border,
          paddingHorizontal: theme.space.md,
          backgroundColor: theme.color.surface,
        }}
      >
        <Icon size={theme.space.md} color={theme.color.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.color.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={{
            flex: 1,
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.md,
            fontFamily: theme.fontFamily.regular,
            paddingVertical: theme.space.sm * 1.25,
            marginLeft: theme.space.sm * 1.25,
          }}
        />
        {rightElement}
      </View>
    </View>
  );
}
