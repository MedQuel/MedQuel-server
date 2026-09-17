import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { View, Text, Image, Modal } from 'react-native';
import { Pressable, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { hasValidPhoto } from '../../common/utils/imageUrl';


type User = {
  displayName?: string;
  photoURL?: string;
  [key: string]: any;
};
type Props = {
  user: User | null;
};

export default function ProfileScreenHeader({ user }: Props) {
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const hasPhoto = hasValidPhoto(user?.photoURL);

  const router = useRouter();
  const { theme } = useTheme();

  return (
    <>
      {hasPhoto && (
        <Modal
          visible={photoModalVisible}
          transparent
          animationType='fade'
          statusBarTranslucent
          onRequestClose={() => setPhotoModalVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.92)',
            }}
            onPress={() => setPhotoModalVisible(false)}
          >
            <TouchableOpacity
              style={{
                zIndex: 10,
                position: 'absolute',
                top: theme.space.xxl,
                right: theme.space.md,
                width: theme.space.xl + theme.space.xs,
                height: theme.space.xl + theme.space.xs,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.borderRadius.full,
                backgroundColor: 'rgba(255,255,255,0.15)',
              }}
              onPress={() => setPhotoModalVisible(false)}
              activeOpacity={0.7}
            >
              <Ionicons
                name='close'
                size={theme.fontSize.lg}
                color={theme.color.textInverse}
              />
            </TouchableOpacity>

            <Pressable onPress={() => {}}>
              <Image
                source={{ uri: user!.photoURL }}
                style={{
                  width: theme.space.xxl * 7,
                  height: theme.space.xxl * 7,
                  borderRadius: theme.borderRadius.xl,
                }}
                resizeMode='contain'
              />
            </Pressable>

            <View style={{ position: 'absolute', bottom: theme.space.xxl + theme.space.md, alignItems: 'center' }}>
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

      <View style={{ position: 'relative' }}>
        <View
          style={{
            paddingVertical: theme.space.xxl,
            backgroundColor: theme.isDark ? theme.color.card : theme.color.accent,
          }}
        />

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
            backgroundColor: theme.isDark ? theme.color.card : theme.color.textMuted + '33',
            boxShadow: theme.isDark ? '0 6px 14px rgba(0,0,0,0.2)' : '0 6px 14px rgba(0,0,0,0.05)',
          }}
        >
          <Feather
            name='edit-2'
            size={theme.space.md + 2}
            color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
          />
        </TouchableOpacity>

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
            backgroundColor: theme.isDark ? theme.color.card : theme.color.textMuted + '33',
            boxShadow: theme.isDark ? '0 6px 14px rgba(0,0,0,0.2)' : '0 6px 14px rgba(0,0,0,0.05)',
          }}
        >
          <Feather
            name='settings'
            size={theme.space.md + 2}
            color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
          />
        </TouchableOpacity>

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
            boxShadow: theme.isDark ? '0 6px 14px rgba(0,0,0,0.2)' : '0 6px 14px rgba(0,0,0,0.05)',
          }}
        >
          {hasPhoto ? (
            <Image
              resizeMode='cover'
              source={{ uri: user!.photoURL }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <Text
              style={{
                lineHeight: 82,
                textAlign: 'center',
                includeFontPadding: false,
                color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
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
