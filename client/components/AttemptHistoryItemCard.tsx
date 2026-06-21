import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useTheme } from "../theme/ThemeContext";

type Attempt = {
  id: string;
  title: string;
  time: string;
  score: number;
};

const attempts: Attempt[] = [
  { id: "1", title: "Cardiology Sprint", time: "Today", score: 83 },
  { id: "2", title: "Anatomy Essentials", time: "Yesterday", score: 92 },
  { id: "3", title: "Pharmacology Sprint", time: "2d ago", score: 67 },
];

function getScoreColor(score: number, theme: any): string {
  if (score >= 80) return theme.color.success + "FF";
  if (score >= 70) return theme.color.warning + "AA";
  return theme.color.error;
}

function getScoreBg(score: number, theme: any): string {
  const { isDark } = theme;
  if (score >= 80) return isDark ? theme.color.background : theme.color.border;
  if (score >= 70) return isDark ? theme.color.background : theme.color.border;
  return isDark ? theme.color.background : theme.color.border;
}

function AttemptCard({ item }: { item: Attempt }) {
  const { theme } = useTheme();

  const color = getScoreColor(item.score, theme);
  const bg = getScoreBg(item.score, theme);
  const { isDark } = theme;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: isDark ? theme.color.card : theme.color.background,
        borderRadius: theme.borderRadius.md + 2,
        borderWidth: 1,
        borderColor: theme.color.border,
        padding: theme.space.xs + 2,
        elevation: 1,
      }}
    >
      {/* Score Badge */}
      <View
        style={{
          paddingHorizontal:theme.space.sm,
          borderWidth:1,
          borderColor:theme.color.border,
          height: theme.space.xl + 8,
          borderRadius: theme.borderRadius.md + 2,
          backgroundColor: bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: theme.fontSize.sm + 0.5,
            fontWeight: theme.fontWeight.bold,
            color: color,
            textAlign: "center", 
            lineHeight: theme.fontSize.sm + 0.5, 
            includeFontPadding: false, 
          }}
        >
          {item.score}%
        </Text>
      </View>

      {/* Title & Time */}
      <View
        style={{
          flex: 1,
          paddingLeft: theme.space.sm,
        }}
      >
        <Text
          style={{
            fontSize: theme.fontSize.sm - 1,
            fontWeight: theme.fontWeight.medium,
            color: theme.color.textPrimary,
          }}
        >
          {item.title}
        </Text>

        <Text
          style={{
            fontSize: theme.fontSize.xs - 1,
            color: theme.color.textSecondary,
            marginTop: 1,
          }}
        >
          {item.time}
        </Text>
      </View>

      {/* Divider + Score */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 1,
            height: 18,
            backgroundColor: theme.color.textMuted,
          }}
        />

        <Text
          style={{
            fontSize: theme.fontSize.sm,
            fontWeight: theme.fontWeight.bold,
            color: color,
            paddingLeft: theme.space.sm,
            minWidth: theme.space.lg,
            textAlign: "right",
          }}
        >
          {item.score}%
        </Text>
      </View>
    </View>
  );
}

export function AttemptHistoryItemCard() {
  const { theme } = useTheme();
  const { isDark } = theme;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View
        style={{
          backgroundColor: isDark
            ? theme.color.background + "AA"
            : theme.color.card,
          borderRadius: theme.borderRadius.lg+2,
          borderWidth: 1,

          borderColor: theme.color.border,
          padding: theme.space.md ,
        }}
      >
        <Text
          style={{
            fontSize: theme.fontSize.sm,
            fontWeight: theme.fontWeight.bold,
            color: theme.color.textPrimary,
            paddingBottom: theme.space.sm +1,
          }}
        >
          Recent Attempts
        </Text>

        {attempts.map((item, index) => (
          <View
            key={item.id}
            style={
              index < attempts.length - 1
                ? { paddingBottom: theme.space.xs }
                : undefined
            }
          >
            <AttemptCard item={item} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
