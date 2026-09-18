import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';

type Props = {
  onPress: () => void;
};

export function AddFriendButton({ onPress }: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
        padding: theme.space.md,
        gap: theme.space.md,
      }}
    >
      {/* Top Header: Icon & Text */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.space.md }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.isDark ? theme.color.surface : theme.color.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons
            name="account-group"
            size={26}
            color={theme.color.accent}
          />
        </View>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.md,
              fontFamily: theme.fontFamily.bold,
              fontWeight: theme.fontWeight.bold,
            }}
          >
            Friends
          </Text>
          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
              marginTop: theme.space.xs / 2,
              lineHeight: theme.fontSize.sm * theme.lineHeight.normal,
            }}
          >
            Find friends to compare progress and stay motivated.
          </Text>
        </View>
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.space.xs + 2,
          paddingVertical: theme.space.md - 2,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.color.accent,
        }}
      >
        <MaterialCommunityIcons
          name="account-plus"
          size={20}
          color="#FFFFFF"
        />
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: theme.fontSize.sm + 1,
            fontFamily: theme.fontFamily.bold,
            fontWeight: theme.fontWeight.bold,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          Add Friends
        </Text>
      </TouchableOpacity>
    </View>
  );
}