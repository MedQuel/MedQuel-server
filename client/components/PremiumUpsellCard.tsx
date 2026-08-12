import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';

export function PremiumUpsellCard({ onPress }: { onPress?: () => void }) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        gap: theme.space.sm + 2,
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.space.md,
        borderWidth: 1.5,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
        boxShadow: theme.isDark
          ? '0 6px 14px rgba(0,0,0,0.2)'
          : '0 6px 14px rgba(0,0,0,0.05)',
      }}
    >
      <View
        style={{
          width: theme.space.md + 22,
          height: theme.space.md + 17,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.borderRadius.sm + 4,
          backgroundColor: theme.isDark ? theme.color.border + 'AA' : '#ece3f9',
        }}
      >
        <MaterialCommunityIcons
          name='crown-outline'
          size={theme.space.md + 4}
          color={theme.color.premium + 'FF'}
        />
      </View>

      <View style={{ flex: 1, gap: theme.space.xs }}>
        <Text
          style={{
            letterSpacing: 0.1,
            color: theme.color.premium + 'FF',
            fontSize: theme.fontSize.sm + 1,
            fontWeight: theme.fontWeight.bold,
            fontFamily:theme.fontFamily.regular,
          }}
        >
          Upgrade to {theme.i18n.t('common.premium')}
        </Text>

        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.xs + 2,
            fontFamily: theme.fontFamily.regular,
            fontWeight:theme.fontWeight.bold,
          }}
        >
          {theme.i18n.t('common.start_contest')}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        disabled={!onPress}
        style={{
          paddingVertical: theme.space.xs + 4,
          paddingHorizontal: theme.space.sm + 4,
          borderRadius: theme.borderRadius.sm + 6,
          backgroundColor: theme.color.premium + 'AF',
        }}
      >
        <Text
          style={{
            letterSpacing: 0.2,
            color: theme.isDark ? theme.color.textPrimary + 'FF' : theme.color.textInverse,
            fontSize: theme.fontSize.xs + 2,
            fontWeight: theme.fontWeight.bold,
            fontFamily:theme.fontFamily.regular,
          }}
        >
          {theme.i18n.t('components.FeatureContestCard.join_now')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}