import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Loading } from "../../components/common/loading";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { ToggleSwitch } from "../../components/common/ToggleSwitch";
import { useTheme } from "../../theme/ThemeContext";
import { userApi } from "@/common/api/api";
import { UserProfileCard } from "../../components/UserProfileCard";
import { PremiumUpsellCardFull } from "../../components/PremiumUpsellCardFull";



function SectionLabel({ text, theme }: any) {
  return (
    <Text
      style={{
        textTransform: "capitalize",
        color: theme.color.textMuted,
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.medium,
        marginTop: theme.space.sm + 4,
        paddingHorizontal: theme.space.sm + 4,
      }}
    >
      {text}
    </Text>
  );
}

function Card({ theme, children }: any) {
  return (
    <View style={{ paddingHorizontal: theme.space.xs + 1 }}>
      <View style={{ justifyContent: "center", padding: theme.space.sm }}>
        <View
          style={{
            overflow: "hidden",
            paddingVertical: theme.space.sm,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.card,
          }}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

function Divider({ theme }: any) {
  return <View style={{ height: 0.6, backgroundColor: theme.color.border }} />;
}


function Row({
  theme,
  icon,
  iconLib: IconLib = MaterialCommunityIcons,
  iconBg,
  iconColor,
  title,
  titleColor,
  subtitle,
  onPress,
  right,
}: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: theme.space.sm,
        paddingVertical: theme.space.sm - 1,
      }}
    >
      <View
        style={{
          padding: theme.space.xs + 2,
          borderRadius: theme.borderRadius.md - 2,
          backgroundColor: iconBg ?? theme.color.surface,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <IconLib name={icon} size={theme.space.md} color={iconColor} />
      </View>
      <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
        <Text
          style={{
            color: titleColor ?? theme.color.textPrimary,
            fontSize: theme.fontSize.sm + 1,
            fontWeight: theme.fontWeight.medium,
          }}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm - 1,
              paddingTop: 2,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {right ?? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={theme.space.md}
          color={theme.color.textMuted}
        />
      )}
    </TouchableOpacity>
  );
}

function ToggleRight({ theme, value, onChange }: any) {
  return (
    <View style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}>
      <ToggleSwitch
        isOn={value}
        onColor="#3B82F6"
        offColor={
          theme.isDark ? theme.color.border : theme.color.textMuted + "55"
        }
        size="medium"
        onToggle={onChange}
      />
    </View>
  );
}



