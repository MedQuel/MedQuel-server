import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

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
      {/* Top row — icon + text */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
        <View
          style={{
            width: theme.space.xxl + 8,
            height: theme.space.xxl + 8,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.accent + '22',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons
            name="account-group"
            size={theme.fontSize.xl}
            color={theme.color.accent}
          />
        </View>

        <View style={{ flex: 1 }}>
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
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
              marginTop: theme.space.xs * 0.5,
            }}
          >
            Find friends to compare progress and stay motivated.
          </Text>
        </View>
      </View>

      {/* Full width button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.space.sm,
          paddingVertical: theme.space.sm + 2,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.color.accent,
        }}
      >
        <MaterialCommunityIcons
          name="account-plus"
          size={theme.fontSize.md}
          color={theme.color.textInverse}
        />
        <Text
          style={{
            color: theme.color.textInverse,
            fontSize: theme.fontSize.md,
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