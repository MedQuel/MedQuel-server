import { useState, useEffect, useMemo, ReactNode } from "react";
import { useRouter } from "expo-router";
import {
  Modal,
  Pressable,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { sendPasswordReset, signOut } from "../../common/firebase/firebase";
import { useBottomBar } from "../../common/context/useBottomBar";
import { userApi } from "@/common/api/api";
import { useTheme } from "../../theme/ThemeContext";
import { Loading } from "../../components/common/loading";
import { UserProfileCard } from "../../components/UserProfileCard";
import { ToggleSwitch } from "../../components/common/ToggleSwitch";
import { PremiumUpsellCardFull } from "../../components/PremiumUpsellCardFull";
import { Difficulty, QuizPrefs, NotifPrefs } from "@/common/types/types";

// --- Types ---

interface ComponentThemeProps {
  theme: any;
}

interface SectionLabelProps extends ComponentThemeProps {
  text: string;
}

interface CardProps extends ComponentThemeProps {
  children: ReactNode;
}

interface RowProps extends ComponentThemeProps {
  icon: string;
  iconLib?: any;
  iconBg?: string;
  iconColor: string;
  title: string;
  titleColor?: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode;
}

interface ToggleRightProps extends ComponentThemeProps {
  value: boolean;
  onChange: (val: boolean) => void;
}

interface UpdateButtonProps extends ComponentThemeProps {
  visible: boolean;
  onPress: () => void;
  saving: boolean;
}

// --- Sub-Components ---

function SectionLabel({ text, theme }: SectionLabelProps) {
  return (
    <Text
      style={{
        color: theme.color.textMuted,
        fontSize: theme.fontSize.md,
        fontFamily: theme.fontFamily.bold,
        marginTop: theme.space.sm * 1.25,
      }}
    >
      {text}
    </Text>
  );
}

function Card({ theme, children }: CardProps) {
  return (
    <View style={{ justifyContent: "center", paddingVertical: theme.space.sm }}>
      <View
        style={{
          overflow: "hidden",
          paddingVertical: theme.space.xs,
          paddingHorizontal: theme.space.xs,
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.color.card,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Divider({ theme }: ComponentThemeProps) {
  return (
    <View
      style={{
        height: 0.6,
        marginVertical: theme.space.xs,
        backgroundColor: theme.color.border,
      }}
    />
  );
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
}: RowProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: theme.space.sm,
        paddingHorizontal: theme.space.sm,
      }}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: theme.space.sm,
          borderRadius: theme.borderRadius.md,
          backgroundColor: iconBg ?? theme.color.surface,
        }}
      >
        <IconLib name={icon} size={theme.space.md * 1.25} color={iconColor} />
      </View>

      <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
        <Text
          style={{
            color: titleColor ?? theme.color.textPrimary,
            fontSize: theme.fontSize.sm + 1,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.light,
              paddingTop: theme.space.xs * 0.75,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {right ?? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={theme.space.lg}
          color={theme.color.textMuted}
        />
      )}
    </TouchableOpacity>
  );
}

function ToggleRight({ theme, value, onChange }: ToggleRightProps) {
  return (
    <View style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}>
      <ToggleSwitch
        isOn={value}
        size="medium"
        onColor="#3B82F6"
        offColor={
          theme.isDark ? theme.color.border : theme.color.textMuted + "55"
        }
        onToggle={onChange}
      />
    </View>
  );
}

function UpdateButton({ theme, visible, onPress, saving }: UpdateButtonProps) {
  if (!visible) return null;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={saving}
      onPress={onPress}
      style={{
        marginTop: theme.space.xs,
        marginHorizontal: theme.space.sm,
        marginBottom: theme.space.sm,
        paddingVertical: theme.space.sm * 0.85,
        borderRadius: theme.borderRadius.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.color.premium,
        opacity: saving ? 0.6 : 1,
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: theme.fontSize.sm + 1,
          fontFamily: theme.fontFamily.bold,
        }}
      >
        {saving
          ? theme.i18n.t("profile.settings.actions.updating")
          : theme.i18n.t("profile.settings.actions.update")}
      </Text>
    </TouchableOpacity>
  );
}

