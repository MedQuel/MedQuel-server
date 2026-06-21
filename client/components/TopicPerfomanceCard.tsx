import { View, Text } from "react-native";
import { useTheme } from "../theme/ThemeContext";

type WeakTopic = {
  name: string;
  score: number;
};

type TopicPerformanceCardProps = {
  title: string;
  topics: WeakTopic[];
};

const defaultTopics: WeakTopic[] = [
  { name: "Arrhythmias", score: 100 },
  { name: "Valve Disorders", score: 40 },
  { name: "Pericarditis", score: 80 },
];

const getBarColor = (score: number, theme: any) => {
  if (score > 60) return theme.color.success;
  if (score >= 50) return theme.color.warning;
  return theme.color.error;
};

export function TopicPerfomanceCard({
  title = "Needs Improvement",
  topics = defaultTopics,
}: TopicPerformanceCardProps) {
  const { theme } = useTheme();
  const {isDark} = theme

  return (
    <View
      style={{
        backgroundColor:isDark? theme.color.background:theme.color.background,
        paddingVertical: theme.space.md -6,
        paddingHorizontal: theme.space.md,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.color.border,
      }}
    >
      <Text
        style={{
          fontSize: theme.fontSize.sm,
          fontWeight: theme.fontWeight.bold,
          color: theme.color.textPrimary,
          marginBottom: theme.space.xs+5,
        }}
      >
        {title}
      </Text>

      {topics.map((topic) => {
        const color = getBarColor(topic.score, theme);

        return (
          <View
            key={topic.name}
            style={{
              marginBottom: theme.space.xs+2 ,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.xs,
                }}
              >
                {topic.name}
              </Text>

              <Text
                style={{
                  color,
                  fontSize: theme.fontSize.xs-1,
                  fontWeight: theme.fontWeight.bold,
                }}
              >
                {topic.score}%
              </Text>
            </View>

            <View
              style={{
                height: 4,
                backgroundColor: theme.color.card,
                borderRadius: theme.borderRadius.full,
                marginTop: 4,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${topic.score}%`,
                  backgroundColor: color,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}