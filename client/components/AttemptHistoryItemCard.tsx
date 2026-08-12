import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';


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
  if (score >= 80) return theme.color.success + 'FF';
  if (score >= 70) return theme.color.warning + 'AA';
  return theme.color.error;
}
function getScoreBg(score: number, theme: any): string {
  if (score >= 80) return theme.color.success + '22';
  if (score >= 70) return theme.color.warning + '22';
  return theme.color.error + '22';
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
        padding: theme.space.sm + 6,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.md + 6,
        backgroundColor: theme.color.card,
      }}
    >
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: theme.space.md * 1.1,
          paddingHorizontal: theme.space.sm + 6,
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.md + 6,
          backgroundColor: bg,
          minWidth: 72,
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            color: color,
            fontSize: theme.fontSize.md + 2,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.number,
            lineHeight: theme.fontSize.md + 4,
            includeFontPadding: false,
          }}
        >
          {item.score}%
        </Text>
      </View>

      <View style={{ flex: 1, paddingLeft: theme.space.sm + 6 }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.regular,
            marginTop: theme.space.xs + 1,
          }}
        >
          {item.time}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 3,
            height: 24,
            marginHorizontal: theme.space.sm + 2,
            backgroundColor: theme.color.textMuted,
          }}
        />
        <Text
          style={{
            textAlign: 'right',
            color: color,
            fontSize: theme.fontSize.md + 2,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.number,
          }}
        >
          {item.score}%
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
        gap: theme.space.md,
        flexDirection: 'column',
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
      {attempts.map((item, index) => (
        <View
          key={item.id}
          style={
            index < attempts.length - 1
              ? {
                  paddingBottom: theme.space.md * 0.8,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.color.border,
                }
              : undefined
          }
        >
          <AttemptCard item={item} />
        </View>
      ))}
    </View>
  );
}