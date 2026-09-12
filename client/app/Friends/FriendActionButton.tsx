import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import type { UserSearchResult } from '../../common/types/types';

interface FriendActionButtonProps {
  item: UserSearchResult;
  isLoading: boolean;
  onSendRequest: (uid: string) => void;
}

export const FriendActionButton: React.FC<FriendActionButtonProps> = ({
  item,
  isLoading,
  onSendRequest,
}) => {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.actionLoaderWrapper}>
        <ActivityIndicator size="small" color={theme.color.accent} />
      </View>
    );
  }

  switch (item.relationshipStatus) {
    case 'FRIENDS':
      return (
        <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
          <MaterialCommunityIcons name="check-decagram" size={14} color="#10b981" />
          <Text style={[styles.badgeText, { color: '#10b981' }]}>Friends</Text>
        </View>
      );

    case 'REQUEST_SENT':
      return (
        <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
          <MaterialCommunityIcons name="clock-fast" size={14} color="#f59e0b" />
          <Text style={[styles.badgeText, { color: '#f59e0b' }]}>Pending</Text>
        </View>
      );

    case 'SELF':
      return (
        <View style={[styles.badge, { backgroundColor: 'rgba(148, 163, 184, 0.12)' }]}>
          <Text style={[styles.badgeText, { color: theme.color.textSecondary }]}>You</Text>
        </View>
      );

    case 'REQUEST_RECEIVED':
    case 'NONE':
    default:
      return (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.color.accent }]}
          onPress={() => onSendRequest(item.uid)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="account-plus-outline" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      );
  }
};

const styles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  badge: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionLoaderWrapper: {
    width: 70,
    alignItems: 'center',
  },
});