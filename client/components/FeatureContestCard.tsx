import React, { useContext } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { CardView, ThemeContext } from 'react-native-boxes';

export type FeatureContestCardProps = {
  title: string;
  subtitle: string;
  status: string;
  difficulty?: string;
} & ViewStyle;

export function FeatureContestCard({ title, subtitle, status, difficulty = 'Hard', ...style }: FeatureContestCardProps) {
  const theme = useContext(ThemeContext);
  const isDark = theme.name === 'dark';

  return (
    <CardView
      style={[
        {
          borderRadius: theme.dimens.space.lg + theme.dimens.space.sm,
          overflow: 'hidden',
          borderWidth: 0,
          backgroundColor: isDark ? theme.colors.forground : theme.colors.accent,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.14)',
        },
        style,
      ]}
    >
      <View style={{ flex: 1, padding: 18, justifyContent: 'space-between' }}>
        <View>
          <View
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: theme.colors.semitransparent,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: theme.colors.invert.text, fontSize: 11, fontWeight: '700' }}>{status}</Text>
          </View>

          <Text style={{ color: theme.colors.invert.text, fontSize: 21, fontWeight: '800', lineHeight: 26 }}>
            {title}
          </Text>

          <Text style={{ marginTop: 8, color: isDark ? theme.colors.caption : theme.colors.invert.heading, fontSize: 12 }}>
            {subtitle}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: theme.colors.semitransparent }}>
              <Text style={{ color: theme.colors.invert.text, fontSize: 11, fontWeight: '700' }}>Neon</Text>
            </View>
            <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: theme.colors.semitransparent }}>
              <Text style={{ color: theme.colors.invert.text, fontSize: 11, fontWeight: '700' }}>{difficulty}</Text>
            </View>
          </View>

          <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: theme.colors.invert.text }} />
        </View>
      </View>
    </CardView>
  );
}

export default FeatureContestCard;
