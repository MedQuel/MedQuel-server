import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { View, Text, Image, TouchableOpacity } from "react-native";

import { useTheme } from "../../theme/ThemeContext";

type User = {
  displayName?: string;
  photoURL?: string;
  [key: string]: any;
};

type Props = {
  user: User | null;
};

const AVATAR_BORDER_WIDTH = 4;

export function ProfileScreenHeader({ user }: Props) {
  const { theme } = useTheme();
  const router = useRouter();

  const avatarSize = theme.space.xxl + 64;
  const hasPhoto = Boolean(user?.photoURL);

  return (
    <View style={{ position: "relative" }}>
      <View
        style={{
          paddingVertical: theme.space.xxl,
          backgroundColor: theme.isDark
            ? theme.color.card
            : theme.color.accent,
        }}
      />

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={theme.i18n.t("profile.header.editProfile")}
        onPress={() => router.push("/profile/updateProfile")}
        style={{
          position: "absolute",
          top: theme.space.md + 4,
          left: theme.space.md + 4,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: theme.space.sm + 4,
          paddingHorizontal: theme.space.sm + 4,
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.lg + 2,
          backgroundColor: theme.isDark
            ? theme.color.card
            : theme.color.textMuted + "33",
          boxShadow: theme.isDark
            ? "0 6px 14px rgba(0,0,0,0.2)"
            : "0 6px 14px rgba(0,0,0,0.05)",
        }}
      >
        <Feather
          name="edit-2"
          size={theme.space.md + 2}
          color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
        />
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={theme.i18n.t("profile.header.settings")}
        onPress={() => router.push("/profile/settingsScreen")}
        style={{
          position: "absolute",
          top: theme.space.md + 4,
          right: theme.space.md + 4,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: theme.space.sm + 4,
          paddingHorizontal: theme.space.sm + 4,
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.lg + 2,
          backgroundColor: theme.isDark
            ? theme.color.card
            : theme.color.textMuted + "33",
          boxShadow: theme.isDark
            ? "0 6px 14px rgba(0,0,0,0.2)"
            : "0 6px 14px rgba(0,0,0,0.05)",
        }}
      >
        <Feather
          name="settings"
          size={theme.space.md + 2}
          color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
        />
      </TouchableOpacity>

      <View
        style={{
          position: "absolute",
          bottom: -48,
          width: avatarSize,
          height: avatarSize,
          alignSelf: "center",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: AVATAR_BORDER_WIDTH,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.color.premium + "FF",
          overflow: "hidden",
        }}
      >
        {hasPhoto ? (
          <Image
            source={{ uri: user?.photoURL }}
            style={{
              width: avatarSize - AVATAR_BORDER_WIDTH * 2,
              height: avatarSize - AVATAR_BORDER_WIDTH * 2,
              borderRadius: theme.borderRadius.full,
            }}
          />
        ) : (
          <Text
            style={{
              lineHeight: 82,
              textAlign: "center",
              includeFontPadding: false,
              color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
              fontSize: theme.fontSize.xxl + 20,
              fontWeight: theme.fontWeight.bold,
            }}
          >
            {user?.displayName?.charAt(0)?.toUpperCase()}
          </Text>
        )}
      </View>
    </View>
  );
}