// --- Constants ---

const DIFFICULTY_OPTIONS: Difficulty[] = ["easy", "medium", "hard"];

const DEFAULT_NOTIF_TOGGLES = {
  rank: false,
  push: false,
  email: false,
  contest: false,
  achievement: false,
};

const DEFAULT_QUIZ_TOGGLES: QuizPrefs = {
  defaultDifficulty: "medium",
  timerSound: false,
  autoSubmit: false,
};

// --- Main Screen ---

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useBottomBar(false, "profile");

  const DIFFICULTY_TRANSLATION_KEYS: Record<Difficulty, string> = useMemo(
    () => ({
      easy: "common.easy",
      medium: "common.medium",
      hard: "common.hard",
    }),
    []
  );

  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Notification states
  const [notifToggles, setNotifToggles] = useState(DEFAULT_NOTIF_TOGGLES);
  const [savedNotifToggles, setSavedNotifToggles] = useState(DEFAULT_NOTIF_TOGGLES);
  const [savingNotif, setSavingNotif] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);

  // Quiz states
  const [quizToggles, setQuizToggles] = useState<QuizPrefs>(DEFAULT_QUIZ_TOGGLES);
  const [savedQuizToggles, setSavedQuizToggles] = useState<QuizPrefs>(DEFAULT_QUIZ_TOGGLES);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Modal visibility states
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [difficultyModalVisible, setDifficultyModalVisible] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const isNotifDirty =
    JSON.stringify(notifToggles) !== JSON.stringify(savedNotifToggles);
  const isQuizDirty =
    JSON.stringify(quizToggles) !== JSON.stringify(savedQuizToggles);

  const setNotif = (key: string) => (val: boolean) =>
    setNotifToggles((t) => ({ ...t, [key]: val }));

  const setQuiz = (key: string) => (val: boolean) =>
    setQuizToggles((t) => ({ ...t, [key]: val }));

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userApi.getMe();
        setUserData(data);

        const loadedNotif = {
          push: data?.notifPrefs?.pushEnabled ?? DEFAULT_NOTIF_TOGGLES.push,
          email: data?.notifPrefs?.emailDigest ?? DEFAULT_NOTIF_TOGGLES.email,
          rank: data?.notifPrefs?.rankAlerts ?? DEFAULT_NOTIF_TOGGLES.rank,
          contest: data?.notifPrefs?.contestReminders ?? DEFAULT_NOTIF_TOGGLES.contest,
          achievement: data?.notifPrefs?.achievementAlerts ?? DEFAULT_NOTIF_TOGGLES.achievement,
        };

        const loadedQuiz: QuizPrefs = {
          defaultDifficulty: data?.quizPrefs?.defaultDifficulty ?? DEFAULT_QUIZ_TOGGLES.defaultDifficulty,
          timerSound: data?.quizPrefs?.timerSound ?? DEFAULT_QUIZ_TOGGLES.timerSound,
          autoSubmit: data?.quizPrefs?.autoSubmit ?? DEFAULT_QUIZ_TOGGLES.autoSubmit,
        };

        setNotifToggles(loadedNotif);
        setSavedNotifToggles(loadedNotif);
        setQuizToggles(loadedQuiz);
        setSavedQuizToggles(loadedQuiz);
      } catch {
        setError(theme.i18n.t("profile.settings.errors.load"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const countDays = (iso: string) => {
    const now = new Date();
    const past = new Date(iso);
    const diffTime = Math.abs(now.getTime() - past.getTime());
    return theme.i18n.t("profile.settings.account.days", {
      count: Math.floor(diffTime / (1000 * 60 * 60 * 24)),
    });
  };

  const handleSaveNotif = async () => {
    try {
      setSavingNotif(true);
      setNotifError(null);
      const payload: NotifPrefs = {
        pushEnabled: notifToggles.push,
        emailDigest: notifToggles.email,
        rankAlerts: notifToggles.rank,
        contestReminders: notifToggles.contest,
        achievementAlerts: notifToggles.achievement,
      };

      await userApi.updateNotifPrefs(payload);
      setSavedNotifToggles(notifToggles);
    } catch {
      setNotifError(theme.i18n.t("profile.settings.errors.saveNotifications"));
    } finally {
      setSavingNotif(false);
    }
  };

  const handleConfirmChangePassword = async () => {
    setChangePasswordModalVisible(false);
    if (!userData?.email) return;

    try {
      setResettingPassword(true);
      await sendPasswordReset(userData.email);
    } catch (err) {
      console.error(err);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleConfirmSignOut = () => {
    setSignOutModalVisible(false);
    signOut();
  };

  const handleSaveQuiz = async () => {
    try {
      setSavingQuiz(true);
      setQuizError(null);
      await userApi.updateQuizPrefs(quizToggles);
      setSavedQuizToggles(quizToggles);
    } catch {
      setQuizError(theme.i18n.t("profile.settings.errors.saveQuizPreferences"));
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleSelectDifficulty = (value: Difficulty) => {
    setQuizToggles((t) => ({ ...t, defaultDifficulty: value }));
    setDifficultyModalVisible(false);
  };

  if (loading || error) {
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
        {loading ? <Loading /> : <Text style={{ color: theme.color.textPrimary }}>{error}</Text>}
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: theme.space.md,
        backgroundColor: theme.color.background,
      }}
    >
      {/* Header */}
      <View
        style={{
          gap: theme.space.sm,
          flexDirection: "row",
          alignItems: "center",
          paddingTop: theme.space.lg,
          paddingBottom: theme.space.sm,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: theme.space.xs * 1.75,
            borderWidth: 1,
            backgroundColor: theme.color.card,
            borderRadius: theme.borderRadius.lg,
            borderColor: theme.color.border,
          }}
        >
          <Feather
            name="chevron-left"
            size={theme.fontSize.xl}
            color={theme.color.textPrimary}
          />
        </TouchableOpacity>

        <View style={{ flexDirection: "column", gap: theme.space.xs * 0.5 }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg * 1.1,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t("profile.settings.title")}
          </Text>
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm * 1.05,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {theme.i18n.t("profile.settings.subtitle")}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          marginTop: theme.space.sm,
          paddingBottom: theme.space.md - 2,
        }}
      >
        <UserProfileCard userData={userData} />

        {/* Account Section */}
        <SectionLabel
          theme={theme}
          text={theme.i18n.t("profile.settings.section.account")}
        />
        <Card theme={theme}>
          <Row
            theme={theme}
            right={<View />}
            icon="email-outline"
            iconBg="#5B9CF61A"
            iconColor="#5B9CF6"
            title={theme.i18n.t("profile.settings.account.email")}
            subtitle={userData?.email ?? theme.i18n.t("common.notSpecified")}
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            right={<View />}
            icon="lock-outline"
            iconBg="#5B9CF61A"
            iconColor="#5B9CF6"
            title={theme.i18n.t("profile.settings.account.changePassword")}
            subtitle={
              resettingPassword
                ? theme.i18n.t("profile.settings.account.sendingResetLink")
                : userData?.updatedAt
                ? theme.i18n.t("profile.settings.account.lastChanged", {
                    date: countDays(userData.updatedAt),
                  })
                : theme.i18n.t("profile.settings.account.changePasswordSubtitle")
            }
            onPress={() => setChangePasswordModalVisible(true)}
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            right={<View />}
            icon="school-outline"
            iconBg="#F6A0201A"
            iconColor="#F6A020"
            title={theme.i18n.t("profile.settings.account.goal")}
            subtitle={userData?.targetExam ?? theme.i18n.t("common.notSpecified")}
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            right={<View />}
            icon="book-open-outline"
            iconBg="#22C55E1A"
            iconColor="#22C55E"
            title={theme.i18n.t("profile.settings.account.studyLevel")}
            subtitle={userData?.studyLevel ?? theme.i18n.t("common.notSpecified")}
          />
        </Card>

        {/* Update Profile CTA */}
        <View
          style={{
            marginTop: theme.space.xs,
            borderRadius: theme.borderRadius.xl,
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={
              theme.isDark
                ? ["#05173d", "#071d4d", "#08205a"]
                : ["#2762f7", "#1a56f0", "#0f49db"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderWidth: 1.5,
              borderColor: theme.isDark
                ? theme.color.border
                : "rgba(37,99,235,0.15)",
              borderRadius: theme.borderRadius.xl,
            }}
          >
            <Row
              theme={theme}
              onPress={() => router.push("/profile/updateProfile")}
              right={<View />}
              icon="account-edit-outline"
              iconBg="rgba(255,255,255,0.15)"
              iconColor={
                theme.isDark ? theme.color.info : theme.color.textInverse
              }
              // Localized title here:
              title={theme.i18n.t("profile.settings.account.UpdateProfile")}
              titleColor={
                theme.isDark ? theme.color.textPrimary : theme.color.textInverse
              }
            />
          </LinearGradient>
        </View>

        {/* Notifications Section */}
        <SectionLabel
          theme={theme}
          text={theme.i18n.t("profile.settings.section.notifications")}
        />
        <Card theme={theme}>
          <Row
            theme={theme}
            icon="bell-outline"
            iconBg="#5B9CF61A"
            iconColor="#5B9CF6"
            title={theme.i18n.t("profile.settings.notifications.pushNotifications")}
            subtitle={theme.i18n.t("profile.settings.notifications.pushNotificationsSubtitle")}
            right={
              <ToggleRight
                theme={theme}
                value={notifToggles.push}
                onChange={setNotif("push")}
              />
            }
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon="email-outline"
            iconBg="#5B9CF61A"
            iconColor="#5B9CF6"
            title={theme.i18n.t("profile.settings.notifications.emailDigest")}
            subtitle={theme.i18n.t("profile.settings.notifications.emailDigestSubtitle")}
            right={
              <ToggleRight
                theme={theme}
                value={notifToggles.email}
                onChange={setNotif("email")}
              />
            }
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon="chart-bar"
            iconBg="#F6A0201A"
            iconColor="#F6A020"
            title={theme.i18n.t("profile.settings.notifications.rankChangeAlerts")}
            subtitle={theme.i18n.t("profile.settings.notifications.rankChangeAlertsSubtitle")}
            right={
              <ToggleRight
                theme={theme}
                value={notifToggles.rank}
                onChange={setNotif("rank")}
              />
            }
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon="medal-outline"
            iconBg="#22C55E1A"
            iconColor="#22C55E"
            title={theme.i18n.t("profile.settings.notifications.achievementAlerts")}
            subtitle={theme.i18n.t("profile.settings.notifications.achievementAlertsSubtitle")}
            right={
              <ToggleRight
                theme={theme}
                value={notifToggles.achievement}
                onChange={setNotif("achievement")}
              />
            }
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon="trophy-outline"
            iconBg={theme.color.error + "1A"}
            iconColor={theme.color.error}
            title={theme.i18n.t("profile.settings.notifications.contestReminders")}
            subtitle={theme.i18n.t("profile.settings.notifications.contestRemindersSubtitle")}
            right={
              <ToggleRight
                theme={theme}
                value={notifToggles.contest}
                onChange={setNotif("contest")}
              />
            }
          />

          {!!notifError && (
            <Text
              style={{
                color: theme.color.error,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                paddingHorizontal: theme.space.sm,
                paddingTop: theme.space.xs,
              }}
            >
              {notifError}
            </Text>
          )}
          <UpdateButton
            theme={theme}
            visible={isNotifDirty}
            saving={savingNotif}
            onPress={handleSaveNotif}
          />
        </Card>

        {/* Quiz Preferences Section */}
        <SectionLabel
          theme={theme}
          text={theme.i18n.t("profile.settings.section.quizPreferences")}
        />
        <Card theme={theme}>
          <Row
            theme={theme}
            icon="tune-vertical"
            iconBg={theme.color.warning + "22"}
            iconColor={theme.color.warning}
            title={theme.i18n.t("profile.settings.quizPreferences.defaultDifficulty")}
            subtitle={theme.i18n.t(DIFFICULTY_TRANSLATION_KEYS[quizToggles.defaultDifficulty])}
            onPress={() => setDifficultyModalVisible(true)}
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon="volume-high"
            iconBg={theme.color.accent + "22"}
            iconColor={theme.color.accent}
            title={theme.i18n.t("profile.settings.quizPreferences.timerSound")}
            right={
              <ToggleRight
                theme={theme}
                value={quizToggles.timerSound}
                onChange={setQuiz("timerSound")}
              />
            }
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon="clock-outline"
            iconBg={theme.color.error + "22"}
            iconColor={theme.color.error}
            title={theme.i18n.t("profile.settings.quizPreferences.autoSubmit")}
            right={
              <ToggleRight
                theme={theme}
                value={quizToggles.autoSubmit}
                onChange={setQuiz("autoSubmit")}
              />
            }
          />

          {!!quizError && (
            <Text
              style={{
                color: theme.color.error,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                paddingHorizontal: theme.space.sm,
                paddingTop: theme.space.xs,
              }}
            >
              {quizError}
            </Text>
          )}
          <UpdateButton
            theme={theme}
            visible={isQuizDirty}
            saving={savingQuiz}
            onPress={handleSaveQuiz}
          />
        </Card>

        {/* Appearance Section */}
        <SectionLabel
          theme={theme}
          text={theme.i18n.t("profile.settings.section.appearance")}
        />
        <Card theme={theme}>
          <Row
            theme={theme}
            icon="moon-outline"
            iconLib={Ionicons}
            iconBg={theme.color.accent + "22"}
            iconColor={theme.color.accent}
            title={
              theme.isDark
                ? theme.i18n.t("profile.settings.appearance.darkMode")
                : theme.i18n.t("profile.settings.appearance.lightMode")
            }
            subtitle={
              theme.isDark
                ? theme.i18n.t("profile.settings.appearance.darkModeSubtitle")
                : theme.i18n.t("profile.settings.appearance.lightModeSubtitle")
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
            title={theme.i18n.t("profile.settings.appearance.language")}
            subtitle={theme.i18n.t("profile.settings.appearance.currentLanguage")}
          />
        </Card>

        <View style={{ marginTop: theme.space.sm }}>
          <PremiumUpsellCardFull />
        </View>

        {/* Help & Support Section */}
        <SectionLabel
          theme={theme}
          text={theme.i18n.t("profile.settings.section.helpAndSupport")}
        />
        <Card theme={theme}>
          <Row
            theme={theme}
            icon="help-circle-outline"
            iconBg="#5B9CF61A"
            iconColor="#5B9CF6"
            title={theme.i18n.t("profile.settings.helpAndSupport.helpCenter")}
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon="message-outline"
            iconBg="#5B9CF61A"
            iconColor={theme.color.accent}
            title={theme.i18n.t("profile.settings.helpAndSupport.contactSupport")}
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon="star-outline"
            iconBg={theme.color.warning + "22"}
            iconColor={theme.color.warning}
            title={theme.i18n.t("profile.settings.helpAndSupport.RateApp")}
          />
          <Divider theme={theme} />
          <Row
            theme={theme}
            icon="file-document-outline"
            iconBg={theme.color.surface}
            iconColor={theme.color.textMuted}
            title={theme.i18n.t("profile.settings.helpAndSupport.privacyPolicy")}
          />
        </Card>

        {/* Sign Out Card */}
        <Card theme={theme}>
          <Row
            onPress={() => setSignOutModalVisible(true)}
            theme={theme}
            icon="logout"
            iconBg={theme.color.error + "22"}
            iconColor={theme.color.error}
            title={theme.i18n.t("profile.settings.signOut")}
            titleColor={theme.color.error}
          />
        </Card>
      </ScrollView>

      {/* --- Modals --- */}

      {/* Change Password Modal */}
      <Modal
        visible={changePasswordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <Pressable
          style={modalStyles.overlay}
          onPress={() => setChangePasswordModalVisible(false)}
        >
          <View style={[modalStyles.sheet, { backgroundColor: theme.color.background }]}>
            <Text
              style={{
                fontSize: theme.fontSize.md,
                fontFamily: theme.fontFamily.bold,
                color: theme.color.textPrimary,
                marginBottom: theme.space.xs,
                paddingHorizontal: 12,
              }}
            >
              {theme.i18n.t("profile.settings.account.changePassword")}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.color.textMuted,
                fontFamily: theme.fontFamily.regular,
                marginBottom: theme.space.sm,
                paddingHorizontal: 12,
              }}
            >
              {theme.i18n.t("profile.settings.account.resetPasswordDescription", {
                email: userData?.email ?? "",
              })}
            </Text>

            <Pressable style={modalStyles.option} onPress={handleConfirmChangePassword}>
              <Text
                style={{
                  color: theme.color.info ?? "#5B9CF6",
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {theme.i18n.t("common.continue")}
              </Text>
            </Pressable>

            <Pressable
              style={modalStyles.option}
              onPress={() => setChangePasswordModalVisible(false)}
            >
              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t("common.cancel")}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Difficulty Selection Modal */}
      <Modal
        visible={difficultyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDifficultyModalVisible(false)}
      >
        <Pressable
          style={modalStyles.overlay}
          onPress={() => setDifficultyModalVisible(false)}
        >
          <View style={[modalStyles.sheet, { backgroundColor: theme.color.background }]}>
            {DIFFICULTY_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={[
                  modalStyles.option,
                  quizToggles.defaultDifficulty === option && {
                    backgroundColor: theme.color.warning + "22",
                  },
                ]}
                onPress={() => handleSelectDifficulty(option)}
              >
                <Text
                  style={{
                    color:
                      quizToggles.defaultDifficulty === option
                        ? theme.color.warning
                        : theme.color.textPrimary,
                    fontWeight:
                      quizToggles.defaultDifficulty === option ? "600" : "400",
                  }}
                >
                  {theme.i18n.t(DIFFICULTY_TRANSLATION_KEYS[option])}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Sign Out Modal */}
      <Modal
        visible={signOutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSignOutModalVisible(false)}
      >
        <Pressable
          style={modalStyles.overlay}
          onPress={() => setSignOutModalVisible(false)}
        >
          <View style={[modalStyles.sheet, { backgroundColor: theme.color.background }]}>
            <Text
              style={{
                fontSize: theme.fontSize.md,
                fontFamily: theme.fontFamily.bold,
                color: theme.color.textPrimary,
                marginBottom: theme.space.xs,
                paddingHorizontal: 12,
              }}
            >
              {theme.i18n.t("profile.settings.signOutConfirmTitle")}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.color.textMuted,
                fontFamily: theme.fontFamily.regular,
                marginBottom: theme.space.sm,
                paddingHorizontal: 12,
              }}
            >
              {theme.i18n.t("profile.settings.signOutConfirmDescription")}
            </Text>
            <Pressable style={modalStyles.option} onPress={handleConfirmSignOut}>
              <Text
                style={{
                  color: theme.color.error,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {theme.i18n.t("profile.settings.confirmSignOut")}
              </Text>
            </Pressable>

            <Pressable
              style={modalStyles.option}
              onPress={() => setSignOutModalVisible(false)}
            >
              <Text
                style={{
                  color: theme.color.textPrimary,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {theme.i18n.t("common.cancel")}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
});