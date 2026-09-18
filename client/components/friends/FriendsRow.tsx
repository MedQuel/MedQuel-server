import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Avatar } from './Avatar';
import { useTheme } from '../../theme/ThemeContext';
import type { FriendSummary } from '../../common/types/types';

const AVATAR_SIZE = 56;

interface FriendsRowProps {
  friends: FriendSummary[];
  onViewAll: () => void;
  onFriendPress: (friend: FriendSummary) => void;
  onAddFriendPress?: () => void; // Added prop for Add Friend action
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
  const s = styles(theme);

  if (friends.length === 0) return null;

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>{title}</Text>
        <TouchableOpacity onPress={onViewAll} hitSlop={8}>
          <Text style={s.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* Add Friend Circle Button */}
        {onAddFriendPress ? (
          <TouchableOpacity
            style={s.item}
            onPress={onAddFriendPress}
            activeOpacity={0.7}
          >
            <View style={s.addButtonCircle}>
              <MaterialCommunityIcons name="plus" size={26} color={theme.color.accent} />
            </View>
            <Text style={s.addText} numberOfLines={1}>
              Add
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Existing Friends List */}
        {friends.map((friend) => (
          <TouchableOpacity
            key={friend.uid}
            style={s.item}
            onPress={() => onFriendPress(friend)}
            activeOpacity={0.7}
          >
            <Avatar
              uri={friend.photoURL}
              name={friend.displayName}
              size={AVATAR_SIZE}
              onPress={() => onFriendPress(friend)}
            />
            <Text style={s.name} numberOfLines={1}>
              {friend.displayName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: { paddingVertical: theme.space.md },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.space.sm,
    },
    title: { fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.md, color: theme.color.textPrimary },
    viewAll: { fontFamily: theme.fontFamily.regular, fontSize: theme.fontSize.sm, color: theme.color.accent },
    scrollContent: { gap: theme.space.md },
    item: { width: AVATAR_SIZE + 12, alignItems: 'center' },
    addButtonCircle: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: theme.color.surface,
      borderWidth: 1.5,
      borderColor: theme.color.accent,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
    },
    addText: {
      marginTop: theme.space.xs,
      fontFamily: theme.fontFamily.bold,
      fontSize: theme.fontSize.xs,
      color: theme.color.accent,
      textAlign: 'center',
    },
    name: {
      marginTop: theme.space.xs,
      fontFamily: theme.fontFamily.regular,
      fontSize: theme.fontSize.xs,
      color: theme.color.textSecondary,
      maxWidth: AVATAR_SIZE + 12,
      textAlign: 'center',
    },
  });