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
        padding: theme.space.xs + 4,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.md + 4,
        backgroundColor: theme.color.card,
        elevation: 1,
      }}
    >
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: theme.space.md * 0.9,
          paddingHorizontal: theme.space.sm + 2,
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.md + 4,
          backgroundColor: bg,
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            color: color,
            fontSize: theme.fontSize.sm + 2,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.number,
            lineHeight: theme.fontSize.sm + 2.5,
            includeFontPadding: false,
          }}
        >
          {item.score}%
        </Text>
      </View>

      <View style={{ flex: 1, paddingLeft: theme.space.sm + 2 }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.sm * 1.1,
            fontWeight: theme.fontWeight.medium,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.xs,
            fontFamily: theme.fontFamily.regular,
            marginTop: theme.space.xs,
          }}
        >
          {item.time}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 3,
            height: 20,
            marginHorizontal: theme.space.sm,
            backgroundColor: theme.color.textMuted,
          }}
        />
        <Text
          style={{
            textAlign: 'right',
            color: color,
            fontSize: theme.fontSize.sm + 2,
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
    <View>
      {attempts.map((item, index) => (
        <View
          key={item.id}
          style={
            index < attempts.length-1 ? { marginBottom: theme.space.sm } : undefined
          }
        >
          <AttemptCard item={item} />
        </View>
      ))}
    </View>
  );
}
