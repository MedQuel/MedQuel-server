import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "@/common/api/api";
import { useTheme } from "../../theme/ThemeContext";
import { withAlpha } from "../../common/utils/withAlpha";
import { Loading } from "../../components/common/loading";
import { ProfileScreenHeader } from "./profileScreenHeader";
import { useBottomBar } from "../../common/context/useBottomBar";
import { PremiumUpsellCard } from "../../components/PremiumUpsellCard";
import { EarnedBadgeCard } from "../../components/EarnedBadgeCard";
import { ProfileScreenStatsCard } from "../../components/ProfileScreenStatsCard";
import { SubjectPerformanceCard } from "../../components/SubjectPerformanceCard";
import { AttemptHistoryItemCard } from "../../components/AttemptHistoryItemCard";
import type { Badge } from "../../common/types/types";

function Pill({ theme, children, style }: any) {
  return (
    <View
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 4,
          paddingHorizontal: theme.space.md,
          borderRadius: theme.borderRadius.full,
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
        gap: 5,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <MaterialCommunityIcons name={icon} size={15} color={color} />
      <Text
        style={{
          color,
          fontSize: theme.fontSize.xs,
          fontFamily: theme.fontFamily.regular,
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
        marginTop: marginTop ?? theme.space.lg,
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
  const [achievements, setAchievements] = useState<Badge[]>([]);
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
        const [user, analyticsData, achievementsData] = await Promise.all([
          api.user.getMe(),
          api.analytics.getAnalytics(),
          api.achievement.getAchievements(),
        ]);

        setUserData(user);
        setAnalytics(analyticsData);
        setRecentData(analyticsData.recentAttempts);
        setAchievements(achievementsData);
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

  const subjectPerformance = analytics.subjectPerformance ?? [];
  const hasRecentAttempts = (recentData ?? []).length > 0;
  const earnedBadges = achievements.filter((b) => b.status === "earned");

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 110 }}
      style={{ flex: 1, backgroundColor: theme.color.background }}
    >
      <ProfileScreenHeader user={userData} />
      <View
        style={{
          alignItems: "center",
          marginTop: theme.space.xxl + 6,
          gap: 6,
          paddingHorizontal: theme.space.md,
        }}
      >
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.xl,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.bold,
            textAlign: "center",
          }}
        >
          {userData?.displayName}
        </Text>

        <View
          style={{
            gap: theme.space.sm,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {userData?.studyLevel ? (
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
                  fontSize: theme.fontSize.xs,
                  fontFamily: theme.fontFamily.bold,
                  fontWeight: theme.fontWeight.bold,
                }}
              >
                {userData.studyLevel}
              </Text>
            </Pill>
          ) : null}

          <Pill
            theme={theme}
            style={{
              gap: 4,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: withAlpha(theme.color.warning, 0.3),
              backgroundColor: withAlpha(theme.color.warning, 0.12),
            }}
          >
            <MaterialCommunityIcons
              name="star"
              size={13}
              color={theme.color.warning}
            />
            <Text
              style={{
                color: theme.color.warning,
                fontSize: theme.fontSize.xs,
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
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            columnGap: theme.space.md,
            rowGap: theme.space.xs,
          }}
        >
          {userData?.targetExam ? (
            <IconLabel
              theme={theme}
              icon="target"
              color={theme.color.textSecondary}
              text={userData.targetExam}
            />
          ) : null}
          {userData?.institution ? (
            <IconLabel
              theme={theme}
              icon="map-marker-outline"
              color={theme.color.textMuted}
              text={userData.institution}
            />
          ) : null}
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
        style={{ marginTop: theme.space.lg, paddingHorizontal: theme.space.md }}
      >
        <ProfileScreenStatsCard
          stats={[
            {
              label: theme.i18n.t("common.level"),
              value: String(userData?.currentLevel ?? 0),
              color: theme.color.warning,
              icon: "star",
            },
            {
              label: theme.i18n.t("common.quizzes"),
              value: String(userData?.stats.contestsPlayed ?? 0),
              color: theme.color.accent,
              icon: "lightning-bolt",
            },
            {
              label: theme.i18n.t("common.streak"),
              value: String(userData?.longestStreak ?? 0),
              color: theme.color.error,
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
              color: theme.color.success,
              icon: "bullseye",
            },
          ]}
        />
      </View>

      {/* Premium Upsell Card - Added Navigation */}
      <Section theme={theme}>
        <PremiumUpsellCard onPress={() => router.push("/premium")} />
      </Section>

      {/* Achievements */}
      <Section theme={theme}>
        <EarnedBadgeCard
          achievements={earnedBadges}
          onViewAllPress={() => router.push("/achievements")}
          onBadgePress={() => router.push("/achievements")}
        />
      </Section>

      {/* Subject Performance */}
      <Section theme={theme}>
        <SubjectPerformanceCard
          subjects={subjectPerformance.map(
            (s: { subject: string; accuracy: number }) => ({
              name: s.subject,
              score: s.accuracy,
            }),
          )}
        />
      </Section>

      {/* Recent Attempts — only show if user has played contests */}
      {hasRecentAttempts && (
        <Section theme={theme}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg,
              fontFamily: theme.fontFamily.bold,
              fontWeight: theme.fontWeight.bold,
              paddingBottom: theme.space.sm,
              marginLeft: theme.space.xs,
            }}
          >
            {theme.i18n.t("profile.recentAttempts") === "recentAttempts" ? "Recent Attempts" : theme.i18n.t("profile.recentAttempts")}
          </Text>

          <AttemptHistoryItemCard
            attempts={recentData.map(
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
      )}
    </ScrollView>
  );
}