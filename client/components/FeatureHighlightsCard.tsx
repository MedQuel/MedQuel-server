import { Text, View } from 'react-native';
import { Feather, Ionicons, SimpleLineIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


export function FeatureHighlightsCard() {
  const { theme } = useTheme();
  const features = [
    {
      id: 1,
      label: theme.i18n.t('components.FeatureHighlightsCard.ep'),
      icon: (
        <Feather
          name='zap'
          size={theme.space.md + 4}
          color={theme.color.info}
        />
      ),
    },
    {
      id: 2,
      label: theme.i18n.t('components.FeatureHighlightsCard.contests'),
      icon: (
        <Ionicons
          name='trophy-outline'
          size={theme.space.md + 4}
          color={theme.color.warning}
        />
      ),
    },
    {
      id: 3,
      label: theme.i18n.t('components.FeatureHighlightsCard.streaks'),
      icon: (
        <SimpleLineIcons
          name='fire'
          size={theme.space.md + 4}
          color={theme.color.error}
        />
      ),
    },
    {
      id: 4,
      label: theme.i18n.t('components.FeatureHighlightsCard.ranks'),
      icon: (
        <Feather
          name='bar-chart-2'
          size={theme.space.md + 4}
          color={theme.color.success}
        />
      ),
    },
  ];


  return (
    <View
      style={{
        padding: theme.space.md,
        borderWidth: 2,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
      }}
    >
      <Text
        style={{
          color: theme.color.textPrimary,
          marginBottom: theme.space.md,
          fontWeight: 'bold',
          fontSize: theme.fontSize.lg,
          fontFamily: theme.fontFamily.text,
        }}
      >
        {theme.i18n.t('components.FeatureHighlightsCard.title')}
      </Text>

      <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
        {features.map((feature) => (
          <View
            key={feature.id}
            style={{
              flex: 1,
              flexDirection: 'column',
              gap: theme.space.sm * 0.5,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.space.sm,
              paddingHorizontal: theme.space.xs,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.color.surface,
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <View>{feature.icon}</View>
            <Text
              style={{
                textAlign: 'center',
                fontSize: theme.fontSize.xs,
                color: theme.color.textMuted,
              }}
            >
              {feature.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
