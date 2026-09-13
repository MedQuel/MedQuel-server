import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  StatusBar,
} from 'react-native';

import { hasValidPhoto } from '../../common/utils/imageUrl';
import { useTheme } from '../../theme/ThemeContext';
import { withAlpha } from '../../common/utils/withAlpha';

type User = {
  displayName?: string;
  photoURL?: string;
  [key: string]: any;
};

type Props = {
  user: User | null;
};

export function ProfileScreenHeader({ user }: Props) {
  const { theme } = useTheme();
  const router = useRouter();
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  const hasPhoto = hasValidPhoto(user?.photoURL);

  // Overlay colors derived from existing tokens
  const overlayBg = 'rgba(0,0,0,0.92)';
  const overlayCloseBtnBg = 'rgba(255,255,255,0.15)';

  return (
    <>
      {/* Full Screen Photo Modal */}
      {hasPhoto && (
        <Modal
          visible={photoModalVisible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setPhotoModalVisible(false)}
        >
          <StatusBar backgroundColor={overlayBg} barStyle="light-content" />
          <Pressable
            style={{
              flex: 1,
              backgroundColor: overlayBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => setPhotoModalVisible(false)}
          >
            {/* Close button */}
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: theme.space.xxl,
                right: theme.space.md,
                width: theme.space.xl + theme.space.xs,
                height: theme.space.xl + theme.space.xs,
                borderRadius: theme.borderRadius.full,
                backgroundColor: overlayCloseBtnBg,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
              onPress={() => setPhotoModalVisible(false)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close"
                size={theme.fontSize.lg}
                color={theme.color.textInverse}
              />
            </TouchableOpacity>

            {/* Photo — inner Pressable stops backdrop close on photo tap */}
            <Pressable onPress={() => {}}>
              <Image
                source={{ uri: user!.photoURL }}
                style={{
                  width: theme.space.xxl * 7,
                  height: theme.space.xxl * 7,
                  borderRadius: theme.borderRadius.xl,
                }}
                resizeMode="contain"
              />
            </Pressable>

            {/* Name at bottom */}
            <View
              style={{
                position: 'absolute',
                bottom: theme.space.xxl + theme.space.md,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: theme.color.textInverse,
                  fontSize: theme.fontSize.lg,
                  fontFamily: theme.fontFamily.bold,
                  letterSpacing: 0.3,
                }}
              >
                {user?.displayName}
              </Text>
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Header */}
      <View style={{ position: 'relative' }}>
        <View
          style={{
            paddingVertical: theme.space.xxl,
            backgroundColor: theme.isDark ? theme.color.card : theme.color.accent,
          }}
        />

        {/* Edit button - left */}
        <TouchableOpacity
          onPress={() => router.push('/profile/updateProfile')}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            top: theme.space.md,
            left: theme.space.md,
            width: 38,
            height: 38,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: withAlpha(theme.color.border, 0.4),
            borderRadius: theme.borderRadius.full,
            backgroundColor: withAlpha(theme.color.background, 0.85),
          }}
        >
          <Feather
            name="edit-2"
            size={17}
            color={theme.color.textPrimary}
          />
        </TouchableOpacity>

        {/* Settings button - right */}
        <TouchableOpacity
          onPress={() => router.push('/profile/settingsScreen')}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            top: theme.space.md,
            right: theme.space.md,
            width: 38,
            height: 38,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: withAlpha(theme.color.border, 0.4),
            borderRadius: theme.borderRadius.full,
            backgroundColor: withAlpha(theme.color.background, 0.85),
          }}
        >
          <Feather
            name="settings"
            size={18}
            color={theme.color.textPrimary}
          />
        </TouchableOpacity>

        {/* Avatar — tappable if photo exists */}
        <TouchableOpacity
          activeOpacity={hasPhoto ? 0.85 : 1}
          onPress={() => hasPhoto && setPhotoModalVisible(true)}
          style={{
            position: 'absolute',
            bottom: -48,
            alignSelf: 'center',
            width: 96,
            height: 96,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderWidth: 4,
            borderColor: theme.color.background,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.card,
          }}
        >
          {hasPhoto ? (
            <Image
              source={{ uri: user!.photoURL }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: withAlpha(theme.color.accent, 0.15),
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  includeFontPadding: false,
                  color: theme.color.accent,
                  fontSize: theme.fontSize.xxxl,
                  fontWeight: theme.fontWeight.bold,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {user?.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}