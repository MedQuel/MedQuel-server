import { useState } from "react";
import { useRouter } from "expo-router";
// import ToggleSwitch from "toggle-switch-react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";

import { useTheme } from "../../theme/ThemeContext";
import { UserProfileCard } from "../../components/UserProfileCard";
import { PremiumUpsellCardFull } from "../../components/PremiumUpsellCardFull";

export default function SettingsScreen() {
  const [rankEnabled, setRankEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [contestEnabled, setContestEnabled] = useState(true);
  const [achievementEnabled, setAchievementEnabled] = useState(false);
  const [timerSoundEnabled, setTimerSoundEnabled] = useState(true);
  const [autoSubmitEnabled, setAutoSubmitEnabled] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { isDark } = theme;

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isDark
          ? theme.color.background
          : theme.color.background,
      }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 70 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: theme.space.sm,
          paddingVertical: theme.space.xs + 2,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("../profile")}
          style={{
            backgroundColor: isDark
              ? theme.color.card
              : theme.color.card + "FF",
            borderRadius: theme.borderRadius.lg - 3,
            borderWidth: 1,
            borderColor: theme.color.border,
            padding: theme.space.xs + 3,
            justifyContent: "center",
            alignItems: "center",
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
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.bold,
              letterSpacing: 0.3,
            }}
          >
            {theme.i18n.t("common.settings")}
          </Text>
          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.xs,
              fontWeight: theme.fontWeight.regular,
              paddingTop: 2,
              letterSpacing: 0.1,
            }}
          >
            {theme.i18n.t("common.account_preferences")}
          </Text>
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: theme.space.sm + 4,
          marginTop: theme.space.sm + 2,
        }}
      >
        <UserProfileCard
          lv={23}
          day={5}
          icoName="J"
          name="Jatinveer singh chauhan"
          email="jatinveerchauhan@gmail.com"
        ></UserProfileCard>
      </View>
      <Text
        style={{
          marginTop: theme.space.sm + 14,
          paddingHorizontal: theme.space.sm + 4,
          color: theme.color.textMuted,
          fontSize: theme.fontSize.sm - 2,
          fontWeight: theme.fontWeight.medium,
        }}
      >
        {theme.i18n.t("common.account")}
      </Text>

      {/* Account component start  */}

      <View
        style={{
          paddingHorizontal: theme.space.xs + 1,
        }}
      >
        <View
          style={{
            backgroundColor: isDark
              ? theme.color.background
              : theme.color.background,
            justifyContent: "center",
            padding: theme.space.sm,
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? theme.color.card : theme.color.card,
              borderRadius: theme.borderRadius.lg,
              borderWidth: 1,
              borderColor: theme.color.border,
              overflow: "hidden",
              paddingVertical: theme.space.sm,
            }}
          >
            {/* Email */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.xs,
              }}
            >
              <View
                style={{
                  padding: theme.space.xs + 2,
                  borderRadius: theme.borderRadius.md - 2,
                  backgroundColor: isDark ? "#1A2744" : theme.color.surface,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="email-outline"
                  size={theme.space.md - 1}
                  color="#5B9CF6"
                />
              </View>
              <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                <Text
                  style={{
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.xs + 1,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {theme.i18n.t("common.email_address")}
                </Text>
                <Text
                  style={{
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.xs - 1,
                    paddingTop: 3,
                    paddingBottom: 3,
                  }}
                >
                  dr.Jatinveer@example.com
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={theme.space.md}
                color={theme.color.textMuted}
              />
            </TouchableOpacity>

            <View
              style={{ height: 0.6, backgroundColor: theme.color.border }}
            />

            {/* Change Password */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.sm,
              }}
            >
              <View
                style={{
                  paddingHorizontal: theme.space.sm - 2,
                  paddingVertical: theme.space.sm - 2,
                  borderRadius: theme.borderRadius.md - 2,
                  backgroundColor: isDark ? "#1A2744" : theme.color.surface,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={theme.space.md}
                  color="#5B9CF6"
                />
              </View>
              <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                <Text
                  style={{
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.xs + 1,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {theme.i18n.t("profile.change_password")}
                </Text>
                <Text
                  style={{
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.xs - 1,
                    paddingTop: 2,
                  }}
                >
                  Last changed 30 days ago
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={theme.space.md}
                color="#4A5568"
              />
            </TouchableOpacity>

            <View
              style={{ height: 0.6, backgroundColor: theme.color.border }}
            />

            {/* Target Exam */}

            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.xs + 2,
              }}
            >
              <View
                style={{
                  paddingHorizontal: theme.space.sm,
                  paddingVertical: theme.space.sm,
                  borderRadius: theme.borderRadius.md - 2,
                  backgroundColor: isDark
                    ? "#2A1F0A" + 90
                    : theme.color.surface,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="school-outline"
                  size={theme.space.md}
                  color="#F6A020"
                />
              </View>
              <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                <Text
                  style={{
                    textTransform: "capitalize",
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.xs + 1,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {theme.i18n.t("profile.target_exam")}
                </Text>
                <Text
                  style={{
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.xs - 1,
                    paddingTop: 2,
                  }}
                >
                  USMLE Step 1
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={theme.space.md}
                color={theme.color.textMuted}
              />
            </TouchableOpacity>

            <View
              style={{ height: 0.6, backgroundColor: theme.color.border }}
            />

            {/* Study Level */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.sm,
              }}
            >
              <View
                style={{
                  paddingHorizontal: theme.space.sm,
                  paddingVertical: theme.space.sm,
                  borderRadius: theme.borderRadius.md - 2,
                  backgroundColor: isDark
                    ? "#0A2A14" + 90
                    : theme.color.surface,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="book-open-outline"
                  size={theme.space.md}
                  color="#22C55E"
                />
              </View>
              <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                <Text
                  style={{
                    textTransform: "capitalize",
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.xs + 1,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {theme.i18n.t("common.study_level")}
                </Text>
                <Text
                  style={{
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.xs - 1,
                    // paddingBottom: 0,
                    paddingTop: 3,
                  }}
                >
                  MBBS Final Year
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={theme.space.md}
                color={theme.color.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text
          style={{
            marginTop: theme.space.sm + 4,
            paddingHorizontal: theme.space.sm + 4,
            color: theme.color.textMuted,
            fontSize: theme.fontSize.sm - 2,
            fontWeight: theme.fontWeight.medium,
          }}
        >
          NOTIFICATIONS
        </Text>
        <View
          style={{
            backgroundColor: isDark
              ? theme.color.background
              : theme.color.background,
            justifyContent: "center",
            padding: theme.space.sm,
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? theme.color.card : theme.color.card,
              borderRadius: theme.borderRadius.lg,
              borderWidth: 1,
              borderColor: theme.color.border,
              overflow: "hidden",
              paddingVertical: theme.space.sm,
            }}
          >
            {/* Push Notifications */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.xs,
              }}
            >
              <View
                style={{
                  padding: theme.space.xs + 2,
                  borderRadius: theme.borderRadius.md - 2,
                  backgroundColor: isDark ? "#1A2744" : theme.color.surface,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={theme.space.md - 1}
                  color="#5B9CF6"
                />
              </View>
              <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                <Text
                  style={{
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.xs + 1,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {theme.i18n.t("settings.push_notifications")}
                </Text>
                <Text
                  style={{
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.xs - 1,
                    paddingTop: 3,
                    paddingBottom: 3,
                  }}
                >
                  {theme.i18n.t("settings.daily_reminders")}
                </Text>
              </View>
              <View
                style={{
                  transform: [{ scaleX: 0.8 }, { scaleY: 0.85 }],
                }}
              >
                {/* <ToggleSwitch
                  isOn={pushEnabled}
                  onColor="#3B82F6"
                  offColor={
                    isDark ? theme.color.border : theme.color.textMuted + 55
                  }
                  size="medium"
                  onToggle={setPushEnabled}
                /> */}
              </View>
            </TouchableOpacity>

            <View
              style={{ height: 0.6, backgroundColor: theme.color.border }}
            />

            {/* Email Digest */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.sm,
              }}
            >
              <View
                style={{
                  paddingHorizontal: theme.space.sm - 2,
                  paddingVertical: theme.space.sm - 2,
                  borderRadius: theme.borderRadius.md - 2,
                  backgroundColor: isDark ? "#1A2744" : theme.color.surface,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="email-outline"
                  size={theme.space.md}
                  color="#5B9CF6"
                />
              </View>
              <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                <Text
                  style={{
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.xs + 1,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {theme.i18n.t("settings.email_digest")}
                </Text>
                <Text
                  style={{
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.xs - 1,
                    paddingTop: 2,
                  }}
                >
                  {theme.i18n.t("settings.weekly_performance_summary")}
                </Text>
              </View>
              <View
                style={{
                  transform: [{ scaleX: 0.8 }, { scaleY: 0.85 }],
                }}
              >
                {/* <ToggleSwitch
                  isOn={emailEnabled}
                  onToggle={setEmailEnabled}
                  onColor="#3B82F6"
                  offColor={
                    isDark ? theme.color.border : theme.color.textMuted + 55
                  }
                  size="medium"
                /> */}
              </View>
            </TouchableOpacity>

            <View
              style={{ height: 0.6, backgroundColor: theme.color.border }}
            />

            {/* Rank Change Alerts */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.xs + 2,
              }}
            >
              <View
                style={{
                  paddingHorizontal: theme.space.sm,
                  paddingVertical: theme.space.sm,
                  borderRadius: theme.borderRadius.md - 2,
                  backgroundColor: isDark
                    ? "#2A1F0A" + 90
                    : theme.color.surface,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="chart-bar"
                  size={theme.space.md}
                  color="#F6A020"
                />
              </View>
              <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                <Text
                  style={{
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.xs + 1,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {theme.i18n.t("settings.rank_change_alerts")}
                </Text>
                <Text
                  style={{
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.xs - 1,
                    paddingTop: 2,
                  }}
                >
                  {theme.i18n.t("settings.notify_on_leaderboard_moves")}
                </Text>
              </View>
              <View
                style={{
                  transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
                }}
              >
                {/* <ToggleSwitch
                  isOn={rankEnabled}
                  onToggle={setRankEnabled}
                  onColor="#3B82F6"
                  offColor={
                    isDark ? theme.color.border : theme.color.textMuted + 55
                  }
                  size="medium"
                  thumbOnStyle={{
                    backgroundColor: "#FFFFFF",
                  }}
                  thumbOffStyle={{
                    backgroundColor: "#FFFFFF",
                  }}
                /> */}
              </View>
            </TouchableOpacity>

            <View
              style={{ height: 0.6, backgroundColor: theme.color.border }}
            />

            {/* Achievement Alerts */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.sm,
              }}
            >
              <View
                style={{
                  paddingHorizontal: theme.space.sm,
                  paddingVertical: theme.space.sm,
                  borderRadius: theme.borderRadius.md - 2,
                  backgroundColor: isDark
                    ? "#0A2A14" + 90
                    : theme.color.surface,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="medal-outline"
                  size={theme.space.md}
                  color="#22C55E"
                />
              </View>
              <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                <Text
                  style={{
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.xs + 1,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {theme.i18n.t("settings.achievement_alerts")}
                </Text>
                <Text
                  style={{
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.xs - 1,
                    paddingTop: 3,
                  }}
                >
                  Badges & milestone unlocks
                </Text>
              </View>
              <View
                style={{
                  transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
                }}
              >
                {/* <ToggleSwitch
                  isOn={achievementEnabled}
                  onToggle={setAchievementEnabled}
                  onColor="#3B82F6"
                  offColor={
                    isDark ? theme.color.border : theme.color.textMuted + 55
                  }
                  size="medium"
                  thumbOnStyle={{
                    backgroundColor: isDark
                      ? theme.color.textPrimary
                      : theme.color.surface,
                  }}
                  thumbOffStyle={{
                    backgroundColor: isDark
                      ? theme.color.textPrimary
                      : theme.color.surface,
                  }}
                /> */}
              </View>
            </TouchableOpacity>

            <View
              style={{ height: 0.6, backgroundColor: theme.color.border }}
            />

            {/* Contest Reminders */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.sm,
              }}
            >
              <View
                style={{
                  paddingHorizontal: theme.space.sm,
                  paddingVertical: theme.space.sm,
                  borderRadius: theme.borderRadius.md - 2,
                  backgroundColor: isDark ? "#2A0A0A" : theme.color.surface,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="trophy-outline"
                  size={theme.space.md}
                  color={theme.color.error}
                />
              </View>
              <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                <Text
                  style={{
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.xs + 1,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {theme.i18n.t("settings.contest_reminders")}
                </Text>
                <Text
                  style={{
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.xs - 1,
                    paddingTop: 3,
                  }}
                >
                  {theme.i18n.t("settings.upcoming_contest_alerts")}
                </Text>
              </View>
              <View
                style={{
                  transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
                }}
              >
                {/* <ToggleSwitch
                  isOn={contestEnabled}
                  onToggle={setContestEnabled}
                  onColor="#3B82F6"
                  offColor={
                    isDark ? theme.color.border : theme.color.textMuted + 55
                  }
                  size="medium"
                  thumbOnStyle={{
                    backgroundColor: isDark
                      ? theme.color.textPrimary
                      : theme.color.surface,
                  }}
                  thumbOffStyle={{
                    backgroundColor: isDark
                      ? theme.color.textPrimary
                      : theme.color.surface,
                  }}
                /> */}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <Text
          style={{
            textTransform: "capitalize",
            color: theme.color.textMuted,
            fontSize: theme.fontSize.xs,
            fontWeight: theme.fontWeight.medium,
            paddingHorizontal: theme.space.md,
            paddingVertical: theme.space.sm - 2,
          }}
        >
          {theme.i18n.t("settings.quiz_preferences")}
        </Text>
        <View
          style={{
            paddingHorizontal: theme.space.xs - 5,
          }}
        >
          <View
            style={{
              justifyContent: "center",
              padding: theme.space.sm,
            }}
          >
            <View
              style={{
                backgroundColor: isDark ? theme.color.card : theme.color.card,
                borderRadius: theme.borderRadius.lg,
                borderWidth: 1,
                borderColor: theme.color.border,
                overflow: "hidden",
                paddingVertical: theme.space.sm,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: theme.space.sm,
                  paddingVertical: theme.space.xs,
                }}
              >
                <View
                  style={{
                    padding: theme.space.xs + 2,
                    borderRadius: theme.borderRadius.md - 2,
                    backgroundColor: isDark
                      ? theme.color.warning + 22
                      : theme.color.surface,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="tune-vertical"
                    size={theme.space.md - 1}
                    color={theme.color.warning}
                  />
                </View>
                <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                  <Text
                    style={{
                      color: theme.color.textPrimary,
                      fontSize: theme.fontSize.xs + 0.5,
                      fontWeight: theme.fontWeight.medium,
                    }}
                  >
                    {theme.i18n.t("settings.default_difficulty")}
                  </Text>
                  <Text
                    style={{
                      textTransform: "capitalize",
                      color: theme.color.textMuted,
                      fontSize: theme.fontSize.xs - 1,
                      paddingTop: 3,
                      paddingBottom: 3,
                    }}
                  >
                    {theme.i18n.t("settings.intermediate")}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={theme.space.md}
                  color={theme.color.textMuted}
                />
              </TouchableOpacity>

              <View
                style={{ height: 0.6, backgroundColor: theme.color.border }}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: theme.space.sm,
                  paddingVertical: theme.space.sm + 3,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: theme.space.sm - 2,
                    paddingVertical: theme.space.sm - 2,
                    borderRadius: theme.borderRadius.md - 2,
                    backgroundColor: isDark
                      ? theme.color.accent + 22
                      : theme.color.surface,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="volume-high"
                    size={theme.space.md}
                    color={theme.color.accent}
                  />
                </View>
                <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                  <Text
                    style={{
                      textTransform: "capitalize",
                      color: theme.color.textPrimary,
                      fontSize: theme.fontSize.xs + 1,
                      fontWeight: theme.fontWeight.medium,
                    }}
                  >
                    {theme.i18n.t("settings.timer_sounds")}
                  </Text>
                </View>
                <View
                  style={{
                    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
                  }}
                >
                  {/* <ToggleSwitch
                    isOn={timerSoundEnabled}
                    onToggle={setTimerSoundEnabled}
                    onColor={theme.color.accent}
                    offColor={
                      isDark ? theme.color.border : theme.color.textMuted + 55
                    }
                    size="medium"
                    thumbOnStyle={{
                      backgroundColor: isDark
                        ? theme.color.textPrimary
                        : theme.color.surface,
                    }}
                    thumbOffStyle={{
                      backgroundColor: isDark
                        ? theme.color.textPrimary
                        : theme.color.surface,
                    }}
                  /> */}
                </View>
              </TouchableOpacity>
              <View
                style={{ height: 0.6, backgroundColor: theme.color.border }}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: theme.space.sm,
                  paddingVertical: theme.space.sm - 1,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: theme.space.sm - 2,
                    paddingVertical: theme.space.sm - 2,
                    borderRadius: theme.borderRadius.md - 2,
                    backgroundColor: isDark
                      ? theme.color.error + 21
                      : theme.color.surface,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={theme.space.md}
                    color={theme.color.error}
                  />
                </View>
                <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                  <Text
                    style={{
                      color: theme.color.textPrimary,
                      fontSize: theme.fontSize.xs + 1,
                      fontWeight: theme.fontWeight.medium,
                    }}
                  >
                    Auto-Submit on Expiry
                  </Text>
                </View>
                <View
                  style={{
                    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
                  }}
                >
                  {/* <ToggleSwitch
                    isOn={autoSubmitEnabled}
                    onToggle={setAutoSubmitEnabled}
                    onColor={theme.color.accent}
                    offColor={
                      isDark ? theme.color.border : theme.color.textMuted + 55
                    }
                    size="medium"
                    thumbOnStyle={{
                      backgroundColor: isDark
                        ? theme.color.textPrimary
                        : theme.color.surface,
                    }}
                    thumbOffStyle={{
                      backgroundColor: isDark
                        ? theme.color.textPrimary
                        : theme.color.surface,
                    }}
                  /> */}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.xs,
            fontWeight: theme.fontWeight.medium,
            paddingHorizontal: theme.space.md,
            paddingVertical: theme.space.sm - 2,
          }}
        >
          APPEARANCE
        </Text>
        <View style={{ paddingHorizontal: theme.space.xs - 5 }}>
          <View
            style={{
              justifyContent: "center",
              padding: theme.space.sm,
            }}
          >
            <View
              style={{
                backgroundColor: isDark ? theme.color.card : theme.color.card,
                borderRadius: theme.borderRadius.lg,
                borderWidth: 1,
                borderColor: theme.color.border,
                overflow: "hidden",
              }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: theme.space.sm,
                  paddingVertical: theme.space.sm + 3,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: theme.space.sm - 2,
                    paddingVertical: theme.space.sm - 2,
                    borderRadius: theme.borderRadius.md - 2,
                    backgroundColor: isDark
                      ? theme.color.accent + 22
                      : theme.color.surface,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="moon-outline"
                    size={theme.space.md - 1}
                    color={theme.color.accent}
                  />
                </View>
                <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                  <Text
                    style={{
                      color: theme.color.textPrimary,
                      fontSize: theme.fontSize.xs + 1,
                      fontWeight: theme.fontWeight.medium,
                      textTransform: "capitalize",
                    }}
                  >
                    {theme.i18n.t("settings.dark_mode")}
                  </Text>
                  <Text
                    style={{
                      color: theme.color.textMuted,
                      fontSize: theme.fontSize.xs - 1,
                      paddingTop: 3,
                      paddingBottom: 3,
                    }}
                  >
                    {isDark
                      ? theme.i18n.t("settings.dark_theme_active")
                      : theme.i18n.t("settings.dark_theme_off")}
                  </Text>
                </View>
                <View
                  style={{
                    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
                  }}
                >
                  {/* <ToggleSwitch
                    isOn={isDark}
                    onToggle={toggleTheme}
                    onColor={theme.color.accent}
                    offColor={
                      isDark ? theme.color.border : theme.color.textMuted + 55
                    }
                    size="medium"
                    thumbOnStyle={{
                      backgroundColor: isDark
                        ? theme.color.textPrimary
                        : theme.color.surface,
                    }}
                    thumbOffStyle={{
                      backgroundColor: isDark
                        ? theme.color.textPrimary
                        : theme.color.surface,
                    }}
                  /> */}
                </View>
              </TouchableOpacity>
              <View
                style={{ height: 0.6, backgroundColor: theme.color.border }}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: theme.space.sm,
                  paddingVertical: theme.space.xs,
                }}
              >
                <View
                  style={{
                    padding: theme.space.xs + 2,
                    borderRadius: theme.borderRadius.md - 2,
                    backgroundColor: isDark
                      ? theme.color.success + 22
                      : theme.color.surface,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="web"
                    size={theme.space.md - 1}
                    color={theme.color.success}
                  />
                </View>
                <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                  <Text
                    style={{
                      textTransform: "capitalize",
                      color: theme.color.textPrimary,
                      fontSize: theme.fontSize.xs + 0.5,
                      fontWeight: theme.fontWeight.medium,
                    }}
                  >
                    {theme.i18n.t("settings.language")}
                  </Text>
                  <Text
                    style={{
                      color: theme.color.textMuted,
                      fontSize: theme.fontSize.xs - 1,
                      paddingTop: 3,
                      paddingBottom: 3,
                    }}
                  >
                    English
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={theme.space.md}
                  color={theme.color.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View
          style={{
            paddingHorizontal: theme.space.sm,
            marginTop: theme.space.sm,
          }}
        >
          <PremiumUpsellCardFull></PremiumUpsellCardFull>
        </View>
        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.xs,
            fontWeight: theme.fontWeight.medium,
            paddingHorizontal: theme.space.md,
            paddingVertical: theme.space.sm + 4,
          }}
        >
          Help and Support
        </Text>

        <View
          style={{
            backgroundColor: isDark
              ? theme.color.background
              : theme.color.background,
            justifyContent: "center",
            padding: theme.space.sm,
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? theme.color.card : theme.color.card,
              borderRadius: theme.borderRadius.lg,
              borderWidth: 1,
              borderColor: theme.color.border,
              overflow: "hidden",
              paddingVertical: theme.space.sm,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.sm,
              }}
            >
              <View
                style={{
                  padding: theme.space.xs + 2,
                  borderRadius: theme.borderRadius.md - 2,
                  backgroundColor: isDark ? "#1A2744" : theme.color.surface,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="help-circle-outline"
                  size={theme.space.md - 1}
                  color="#5B9CF6"
                />
              </View>
              <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                <Text
                  style={{
                    textTransform: "capitalize",
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.xs + 1,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {theme.i18n.t("settings.help_center")}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={theme.space.md}
                color={theme.color.textMuted}
              />
            </TouchableOpacity>

            <View
              style={{ height: 0.6, backgroundColor: theme.color.border }}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.sm + 1,
              }}
            >
              <View
                style={{
                  paddingHorizontal: theme.space.sm - 2,
                  paddingVertical: theme.space.sm - 2,
                  borderRadius: theme.borderRadius.md - 2,
                  backgroundColor: isDark ? "#1A2744" : theme.color.surface,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="message-outline"
                  size={theme.space.md}
                  color={theme.color.accent}
                />
              </View>
              <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                <Text
                  style={{
                    textTransform: "capitalize",
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.xs + 1,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {theme.i18n.t("settings.contact_support")}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={theme.space.md}
                color="#4A5568"
              />
            </TouchableOpacity>

            <View
              style={{ height: 0.6, backgroundColor: theme.color.border }}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.sm + 2,
              }}
            >
              <View
                style={{
                  paddingHorizontal: theme.space.sm,
                  paddingVertical: theme.space.sm - 1,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: isDark
                    ? theme.color.warning + 22
                    : theme.color.surface,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="star-outline"
                  size={theme.space.md}
                  color={theme.color.warning}
                />
              </View>
              <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                <Text
                  style={{
                    textTransform: "capitalize",
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.xs + 1,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {theme.i18n.t("settings.rate_medquel")}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={theme.space.md}
                color={theme.color.textMuted}
              />
            </TouchableOpacity>

            <View
              style={{ height: 0.6, backgroundColor: theme.color.border }}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.sm - 3,
              }}
            >
              <View
                style={{
                  paddingHorizontal: theme.space.sm,
                  paddingVertical: theme.space.sm,
                  borderRadius: theme.borderRadius.md - 2,
                  backgroundColor: isDark
                    ? theme.color.surface
                    : theme.color.surface,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={theme.space.md}
                  color={theme.color.textMuted}
                />
              </View>
              <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                <Text
                  style={{
                    textTransform: "capitalize",
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.xs + 1,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {theme.i18n.t("settings.privacy_policy")}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={theme.space.md}
                color={theme.color.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            backgroundColor: isDark
              ? theme.color.background
              : theme.color.background,
            justifyContent: "center",
            padding: theme.space.sm,
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? theme.color.card : theme.color.card,
              borderRadius: theme.borderRadius.lg,
              borderWidth: 1,
              borderColor: theme.color.border,
              overflow: "hidden",
              paddingVertical: theme.space.sm,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.sm - 2,
              }}
            >
              <View
                style={{
                  paddingHorizontal: theme.space.sm,
                  paddingVertical: theme.space.sm - 2,
                  borderRadius: theme.borderRadius.md - 2,
                  backgroundColor: isDark
                    ? theme.color.error + 22
                    : theme.color.surface,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={theme.space.md}
                  color={theme.color.error}
                />
              </View>
              <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                <Text
                  style={{
                    textTransform: "capitalize",
                    color: theme.color.error,
                    fontSize: theme.fontSize.xs + 1,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {theme.i18n.t("settings.sign_out")}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={theme.space.md}
                color={theme.color.textMuted}
              />
            </TouchableOpacity>
            <View
              style={{ height: 0.6, backgroundColor: theme.color.border }}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.sm - 3,
              }}
            >
              <View
                style={{
                  paddingHorizontal: theme.space.sm - 1,
                  paddingVertical: theme.space.sm - 2,
                  borderRadius: theme.borderRadius.md - 2,
                  backgroundColor: isDark
                    ? theme.color.error + 22
                    : theme.color.surface,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={theme.space.md}
                  color={theme.color.error}
                />
              </View>
              <View style={{ flex: 1, paddingLeft: theme.space.sm }}>
                <Text
                  style={{
                    textTransform: "capitalize",
                    color: theme.color.error,
                    fontSize: theme.fontSize.xs + 1,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {theme.i18n.t("settings.delete_account")}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={theme.space.md}
                color={theme.color.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
