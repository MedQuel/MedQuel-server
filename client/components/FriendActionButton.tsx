import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import type { UserSearchResult } from '../common/types/types';


interface FriendActionButtonProps {
  item: UserSearchResult;
  isLoading: boolean;
  onSendRequest: (uid: string) => void;
}

export const FriendActionButton: React.FC<FriendActionButtonProps> = ({ item, isLoading, onSendRequest }) => {
  const { theme } = useTheme();

  const labelStyle = {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  } as const;

  if (isLoading) {
    return (
      <View style={{ width: 70, alignItems: 'center' }}>
        <ActivityIndicator size='small' color={theme.color.accent} />
      </View>
    );
  }

  switch (item.relationshipStatus) {
    case 'FRIENDS':
      return (
        <View
          style={{
            backgroundColor: `${theme.color.success}1F`,
            flexDirection: 'row',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 12,
            alignItems: 'center',
            gap: 4,
          }}
        >
          <MaterialCommunityIcons
            name='check-decagram'
            size={14}
            color={theme.color.success}
          />
          <Text style={[labelStyle, { color: theme.color.success }]}>
            {theme.i18n.t('friends.status.friends')}
          </Text>
        </View>
      );

    case 'REQUEST_SENT':
    case 'REQUEST_RECEIVED':
      return (
        <View
          style={{
            backgroundColor: `${theme.color.warning}1F`,
            flexDirection: 'row',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 12,
            alignItems: 'center',
            gap: 4,
          }}
        >
          <MaterialCommunityIcons name='clock-fast' size={14} color={theme.color.warning} />
          <Text style={[labelStyle, { color: theme.color.warning }]}>
            {theme.i18n.t(
              item.relationshipStatus === 'REQUEST_RECEIVED'
                ? 'friends.status.received'
                : 'friends.status.pending'
            )}
          </Text>
        </View>
      );

    case 'SELF':
      return (
        <View
          style={{
            backgroundColor: `${theme.color.textMuted}1F`,
            flexDirection: 'row',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 12,
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Text
            style={{
              color: theme.color.textSecondary,
              ...labelStyle,
            }}
          >
            {theme.i18n.t('common.you')}
          </Text>
        </View>
      );

    case 'NONE':
    default:
      return (
        <TouchableOpacity
          style={{
            backgroundColor: theme.color.accent,
            flexDirection: 'row',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            alignItems: 'center',
            gap: 4,
          }}
          onPress={() => onSendRequest(item.uid)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name='account-plus-outline'
            size={16}
            color={theme.color.textInverse}
          />
          <Text style={[labelStyle, { color: theme.color.textInverse }]}>
            {theme.i18n.t('friends.actions.add')}
          </Text>
        </TouchableOpacity>
      );
  }
};

