import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


export type ActionSheetOption = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  destructive?: boolean;
  onPress: () => void;
};
type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: ActionSheetOption[];
};


export function ActionSheet({ visible, onClose, title, options }: Props) {
  const { theme } = useTheme();

  const handleOptionPress = (option: ActionSheetOption) => {
    onClose();
    setTimeout(option.onPress, 50);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: theme.color.card,
            borderTopLeftRadius: theme.borderRadius.xl,
            borderTopRightRadius: theme.borderRadius.xl,
            paddingTop: theme.space.sm,
            paddingBottom: theme.space.xl,
            paddingHorizontal: theme.space.md,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.border,
              marginBottom: theme.space.md,
            }}
          />

          {title ? (
            <Text
              style={{
                color: theme.color.textMuted,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                marginBottom: theme.space.sm,
                paddingHorizontal: theme.space.xs,
              }}
            >
              {title}
            </Text>
          ) : null}

          {options.map((option) => (
            <TouchableOpacity
              key={option.key}
              activeOpacity={0.7}
              onPress={() => handleOptionPress(option)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: theme.space.md,
                paddingHorizontal: theme.space.xs,
                gap: theme.space.md,
              }}
            >
              <MaterialCommunityIcons
                name={option.icon}
                size={22}
                color={option.destructive ? theme.color.error : theme.color.textPrimary}
              />
              <Text
                style={{
                  fontSize: theme.fontSize.md,
                  fontFamily: theme.fontFamily.regular,
                  color: option.destructive ? theme.color.error : theme.color.textPrimary,
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

