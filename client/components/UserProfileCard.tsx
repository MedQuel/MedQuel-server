import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

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

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.space.sm * 1.25,
        paddingHorizontal: theme.space.md,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
      }}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 56,
            height: 56,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.borderRadius.full,
            backgroundColor: '#5852E8',
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: theme.fontSize.xxl,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {userData?.displayName?.charAt(0)?.toUpperCase()}
          </Text>
        </View>

        <View style={{ justifyContent: 'center', marginLeft: theme.space.md * 0.8 }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.md + 1,
              fontFamily: theme.fontFamily.bold,
              marginBottom: theme.space.xs * 0.5,
            }}
          >
            {userData?.displayName}
          </Text>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.regular,
              marginBottom: theme.space.xs,
            }}
          >
            {userData?.email}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 8,
                height: 8,
                marginRight: theme.space.xs * 1.5,
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.color.success,
              }}
            />
            <Text
              style={{
                color: theme.color.textMuted,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.number,
              }}
            >
              {theme.i18n.t('profile.settings.level', { level: userData?.currentLevel })}{' '}
              ·{' '}{theme.i18n.t('profile.settings.streak', { streak: userData?.currentStreak })}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        accessibilityLabel={theme.i18n.t('common.premium')}
      >
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.sm,
            paddingHorizontal: theme.space.sm * 1.5,
            borderWidth: 1,
            borderRadius: theme.borderRadius.xl,
            borderColor: theme.isDark ? '#2E2D5B' : 'transparent',
            backgroundColor: theme.isDark ? theme.color.premium + '22' : '#ece3fa',
          }}
        >
          <MaterialCommunityIcons
            name='crown-outline'
            size={theme.space.md * 1.25}
            color={theme.isDark ? '#8282FB' : '#5852E8'}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}
