import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import { withAlpha } from '../common/utils/withAlpha';

export function PremiumUpsellCard({ onPress }: { onPress?: () => void }) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        gap: theme.space.md,
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.space.md,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.borderRadius.lg,
          backgroundColor: withAlpha(theme.color.premium, 0.12),
          borderWidth: 1,
          borderColor: withAlpha(theme.color.premium, 0.25),
        }}
      >
        <MaterialCommunityIcons
          name='crown-outline'
          size={24}
          color={theme.color.premium}
        />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            color: theme.color.premium,
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          Upgrade to Premium
        </Text>

        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.xs,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          Unlock unlimited tests & in-depth analytics
        </Text>
      </View>

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        disabled={!onPress}
        style={{
          paddingVertical: theme.space.xs * 1.5,
          paddingHorizontal: theme.space.md,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.color.premium,
        }}
      >
        <Text
          style={{
            color: theme.color.textInverse,
            fontSize: theme.fontSize.xs,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {theme.i18n.t('common.pro') === 'pro' ? 'Upgrade' : theme.i18n.t('common.pro')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}