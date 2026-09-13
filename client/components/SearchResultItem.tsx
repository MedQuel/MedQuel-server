import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Avatar } from './Avatar';
import { useTheme } from '../theme/ThemeContext';
import type { UserSearchResult } from '../common/types/types';

type Props = {
  user: UserSearchResult;
  busy?: boolean;
  onPress: () => void;          // navigate to their profile
  onAddFriend: () => void;
  onMorePress: () => void;
};

export function SearchResultItem({ user, busy, onPress, onAddFriend, onMorePress }: Props) {
  const { theme } = useTheme();

  const renderTrailingAction = () => {
    if (busy) return <ActivityIndicator size="small" color={theme.color.accent} />;

    switch (user.relationshipStatus) {
      case 'FRIENDS':
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: theme.borderRadius.full,
              backgroundColor: `${theme.color.success}20`,
            }}
          >
            <MaterialCommunityIcons name="account-check" size={14} color={theme.color.success} />
            <Text style={{ color: theme.color.success, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.bold, fontWeight: theme.fontWeight.bold }}>
              Friends
            </Text>
          </View>
        );
      case 'REQUEST_SENT':
        return (
          <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular }}>
            Requested
          </Text>
        );
      case 'REQUEST_RECEIVED':
        return (
          <Text style={{ color: theme.color.warning, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.bold, fontWeight: theme.fontWeight.bold }}>
            Respond
          </Text>
        );
      case 'SELF':
        return null;
      case 'NONE':
      default:
        return (
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onAddFriend}
            style={{
              width: 34,
              height: 34,
              borderRadius: theme.borderRadius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.color.accent,
            }}
          >
            <MaterialCommunityIcons name="account-plus" size={18} color={theme.color.textInverse} />
          </TouchableOpacity>
        );
    }
  };
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.space.sm, paddingHorizontal: theme.space.xs }}
    >
      <Avatar uri={user.photoURL} name={user.displayName} size={48} onPress={onPress} />

      <View style={{ flex: 1, marginLeft: theme.space.md }}>
        <Text
          numberOfLines={1}
          style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.bold }}
        >
          {user.displayName}
        </Text>
        <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular, marginTop: 2 }}>
          {user.targetExam}
        </Text>
      </View>

      <View style={{ marginRight: user.relationshipStatus === 'SELF' ? 0 : theme.space.sm }}>{renderTrailingAction()}</View>

      {user.relationshipStatus !== 'SELF' && (
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={onMorePress} style={{ padding: theme.space.xs }}>
          <MaterialCommunityIcons name="dots-horizontal" size={20} color={theme.color.textMuted} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}