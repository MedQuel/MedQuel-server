import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Avatar } from './Avatar';
import { useTheme } from '../../theme/ThemeContext';
import type { FriendSummary } from '../../common/types/types';

const AVATAR_SIZE = 56;

interface FriendsRowProps {
  friends: FriendSummary[];
  onViewAll: () => void;
  onFriendPress: (friend: FriendSummary) => void;
  onAddFriendPress?: () => void; 
  title?: string;
}

export function FriendsRow({
  friends,
  onViewAll,
  onFriendPress,
  onAddFriendPress,
  title = 'Friends',
}: FriendsRowProps) {
  const { theme } = useTheme();

  if (friends.length === 0) return null;

  return (
    <View style={{ paddingVertical: theme.space.md }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.space.sm,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.fontSize.md,
            color: theme.color.textPrimary,
          }}
        >
          {title}
        </Text>
        <TouchableOpacity onPress={onViewAll} hitSlop={8}>
          <Text
            style={{
              fontFamily: theme.fontFamily.regular,
              fontSize: theme.fontSize.sm,
              color: theme.color.accent,
            }}
          >
            {theme.i18n.t('common.view_all')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.space.md }}
      >
        {/* Add Friend Circle Button */}
        {onAddFriendPress ? (
          <TouchableOpacity
            style={{ width: AVATAR_SIZE + 12, alignItems: 'center' }}
            onPress={onAddFriendPress}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                backgroundColor: theme.color.surface,
                borderWidth: 1.5,
                borderColor: theme.color.accent,
                borderStyle: 'dashed',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="plus" size={26} color={theme.color.accent} />
            </View>
            <Text
              style={{
                marginTop: theme.space.xs,
                fontFamily: theme.fontFamily.bold,
                fontSize: theme.fontSize.xs,
                color: theme.color.accent,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              Add
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Existing Friends List */}
        {friends.map((friend) => (
          <TouchableOpacity
            key={friend.uid}
            style={{ width: AVATAR_SIZE + 12, alignItems: 'center' }}
            onPress={() => onFriendPress(friend)}
            activeOpacity={0.7}
          >
            <Avatar
              uri={friend.photoURL}
              name={friend.displayName}
              size={AVATAR_SIZE}
              onPress={() => onFriendPress(friend)}
            />
            <Text
              style={{
                marginTop: theme.space.xs,
                fontFamily: theme.fontFamily.regular,
                fontSize: theme.fontSize.xs,
                color: theme.color.textSecondary,
                maxWidth: AVATAR_SIZE + 12,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {friend.displayName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}