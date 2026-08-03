import { useEffect, useState } from "react";
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



function Pill({ theme, children, style }: any) {
  return (
    <View
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: theme.space.xs - 5,
          paddingHorizontal: theme.space.md + 2,
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
    <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space.sm }}>
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
    <View style={{ marginTop: marginTop ?? theme.space.sm * 1.5, paddingHorizontal: theme.space.md }}>
      {children}
    </View>
  );
}



export default function ChatScreen() {
  const { theme } = useTheme();
  const t = theme.i18n.t;
  useBottomBar(true, "profile");

  const [userData, setUserData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentData, setRecentData] = useState<any>(null);
  const [statsCard, setStatsCard] = useState<any>(null);
  const [load, setLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        setLoad(true);
        const [user, analyticsData] = await Promise.all([
          userApi.getMe(),
          analyticsApi.getAnalytics(),
        ]);
        setUserData(user);
        setAnalytics(analyticsData.subjectPerformance);
        setRecentData(analyticsData.recentAttempts);
        setStatsCard(analyticsData);
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
          backgroundColor: theme.color.background,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: theme.space.md,
        }}
      >
        {load ? <Loading /> : <Text>{error}</Text>}
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

      <View style={{ gap: theme.space.xs * 1.5, alignItems: "center", marginTop: theme.space.xxl - 2 }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg + 2,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {userData?.displayName ?? t("components.ProfileCard.name")}
        </Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pill theme={theme} style={{ borderWidth: 1, borderColor: theme.color.border, backgroundColor: theme.color.card }}>
            <Text style={{ color: theme.color.accent, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.xs + 1 }}>
              {userData?.role ?? t("components.ProfileCard.role")}
            </Text>
          </Pill>

          <Pill
            theme={theme}
            style={{
              gap: 5,
              flexDirection: "row",
              paddingVertical: theme.space.xs,
              paddingHorizontal: theme.space.sm + 3,
              borderWidth: 0.5,
              borderColor: theme.color.warning + "22",
              backgroundColor: theme.color.warning + "22",
            }}
          >
            <MaterialCommunityIcons name="star" size={theme.space.md - 3} color={theme.color.warning} />
            <Text style={{ color: theme.color.warning, fontSize: theme.fontSize.xs + 2 }}>
              {userData?.currentLevel ?? t("components.ProfileCard.level")}
            </Text>
          </Pill>
        </View>

        <View style={{ gap: theme.space.md + 2, flexDirection: "row", alignItems: "center" }}>
          <IconLabel
            theme={theme}
            icon="map-marker-outline"
            color={theme.color.textMuted}
            text={t("components.ProfileCard.location")}
          />
          <IconLabel
            theme={theme}
            icon="lightning-bolt-outline"
            color={theme.color.info}
            bold
            text={`${userData?.epPoints ?? t("components.ProfileCard.epPoints")} Ep`}
          />
        </View>
      </View>

      <View style={{ marginTop: -theme.space.sm, paddingHorizontal: theme.space.xs * 1.5 }}>
        <ProfileScreenStatsCard
          stats={[
            { label: "Level", value: String(userData?.currentLevel ?? 0), color: "#F59E0B", icon: "star" },
            { label: "Rank", value: `#${statsCard?.rank ?? 0}`, color: "#3B82F6", icon: "trending-up" },
            { label: "Streak", value: String(userData?.longestStreak ?? 0), color: "#EF4444", icon: "fire" },
            { label: "Accuracy", value: `${statsCard?.accuracy ?? 0}%`, color: "#22C55E", icon: "bullseye" },
          ]}
        />
      </View>

      <Section theme={theme}>
        <PremiumUpsellCard />
      </Section>

      <Section theme={theme}>
        <SubjectPerformanceCard
          subjects={(analytics ?? []).map((s: { subject: string; accuracy: number }) => ({
            name: s.subject,
            score: s.accuracy,
          }))}
        />
      </Section>

      <Section theme={theme}>
        <AttemptHistoryItemCard
          attempts={(recentData ?? []).map(
            (a: { sessionId: string; subject: string; scorePercent: number; completedAt: string }) => ({
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