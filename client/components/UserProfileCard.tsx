import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';

type UserData = {
  displayName?: string;
  email?: string;
  currentLevel?: number;
  currentStreak?: number;
  [key: string]: any;
};

type ProfilePropsCards = {
  userData: UserData | null;
};

export function UserProfileCard({ userData }: ProfilePropsCards) {
  const { theme } = useTheme();
  const { isDark } = theme;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.space.sm + 2,
        paddingHorizontal: theme.space.sm - 2,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.lg + 2,
        backgroundColor: isDark ? theme.color.card : theme.color.surface,
      }}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: theme.space.sm,
            paddingVertical: theme.space.sm,
            paddingHorizontal: theme.space.md + 2,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.accent + 'AF',
          }}
        >
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg + 6,
              fontWeight: theme.fontWeight.regular,
            }}
          >
            {userData?.displayName?.charAt(0)?.toUpperCase() || 'J'}
          </Text>
        </View>

        <View style={{ gap: theme.space.xs - 2, marginLeft: theme.space.md }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.md + 1,
              fontWeight: theme.fontWeight.bold,
            }}
          >
            {userData?.displayName}
          </Text>

          <Text style={{ color: theme.color.textSecondary, fontSize: theme.fontSize.sm + 1 }}>
            {userData?.email}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.space.xs * 0.5,
            }}
          >
            <View
              style={{
                marginRight: theme.space.xs * 1.5,
                paddingVertical: theme.space.xs,
                paddingHorizontal: theme.space.xs,
                backgroundColor: theme.color.success,
                borderRadius: theme.borderRadius.full,
              }}
            />

            <Text style={{ color: theme.color.textMuted, fontSize: theme.fontSize.sm }}>
              Lv{userData?.currentLevel} . {userData?.currentStreak} days streak
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        accessibilityLabel={theme.i18n.t('common.premium')}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: theme.space.xs * 0.5,
          paddingHorizontal: theme.space.xs * 0.5,
          borderRadius: theme.borderRadius.md,
        }}
      >
        <View
          style={{
            paddingVertical: theme.space.xs,
            paddingHorizontal: theme.space.md - 5,
            borderRadius: theme.borderRadius.md,
            backgroundColor: isDark ? theme.color.premium + '22' : '#cfbaf3',
          }}
        >
          <MaterialCommunityIcons
            name='crown-outline'
            size={theme.space.md}
            color={theme.color.premium + 'FF'}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}