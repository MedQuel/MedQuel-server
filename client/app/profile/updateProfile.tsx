import { useState, useEffect, useCallback } from "react";
import { useBottomBar } from '../../common/context/useBottomBar';
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { userApi } from "@/common/api/api";
import { Feather } from "@expo/vector-icons";
import type {
  StudyLevel,
  YearOfStudy,
  TargetExam,
  UpdateProfileInput,
} from "@/common/types/types";
import { useTheme } from "../../theme/ThemeContext";
import { Loading } from "../../components/common/loading";
const STUDY_LEVELS: StudyLevel[] = [
  "MBBS Year 1-5",
  "Postgraduate",
  "Practitioner",
  "Nursing / Allied",
];

const YEARS_OF_STUDY: YearOfStudy[] = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Final Year",
  "Intern",
];

const TARGET_EXAMS: TargetExam[] = [
  "USMLE",
  "NEET-PG",
  "INI-CET",
  "PLAB",
  "MRCP",
  "FMGE",
  "Clinical Mastery",
];

interface ProfileFormState {
  uid: string;
  displayName: string;
  photoURL: string;
  studyLevel: StudyLevel | "";
  yearOfStudy: YearOfStudy | "";
  targetExam: TargetExam | "";
  institution: string;
}

const EMPTY_FORM: ProfileFormState = {
  uid: "",
  displayName: "",
  photoURL: "",
  studyLevel: "",
  yearOfStudy: "",
  targetExam: "",
  institution: "",
};

