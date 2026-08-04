import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { UserLevelChip } from '../../components/UserLevelChip';


function getAvatarLabel(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0]!.charAt(0).toUpperCase();

  return (words[0]!.charAt(0) + words[words.length - 1]!.charAt(0)).toUpperCase();
}


export function HomeHeader({ name, streak, level, onNotificationsPress }: {
  name: string;
  streak: number;
  level: number;
  onNotificationsPress?: () => void;
}) {
  const { theme } = useTheme();
  const avatarLabel = getAvatarLabel(name);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: theme.space.sm,
        paddingVertical: theme.space.md,
        paddingHorizontal: theme.space.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <LinearGradient
          colors={theme.isDark ? ['#4F7CFF', '#7C3AED'] : ['#5B7FFF', '#6D4CFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: theme.space.xxl,
            height: theme.space.xxl,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.borderRadius.full,
          }}
        >
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {avatarLabel}
          </Text>
        </LinearGradient>

        <View style={{ marginLeft: theme.space.sm }}>
          <Text
            numberOfLines={1}
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {name}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.space.xs * 0.5 }}>
            <Ionicons name='flame' size={theme.fontSize.md} color='#FF6723' />
            <Text
              style={{
                color: theme.color.warning,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.regular,
                marginLeft: theme.space.xs * 0.5,
              }}
            >
              {theme.i18n.t('home.dayStreak', { streak: streak })}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onNotificationsPress}
          style={{
            width: theme.space.xl + theme.space.xs,
            height: theme.space.xl + theme.space.xs,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.space.sm,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.color.card,
          }}
        >
          <Ionicons
            name='notifications-outline'
            size={theme.fontSize.md}
            color={theme.color.textSecondary}
          />
          <View
            style={{
              position: 'absolute',
              top: -(theme.space.xs * 0.5),
              right: -(theme.space.xs * 0.5),
              width: theme.space.sm,
              height: theme.space.sm,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: theme.color.background,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.error,
            }}
          />
        </TouchableOpacity>

        <UserLevelChip level={level} size='sm' />
      </View>
    </View>
  );
}
