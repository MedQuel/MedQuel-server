import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Text, View, Pressable, ScrollView } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, Modal, TouchableOpacity } from 'react-native';

import { userApi } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../common/context/AppContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { ProfilePhotoUploadError } from '../../common/api/api.errors';
import type { UpdateProfileInput, Specialty } from '../../common/types/types';
import { removeProfilePhoto, uploadProfilePhoto } from '../../common/firebase/storage';
import { MAX_SPECIALTIES, MAX_FOCUS_SUBJECTS } from '../../common/constants/onboardingOptions';
import { ROLE_HAS_YEAR, ROLE_HAS_SPECIALTY, targetExamsFor } from '../../common/constants/onboardingOptions';

import { Loading } from '../../components/common/loading';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { UpdateProfilePhoto } from '../../components/profile/UpdateProfilePhoto';
import { UpdateProfileStatus } from '../../components/profile/UpdateProfileStatus';
import { UpdateProfileFields, type ProfileFormValues } from '../../components/profile/UpdateProfileFields';


interface ProfileFormState extends ProfileFormValues {
  uid: string;
  photoURL: string;
}
const EMPTY_FORM: ProfileFormState = {
  uid: '',
  displayName: '',
  photoURL: '',
  describesYou: '',
  yearOfStudy: '',
  specialties: [],
  targetExam: '',
  institution: '',
  contentScope: '',
  focusSubjects: [],
};

function isEphemeralUri(uri?: string | null): boolean {
  return Boolean(uri && (uri.startsWith('blob:') || uri.startsWith('file:')));
}
function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();

  return sortedA.every((v, i) => v === sortedB[i]);
}


