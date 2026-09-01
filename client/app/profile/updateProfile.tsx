import { useState, useEffect, useCallback, useRef } from "react";
import { useBottomBar } from "../../common/context/useBottomBar";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ProfilePhotoUploadError } from "@/common/api/api.errors";
import { uploadProfilePhoto } from "@/common/firebase/storage";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
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

// Ephemeral (local/temporary) URIs jinhe DB mein save nahi karna hai
function isEphemeralUri(uri?: string | null): boolean {
  if (!uri) return false;
  return uri.startsWith("blob:") || uri.startsWith("file:");
}

export default function UpdateProfile() {
  const [formData, setFormData] = useState<ProfileFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [examDropdownOpen, setExamDropdownOpen] = useState<boolean>(false);
  const [photoModalVisible, setPhotoModalVisible] = useState<boolean>(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const { theme } = useTheme();
  const { isDark } = theme;
  const router = useRouter();
  useBottomBar(false, "profile");

  // Component mount-status track karne ke liye, taaki unmount ke baad
  // state update ya navigation na ho (setTimeout / async race conditions)
  const isMountedRef = useRef(true);
  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current);
      }
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

  const pickImage = useCallback(
    async (source: "camera" | "gallery") => {
      setPhotoModalVisible(false);
      try {
        let permissionResult;
        if (source === "camera") {
          permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        } else {
          permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        }

        if (!permissionResult.granted) {
          setError(
            source === "camera"
              ? "Camera permission is required to take a photo."
              : "Gallery permission is required to choose a photo.",
          );
          return;
        }

        const pickerOptions = {
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1] as [number, number],
          quality: 0.8,
        };

        const result =
          source === "camera"
            ? await ImagePicker.launchCameraAsync(pickerOptions)
            : await ImagePicker.launchImageLibraryAsync(pickerOptions);

        if (!result.canceled && result.assets?.[0]?.uri) {
          const localUri = result.assets[0].uri;
          const previousPhotoURL = formData.photoURL; // upload se pehle purana hosted URL save kar lo

          // Turant preview ke liye local URI dikhado (sirf UI ke liye, DB mein nahi jayega)
          handleChange("photoURL", localUri);

          setUploadingPhoto(true);
          setError(null);
          try {
            const downloadUrl = await uploadProfilePhoto(
              localUri,
              previousPhotoURL,
            );
            if (!isMountedRef.current) return;
            handleChange("photoURL", downloadUrl); // ab real hosted URL set ho gaya
          } catch (uploadErr) {
            if (!isMountedRef.current) return;
            const msg =
              uploadErr instanceof ProfilePhotoUploadError
                ? uploadErr.message
                : "Photo upload failed. Please try again.";
            setError(msg);
            handleChange("photoURL", previousPhotoURL); // revert local preview
          } finally {
            if (isMountedRef.current) setUploadingPhoto(false);
          }
        }
      } catch (e) {
        console.log("pickImage error:", e);
        setError("Something went wrong while picking the photo.");
      }
    },
    [formData.photoURL],
  );

  const handlePhotoPress = useCallback(() => {
    setPhotoModalVisible(true);
  }, []);

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
          photoURL: isEphemeralUri(me.photoURL) ? "" : (me.photoURL ?? ""),
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

  const handleSubmit = useCallback(async () => {
    if (uploadingPhoto) {
      setError("Please wait for the photo to finish uploading.");
      return;
    }
    // isEphemeralUri consistently use kiya (file:// aur blob: dono cover ho jaate hain)
    if (isEphemeralUri(formData.photoURL)) {
      setError("Photo upload didn't complete. Please re-select your photo.");
      return;
    }

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
      if (!isMountedRef.current) return;

      setFormData((prev) => ({
        ...prev,
        ...updated,
        studyLevel: updated.studyLevel ?? prev.studyLevel,
        yearOfStudy: updated.yearOfStudy ?? prev.yearOfStudy,
        targetExam: updated.targetExam ?? prev.targetExam,
      }));
      setSaved(true);

      navigateTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          router.push("/profile");
        }
      }, 800);
    } catch (e) {
      if (isMountedRef.current) {
        setError("Could not save your changes. Please try again.");
      }
    } finally {
      if (isMountedRef.current) setSaving(false);
    }
  }, [formData, router, uploadingPhoto]);

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
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: isDark
            ? theme.color.background
            : theme.color.background,
        }}
      >
        <View
          style={{
            backgroundColor: theme.color.background,
            borderRadius: theme.borderRadius.lg,
            padding: theme.space.lg,
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
                    (!isEphemeralUri(formData.photoURL) && formData.photoURL) ||
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
                  opacity: uploadingPhoto ? 0.5 : 1,
                }}
              />
              {uploadingPhoto && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator color={theme.color.accent} />
                </View>
              )}
              <TouchableOpacity
                onPress={handlePhotoPress}
                disabled={uploadingPhoto}
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
                <Feather name="camera" size={16} color={theme.color.accent} />
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
              Goal
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
                  // Android par zIndex reliably kaam nahi karta, elevation zaroori hai
                  ...(Platform.OS === "android" ? { elevation: 6 } : {}),
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
        </View>
      </ScrollView>

      {/* Bottom pe fixed footer: Save button + saved/error messages */}
      <View
        style={{
          paddingHorizontal: theme.space.lg,
          paddingTop: theme.space.sm,
          paddingBottom: theme.space.lg,
          backgroundColor: theme.color.background,
        }}
      >
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={saving || uploadingPhoto}
          style={{
            backgroundColor: theme.color.accent,
            borderRadius: theme.borderRadius.md,
            paddingVertical: theme.space.sm + 4,
            alignItems: "center",
            opacity: saving || uploadingPhoto ? 0.6 : 1,
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

      {/* Photo source picker modal */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
          onPress={() => setPhotoModalVisible(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: theme.color.card,
              borderTopLeftRadius: theme.borderRadius.lg,
              borderTopRightRadius: theme.borderRadius.lg,
              padding: theme.space.lg,
              paddingBottom: theme.space.lg + 20,
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSize.md,
                fontFamily: theme.fontFamily.bold,
                color: theme.color.textPrimary,
                textAlign: "center",
                marginBottom: theme.space.lg,
              }}
            >
              Update Photo
            </Text>

            <TouchableOpacity
              onPress={() => pickImage("camera")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: theme.space.sm + 6,
                borderBottomWidth: 1,
                borderBottomColor: theme.color.border,
              }}
            >
              <Feather
                name="camera"
                size={20}
                color={theme.color.accent}
                style={{ marginRight: theme.space.sm }}
              />
              <Text
                style={{
                  fontSize: theme.fontSize.sm + 1,
                  fontFamily: theme.fontFamily.bold,
                  color: theme.color.textPrimary,
                }}
              >
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => pickImage("gallery")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: theme.space.sm + 6,
                borderBottomWidth: 1,
                borderBottomColor: theme.color.border,
              }}
            >
              <Feather
                name="image"
                size={20}
                color={theme.color.accent}
                style={{ marginRight: theme.space.sm }}
              />
              <Text
                style={{
                  fontSize: theme.fontSize.sm + 1,
                  fontFamily: theme.fontFamily.bold,
                  color: theme.color.textPrimary,
                }}
              >
                Choose from Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPhotoModalVisible(false)}
              style={{
                paddingVertical: theme.space.sm + 6,
                alignItems: "center",
                marginTop: theme.space.sm,
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.sm + 1,
                  fontFamily: theme.fontFamily.bold,
                  color: theme.color.error,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}