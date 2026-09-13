import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { useTheme } from '../theme/ThemeContext';
import type { FriendSummary } from '../common/types/types';

type Props = {
  friend: FriendSummary;
  onPress: () => void;
  onMorePress: () => void;
};

export function FriendListItem({ friend, onPress, onMorePress }: Props) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.space.sm,
        paddingHorizontal: theme.space.xs,
      }}
    >
      <Avatar uri={friend.photoURL} name={friend.displayName} size={48} onPress={onPress} />

      <View style={{ flex: 1, marginLeft: theme.space.md }}>
        <Text
          numberOfLines={1}
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {friend.displayName}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: theme.space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <MaterialCommunityIcons name="shield-star" size={13} color={theme.color.accent} />
            <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>
              Lvl {friend.currentLevel}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <MaterialCommunityIcons name="fire" size={13} color={theme.color.warning} />
            <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>
              {friend.currentStreak}d
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <MaterialCommunityIcons name="star-circle" size={13} color={theme.color.info} />
            <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>
              {friend.epPoints} EP
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={onMorePress}
        style={{ padding: theme.space.xs }}
      >
        <MaterialCommunityIcons name="dots-horizontal" size={20} color={theme.color.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}