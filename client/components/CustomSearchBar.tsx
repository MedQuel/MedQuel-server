import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Icon } from "react-native-boxes";
import { useTheme } from "../theme/ThemeContext";

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  iconName?: string;
};

export function CustomSearchBar({
  value,
  onChangeText,
  placeholder,
  iconName,
}: SearchBarProps) {
  const { theme } = useTheme();
  const { isDark } = theme;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.color.border : theme.color.background,
        },
      ]}
    >
      {iconName && (
        <Icon
          name={iconName}
          size={15}
          color={theme.color.textMuted}
          style={styles.icon}
        />
      )}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={
          placeholder || theme.i18n.t("common.search") || "Search contents..."
        }
        placeholderTextColor={theme.color.textMuted}
        style={[
          styles.input,
          { color: isDark ? theme.color.textPrimary : theme.color.textPrimary },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  icon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 13,
  },
});