export default function updateProfile() {
  const [formData, setFormData] = useState<ProfileFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [examDropdownOpen, setExamDropdownOpen] = useState<boolean>(false);
  const { theme } = useTheme();
  const { isDark } = theme;
  const router = useRouter();
  useBottomBar(false, 'profile');

  // Load current profile on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await userApi.getMe();
        if (!mounted) return;
        setFormData({
          uid: me.uid ?? "",
          displayName: me.displayName ?? "",
          photoURL: me.photoURL ?? "",
          studyLevel: me.studyLevel ?? "",
          yearOfStudy: me.yearOfStudy ?? "",
          targetExam: me.targetExam ?? "",
          institution: me.institution ?? "",
        });
      } catch (e) {
        if (mounted) setError("Could not load your profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = <K extends keyof ProfileFormState>(
    name: K,
    value: ProfileFormState[K],
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Year of Study sirf MBBS Year 1-5 ke liye relevant hai,
      // isliye kisi aur studyLevel pe switch karte hi ise clear kar do
      if (name === "studyLevel" && value !== "MBBS Year 1-5") {
        next.yearOfStudy = "";
      }
      return next;
    });
    setSaved(false);
  };

  const handleSubmit = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const input: UpdateProfileInput = {
        displayName: formData.displayName,
        photoURL: formData.photoURL || undefined,
        studyLevel: formData.studyLevel || undefined,
        yearOfStudy: formData.yearOfStudy || undefined,
        targetExam: formData.targetExam || undefined,
        institution: formData.institution || undefined,
      };
      const updated = await userApi.updateProfile(input);
      setFormData((prev) => ({
        ...prev,
        ...updated,
        studyLevel: updated.studyLevel ?? prev.studyLevel,
        yearOfStudy: updated.yearOfStudy ?? prev.yearOfStudy,
        targetExam: updated.targetExam ?? prev.targetExam,
      }));
      setSaved(true);
    } catch (e) {
      setError("Could not save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [formData]);

  if (loading) {
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
        {loading ? <Loading /> : <Text>{error}</Text>}
      </View>
    );
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isDark
          ? theme.color.background
          : theme.color.background,
      }}
      // contentContainerStyle={{
      //   padding: theme.space.lg,
      //   paddingBottom: 75,
      // }}
    >
      <View
        style={{
          backgroundColor: theme.color.background,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          borderColor: theme.color.border,
          padding: theme.space.lg,
          boxShadow: theme.isDark
            ? "0 6px 14px rgba(0,0,0,0.2)"
            : "0 6px 14px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header row: back button + title */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: theme.space.lg,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              backgroundColor: theme.color.card,
              borderRadius: theme.borderRadius.lg,
              borderColor: theme.color.border,
              marginRight: theme.space.sm,
            }}
          >
            <Feather
              name="chevron-left"
              size={theme.fontSize.xl}
              color={theme.color.textPrimary}
            />
          </TouchableOpacity>

          <View>
            <Text
              style={{
                fontSize: theme.fontSize.lg,
                fontWeight: theme.fontWeight.medium,
                fontFamily: theme.fontFamily.bold,
                color: theme.color.textPrimary,
              }}
            >
              Update Profile
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.color.textMuted,
                fontFamily: theme.fontFamily.bold,
                marginTop: 4,
              }}
            >
              Update your study details below.
            </Text>
          </View>
        </View>
        <Text
          style={{
            fontSize: theme.fontSize.sm,
            color: theme.color.textMuted,
            fontFamily: theme.fontFamily.bold,
            marginTop: 4,
            marginBottom: theme.space.lg,
          }}
        >
          Update your study details below.
        </Text>

        {/* Photo preview - centered and enlarged */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginBottom: theme.space.lg,
          }}
        >
          <View style={{ width: 110, height: 110 }}>
            <Image
              source={{
                uri:
                  formData.photoURL ||
                  "https://api.dicebear.com/7.x/initials/svg?seed=" +
                    encodeURIComponent(formData.displayName || "U"),
              }}
              style={{
                borderWidth: 4,
                borderColor: theme.color.border,
                width: 110,
                height: 110,
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.border,
              }}
            />
            <TouchableOpacity
              onPress={() => {
                // TODO: hook up image picker to update formData.photoURL
              }}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.card,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: theme.color.background,
              }}
            >
              <Feather
                name="camera"
                size={16}
                color={theme.color.accent}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* displayName */}
        <View style={{ marginBottom: theme.space.md }}>
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.medium,
              fontFamily: theme.fontFamily.bold,
              color: theme.color.textSecondary,
              marginBottom: 4,
            }}
          >
            Display Name
          </Text>
          <TextInput
            value={formData.displayName}
            onChangeText={(v) => handleChange("displayName", v)}
            placeholder="Your name"
            placeholderTextColor={theme.color.textMuted}
            style={{
              borderWidth: 1,
              borderColor: theme.color.border,
              fontFamily: theme.fontFamily.bold,
              borderRadius: theme.borderRadius.md,
              paddingHorizontal: theme.space.sm + 4,
              paddingVertical: theme.space.sm,
              fontSize: theme.fontSize.sm + 1,
              color: theme.color.textPrimary,
              backgroundColor: theme.color.background,
            }}
          />
        </View>

        {/* studyLevel */}
        <View style={{ marginBottom: theme.space.md }}>
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.bold,
              fontWeight: theme.fontWeight.medium,
              color: theme.color.textSecondary,
              marginBottom: theme.space.sm,
            }}
          >
            Study Level
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: theme.space.sm,
            }}
          >
            {STUDY_LEVELS.map((level) => {
              const active = formData.studyLevel === level;
              return (
                <TouchableOpacity
                  key={level}
                  onPress={() => handleChange("studyLevel", level)}
                  style={{
                    paddingHorizontal: theme.space.sm + 4,
                    paddingVertical: theme.space.sm - 1,
                    borderRadius: theme.borderRadius.full,
                    borderWidth: 1,
                    borderColor: active
                      ? theme.color.accent
                      : theme.color.border,
                    backgroundColor: active
                      ? theme.color.accent
                      : theme.color.card,
                    marginRight: theme.space.sm,
                    marginBottom: theme.space.sm,
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.fontSize.sm,
                      color: active
                        ? theme.color.textInverse
                        : theme.color.textSecondary,
                      fontWeight: active
                        ? theme.fontWeight.medium
                        : theme.fontWeight.regular,
                      fontFamily: theme.fontFamily.bold,
                    }}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* yearOfStudy - sirf MBBS Year 1-5 select hone par dikhana hai */}
        {formData.studyLevel === "MBBS Year 1-5" && (
          <View style={{ marginBottom: theme.space.md }}>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                fontWeight: theme.fontWeight.medium,
                color: theme.color.textSecondary,
                fontFamily: theme.fontFamily.bold,
                marginBottom: theme.space.sm,
              }}
            >
              Year of Study
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: theme.space.sm,
              }}
            >
              {YEARS_OF_STUDY.map((year) => {
                const active = formData.yearOfStudy === year;
                return (
                  <TouchableOpacity
                    key={year}
                    onPress={() => handleChange("yearOfStudy", year)}
                    style={{
                      paddingHorizontal: theme.space.sm + 4,
                      paddingVertical: theme.space.sm - 1,
                      borderRadius: theme.borderRadius.full,
                      borderWidth: 1,
                      borderColor: active
                        ? theme.color.accent
                        : theme.color.border,
                      backgroundColor: active
                        ? theme.color.accent
                        : theme.color.card,
                      marginRight: theme.space.sm,
                      marginBottom: theme.space.sm,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.fontSize.sm,
                        color: active
                          ? theme.color.textInverse
                          : theme.color.textSecondary,
                        fontWeight: active
                          ? theme.fontWeight.medium
                          : theme.fontWeight.regular,
                        fontFamily: theme.fontFamily.bold,
                      }}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* targetExam - dropdown */}
        <View style={{ marginBottom: theme.space.md, zIndex: 10 }}>
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.medium,
              color: theme.color.textSecondary,
              fontFamily: theme.fontFamily.bold,
              marginBottom: theme.space.sm,
            }}
          >
            Target Exam
          </Text>

          <TouchableOpacity
            onPress={() => setExamDropdownOpen((prev) => !prev)}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: 1,
              borderColor: examDropdownOpen
                ? theme.color.accent
                : theme.color.border,
              borderRadius: theme.borderRadius.md,
              paddingHorizontal: theme.space.sm + 4,
              paddingVertical: theme.space.sm,
              backgroundColor: theme.color.background,
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSize.sm + 1,
                fontFamily: theme.fontFamily.bold,
                color: formData.targetExam
                  ? theme.color.textPrimary
                  : theme.color.textMuted,
              }}
            >
              {formData.targetExam || "Select target exam"}
            </Text>
            <Feather
              name={examDropdownOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={theme.color.textMuted}
            />
          </TouchableOpacity>

          {examDropdownOpen && (
            <View
              style={{
                marginTop: theme.space.sm - 2,
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.color.card,
                overflow: "hidden",
              }}
            >
              {TARGET_EXAMS.map((exam, index) => {
                const active = formData.targetExam === exam;
                return (
                  <TouchableOpacity
                    key={exam}
                    onPress={() => {
                      handleChange("targetExam", exam);
                      setExamDropdownOpen(false);
                    }}
                    style={{
                      paddingHorizontal: theme.space.sm + 4,
                      paddingVertical: theme.space.sm + 2,
                      backgroundColor: active
                        ? theme.color.accent
                        : theme.color.card,
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderTopColor: theme.color.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.fontSize.sm + 1,
                        fontFamily: theme.fontFamily.bold,
                        color: active
                          ? theme.color.textInverse
                          : theme.color.textPrimary,
                        fontWeight: active
                          ? theme.fontWeight.medium
                          : theme.fontWeight.regular,
                      }}
                    >
                      {exam}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* institution */}
        <View style={{ marginBottom: theme.space.lg }}>
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.medium,
              color: theme.color.textSecondary,
              fontFamily: theme.fontFamily.bold,
              marginBottom: 4,
            }}
          >
            Institution
          </Text>
          <TextInput
            value={formData.institution}
            onChangeText={(v) => handleChange("institution", v)}
            placeholder="Your school / college name"
            placeholderTextColor={theme.color.textMuted}
            style={{
              borderWidth: 1,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.md,
              paddingHorizontal: theme.space.sm + 4,
              paddingVertical: theme.space.sm,
              fontSize: theme.fontSize.sm + 1,
              fontFamily: theme.fontFamily.bold,
              color: theme.color.textPrimary,
              backgroundColor: theme.color.background,
            }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={saving}
          style={{
            backgroundColor: theme.color.accent,
            borderRadius: theme.borderRadius.md,
            paddingVertical: theme.space.sm + 4,
            alignItems: "center",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator color={theme.color.textInverse} />
          ) : (
            <Text
              style={{
                color: theme.color.textInverse,
                fontSize: theme.fontSize.sm + 1,
                fontWeight: theme.fontWeight.medium,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              Save Changes
            </Text>
          )}
        </TouchableOpacity>

        {saved && !error && (
          <Text
            style={{
              color: theme.color.success,
              fontSize: theme.fontSize.sm,
              textAlign: "center",
              fontFamily: theme.fontFamily.bold,
              marginTop: theme.space.sm,
            }}
          >
            Profile updated successfully.
          </Text>
        )}

        {error && (
          <Text
            style={{
              color: theme.color.error,
              fontSize: theme.fontSize.sm,
              textAlign: "center",
              fontFamily: theme.fontFamily.bold,
              marginTop: theme.space.sm,
            }}
          >
            {error}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}