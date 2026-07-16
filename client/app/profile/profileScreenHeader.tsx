import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


export function ProfileScreenHeader() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={{ position: 'relative', backgroundColor: theme.color.card }}>
      <View
        style={{
          paddingVertical: theme.space.xxl - 1,
          backgroundColor: theme.isDark ? theme.color.card : theme.color.accent,
        }}
      />

      <TouchableOpacity
        onPress={() => router.push('/profile/settingsScreen')}
        style={{
          position: 'absolute',
          top: theme.space.md + 4,
          right: theme.space.md + 4,
          paddingHorizontal: theme.space.sm + 4,
          paddingVertical: theme.space.sm + 4,
          borderRadius: theme.borderRadius.lg + 2, // square-ish box, full nahi
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.color.textMuted + 90,
          borderWidth: 1,
          borderColor: theme.color.border,
          elevation: 3,
        }}
      >
        <MaterialCommunityIcons
          name='cog-outline'
          size={theme.space.md + 2}
          color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
        />
      </TouchableOpacity>

      <View
        style={{
          width: theme.space.xxl + 40,
          height: theme.space.xxl + 40,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.color.premium + 'FF',
          position: 'absolute',
          bottom: -36,
          alignSelf: 'center',
          borderWidth: 4,
          borderColor: theme.color.border,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
            fontSize: theme.fontSize.xxl + 6,
            fontWeight: theme.fontWeight.bold,
            lineHeight: 66,
            textAlign: 'center',
            includeFontPadding: false,
          }}
        >
          J
        </Text>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            height: theme.space.lg,
            width: theme.space.lg,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.accent,
            borderWidth: 2,
            borderColor: theme.color.border,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MaterialCommunityIcons
            name='camera-outline'
            size={theme.space.md - 2}
            color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
          />
        </View>
      </View>
    </View>
  );
}