export default function SettingsScreen() {
  const [toggles, setToggles] = useState({
    rank: false,
    push: false,
    email: false,
    contest: false,
    achievement: false,
    timerSound: false,
    autoSubmit: false,
  });
  const set = (key: string) => (val: boolean) =>
    setToggles((t) => ({ ...t, [key]: val }));

  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const t = theme.i18n.t;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setUserData(await userApi.getMe());
      } catch {
        setError("Could not load profile. Pull to refresh.");
      } finally {
        setLoading(false);
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

  if (loading || error) {
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
        {loading ? <Loading /> : <Text>{error}</Text>}
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 70 }}
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: theme.color.background }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: theme.space.xs * 1.5,
          paddingHorizontal: theme.space.sm,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("../profile")}
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: theme.space.xs + 3,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.lg - 3,
            backgroundColor: theme.color.card,
            aspectRatio: 1,
          }}
        >
          <Ionicons
            name="chevron-back"
            size={theme.space.md}
            color={theme.color.textSecondary}
          />
        </TouchableOpacity>
        <View style={{ flex: 1, paddingLeft: theme.space.md }}>
          <Text
            style={{
              textTransform: "capitalize",
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg + 2,
              fontWeight: theme.fontWeight.bold,
            }}
          >
            {t("common.settings")}
          </Text>
          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              paddingTop: theme.space.xs * 0.5,
            }}
          >
            {t("common.account_preferences")}
          </Text>
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: theme.space.sm + 4,
          marginTop: theme.space.sm + 2,
        }}
      >
        <UserProfileCard userData={userData} />
      </View>

      {/* Account */}
      <SectionLabel theme={theme} text={t("common.account")} />
      <Card theme={theme}>
        <Row
          theme={theme}
          icon="email-outline"
          iconBg="#5B9CF61A"
          iconColor="#5B9CF6"
          title={t("common.email_address")}
          subtitle={userData?.email}
        />
        <Divider theme={theme} />
        <Row
          theme={theme}
          icon="lock-outline"
          iconBg="#5B9CF61A"
          iconColor="#5B9CF6"
          title={t("profile.change_password")}
          subtitle={userData?.updatedAt ? formatTime(userData.updatedAt) : ""}
        />
        <Divider theme={theme} />
        <Row
          theme={theme}
          icon="school-outline"
          iconBg="#F6A0201A"
          iconColor="#F6A020"
          title={t("profile.target_exam")}
          subtitle={userData?.targetExam}
        />
        <Divider theme={theme} />
        <Row
          theme={theme}
          icon="book-open-outline"
          iconBg="#22C55E1A"
          iconColor="#22C55E"
          title={t("common.study_level")}
          subtitle={userData?.studyLevel}
        />
      </Card>

      {/* Notifications */}
      <SectionLabel theme={theme} text="NOTIFICATIONS" />
      <Card theme={theme}>
        <Row
          theme={theme}
          icon="bell-outline"
          iconBg="#5B9CF61A"
          iconColor="#5B9CF6"
          title={t("settings.push_notifications")}
          subtitle={t("settings.daily_reminders")}
          right={
            <ToggleRight
              theme={theme}
              value={toggles.push}
              onChange={set("push")}
            />
          }
        />
        <Divider theme={theme} />
        <Row
          theme={theme}
          icon="email-outline"
          iconBg="#5B9CF61A"
          iconColor="#5B9CF6"
          title={t("settings.email_digest")}
          subtitle={t("settings.weekly_performance_summary")}
          right={
            <ToggleRight
              theme={theme}
              value={toggles.email}
              onChange={set("email")}
            />
          }
        />
        <Divider theme={theme} />
        <Row
          theme={theme}
          icon="chart-bar"
          iconBg="#F6A0201A"
          iconColor="#F6A020"
          title={t("settings.rank_change_alerts")}
          subtitle={t("settings.notify_on_leaderboard_moves")}
          right={
            <ToggleRight
              theme={theme}
              value={toggles.rank}
              onChange={set("rank")}
            />
          }
        />
        <Divider theme={theme} />
        <Row
          theme={theme}
          icon="medal-outline"
          iconBg="#22C55E1A"
          iconColor="#22C55E"
          title={t("settings.achievement_alerts")}
          subtitle="Badges & milestone unlocks"
          right={
            <ToggleRight
              theme={theme}
              value={toggles.achievement}
              onChange={set("achievement")}
            />
          }
        />
        <Divider theme={theme} />
        <Row
          theme={theme}
          icon="trophy-outline"
          iconBg={theme.color.error + "1A"}
          iconColor={theme.color.error}
          title={t("settings.contest_reminders")}
          subtitle={t("settings.upcoming_contest_alerts")}
          right={
            <ToggleRight
              theme={theme}
              value={toggles.contest}
              onChange={set("contest")}
            />
          }
        />
      </Card>

      {/* Quiz preferences */}
      <SectionLabel theme={theme} text={t("settings.quiz_preferences")} />
      <Card theme={theme}>
        <Row
          theme={theme}
          icon="tune-vertical"
          iconBg={theme.color.warning + "22"}
          iconColor={theme.color.warning}
          title={t("settings.default_difficulty")}
          subtitle={t("settings.intermediate")}
        />
        <Divider theme={theme} />
        <Row
          theme={theme}
          icon="volume-high"
          iconBg={theme.color.accent + "22"}
          iconColor={theme.color.accent}
          title={t("settings.timer_sounds")}
          right={
            <ToggleRight
              theme={theme}
              value={toggles.timerSound}
              onChange={set("timerSound")}
            />
          }
        />
        <Divider theme={theme} />
        <Row
          theme={theme}
          icon="clock-outline"
          iconBg={theme.color.error + "22"}
          iconColor={theme.color.error}
          title="Auto-Submit on Expiry"
          right={
            <ToggleRight
              theme={theme}
              value={toggles.autoSubmit}
              onChange={set("autoSubmit")}
            />
          }
        />
      </Card>

      {/* Appearance */}
      <SectionLabel theme={theme} text="APPEARANCE" />
      <Card theme={theme}>
        <Row
          theme={theme}
          icon="moon-outline"
          iconLib={Ionicons}
          iconBg={theme.color.accent + "22"}
          iconColor={theme.color.accent}
          title={t("settings.dark_mode")}
          subtitle={
            theme.isDark
              ? t("settings.dark_theme_active")
              : t("settings.dark_theme_off")
          }
          right={
            <ToggleRight
              theme={theme}
              value={theme.isDark}
              onChange={toggleTheme}
            />
          }
        />
        <Divider theme={theme} />
        <Row
          theme={theme}
          icon="web"
          iconBg={theme.color.success + "22"}
          iconColor={theme.color.success}
          title={t("settings.language")}
          subtitle="English"
        />
      </Card>

      <View
        style={{ paddingHorizontal: theme.space.sm, marginTop: theme.space.sm }}
      >
        <PremiumUpsellCardFull />
      </View>

      {/* Help & Support */}
      <SectionLabel theme={theme} text="Help and Support" />
      <Card theme={theme}>
        <Row
          theme={theme}
          icon="help-circle-outline"
          iconBg="#5B9CF61A"
          iconColor="#5B9CF6"
          title={t("settings.help_center")}
        />
        <Divider theme={theme} />
        <Row
          theme={theme}
          icon="message-outline"
          iconBg="#5B9CF61A"
          iconColor={theme.color.accent}
          title={t("settings.contact_support")}
        />
        <Divider theme={theme} />
        <Row
          theme={theme}
          icon="star-outline"
          iconBg={theme.color.warning + "22"}
          iconColor={theme.color.warning}
          title={t("settings.rate_medquel")}
        />
        <Divider theme={theme} />
        <Row
          theme={theme}
          icon="file-document-outline"
          iconBg={theme.color.surface}
          iconColor={theme.color.textMuted}
          title={t("settings.privacy_policy")}
        />
      </Card>

      {/* Danger zone */}
      <Card theme={theme}>
        <Row
          theme={theme}
          icon="logout"
          iconBg={theme.color.error + "22"}
          iconColor={theme.color.error}
          title={t("settings.sign_out")}
          titleColor={theme.color.error}
        />
        <Divider theme={theme} />
        <Row
          theme={theme}
          icon="trash-can-outline"
          iconBg={theme.color.error + "22"}
          iconColor={theme.color.error}
          title={t("settings.delete_account")}
          titleColor={theme.color.error}
        />
      </Card>
    </ScrollView>
  );
}
