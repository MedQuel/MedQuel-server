import { Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';

type Props = {
  month: number;
  year: number;
  activity: number[];
};

const resolveText = (translated: string, fallback: string) => {
  const value = String(translated ?? '').trim();
  return !value || value.includes('components.ActivityHeatmapCard') ? fallback : value;
};

const rgba = (hex: string, alpha: number) => {
  const n = hex.replace('#', '');
  const full = n.length === 3 ? n.split('').map(c => c + c).join('') : n.slice(0, 6);
  const i = parseInt(full, 16);

  // eslint-disable-next-line no-bitwise
  return `rgba(${(i >> 16) & 255}, ${(i >> 8) & 255}, ${i & 255}, ${alpha})`;
};

const monthName = (month: number) =>
  new Date(2025, month - 1, 1).toLocaleString('default', { month: 'long' });

export function ActivityHeatmapCard({ month, year, activity }: Props) {
  const { theme } = useTheme();

  const title = resolveText(
    theme.i18n.t('components.ActivityHeatmapCard.title'),
    'Activity Heatmap',
  );

  const less = resolveText(
    theme.i18n.t('components.ActivityHeatmapCard.less'),
    'Less',
  );

  const more = resolveText(
    theme.i18n.t('components.ActivityHeatmapCard.more'),
    'More',
  );

  const daysInMonth = new Date(year, month, 0).getDate();

  const cells = Array.from({ length: daysInMonth }, (_, i) => activity[i] ?? 0);

  const levelColor = (level: number) => {
    const alpha = [0.10, 0.22, 0.38, 0.58, 0.82][Math.max(0, Math.min(level, 4))] ?? 0.82;

    return rgba(theme.color.accent, alpha);
  };

  return (
    <View
      style={{
        padding: theme.space.md,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.color.border,
        backgroundColor: theme.color.card,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.space.md,
        }}
      >
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {monthName(month)}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 4,
        }}
      >
        {cells.map((level, index) => (
          <View
            key={index}
            style={{
              width: 20,
              height: 20,
              borderRadius: 3,
              backgroundColor: levelColor(level),
            }}
          />
        ))}
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 6,
          marginTop: theme.space.md,
        }}
      >
        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.xs,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {less}
        </Text>

        {[0, 1, 2, 3, 4].map(level => (
          <View
            key={level}
            style={{
              width: 20,
              height: 20,
              borderRadius: 3,
              backgroundColor: levelColor(level),
            }}
          />
        ))}

        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.xs,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {more}
        </Text>
      </View>
    </View>
  );
}