export default function UpdateProfile() {
  const { user, refreshUser } = useAppContext();

  const [formData, setFormData] = useState<ProfileFormState>(EMPTY_FORM);
  const originalRef = useRef<ProfileFormState>(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [pendingPhotoUri, setPendingPhotoUri] = useState<string | null>(null);
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [removeConfirmationVisible, setRemoveConfirmationVisible] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: 'error' | 'success';
  } | null>(null);

  const isMountedRef = useRef(true);
  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  useBottomBar(false, 'profile');

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setFeedback({ message: 'Could not load your profile.', tone: 'error' });
      return;
    }

    const hydrated: ProfileFormState = {
      uid: user.uid ?? '',
      displayName: user.displayName ?? '',
      photoURL: isEphemeralUri(user.photoURL) ? '' : (user.photoURL ?? ''),
      describesYou: user.describesYou ?? '',
      yearOfStudy: user.yearOfStudy ?? '',
      specialties: user.specialties ?? [],
      targetExam: user.targetExam ?? '',
      institution: user.institution ?? '',
      contentScope: user.contentScope ?? 'all',
      focusSubjects: user.focusSubjects ?? [],
    };
    setFormData(hydrated);
    originalRef.current = hydrated;
    setLoading(false);
  }, [user]);

  const handleChange = useCallback(<K extends keyof ProfileFormValues>(
    name: K,
    value: ProfileFormValues[K]
  ) => {
    setFormData((previous) => {
      let next = { ...previous, [name]: value };

      if (name === 'describesYou') {
        const role = value as ProfileFormValues['describesYou'];
        const targetStillValid = next.targetExam && role
          ? targetExamsFor(role).includes(next.targetExam as any)
          : false;
        next = {
          ...next,
          yearOfStudy: role && ROLE_HAS_YEAR[role] ? next.yearOfStudy : '',
          specialties: role && ROLE_HAS_SPECIALTY[role] ? next.specialties : [],
          targetExam: targetStillValid ? next.targetExam : '',
        };
      }
      if (name === 'contentScope' && value !== 'focused') {
        next = { ...next, focusSubjects: [] };
      }
      return next;
    });
    setFeedback(null);
  }, []);

  const handleToggleSpecialty = useCallback((specialty: Specialty) => {
    setFormData((previous) => {
      if (previous.specialties.includes(specialty)) {
        return { ...previous, specialties: previous.specialties.filter((s) => s !== specialty) };
      }
      if (previous.specialties.length >= MAX_SPECIALTIES) return previous;
      return { ...previous, specialties: [...previous.specialties, specialty] };
    });
    setFeedback(null);
  }, []);

  const handleToggleFocusSubject = useCallback((subject: Specialty) => {
    setFormData((previous) => {
      if (previous.focusSubjects.includes(subject)) {
        return { ...previous, focusSubjects: previous.focusSubjects.filter((s) => s !== subject) };
      }
      if (previous.focusSubjects.length >= MAX_FOCUS_SUBJECTS) return previous;
      return { ...previous, focusSubjects: [...previous.focusSubjects, subject] };
    });
    setFeedback(null);
  }, []);

  const pickImage = useCallback(async (source: 'camera' | 'gallery') => {
    setPhotoModalVisible(false);
    try {
      const permission = source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setFeedback({
          message: source === 'camera'
            ? 'Camera permission is required to take a photo.'
            : 'Gallery permission is required to choose a photo.',
          tone: 'error',
        });
        return;
      }

      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1] as [number, number],
        quality: 0.8,
      };
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
      const uri = !result.canceled ? result.assets?.[0]?.uri : undefined;

      if (uri && isMountedRef.current) {
        setPendingPhotoUri(uri);
        setFeedback(null);
      }
    } catch (error) {
      if (isMountedRef.current)
        setFeedback({
          message: getErrorMessage(error, 'Something went wrong while picking the photo.'),
          tone: 'error',
        });
    }
  }, []);

  const handlePhotoUpload = useCallback(async () => {
    if (!pendingPhotoUri || uploadingPhoto) return;
    setUploadingPhoto(true);
    setFeedback(null);

    try {
      const downloadUrl = await uploadProfilePhoto(
        pendingPhotoUri,
        formData.photoURL
      );
      await userApi.updateProfile({ photoURL: downloadUrl });
      await refreshUser();

      if (!isMountedRef.current) return;
      setPendingPhotoUri(null);
      setFeedback({
        message: 'Profile photo updated successfully.',
        tone: 'success',
      });
    } catch (error) {
      if (!isMountedRef.current) return;
      const fallback = error instanceof ProfilePhotoUploadError
        ? error.message
        : 'Could not update your profile photo. Please try again.';
      setFeedback({ message: getErrorMessage(error, fallback), tone: 'error' });
    } finally {
      if (isMountedRef.current) setUploadingPhoto(false);
    }
  }, [formData.photoURL, pendingPhotoUri, uploadingPhoto, refreshUser]);

  const handleRemovePhoto = useCallback(() => {
    if (!formData.photoURL || uploadingPhoto) return;
    setRemoveConfirmationVisible(true);
  }, [formData.photoURL, uploadingPhoto]);

  const confirmRemovePhoto = useCallback(async () => {
    if (!formData.photoURL || uploadingPhoto) return;

    setUploadingPhoto(true);
    setFeedback(null);
    try {
      await userApi.updateProfile({ photoURL: null });
      removeProfilePhoto(formData.photoURL);
      await refreshUser();
      if (!isMountedRef.current) return;

      setRemoveConfirmationVisible(false);
      setPhotoModalVisible(false);
      setFeedback({
        message: theme.i18n.t('profile.updateProfile.photoRemoved'),
        tone: 'success',
      });
    } catch (error) {
      if (isMountedRef.current)
        setFeedback({
          message: getErrorMessage(error, theme.i18n.t('profile.updateProfile.removePhotoFailed')),
          tone: 'error',
        });
    } finally {
      if (isMountedRef.current) setUploadingPhoto(false);
    }
  }, [formData.photoURL, theme, uploadingPhoto, refreshUser]);

  function validate(): string | null {
    if (formData.displayName.trim().length < 5) return 'Display name must be at least 5 characters.';
    if (!formData.describesYou) return 'Please select what best describes you.';
    if (ROLE_HAS_YEAR[formData.describesYou] && !formData.yearOfStudy) {
      return 'Please select your year of study.';
    }
    if (ROLE_HAS_SPECIALTY[formData.describesYou] && formData.specialties.length === 0) {
      return 'Please select at least one specialty.';
    }
    if (!formData.targetExam) return 'Please select your goal.';
    if (!formData.contentScope) return 'Please choose a content scope.';
    if (formData.contentScope === 'focused' && formData.focusSubjects.length === 0) {
      return 'Please select at least one subject to focus on.';
    }
    return null;
  }

  const handleSubmit = useCallback(async () => {
    if (pendingPhotoUri) {
      setFeedback({
        message: 'Upload your selected photo before saving profile details.',
        tone: 'error',
      });
      return;
    }
    const validationError = validate();
    if (validationError) {
      setFeedback({ message: validationError, tone: 'error' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const original = originalRef.current;
      const payload: UpdateProfileInput = {};

      if (formData.displayName.trim() !== original.displayName)
        payload.displayName = formData.displayName.trim();
      if (formData.describesYou !== original.describesYou)
        payload.describesYou = formData.describesYou || undefined;
      if (formData.yearOfStudy !== original.yearOfStudy)
        payload.yearOfStudy = formData.yearOfStudy || undefined;
      if (!sameSet(formData.specialties, original.specialties))
        payload.specialties = formData.specialties;
      if (formData.targetExam !== original.targetExam)
        payload.targetExam = formData.targetExam || undefined;
      if (formData.institution.trim() !== original.institution)
        payload.institution = formData.institution.trim() || undefined;
      if (formData.contentScope !== original.contentScope)
        payload.contentScope = formData.contentScope || undefined;
      if (!sameSet(formData.focusSubjects, original.focusSubjects))
        payload.focusSubjects = formData.focusSubjects;

      if (Object.keys(payload).length === 0) {
        setFeedback({ message: 'No changes to save.', tone: 'success' });
        setSaving(false);
        return;
      }

      await userApi.updateProfile(payload);
      await refreshUser();

      if (!isMountedRef.current) return;
      originalRef.current = { ...formData };
      setFeedback({ message: 'Profile updated successfully.', tone: 'success' });
      navigateTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) router.push('/profile');
      }, 800);
    } catch (error) {
      if (isMountedRef.current)
        setFeedback({
          message: getErrorMessage(error, 'Could not save your changes. Please try again.'),
          tone: 'error',
        });
    } finally {
      if (isMountedRef.current) setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, pendingPhotoUri, router, refreshUser]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.color.background,
        }}
      >
        <Loading />
      </View>
    );
  }


  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScreenHeader
        title={theme.i18n.t('profile.updateProfile.title')}
        subtitle={theme.i18n.t('profile.updateProfile.subtitle')}
        onBack={() => router.canGoBack()
          ? router.back()
          : router.replace('/profile')
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          marginTop: theme.space.md,
          paddingBottom: theme.space.md,
          paddingHorizontal: theme.space.md,
        }}
      >
        {feedback && (
          <UpdateProfileStatus
            message={feedback.message}
            tone={feedback.tone}
            onDismiss={() => setFeedback(null)}
          />
        )}

        <UpdateProfilePhoto
          displayName={formData.displayName}
          photoURL={formData.photoURL}
          pendingPhotoUri={pendingPhotoUri}
          uploading={uploadingPhoto}
          onChoosePhoto={() => setPhotoModalVisible(true)}
          onUploadPhoto={handlePhotoUpload}
        />
        <UpdateProfileFields
          values={formData}
          examDropdownOpen={examDropdownOpen}
          onChange={handleChange}
          onToggleExam={() => setExamDropdownOpen((open) => !open)}
          onSelectExam={(exam) => {
            handleChange('targetExam', exam);
            setExamDropdownOpen(false);
          }}
          onToggleSpecialty={handleToggleSpecialty}
          onToggleFocusSubject={handleToggleFocusSubject}
        />
      </ScrollView>

      <View
        style={{
          paddingTop: theme.space.sm,
          paddingBottom: insets.bottom * 1.15,
          paddingHorizontal: theme.space.lg,
          backgroundColor: theme.color.background,
        }}
      >
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={saving || uploadingPhoto}
          style={{
            alignItems: 'center',
            paddingVertical: theme.space.sm * 1.5,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.color.accent,
            opacity: saving || uploadingPhoto ? 0.6 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator color={theme.color.textInverse} />
          ) : (
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.sm + 1,
                fontWeight: theme.fontWeight.medium,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {theme.i18n.t('profile.updateProfile.saveChanges')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={photoModalVisible}
        transparent
        animationType='slide'
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
          onPress={() => {
            setPhotoModalVisible(false);
            setRemoveConfirmationVisible(false);
          }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              padding: theme.space.lg,
              paddingBottom: theme.space.lg + 20,
              borderTopLeftRadius: theme.borderRadius.lg,
              borderTopRightRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.card,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: theme.fontSize.md,
                fontFamily: theme.fontFamily.bold,
                color: theme.color.textPrimary,
                marginBottom: theme.space.lg,
              }}
            >
              {removeConfirmationVisible ? theme.i18n.t('profile.updateProfile.removePhoto') : theme.i18n.t('profile.updateProfile.uploadPhoto')}
            </Text>

            {removeConfirmationVisible ? (
              <>
                <Text
                  style={{
                    textAlign: 'center',
                    color: theme.color.textSecondary,
                    fontSize: theme.fontSize.sm,
                    fontFamily: theme.fontFamily.bold,
                    marginBottom: theme.space.lg,
                  }}
                >
                  {theme.i18n.t('profile.updateProfile.removePhotoConfirmation')}
                </Text>

                <View style={{ gap: theme.space.sm, flexDirection: 'row' }}>
                  <TouchableOpacity
                    onPress={() => setRemoveConfirmationVisible(false)}
                    disabled={uploadingPhoto}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: theme.space.md * 0.75,
                      borderWidth: 1,
                      borderColor: theme.color.border,
                      borderRadius: theme.borderRadius.md,
                    }}
                  >
                    <Text style={{ color: theme.color.textPrimary, fontFamily: theme.fontFamily.bold }}>
                      {theme.i18n.t('common.cancel')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={confirmRemovePhoto}
                    disabled={uploadingPhoto}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: theme.space.md * 0.75,
                      borderRadius: theme.borderRadius.md,
                      backgroundColor: theme.color.error,
                      opacity: uploadingPhoto ? 0.6 : 1,
                    }}
                  >
                    {uploadingPhoto ? (
                      <ActivityIndicator color={theme.color.textInverse} />
                    ) : (
                      <Text style={{ color: theme.color.textInverse, fontFamily: theme.fontFamily.bold }}>
                        {theme.i18n.t('profile.updateProfile.removePhoto')}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => pickImage('camera')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: theme.space.md * 0.75,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.color.border,
                  }}
                >
                  <Feather
                    name='camera'
                    size={theme.space.md}
                    color={theme.color.accent}
                    style={{ marginRight: theme.space.sm }}
                  />
                  <Text
                    style={{
                      fontSize: theme.fontSize.sm + 1,
                      color: theme.color.textPrimary,
                      fontFamily: theme.fontFamily.bold,
                    }}
                  >
                    {theme.i18n.t('profile.updateProfile.takePhoto')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => pickImage('gallery')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: theme.space.md * 0.75,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.color.border,
                  }}
                >
                  <Feather
                    name='image'
                    size={theme.space.md}
                    color={theme.color.accent}
                    style={{ marginRight: theme.space.sm }}
                  />
                  <Text
                    style={{
                      fontSize: theme.fontSize.sm + 1,
                      color: theme.color.textPrimary,
                      fontFamily: theme.fontFamily.bold,
                    }}
                  >
                    {theme.i18n.t('profile.updateProfile.chooseFromGallery')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleRemovePhoto}
                  disabled={!formData.photoURL || Boolean(pendingPhotoUri) || uploadingPhoto}
                  accessibilityRole='button'
                  accessibilityLabel={theme.i18n.t('profile.updateProfile.removePhoto')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: theme.space.md * 0.75,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.color.border,
                    opacity: !formData.photoURL || pendingPhotoUri || uploadingPhoto ? 0.45 : 1,
                  }}
                >
                  <Feather
                    name='trash-2'
                    size={theme.space.md}
                    color={theme.color.error}
                    style={{ marginRight: theme.space.sm }}
                  />
                  <Text
                    style={{
                      fontSize: theme.fontSize.sm + 1,
                      color: theme.color.error,
                      fontFamily: theme.fontFamily.bold,
                    }}
                  >
                    {theme.i18n.t('profile.updateProfile.removePhoto')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPhotoModalVisible(false)}
                  style={{
                    alignItems: 'center',
                    marginTop: theme.space.sm,
                    paddingVertical: theme.space.md * 0.75,
                  }}
                >
                  <Text
                    style={{
                      color: theme.color.error,
                      fontSize: theme.fontSize.sm + 1,
                      fontFamily: theme.fontFamily.bold,
                    }}
                  >
                    {theme.i18n.t('common.cancel')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
