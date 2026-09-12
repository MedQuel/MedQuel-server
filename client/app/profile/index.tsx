import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { api } from "@/common/api/api";
import { useTheme } from "../../theme/ThemeContext";
import { Loading } from "../../components/common/loading";
import { ProfileScreenHeader } from "./profileScreenHeader";
import { useBottomBar } from "../../common/context/useBottomBar";
import { PremiumUpsellCard } from "../../components/PremiumUpsellCard";
import { EarnedBadgeCard } from "../../components/EarnedBadgeCard";
import { ProfileScreenStatsCard } from "../../components/ProfileScreenStatsCard";
import { SubjectPerformanceCard } from "../../components/SubjectPerformanceCard";
import { AttemptHistoryItemCard } from "../../components/AttemptHistoryItemCard";
import { ProfilePillRow } from "../../components/profile/ProfilePillRow";
import { EmptyState } from "../../components/common/EmptyState";
import type { Badge } from "../../common/types/types";

function Pill({ theme, children, style }: any) {
  return (
    <View
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: theme.space.xs,
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
          fontFamily: bold ? theme.fontFamily.bold : theme.fontFamily.regular,
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

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentData, setRecentData] = useState<any>(null);
  const [achievements, setAchievements] = useState<Badge[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [load, setLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  useBottomBar(true, "profile");

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [user, analyticsData, achievementsData] = await Promise.all([
        api.user.getMe(),
        api.analytics.getAnalytics(),
        api.achievement.getAchievements(),
      ]);

      setUserData(user);
      setAnalytics(analyticsData);
      setRecentData(analyticsData.recentAttempts ?? []);
      setAchievements(achievementsData ?? []);
    } catch {
      setError("Could not load profile. Pull to refresh.");
    } finally {
      setLoad(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleAddFriendsPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Standardized lower-case path for Expo Router to match screen file naming
    router.push("/Friends" as any);
  }, [router]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  if (load) {
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
        <Loading />
      </View>
    );
  }

  if (error || !userData) {
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
        <Text style={{ color: theme.color.textSecondary }}>
          {error ?? "Could not load profile. Pull to refresh."}
        </Text>
      </View>
    );
  }

  const subjectPerformance = analytics?.subjectPerformance ?? [];
  const earnedBadges = achievements.filter((b) => b.status === "earned");
  const inProgressBadges = achievements.filter((b) => b.status === "in_progress");
  const displayBadges = [...earnedBadges, ...inProgressBadges];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 75 }}
      style={{ flex: 1, backgroundColor: theme.color.background }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.color.accent}
        />
      }
    >
      <ProfileScreenHeader user={userData} />

      <View
        style={{
          gap: theme.space.xs * 1.5,
          alignItems: "center",
          marginTop: theme.space.xxl,
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
          {userData?.describesYou && (
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
                {userData.describesYou}
              </Text>
            </Pill>
          )}

          {userData?.yearOfStudy && (
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
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.xs * 1.2,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {userData.yearOfStudy}
              </Text>
            </Pill>
          )}

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

        {userData?.specialties?.length > 0 && (
          <ProfilePillRow items={userData.specialties} variant="accent" />
        )}

        <View
          style={{
            flexWrap: "wrap",
            gap: theme.space.md + 2,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
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

      {/* Stats Summary */}
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
              value: String(userData?.stats?.contestsPlayed ?? 0),
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
                      (userData.totalCorrect / userData.totalQuestions) * 1000
                    ) / 10
                  : 0
              }%`,
              color: "#22C55E",
              icon: "bullseye",
            },
          ]}
        />
      </View>

      {/* Friends Banner Card */}
      <Section theme={theme}>
        <View
          style={{
            backgroundColor: theme.color.card,
            borderRadius: theme.borderRadius.lg,
            borderWidth: 1,
            borderColor: theme.color.border,
            padding: theme.space.md,
            gap: theme.space.md,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space.sm }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.color.accent + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons name="account-group" size={24} color={theme.color.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontSize: theme.fontSize.md,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                Friends
              </Text>
              <Text
                style={{
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.xs + 1,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                Find friends to compare progress and stay motivated.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddFriendsPress}
            style={{
              backgroundColor: theme.color.accent,
              borderRadius: theme.borderRadius.md,
              paddingVertical: theme.space.sm + 2,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.space.xs,
            }}
          >
            <MaterialCommunityIcons name="account-plus" size={20} color="#FFFFFF" />
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: theme.fontSize.sm,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              ADD FRIENDS
            </Text>
          </TouchableOpacity>
        </View>
      </Section>

      {/* Premium Upsell Card */}
      <Section theme={theme}>
        <PremiumUpsellCard onPress={() => router.push("/premium" as any)} />
      </Section>

      {/* Achievements Card */}
      <Section theme={theme}>
        <EarnedBadgeCard
          achievements={displayBadges}
          onViewAllPress={() => router.push("/achievements" as any)}
          onBadgePress={() => router.push("/achievements" as any)}
        />
      </Section>

      {/* Subject Performance */}
      <Section theme={theme}>
        {subjectPerformance.length === 0 ? (
          <EmptyState
            icon="bar-chart-2"
            title="No subject data yet"
            subtitle="Complete a few quizzes to see your subject-wise performance here."
          />
        ) : (
          <SubjectPerformanceCard
            subjects={subjectPerformance.map(
              (s: { subject: string; accuracy: number }) => ({
                name: s.subject,
                score: s.accuracy,
              })
            )}
          />
        )}
      </Section>

      {/* Recent Attempts */}
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

        {recentData?.length === 0 ? (
          <EmptyState
            icon="clock"
            title="No attempts yet"
            subtitle="Your recent quiz and contest attempts will show up here."
          />
        ) : (
          <AttemptHistoryItemCard
            attempts={recentData?.map(
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
              })
            )}
          />
        )}
      </Section>
    </ScrollView>
  );
}