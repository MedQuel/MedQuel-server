import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { withAlpha } from '../common/utils/withAlpha';

type Attempt = {
  id: string;
  title: string;
  time: string;
  score: number;
};
type Props = {
  attempts: Attempt[];
};

function getScoreColor(score: number, theme: any): string {
  if (score >= 80) return theme.color.success;
  if (score >= 70) return theme.color.warning;
  return theme.color.error;
}

function getScoreBg(score: number, theme: any): string {
  if (score >= 80) return withAlpha(theme.color.success, 0.12);
  if (score >= 70) return withAlpha(theme.color.warning, 0.12);
  return withAlpha(theme.color.error, 0.12);
}

function AttemptCard({ item }: { item: Attempt }) {
  const { theme } = useTheme();
  const bg = getScoreBg(item.score, theme);
  const color = getScoreColor(item.score, theme);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.space.md,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
        gap: theme.space.md,
      }}
    >
      <View
        style={{
          width: 50,
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: withAlpha(color, 0.25),
          borderRadius: theme.borderRadius.lg,
          backgroundColor: bg,
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            color: color,
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.number,
            includeFontPadding: false,
          }}
        >
          {item.score.toFixed(0)}%
        </Text>
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <Text
          numberOfLines={1}
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.xs,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {item.time}
        </Text>
      </View>

      <View
        style={{
          paddingVertical: theme.space.xs * 0.75,
          paddingHorizontal: theme.space.sm,
          borderRadius: theme.borderRadius.full,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: withAlpha(color, 0.25),
        }}
      >
        <Text
          style={{
            color: color,
            fontSize: theme.fontSize.xs,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {item.score >= 70 ? 'Passed' : 'Review'}
        </Text>
      </View>
    </View>
  );
}

export function AttemptHistoryItemCard({ attempts }: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        gap: theme.space.sm,
        flexDirection: 'column',
      }}
    >
      {attempts.map((item) => (
        <AttemptCard key={item.id} item={item} />
      ))}
    </View>
  );
}