import React from "react";
import { useRouter } from 'expo-router';
import { View, Text,TouchableOpacity } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export  function ProfileScreen() {
    const { theme,toggleTheme } = useTheme();
    const {isDark} = theme
    const router  = useRouter()
  return (
     <View
  style={{
    position: "relative",
    backgroundColor: theme.color.card,
  }}
>
  {/* Header */}
  <View
    style={{
      paddingVertical: theme.space.xxl - 3,
      backgroundColor: isDark ? theme.color.card : theme.color.accent,
    }}
  />

 
<TouchableOpacity
  onPress={() => router.push('./settings/SettingPage')}
  style={{
    position: "absolute",
    top: theme.space.md,
    right: theme.space.md,
    paddingHorizontal: theme.space.sm ,
    paddingVertical: theme.space.sm ,
    borderRadius: theme.borderRadius.lg, // square-ish box, full nahi
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.color.textMuted + 90,
    borderWidth: 1,
    borderColor: theme.color.border,
   elevation: 3,
  }}
>
  <MaterialCommunityIcons
    name="cog-outline"
    size={theme.space.md }
    color={isDark ? theme.color.textPrimary : theme.color.textInverse}
  />
</TouchableOpacity>

  {/* Circle Avatar */}
  <View
    style={{
      width: theme.space.xxl + 30,
      height: theme.space.xxl + 30,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.color.premium + 'FF',
      position: "absolute",
      bottom: -36,
      alignSelf: "center",
      borderWidth: 4,
      borderColor: theme.color.border,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text
      onPress={toggleTheme}
      style={{
        color: isDark ? theme.color.textPrimary : theme.color.textInverse,
        fontSize: theme.fontSize.xxl + 4,
        fontWeight: theme.fontWeight.bold,
        lineHeight: 64,
        textAlign: "center",
        includeFontPadding: false,
      }}
    >
      J
    </Text>
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        height: theme.space.lg - 2,
        width: theme.space.lg - 2,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.color.accent,
        borderWidth: 2,
        borderColor: theme.color.border,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <MaterialCommunityIcons
        name="camera-outline"
        size={theme.space.md - 4}
        color={isDark ? theme.color.textPrimary : theme.color.textInverse}
      />
    </View>
  </View>
</View>
   
  )
}
