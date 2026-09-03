import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Text, View, Pressable, ScrollView } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, TouchableOpacity } from 'react-native';

import { userApi } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { Loading } from '../../components/common/loading';
import { UpdateProfilePhoto } from './UpdateProfilePhoto';
import { UpdateProfileStatus } from './UpdateProfileStatus';
import { useBottomBar } from '../../common/context/useBottomBar';
import type { UpdateProfileInput } from '../../common/types/types';
import { ProfilePhotoUploadError } from '../../common/api/api.errors';
import { UpdateProfileFields, type ProfileFormValues } from './UpdateProfileFields';
import { removeProfilePhoto, uploadProfilePhoto } from '../../common/firebase/storage';


interface ProfileFormState extends ProfileFormValues {
  uid: string;
  photoURL: string;
}
const EMPTY_FORM: ProfileFormState = {
  uid: '',
  displayName: '',
  photoURL: '',
  studyLevel: '',
  yearOfStudy: '',
  targetExam: '',
  institution: '',
};

function isEphemeralUri(uri?: string | null): boolean {
  return Boolean(uri && (uri.startsWith('blob:') || uri.startsWith('file:')));
}
function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}


export default function UpdateProfile() {
  const [formData, setFormData] = useState<ProfileFormState>(EMPTY_FORM);
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
  const { theme } = useTheme();
  useBottomBar(false, 'profile');

  useEffect(() => {
    (async () => {
      try {
        const me = await userApi.getMe();
        if (!isMountedRef.current) return;

        setFormData({
          uid: me.uid ?? '',
          displayName: me.displayName ?? '',
          photoURL: isEphemeralUri(me.photoURL) ? '' : (me.photoURL ?? ''),
          studyLevel: me.studyLevel ?? '',
          yearOfStudy: me.yearOfStudy ?? '',
          targetExam: me.targetExam ?? '',
          institution: me.institution ?? '',
        });
      } catch (error) {
        if (isMountedRef.current)
          setFeedback({
            message: getErrorMessage(error, 'Could not load your profile.'),
            tone: 'error',
          });
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    })();

    return () => {
      isMountedRef.current = false;
      if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
    };
  }, []);

  const handleChange = useCallback(
    <K extends keyof ProfileFormValues>(
      name: K,
      value: ProfileFormValues[K]
    ) => {
      setFormData((previous) => {
        const next = { ...previous, [name]: value };
        if (name === 'studyLevel' && value !== 'MBBS Year 1-5') next.yearOfStudy = '';
        return next;
      });
      setFeedback(null);
    },
    []
  );

  const pickImage = useCallback(async (source: 'camera' | 'gallery') => {
    setPhotoModalVisible(false);
    try {
      const permission = source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setFeedback({ message: source === 'camera'
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

      if (!isMountedRef.current) return;
      setFormData((previous) => ({ ...previous, photoURL: downloadUrl }));
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
  }, [formData.photoURL, pendingPhotoUri, uploadingPhoto]);

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
      if (!isMountedRef.current) return;

      setFormData((previous) => ({ ...previous, photoURL: '' }));
      setRemoveConfirmationVisible(false);
      setPhotoModalVisible(false);
      setFeedback({ message: theme.i18n.t('profile.updateProfile.photoRemoved'), tone: 'success' });
    } catch (error) {
      if (isMountedRef.current) setFeedback({ message: getErrorMessage(error, theme.i18n.t('profile.updateProfile.removePhotoFailed')), tone: 'error' });
    } finally {
      if (isMountedRef.current) setUploadingPhoto(false);
    }
  }, [formData.photoURL, theme, uploadingPhoto]);

  const handleSubmit = useCallback(async () => {
    if (pendingPhotoUri) {
      setFeedback({
        message: 'Upload your selected photo before saving profile details.',
        tone: 'error',
      });
      return;
    }
    setSaving(true);
    setFeedback(null);

    try {
      const input: UpdateProfileInput = {
        displayName: formData.displayName,
        studyLevel: formData.studyLevel || undefined,
        yearOfStudy: formData.yearOfStudy || undefined,
        targetExam: formData.targetExam || undefined,
        institution: formData.institution || undefined,
      };
      const updated = await userApi.updateProfile(input);

      if (!isMountedRef.current) return;
      setFormData((previous) => ({
        ...previous,
        ...updated,
        photoURL: updated.photoURL ?? previous.photoURL,
        studyLevel: updated.studyLevel ?? previous.studyLevel,
        yearOfStudy: updated.yearOfStudy ?? previous.yearOfStudy,
        targetExam: updated.targetExam ?? previous.targetExam,
      }));

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
  }, [formData, pendingPhotoUri, router]);

  if (loading)
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


  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          backgroundColor: theme.color.background,
        }}
        contentContainerStyle={{
          padding: theme.space.lg,
          paddingBottom: theme.space.xl,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.space.lg }}>
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            accessibilityLabel='Back to profile'
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: theme.space.sm,
              borderWidth: 1,
              borderColor: theme.color.border,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.color.card,
            }}
          >
            <Feather
              name='chevron-left'
              size={theme.fontSize.xl}
              color={theme.color.textPrimary}
            />
          </TouchableOpacity>

          <View>
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.lg,
                fontWeight: theme.fontWeight.medium,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {theme.i18n.t('profile.updateProfile.title')}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.color.textMuted,
                fontFamily: theme.fontFamily.bold,
                marginTop: theme.space.xs,
              }}
            >
              {theme.i18n.t('profile.updateProfile.subtitle')}
            </Text>
          </View>
        </View>

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
        />
      </ScrollView>

      <View
        style={{
          paddingTop: theme.space.sm,
          paddingBottom: theme.space.lg,
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
              {removeConfirmationVisible
                ? theme.i18n.t('profile.updateProfile.removePhoto')
                : theme.i18n.t('profile.updateProfile.uploadPhoto')}
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
                    {uploadingPhoto
                      ? <ActivityIndicator color={theme.color.textInverse} />
                      : <Text style={{ color: theme.color.textInverse, fontFamily: theme.fontFamily.bold }}>
                        {theme.i18n.t('profile.updateProfile.removePhoto')}
                      </Text>}
                  </TouchableOpacity>
                </View>
              </>
            ) : <>
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
              onPress={() => {
                handleRemovePhoto();
              }}
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
                  fontSize: theme.fontSize.sm + 1,
                  color: theme.color.error,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {theme.i18n.t('common.cancel')}
              </Text>
            </TouchableOpacity>
            </>}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
