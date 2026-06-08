import React, { useContext } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { CardView, ThemeContext } from 'react-native-boxes';

export type PerformanceTrendCardProps = {
  title: string;
  subtitle: string;
  data?: number[];
} & ViewStyle;

const defaultData = [20, 42, 34, 60, 48, 72, 55, 88];

export function PerformanceTrendCard({ title, subtitle, data = defaultData, ...style }: PerformanceTrendCardProps) {
  const theme = useContext(ThemeContext);
  const isDark = theme.name === 'dark';
  const maxValue = Math.max(...data, 1);

  return (
    <CardView
      style={[
        {
          borderRadius: theme.dimens.space.lg + theme.dimens.space.sm,
          overflow: 'hidden',
          borderWidth: 0,
          backgroundColor: isDark ? theme.colors.forground : theme.colors.accent,
          padding: theme.dimens.space.lg - theme.dimens.space.xs * 4,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)',
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={{ color: theme.colors.invert.text, fontSize: 18, fontWeight: '800' }}>{title}</Text>
          <Text style={{ marginTop: 4, color: isDark ? theme.colors.caption : theme.colors.invert.heading, fontSize: 11.5 }}>
            {subtitle}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: theme.colors.semitransparent }} />
          <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: theme.colors.semitransparent }} />
        </View>
      </View>

      <View
        style={{
          marginTop: 16,
          height: 140,
          borderRadius: 18,
          backgroundColor: isDark ? theme.colors.background : theme.colors.accentLight,
          paddingHorizontal: 10,
          paddingTop: 10,
          justifyContent: 'flex-end',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 112 }}>
          {data.map((value, index) => {
            const barHeight = Math.max((value / maxValue) * 92, 14);
            const barColor = isDark
              ? index % 2 === 0
                ? theme.colors.success
                : theme.colors.accentLight
              : index % 2 === 0
                ? theme.colors.invert.text
                : theme.colors.heading;

            return (
              <View key={index} style={{ alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                <View
                  style={{
                    width: 18,
                    height: barHeight,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4,
                    backgroundColor: barColor,
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>
    </CardView>
  );
}

export default PerformanceTrendCard;
