import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

export type LevelBadgesProps = {
  level: number;
};

export function UserLevelChip(props: LevelBadgesProps) {
  const { theme } = useTheme();
  const { isDark } = theme;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: isDark ? theme.color.surface : "#dfdff7",
        borderRadius: theme.borderRadius.lg * 2,
        paddingHorizontal: theme.space.lg,
        paddingVertical: theme.space.sm,
        borderWidth: 3,
        borderColor: theme.color.accent,
        alignSelf: "flex-start",
      }}
    >
      <Ionicons name="star" size={theme.space.lg} color={theme.color.warning} />
      <Text
        style={{
          fontSize: theme.fontSize.lg,
          marginRight: theme.space.sm,
        }}
      />
      <Text
        style={{
          color: theme.color.accent,
          fontSize: theme.fontSize.xl,
          fontWeight: "bold",
        }}
      >
        {theme.i18n.t("common.lv")} {props.level}
      </Text>
    </View>
  );
}
