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
        paddingVertical: theme.space.sm + 5,
        paddingHorizontal: theme.space.lg + 2,
        borderWidth: 1.5,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.color.card,
        boxShadow: `0 2px 8px ${theme.color.premium}1F`,
        elevation: 3,
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

      <View style={{ flex: 1, gap: theme.space.xs * 0.5 }}>
        <Text
          style={{
            letterSpacing: 0.1,
            color: theme.color.premium + 'FF',
            fontSize: theme.fontSize.sm + 1,
            fontWeight: theme.fontWeight.bold,
          }}
        >
          Upgrade to {theme.i18n.t('common.premium')}
        </Text>

        <Text
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.xs + 2,
            fontWeight: theme.fontWeight.regular,
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
          }}
        >
          {theme.i18n.t('components.FeatureContestCard.join_now')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
