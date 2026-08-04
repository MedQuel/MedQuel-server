import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


type User = {
  displayName?: string;
  [key: string]: any;
};
type Props = {
  user: User | null;
};

export function ProfileScreenHeader({ user }: Props) {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={{ position: 'relative' }}>
      <View style={{ paddingVertical: theme.space.xxl, backgroundColor: theme.isDark ? theme.color.card : theme.color.accent }} />

      <TouchableOpacity
        onPress={() => router.push('/profile/settingsScreen')}
        style={{
          position: 'absolute',
          top: theme.space.md + 4,
          right: theme.space.md + 4,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: theme.space.sm + 4,
          paddingHorizontal: theme.space.sm + 4,
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.lg + 2,
          backgroundColor: theme.color.textMuted + 90,
          elevation: 3,
        }}
      >
        <Feather
          name='settings'
          size={theme.space.md + 2}
          color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
        />
      </TouchableOpacity>

      <View
        style={{
          position: 'absolute',
          bottom: -36,
          width: theme.space.xxl + 40,
          height: theme.space.xxl + 40,
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 4,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.color.premium + 'FF',
        }}
      >
        <Text
          style={{
            lineHeight: 66,
            textAlign: 'center',
            includeFontPadding: false,
            color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
            fontSize: theme.fontSize.xxl + 6,
            fontWeight: theme.fontWeight.bold,
          }}
        >
          {user?.displayName?.charAt(0)?.toUpperCase()}
        </Text>

        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: theme.space.lg * 1.1,
            height: theme.space.lg * 1.1,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.accent,
          }}
        >
          <Feather
            name='camera'
            size={theme.space.md * 0.85}
            color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
          />
        </View>
      </View>
    </View>
  );
}
