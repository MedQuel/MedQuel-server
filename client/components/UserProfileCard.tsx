import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type ProfilePropsCards = {
  icoName: string;
  name: string;
  email: string;
  lv:Number;
  day:Number
};

export function UserProfileCard({
  icoName,
  name,
  email,
  
}: ProfilePropsCards) {
  const { theme } = useTheme();
  const { isDark } = theme;

  return (
    <View
      style={{
        backgroundColor: isDark
          ? theme.color.card
          : theme.color.surface,
        paddingHorizontal: theme.space.sm - 2,
        paddingVertical: theme.space.sm +2,
        borderRadius: theme.borderRadius.lg + 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: theme.color.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
        }}
      >
        {/* Avatar */}
        <View
          style={{
            marginLeft: theme.space.sm,
            paddingHorizontal: theme.space.md + 2,
            paddingVertical: theme.space.sm,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.accent + "AF",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg + 6,
              
              fontWeight:theme.fontWeight.regular,
            }}
          >
            {icoName}
          </Text>
        </View>

        {/* User Info */}
        <View
          style={{
            marginLeft: theme.space.md,
            gap:theme.space.xs-2
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSize.sm+ 2,
              fontWeight: theme.fontWeight.bold.toString() as any,
              color: theme.color.textPrimary,
            }}
          >
            {name}
          </Text>

          <Text
            style={{
              fontSize: theme.fontSize.xs-1,
              color: theme.color.textSecondary,
              
            }}
          >
            {email}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 2,
            }}
          >
            <View
              style={{
                paddingHorizontal: 4,
                paddingVertical: 4,
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.success,
                marginRight: 6,
              }}
            />

            <Text
              style={{
                fontSize: theme.fontSize.xs-1,
                color: theme.color.textMuted,
              }}
            >
              Lv{12} . {24} days streak
            </Text>
          </View>
        </View>
      </View>

      {/* Crown Button */}
      <TouchableOpacity
        accessibilityLabel={theme.i18n.t("common.premium")}
        style={{
          paddingHorizontal: 2,
          paddingVertical: 2,
          borderRadius: theme.borderRadius.md,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: isDark
              ? theme.color.premium +22
              : "#cfbaf3",
            borderRadius: theme.borderRadius.md,
            paddingHorizontal: theme.space.md-5,
            paddingVertical: theme.space.xs,
          }}
        >
          <MaterialCommunityIcons
            name="crown-outline"
            size={theme.space.md}
            color={theme.color.premium + "FF"}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}