import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "@/common/api/api";
import { useTheme } from "../../theme/ThemeContext";
import { Loading } from "../../components/common/loading";
import { ProfileScreenHeader } from "./profileScreenHeader";
import { useBottomBar } from "../../common/context/useBottomBar";
import { PremiumUpsellCard } from "../../components/PremiumUpsellCard";
import { ProfileScreenStatsCard } from "../../components/ProfileScreenStatsCard";
import { SubjectPerformanceCard } from "../../components/SubjectPerformanceCard";
import { AttemptHistoryItemCard } from "../../components/AttemptHistoryItemCard";
function Pill({ theme, children, style }: any) {
  return (
    <View
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: theme.space.xs - 5,
          paddingHorizontal: theme.space.sm * 1.1,
          borderRadius: theme.borderRadius.md + 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
function IconLabel({ theme, icon, color, text, bold }: any) {
  return (
    <View
      style={{
        gap: theme.space.xs,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <MaterialCommunityIcons name={icon} size={theme.space.md} color={color} />
      <Text
        style={{
          color,
          fontSize: theme.fontSize.xs + 2,
          fontWeight: bold ? theme.fontWeight.bold : undefined,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
function Section({ theme, children, marginTop }: any) {
  return (
    <View
      style={{
        marginTop: marginTop ?? theme.space.sm * 1.5,
        paddingHorizontal: theme.space.md,
      }}
    >
      {children}
    </View>
  );
}

export default function ChatScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentData, setRecentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [load, setLoad] = useState(true);

  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(true, "profile");

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        setLoad(true);
        const [user, analyticsData] = await Promise.all([
          api.user.getMe(),
          api.analytics.getAnalytics(),
        ]);

        setUserData(user);
        setAnalytics(analyticsData);
        setRecentData(analyticsData.recentAttempts);
      } catch {
        setError("Could not load profile. Pull to refresh.");
      } finally {
        setLoad(false);
      }
    })();
  }, []);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  if (load || error) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: theme.space.md,
          backgroundColor: theme.color.background,
        }}
      >
        {load ? <Loading /> : <Text>{error}</Text>}
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 75 }}
      style={{ flex: 1, backgroundColor: theme.color.background }}
    >
      <ProfileScreenHeader user={userData} />
      <View
        style={{
          gap: theme.space.xs * 1.5,
          alignItems: "center",
          marginTop: theme.space.xxl - 2,
        }}
      >
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg + 2,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {userData?.displayName}
        </Text>

        <View style={{ gap: theme.space.sm, flexDirection: "row" }}>
          <Pill
            theme={theme}
            style={{
              borderWidth: 1,
              borderColor: theme.color.border,
              backgroundColor: theme.color.card,
            }}
          >
            <Text
              style={{
                color: theme.color.accent,
                fontSize: theme.fontSize.xs * 1.2,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {userData?.studyLevel}
            </Text>
          </Pill>

          <Pill
            theme={theme}
            style={{
              gap: 5,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: theme.space.xs,
              paddingHorizontal: theme.space.sm + 3,
              borderWidth: 0.5,
              borderColor: theme.color.warning + "22",
              backgroundColor: theme.color.warning + "22",
            }}
          >
            <MaterialCommunityIcons
              name="star"
              size={theme.space.md}
              color={theme.color.warning}
            />
            <Text
              style={{
                color: theme.color.warning,
                fontSize: theme.fontSize.xs * 1.15,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.number,
              }}
            >
              {theme.i18n.t("profile.level", {
                level: userData?.currentLevel ?? 0,
              })}
            </Text>
          </Pill>
        </View>

        <View
          style={{
            gap: theme.space.md + 2,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <IconLabel
            theme={theme}
            icon="target"
            color={theme.color.textSecondary}
            text={userData?.targetExam}
          />
          {userData?.institution && (
            <IconLabel
              theme={theme}
              icon="map-marker-outline"
              color={theme.color.textMuted}
              text={userData?.institution}
            />
          )}
          <IconLabel
            theme={theme}
            icon="lightning-bolt"
            color={theme.color.info}
            bold
            text={theme.i18n.t("profile.xpPoints", {
              points: userData?.xpPoints ?? 0,
            })}
          />
        </View>
      </View>

      <View
        style={{ marginTop: theme.space.md, paddingHorizontal: theme.space.md }}
      >
        <ProfileScreenStatsCard
          stats={[
            {
              label: theme.i18n.t("common.level"),
              value: String(userData?.currentLevel ?? 0),
              color: "#F59E0B",
              icon: "star",
            },
            {
              label: theme.i18n.t("common.quizzes"),
              value: String(userData?.totalContests ?? 0),
              color: "#3B82F6",
              icon: "lightning-bolt",
            },
            {
              label: theme.i18n.t("common.streak"),
              value: String(userData?.longestStreak ?? 0),
              color: "#EF4444",
              icon: "fire",
            },
            {
              label: theme.i18n.t("common.accuracy"),
              value: `${
                userData?.totalQuestions
                  ? Math.floor(
                      (userData.totalCorrect / userData.totalQuestions) * 1000,
                    ) / 10
                  : 0
              }%`,
              color: "#22C55E",
              icon: "bullseye",
            },
          ]}
        />
      </View>

      <Section theme={theme}>
        <PremiumUpsellCard onPress={() => router.push('/Premium')} />
      </Section>

      <Section theme={theme}>
        <SubjectPerformanceCard
          subjects={(analytics.subjectPerformance ?? []).map(
            (s: { subject: string; accuracy: number }) => ({
              name: s.subject,
              score: s.accuracy,
            }),
          )}
        />
      </Section>

      <Section theme={theme}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.sm + 4,
            fontFamily: theme.fontFamily.regular,
            fontWeight: theme.fontWeight.bold,
            paddingBottom: theme.space.md,
            marginLeft: theme.space.xs,
          }}
        >
          {theme.i18n.t("profile.recentAttempts")}
        </Text>

        <AttemptHistoryItemCard
          attempts={(recentData ?? []).map(
            (a: {
              sessionId: string;
              subject: string;
              scorePercent: number;
              completedAt: string;
            }) => ({
              id: a.sessionId,
              title: a.subject,
              time: formatTime(a.completedAt),
              score: a.scorePercent,
            }),
          )}
        />
      </Section>
    </ScrollView>
  );
}