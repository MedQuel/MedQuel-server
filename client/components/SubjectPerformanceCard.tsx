import { View, Text } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type SubjectItem = {
  name: string;
  score: number;
};

type PerformanceBySubjectProps = {
  title?: string;
  subjects?: SubjectItem[];
};

const defaultSubjects: SubjectItem[] = [
  { name: "Anatomy", score: 90 },
  { name: "Pharmacology", score: 81 },
  { name: "Pathology", score: 74 },
  { name: "Microbiology", score: 68 },
  { name: "Surgery", score: 55 },
];

function getScoreColor(score: number, theme: any): string {
  if (score >= 90) return theme.color.success + "FF";
  if (score > 80 && score <90)return  theme.color.accent;
  if (score >= 70 && score <80) return theme.color.warning + "AA";
  if(score < 70 && score >60) return theme.color.premium
  return theme.color.error;
}

export function SubjectPerformanceCard({
  title = "Performance by Subject",
  subjects = defaultSubjects,
}: PerformanceBySubjectProps) {
  const { theme } = useTheme();
  const { isDark } = theme;

  return (
    <View
      style={{
        backgroundColor: isDark
          ? theme.color.background 
          : theme.color.card,
        paddingHorizontal: theme.space.sm,
        paddingVertical: theme.space.md -2,
        borderRadius: theme.borderRadius.lg + 2,
        borderWidth: 1,
        borderColor: theme.color.border,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingBottom: theme.space.sm,
        }}
      >
        <MaterialCommunityIcons
          name="pulse"
          size={18}
          color={theme.color.accent}
        />

        <Text
          style={{
            fontSize: theme.fontSize.sm,
            fontWeight: theme.fontWeight.bold,
            color: theme.color.textPrimary,
            paddingLeft: 6,
          }}
        >
          {title}
        </Text>
      </View>

      {/* Subject Rows */}
      {subjects.map((item, index) => {
        const scoreColor = getScoreColor(item.score, theme);

        return (
          <View
            key={item.name}
            style={{
              paddingBottom:
                index === subjects.length - 1
                  ? 0
                  : theme.space.xs,
            }}
          >
            {/* Label Row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.xs,
                  color: theme.color.textSecondary,
                  fontWeight: theme.fontWeight.medium,
                }}
              >
                {item.name}
              </Text>

              <View
                style={{
                  paddingHorizontal: theme.space.xs,
                  paddingVertical: 1,
                  borderRadius: theme.borderRadius.full,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.xs,
                    fontWeight: theme.fontWeight.bold,
                    color: scoreColor,
                  }}
                >
                  {item.score}%
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View
              style={{
                height: theme.space.xs + 1,
                backgroundColor: isDark?theme.color.card:theme.color.border,
                borderRadius: theme.borderRadius.full,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${item.score}%`,
                  height: "100%",
                  backgroundColor: scoreColor,
                  borderRadius: theme.borderRadius.full,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}