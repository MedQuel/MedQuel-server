import { View, Text ,ActivityIndicator} from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { MOCK_ANALYTICS } from "@/common/constants/mockData";
import { analyticsApi } from "@/common/api/api";
import { useState ,useEffect} from "react";

type Attempt = {
  id: string;
  title: string;
  time: string;
  score: number;
};

// const attempts: Attempt[] = [
//   { id: "1", title: "Cardiology Sprint", time: "Today", score: 83 },
//   { id: "2", title: "Anatomy Essentials", time: "Yesterday", score: 92 },
//   { id: "3", title: "Pharmacology Sprint", time: "2d ago", score: 67 },
// ];

function getScoreColor(score: number, theme: any): string {
  if (score >= 80) return theme.color.success + "FF";
  if (score >= 70) return theme.color.warning + "AA";
  return theme.color.error;
}
const SIMULATED_LATENCY_MS = 5000;

function fetchRecentAttempts(): Promise<typeof MOCK_ANALYTICS.recentAttempts> {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const analytics = await analyticsApi.getAnalytics();

        if (!analytics?.recentAttempts) {
          throw { code: "analytics/no-data" };
        }

        resolve(analytics.recentAttempts);
      } catch (err) {
        reject(err);
      }
    }, SIMULATED_LATENCY_MS);
  });
}

function mapFirebaseError(err: unknown): string {
  const code = (err as { code?: string })?.code;

  switch (code) {
    case "analytics/no-data":
      return "No performance data available right now.";
    default:
      return "Failed to load subject performance. Please try again.";
  }
}

function getScoreBg(score: number, theme: any): string {
  if (score >= 80) return theme.color.success + "22";
  if (score >= 70) return theme.color.warning + "22";
  return theme.color.error + "22";
}

function AttemptCard({ item }: { item: Attempt }) {
  const { theme } = useTheme();

  const color = getScoreColor(item.score, theme);
  const bg = getScoreBg(item.score, theme);
  // const { isDark } = theme;

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

export function AttemptHistoryItemCard() {
  const { theme } = useTheme();
  const { isDark } = theme;
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<String | null>(null);
  const loadSubjectRecentAttempts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecentAttempts();
      const mapped: Attempt[] = data.map((item) => ({
        id: item.sessionId,
        title: item.subject,
        time: item.completedAt,
        score: item.scorePercent,
      }));
      setAttempts(mapped)
    } catch (error) {
      setError(mapFirebaseError(error));
    }finally{
      setLoading(false)
    }
  };


   useEffect(() => {
      let isMounted = true;
  
      (async () => {
        if (!isMounted) return;
        await loadSubjectRecentAttempts();
      })();
  
      return () => {
        isMounted = false;
      };
    }, []);

  return (
    <View>
      <View
        style={{
          backgroundColor: isDark ? theme.color.card + "AA" : theme.color.card,
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
         {loading && (
                <View style={{ paddingVertical: theme.space.md, alignItems: "center" }}>
                  <ActivityIndicator color={theme.color.accent} />
                </View>
              )}
               {!loading && error && (
        <Text
          style={{
            fontSize: theme.fontSize.xs + 2,
            color: theme.color.error,
          }}
        >
          {error}
        </Text>
      )}

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
