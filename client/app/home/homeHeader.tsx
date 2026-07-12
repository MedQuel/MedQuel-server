import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../theme/ThemeContext';

export function HomeHeader({
  name,
  streak,
  level,
  initial,
}: {
  name: string;
  streak: number;
  level: number;
  initial: string;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.space.md,
        paddingVertical: theme.space.md,
        paddingBottom: theme.space.sm,
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
            borderRadius: theme.borderRadius.full,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.lg, fontFamily: theme.fontFamily.bold }}>
            {initial}
          </Text>
        </LinearGradient>

        <View style={{ marginLeft: theme.space.sm }}>
          <Text numberOfLines={1} style={{ color: theme.color.textPrimary, fontSize: theme.fontSize.lg, fontFamily: theme.fontFamily.bold }}>
            {name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.space.xs * 0.5 }}>
           <Ionicons name="flame" size={theme.fontSize.md} color="#FF6723" />
            <Text style={{ marginLeft: theme.space.xs * 0.5, color: theme.color.warning, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.regular }}>
              {`${streak} ${theme.i18n.t('Day Streak')}`}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            width: theme.space.xl + theme.space.xs,
            height: theme.space.xl + theme.space.xs,
            borderRadius: theme.borderRadius.lg,
            borderWidth: 1,
            borderColor: theme.color.border,
            backgroundColor: theme.color.card,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.space.sm,
          }}
        >
          <Ionicons
            name="notifications-outline"
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
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.color.error,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: theme.color.background,
            }}
          />
        </TouchableOpacity>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.space.sm,
            paddingVertical: theme.space.xs,
            borderRadius: theme.borderRadius.full,
            borderWidth: 1,
            borderColor: theme.color.border,
            backgroundColor: theme.color.surface,
          }}
        >
          <Ionicons
            name="star"
            size={theme.fontSize.sm}
            color={theme.color.warning}
          />
          <Text
            style={{
              marginLeft: theme.space.xs,
              color: theme.color.accent,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {`${theme.i18n.t('Lv')} ${level}`}
          </Text>
        </View>
      </View>
    </View>
  );
}