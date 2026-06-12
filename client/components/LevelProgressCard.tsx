import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../theme/ThemeContext";

export type XpProgressCardProps = {
  currentLevel: number;
  nextLevel: number;
  currentXP: number;
  totalXP: number;

  remaining: number;
};

export function LevelProgressCard({
  currentLevel,
  nextLevel,
  currentXP,
  totalXP,

  remaining,
}: XpProgressCardProps) {
  const { theme } = useTheme();
  const { isDark } = theme;

  const progress = currentXP / totalXP;

  return (
    <View style={{ padding: theme.space.lg }}>
      <View
        style={{
          backgroundColor: isDark
            ? theme.color.surface
            : theme.color.background,
          borderRadius: theme.borderRadius.lg,
          paddingVertical: theme.space.sm,
          paddingHorizontal: theme.space.lg,
          shadowColor: theme.color.border,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: theme.space.sm,
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              fontWeight: "medium",
              color: isDark ? theme.color.textSecondary : theme.color.textMuted,
            }}
          >
            {theme.i18n.t("common.level") || "Lv"} {currentLevel} →{" "}
            {theme.i18n.t("common.level") || "Lv"} {nextLevel}
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize.xs,
              fontWeight: "bold",
              color: theme.color.accent,
            }}
          >
            {currentXP.toLocaleString()} / {totalXP.toLocaleString()}{" "}
            {theme.i18n.t("common.xp") || "XP"}
          </Text>
        </View>

        <View
          style={{
            height: 6,
            backgroundColor: isDark ? theme.color.border : theme.color.border,
            borderRadius: theme.borderRadius.full,
            overflow: "hidden",
            marginBottom: theme.space.xs,
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${progress * 100}%`,
              backgroundColor: isDark ? theme.color.info : theme.color.accent,
              borderRadius: theme.borderRadius.full,
            }}
          />
        </View>

        <Text
          style={{
            fontSize: theme.fontSize.xs,
            color: theme.color.textMuted,
          }}
        >
          {remaining.toLocaleString()}{" "}
          {theme.i18n.t("common.xpToNextLevel") || "XP to next level"}
        </Text>
      </View>
    </View>
  );
}
