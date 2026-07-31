import { View, Text, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../../theme/ThemeContext";
import { ProfileScreenHeader } from "./profileScreenHeader";
import { useBottomBar } from "../../common/context/useBottomBar";
import { PremiumUpsellCard } from "../../components/PremiumUpsellCard";
import { ProfileScreenStatsCard } from "../../components/ProfileScreenStatsCard";
import { SubjectPerformanceCard } from "../../components/SubjectPerformanceCard";
import { AttemptHistoryItemCard } from "../../components/AttemptHistoryItemCard";
import { Loading } from "../../components/common/loading";
import { userApi, analyticsApi } from "@/common/api/api";
import { useEffect, useState } from "react";

export default function ChatScreen() {
  

  const { theme } = useTheme();
  const [userData, setUserData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentData, setRecentData] = useState<any>(null);
  const [statsCard, setStatsCard] = useState<any>(null);
  const [load, setLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useBottomBar(true, "profile");

  const userDataLoader = async () => {
    try {
      setError(null);
      setLoad(true);
      const response = await userApi.getMe();
      const analyticsData = await analyticsApi.getAnalytics();
      setAnalytics(analyticsData.subjectPerformance);
      setRecentData(analyticsData.recentAttempts);
      setStatsCard(analyticsData);

      setUserData(response);
    } catch (error) {
      setError("Could not load profile. Pull to refresh.");
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    userDataLoader();
  }, []);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (load) {
    return (
      <View
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          backgroundColor: theme.color.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loading />
      </View>
    );
  }
  if (error) {
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: theme.color.background,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: theme.space.md,
      }}
    >
      {error} 
    </View>
  );
}

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.color.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 75 }}
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
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {userData?.displayName ?? theme.i18n.t("components.ProfileCard.name")}
        </Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: theme.space.xs - 5,
              paddingHorizontal: theme.space.md + 2,
              borderWidth: 1,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.md + 2,
              backgroundColor: theme.color.card,
            }}
          >
            <Text
              style={{
                color: theme.color.accent,
                fontWeight: theme.fontWeight.bold,
                fontSize: theme.fontSize.xs + 1,
              }}
            >
              {userData?.role ?? theme.i18n.t("components.ProfileCard.role")}
            </Text>
          </View>

          <View
            style={{
              gap: 5,
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: theme.space.xs,
              paddingHorizontal: theme.space.sm + 3,
              borderWidth: 0.5,
              borderColor: theme.color.warning + "22",
              borderRadius: theme.borderRadius.md + 2,
              backgroundColor: theme.color.warning + "22",
            }}
          >
            <Text style={{ fontSize: theme.space.sm + 2 }}>
              <MaterialCommunityIcons
                name="star"
                size={theme.space.md - 3}
                color={theme.color.warning}
              />
            </Text>
            <Text
              style={{
                color: theme.color.warning,
                fontSize: theme.fontSize.xs + 2,
              }}
            >
              {userData?.currentLevel ??
                theme.i18n.t("components.ProfileCard.level")}
            </Text>
          </View>
        </View>

        <View
          style={{
            gap: theme.space.md + 2,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              gap: theme.space.sm,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={theme.space.md}
              color={theme.color.textMuted}
            />
            <Text
              style={{
                color: theme.color.textMuted,
                fontSize: theme.fontSize.xs + 2,
              }}
            > 
              { userData?. institution??theme.i18n.t("components.ProfileCard.location")}
            </Text>
          </View>

          <View
            style={{
              gap: theme.space.xs + 2,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="lightning-bolt-outline"
              size={theme.space.md}
              color={theme.color.info}
            />
            <Text
              style={{
                color: theme.color.info,
                fontSize: theme.fontSize.xs + 0.5,
                fontWeight: theme.fontWeight.bold,
              }}
            >
              {userData?.epPoints ??
                theme.i18n.t("components.ProfileCard.epPoints")}{" "}
              Ep
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          marginTop: -theme.space.sm,
          paddingHorizontal: theme.space.xs * 1.5,
        }}
      >
        <ProfileScreenStatsCard
          stats={[
            {
              label: "Level",
              value: String(userData?.currentLevel ?? 0),
              color: "#F59E0B",
              icon: "star",
            },
            {
              label: "Rank",
              value: `#${statsCard?.rank ?? 0}`,
              color: "#3B82F6",
              icon: "trending-up",
            },
            {
              label: "Streak",
              value: String(userData?.longestStreak ?? 0),
              color: "#EF4444",
              icon: "fire",
            },
            {
              label: "Accuracy",
              value: `${statsCard?.accuracy ?? 0}%`,
              color: "#22C55E",
              icon: "bullseye",
            },
          ]}
        />
      </View>

      <View
        style={{
          marginTop: theme.space.sm * 1.5,
          paddingHorizontal: theme.space.md,
        }}
      >
        <PremiumUpsellCard />
      </View>

      <View
        style={{
          marginTop: theme.space.sm * 1.5,
          paddingHorizontal: theme.space.md,
        }}
      >
        <SubjectPerformanceCard
          subjects={(analytics ?? []).map(
            (s: {
              subject: string;
              accuracy: number;
              totalAttempted: number;
            }) => ({
              name: s.subject,
              score: s.accuracy,
            }),
          )}
        />
      </View>

      <View
        style={{
          marginTop: theme.space.sm * 1.5,
          paddingHorizontal: theme.space.md,
        }}
      >
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
      </View>
    </ScrollView>
  );
}
