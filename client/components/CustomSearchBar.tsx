import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


type CustomSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onClear?: () => void;
  placeholder: string;
  autoFocus?: boolean;
  loading?: boolean;
  editable?: boolean;
};

export function CustomSearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder,
  autoFocus = false,
  loading = false,
  editable = true,
}: CustomSearchBarProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.space.md * 0.8,
        borderWidth: 1.5,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.color.card,
        boxShadow: theme.isDark
          ? '0px 8px 18px rgba(0,0,0,0.18)'
          : '0px 6px 16px rgba(15,23,42,0.05)',
      }}
    >
      <Feather
        name='search'
        size={theme.space.lg * 0.8}
        color={theme.color.textMuted}
        style={{ marginHorizontal: theme.space.md }}
      />
      <TextInput
        value={value}
        editable={editable}
        autoFocus={autoFocus}
        returnKeyType='search'
        placeholder={placeholder}
        placeholderTextColor={theme.color.textMuted}
        onChangeText={onChange}
        onSubmitEditing={() => onSubmit?.(value)}
        style={{
          flex: 1,
          color: theme.color.textPrimary,
          fontSize: theme.fontSize.md,
          fontFamily: theme.fontFamily.regular,
        }}
      />

      {loading ? (
        <ActivityIndicator size='small' color={theme.color.accent} />
      ) : value.length > 0 ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            onChange('');
            onClear?.();
          }}
        >
          <Ionicons
            name='close-circle'
            size={theme.space.lg * 0.8}
            color={theme.color.textMuted}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
