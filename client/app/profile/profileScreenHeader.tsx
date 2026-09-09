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
          style={{
            position: 'absolute',
            top: theme.space.md + 4,
            left: theme.space.md + 4,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.sm + 4,
            paddingHorizontal: theme.space.sm + 4,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.lg + 2,
            backgroundColor: theme.isDark
              ? theme.color.card
              : theme.color.textMuted + '33',
            boxShadow: theme.isDark
              ? '0 6px 14px rgba(0,0,0,0.2)'
              : '0 6px 14px rgba(0,0,0,0.05)',
          }}
        >
          <Feather
            name="edit-2"
            size={theme.space.md + 2}
            color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
          />
        </TouchableOpacity>

        {/* Settings button - right */}
        <TouchableOpacity
          onPress={() => router.push('/profile/settingsScreen')}
          style={{
            position: 'absolute',
            top: theme.space.md + 4,
            right: theme.space.md + 4,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.sm + 4,
            paddingHorizontal: theme.space.sm + 4,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.lg + 2,
            backgroundColor: theme.isDark
              ? theme.color.card
              : theme.color.textMuted + '33',
            boxShadow: theme.isDark
              ? '0 6px 14px rgba(0,0,0,0.2)'
              : '0 6px 14px rgba(0,0,0,0.05)',
          }}
        >
          <Feather
            name="settings"
            size={theme.space.md + 2}
            color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
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
            width: theme.space.xxl + 64,
            height: theme.space.xxl + 64,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderWidth: 4,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.premium + 'FF',
            boxShadow: theme.isDark
              ? '0 6px 14px rgba(0,0,0,0.2)'
              : '0 6px 14px rgba(0,0,0,0.05)',
          }}
        >
          {hasPhoto ? (
            <Image
              source={{ uri: user!.photoURL }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Text
              style={{
                lineHeight: 82,
                textAlign: 'center',
                includeFontPadding: false,
                color: theme.isDark
                  ? theme.color.textPrimary
                  : theme.color.textInverse,
                fontSize: theme.fontSize.xxl + 20,
                fontWeight: theme.fontWeight.bold,
              }}
            >
              {user?.displayName?.charAt(0)?.toUpperCase()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}