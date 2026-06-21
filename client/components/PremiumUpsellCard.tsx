import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeContext";

type UpgradeBannerProps = {
  onPress?: () => void;
};

export function PremiumUpsellCard({ onPress }: UpgradeBannerProps) {
  const { theme } = useTheme();
  const { isDark } = theme;

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          borderWidth: theme.space.xs - 2,
          borderColor: theme.color.border,
          backgroundColor: isDark
            ? theme.color.background 
            : theme.color.background,
          borderRadius: theme.borderRadius.lg,
          paddingVertical: theme.space.sm + 4,
          paddingHorizontal: theme.space.lg,
          gap: theme.space.sm,
          shadowColor: theme.color.premium,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 3,
        },
      ]}
    >
      {/* Icon */}
      <View
        style={{
          width: theme.space.md + 20,
          height: theme.space.md + 15,
          borderRadius: theme.borderRadius.sm + 2,
          backgroundColor: isDark ? theme.color.border + "AA" : "#ece3f9",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons
          name="crown-outline"
          size={theme.space.md + 2}
          color={theme.color.premium + "FF"}
        />
      </View>

      {/* Text */}
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            fontSize: theme.fontSize.sm - 1,
            fontWeight: theme.fontWeight.bold,
            color: theme.color.premium + "FF",
            letterSpacing: 0.1,
          }}
        >
          Upgrade to {theme.i18n.t("common.premium")}
        </Text>

        <Text
          style={{
            fontSize: theme.fontSize.xs,
            fontWeight: theme.fontWeight.regular,
            color: theme.color.textSecondary,
          }}
        >
          {theme.i18n.t("common.start_contest")}
        </Text>
      </View>

      {/* Button */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        disabled={!onPress}
        style={{
          backgroundColor: theme.color.premium + 'AF',
          borderRadius: theme.borderRadius.sm + 4,
          paddingVertical: theme.space.xs + 2,
          paddingHorizontal: theme.space.sm + 2,
        }}
      >
        <Text
          style={{
            color: isDark
              ? theme.color.textPrimary + "FF"
              : theme.color.textInverse,
            fontSize: theme.fontSize.xs,
            fontWeight: theme.fontWeight.bold,
            letterSpacing: 0.2,
          }}
        >
          {theme.i18n.t("components.FeatureContestCard.join_now")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
