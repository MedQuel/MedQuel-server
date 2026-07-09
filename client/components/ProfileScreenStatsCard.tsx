import React from "react";
import { View, Text } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from '../theme/ThemeContext';

const stats = [
  { label: "Level",    value: "12",   color: "#F59E0B", icon: "star" },
  { label: "Rank",     value: "#127", color: "#3B82F6", icon: "trending-up"},
  { label: "Streak",   value: "24",   color: "#EF4444", icon: "fire" },
  { label: "Accuracy", value: "87%",  color: "#22C55E", icon: "bullseye" },
];

export function ProfileScreenBoxes() {
  const { theme } = useTheme();
  const {isDark} = theme

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: theme.space.md,
        marginTop: theme.space.lg,
      }}
    >
      {stats.map((item, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            backgroundColor:isDark? theme.color.card:theme.color.card,
            borderRadius: theme.borderRadius.lg,
            paddingVertical: theme.space.sm + 2,
            alignItems: "center",
            marginHorizontal: theme.space.xs,
            borderWidth: 1,
            borderColor: theme.color.border,
          }}
        >
         
          
            <MaterialCommunityIcons
              name={item.icon}
              size={theme.space.md-3}
              color={item.color}
            />
          

          {/* Value */}
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.bold,
              color: item.color,
            }}
          >
            {item.value}
          </Text>

          {/* Label */}
          <Text
            style={{
              fontSize: theme.fontSize.xs-2,
              color: theme.color.textMuted,
              fontFamily: theme.fontFamily.regular,
              marginTop: 2
            }}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}