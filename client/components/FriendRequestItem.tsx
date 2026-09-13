import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Avatar } from './Avatar';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  displayName: string;
  photoURL?: string | null;
  busy?: boolean;
  onPress: () => void;   // view their profile
  onAccept: () => void;
  onDecline: () => void;
};

export function FriendRequestItem({ displayName, photoURL, busy, onPress, onAccept, onDecline }: Props) {
  const { theme } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.space.sm, paddingHorizontal: theme.space.xs }}>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Avatar uri={photoURL} name={displayName} size={48} onPress={onPress} />
        <View style={{ marginLeft: theme.space.md, flex: 1 }}>
          <Text numberOfLines={1} style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, fontFamily: theme.fontFamily.bold }}>
            {displayName}
          </Text>
          <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.xs, fontFamily: theme.fontFamily.regular, marginTop: 2 }}>
            wants to be friends
          </Text>
        </View>
      </TouchableOpacity>

      {busy ? (
        <ActivityIndicator size="small" color={theme.color.accent} style={{ marginLeft: theme.space.sm }} />
      ) : (
        <View style={{ flexDirection: 'row', gap: theme.space.sm, marginLeft: theme.space.sm }}>
          <TouchableOpacity
            onPress={onDecline}
            style={{
              width: 34, height: 34, borderRadius: theme.borderRadius.full,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.border,
            }}
          >
            <MaterialCommunityIcons name="close" size={18} color={theme.color.error} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAccept}
            style={{
              width: 34, height: 34, borderRadius: theme.borderRadius.full,
              alignItems: 'center', justifyContent: 'center', backgroundColor: theme.color.success,
            }}
          >
            <MaterialCommunityIcons name="check" size={18} color={theme.color.textInverse} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}