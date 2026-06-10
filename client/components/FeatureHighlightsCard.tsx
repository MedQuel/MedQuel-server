import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons, Ionicons, SimpleLineIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function FeatureHighlightsCard() {
  const { theme } = useTheme();
  const { color, space, fontSize, fontWeight, borderRadius, fontFamily, i18n, isDark } = theme;

  const features = [
    {
      id: 1,
      label: i18n.t('components.FeatureHighlightsCard.earn_ep'),
      icon: <MaterialCommunityIcons name="lightning-bolt-outline" size={fontSize.xxl} color={color.accent} />,
    },
    {
      id: 2,
      label: i18n.t('components.FeatureHighlightsCard.win_contests'),
      icon: <Ionicons name="trophy-outline" size={fontSize.xl} color={color.warning} />,
    },
    {
      id: 3,
      label: i18n.t('components.FeatureHighlightsCard.build_streaks'),
      icon: <SimpleLineIcons name="fire" size={fontSize.xl} color={color.error} />,
    },
    {
      id: 4,
      label: i18n.t('components.FeatureHighlightsCard.climb_ranks'),
      icon: <Ionicons name="bar-chart-outline" size={fontSize.xl} color={color.success} />,
    },
  ];

  return (
    <View
      style={{
        backgroundColor: color.surface,
        borderRadius: borderRadius.xl,
        padding: space.md,
        borderWidth: 1,
        borderColor: color.border,
      }}
    >
      <Text
        style={{
          fontSize: fontSize.lg,
          fontWeight: fontWeight.bold.toString() as any,
          color: isDark ? '#FFFFFF' : '#0F172A',
          marginBottom: space.md,
          fontFamily: fontFamily.text,
          letterSpacing: -0.3,
        }}
      >
        {i18n.t('components.FeatureHighlightsCard.title')}
      </Text>

      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {features.map((feature) => (
          <View
            key={feature.id}
            style={{
              backgroundColor: color.card,
              borderRadius: borderRadius.md,
              paddingVertical: space.sm,
              paddingHorizontal: space.xs,
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            } as any}
          >
            <View style={{ marginBottom: space.xs, alignItems: 'center' }}>
              {feature.icon}
            </View>
            <Text
              style={{
                fontSize: fontSize.xs,
                fontWeight: fontWeight.medium.toString() as any,
                color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.55)',
                textAlign: 'center',
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