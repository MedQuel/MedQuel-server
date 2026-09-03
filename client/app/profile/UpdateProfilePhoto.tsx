import { Feather } from '@expo/vector-icons';
import { Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


interface UpdateProfilePhotoProps {
  displayName: string;
  photoURL: string;
  pendingPhotoUri: string | null;
  uploading: boolean;
  onChoosePhoto: () => void;
  onUploadPhoto: () => void;
}

export function UpdateProfilePhoto({
  displayName,
  photoURL,
  pendingPhotoUri,
  uploading,
  onChoosePhoto,
  onUploadPhoto,
}: UpdateProfilePhotoProps) {
  const { theme } = useTheme();
  const previewUri = pendingPhotoUri || photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName || 'U')}`;

  return (
    <View style={{ alignItems: 'center', marginBottom: theme.space.lg }}>
      <View style={{ width: 110, height: 110 }}>
        <Image
          source={{ uri: previewUri }}
          style={{
            width: 110,
            height: 110,
            borderWidth: 4,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.border,
            opacity: uploading ? 0.5 : 1,
          }}
        />

        {uploading && (
          <View
            style={{
              position: 'absolute',
              inset: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator color={theme.color.accent} />
          </View>
        )}

        <TouchableOpacity
          onPress={onChoosePhoto}
          disabled={uploading}
          accessibilityLabel='Choose profile photo'
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: theme.color.background,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.card,
          }}
        >
          <Feather name='camera' size={theme.space.md} color={theme.color.accent} />
        </TouchableOpacity>
      </View>

      {pendingPhotoUri && !uploading && (
        <TouchableOpacity
          onPress={onUploadPhoto}
          style={{
            gap: theme.space.xs,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.space.sm,
            paddingHorizontal: theme.space.md,
            paddingVertical: theme.space.sm,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.color.accent,
          }}
        >
          <Feather name='upload' size={theme.space.md} color={theme.color.textPrimary} />
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('profile.updateProfile.uploadNewPhoto')}
          </Text>
        </TouchableOpacity>
      )}

      {pendingPhotoUri && !uploading && (
        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.xs,
            marginTop: theme.space.xs,
          }}
        >
          {theme.i18n.t('profile.updateProfile.previewNotSaved')}
        </Text>
      )}
    </View>
  );
}
