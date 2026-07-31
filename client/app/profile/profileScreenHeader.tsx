import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity  } from 'react-native';
import { userApi } from "@/common/api/api";

import { useTheme } from '../../theme/ThemeContext';
import { useState , useEffect } from 'react';


export function ProfileScreenHeader() {
  const { theme } = useTheme();
  const router = useRouter();
  const [user,setUser] = useState<any>(null)
 

  const loadUser = async () => {
  try {
   

    const response = await userApi.getMe();

    setUser(response);

    // console.log(response);
  } catch (error) {
   
    console.log(error)
  } 
};

useEffect(() => {
  loadUser();
}, []);

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
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: theme.space.sm + 4,
          paddingHorizontal: theme.space.sm + 4,
          borderWidth: 1,
          borderRadius: theme.borderRadius.lg + 2,
          backgroundColor: theme.color.textMuted + 90,
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
          {user?.displayName?.charAt(0)?.toUpperCase() || 'J'}
        </Text>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            height: theme.space.lg,
            width: theme.space.lg,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.color.accent,
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
