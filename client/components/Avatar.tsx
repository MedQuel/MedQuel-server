import { useState } from 'react';
import { Image, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
type Props = {
  uri?: string | null;
  name: string;
  size?: number;
  onPress?: () => void; // if provided (e.g. navigate to profile), overrides the default preview behavior
  ringColor?: string;   // optional colored ring, e.g. to highlight premium users
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export function Avatar({ uri, name, size = 48, onPress, ringColor }: Props) {
  const { theme } = useTheme();
  const [previewVisible, setPreviewVisible] = useState(false);
  const handlePress = onPress ?? (() => setPreviewVisible(true));

  return (
    <>
      <TouchableOpacity activeOpacity={0.75} onPress={handlePress}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.color.surface,
            borderWidth: ringColor ? 2 : 0,
            borderColor: ringColor ?? 'transparent',
            overflow: 'hidden',
          }}
        >
          {uri ? (
            <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <Text
              style={{
                color: theme.color.accent,
                fontSize: size * 0.36,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {getInitials(name)}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Full-screen preview — only used when the caller didn't override onPress */}
      {!onPress && (
        <Modal visible={previewVisible} transparent animationType="fade" onRequestClose={() => setPreviewVisible(false)}>
          <Pressable
            onPress={() => setPreviewVisible(false)}
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.92)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TouchableOpacity
              onPress={() => setPreviewVisible(false)}
              style={{ position: 'absolute', top: theme.space.xl, right: theme.space.lg, padding: theme.space.sm }}
            >
              <Feather name="x" size={28} color={theme.color.textInverse} />
            </TouchableOpacity>

            {uri ? (
              <Image
                source={{ uri }}
                style={{ width: 280, height: 280, borderRadius: theme.borderRadius.xl }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 110,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.color.surface,
                }}
              >
                <Text style={{ color: theme.color.accent, fontSize: 72, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.bold }}>
                  {getInitials(name)}
                </Text>
              </View>
            )}

            <Text
              style={{
                marginTop: theme.space.md,
                color: theme.color.textInverse,
                fontSize: theme.fontSize.lg,
                fontWeight: theme.fontWeight.bold,
                fontFamily: theme.fontFamily.bold,
              }}
            >
              {name}
            </Text>
          </Pressable>
        </Modal>
      )}
    </>
  );
}