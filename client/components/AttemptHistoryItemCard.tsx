import { View, Text } from "react-native";
import { useTheme } from "../theme/ThemeContext";

type Attempt = {
  id: string;
  title: string;
  time: string;
  score: number;
};

type Props = {
  attempts: Attempt[];
};

function getScoreColor(score: number, theme: any): string {
  if (score >= 80) return theme.color.success + "FF";
  if (score >= 70) return theme.color.warning + "AA";
  return theme.color.error;
}

function getScoreBg(score: number, theme: any): string {
  if (score >= 80) return theme.color.success + '22';
  if (score >= 70) return theme.color.warning + '22';
  return theme.color.error + '22';
}

function AttemptCard({ item }: { item: Attempt }) {
  const { theme } = useTheme();

  const color = getScoreColor(item.score, theme);
  const bg = getScoreBg(item.score, theme);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.color.card,
        borderRadius: theme.borderRadius.md + 4,
        borderWidth: 1,
        borderColor: theme.color.border,
        padding: theme.space.xs + 4,
        elevation: 1,
      }}
    >
      {/* Score Badge */}
      <View
        style={{
          paddingHorizontal: theme.space.sm + 2,
          borderWidth: 1,
          borderColor: theme.color.border,
          height: theme.space.xl + 10,
          borderRadius: theme.borderRadius.md + 4,
          backgroundColor: bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: theme.fontSize.sm + 2.5,
            fontWeight: theme.fontWeight.bold,
            color: color,
            textAlign: "center",
            lineHeight: theme.fontSize.sm + 2.5,
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
          paddingLeft: theme.space.sm + 2,
        }}
      >
        <Text
          style={{
            fontSize: theme.fontSize.sm + 1,
            fontWeight: theme.fontWeight.medium,
            color: theme.color.textPrimary,
          }}
        >
          {item.title}
        </Text>

        <Text
          style={{
            fontSize: theme.fontSize.xs + 1,
            color: theme.color.textSecondary,
            marginTop: 3,
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
            width: 3,
            height: 20,
            backgroundColor: theme.color.textMuted,
          }}
        />

        <Text
          style={{
            fontSize: theme.fontSize.sm + 2,
            fontWeight: theme.fontWeight.bold,
            color: color,
            paddingLeft: theme.space.sm + 2,
            minWidth: theme.space.lg + 2,
            textAlign: "right",
          }}
        >
          {item.score}%
        </Text>
      </View>
    </View>
  );
}

export function AttemptHistoryItemCard({ attempts }: Props) {
  const { theme } = useTheme();
  const { isDark } = theme;

  return (
    <View>
      <View
        style={{
          backgroundColor: isDark
            ? theme.color.card + "AA"
            : theme.color.card,
          borderRadius: theme.borderRadius.lg + 4,
          borderWidth: 1,
          borderColor: theme.color.border,
          padding: theme.space.md + 2,
        }}
      >
        <Text
          style={{
            fontSize: theme.fontSize.sm + 2,
            fontWeight: theme.fontWeight.bold,
            color: theme.color.textPrimary,
            paddingBottom: theme.space.sm + 3,
          }}
        >
          Recent Attempts
        </Text>

        {attempts.map((item, index) => (
          <View
            key={item.id}
            style={
              index < attempts.length - 1
                ? { paddingBottom: theme.space.xs + 2 }
                : undefined
            }
          >
            <AttemptCard item={item} />
          </View>
        ))}
      </View>
    </View>
  );
}