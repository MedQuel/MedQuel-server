import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Text, View, Modal, Image } from 'react-native';
import { Pressable, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { getInitials } from '../../common/utils/getInitials';


type Props = {
  uri?: string | null;
  name: string;
  size?: number;
  onPress?: () => void;
  ringColor?: string;
};

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
            <Image
              source={{ uri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode='cover'
            />
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

      {!onPress && (
        <Modal
          visible={previewVisible}
          transparent
          animationType='fade'
          onRequestClose={() => setPreviewVisible(false)}
        >
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
              style={{
                position: 'absolute',
                top: theme.space.xl,
                right: theme.space.lg,
                padding: theme.space.sm,
              }}
            >
              <Feather name='x' size={28} color={theme.color.textInverse} />
            </TouchableOpacity>

            {uri ? (
              <Image
                source={{ uri }}
                style={{
                  width: 280,
                  height: 280,
                  borderRadius: theme.borderRadius.xl,
                }}
                resizeMode='cover'
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
                <Text
                  style={{
                    color: theme.color.accent,
                    fontSize: 72,
                    fontWeight: theme.fontWeight.bold,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
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
