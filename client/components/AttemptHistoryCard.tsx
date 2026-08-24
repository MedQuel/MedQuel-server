import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '../theme/ThemeContext';

type Attempt = {
  id: string;
  title: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: string;
};

type Props = {
  attempts: Attempt[];
};

const calcPercentage = (correct: number, total: number) => (total > 0 ? Math.round((correct / total) * 100) : 0);
const isPassed = (pct: number) => pct >= 40;

function CircleProgress({ percentage, size = 52 }: { percentage: number; size?: number }) {
  const { theme } = useTheme();
  const strokeWidth = 4;
  const clamped = Math.max(0, Math.min(100, percentage));
  const progressColor = isPassed(clamped) ? theme.color.success : theme.color.error;
  const trackColor = theme.color.border;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="transparent" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <Text
        style={{
          color: progressColor,
          fontSize: theme.fontSize.sm,
          fontWeight: theme.fontWeight.bold,
          fontFamily: theme.fontFamily.number,
        }}
      >
        {clamped}%
      </Text>
    </View>
  );
}

export function AttemptHistoryCard({ attempts }: Props) {
  const { theme } = useTheme();

  return (
    <View style={{ gap: theme.space.md }}>
      {attempts.map(item => {
        const pct = calcPercentage(item.correctAnswers, item.totalQuestions);
        const result = isPassed(pct) ? 'Passed' : 'Failed';
        const resultColor = isPassed(pct) ? theme.color.success : theme.color.error;

        return (
          <View
            key={item.id}
            style={{
              padding: theme.space.md,
              borderRadius: theme.borderRadius.xl,
              borderWidth: 1,
              borderColor: theme.color.border,
              backgroundColor: theme.color.card,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, paddingRight: theme.space.md }}>
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
                    marginTop: 2,
                    color: theme.color.textMuted,
                    fontSize: theme.fontSize.xs,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {item.date}
                </Text>
              </View>

              <CircleProgress percentage={pct} />
            </View>

            <View
              style={{
                marginTop: theme.space.md,
                flexDirection: 'row',
                paddingTop: theme.space.sm,
                borderTopWidth: 1,
                borderTopColor: theme.color.border,
                flexWrap: 'wrap',
                gap: theme.space.lg,
              }}
            >
              {[
                { labelKey: 'components.AttemptHistoryCard.questions', value: String(item.totalQuestions) },
                { labelKey: 'components.AttemptHistoryCard.correct', value: String(item.correctAnswers), color: theme.color.success },
                { labelKey: 'components.AttemptHistoryCard.time', value: item.timeTaken },
                { labelKey: 'components.AttemptHistoryCard.result', value: result, color: resultColor },
              ].map(stat => (
                <View key={stat.labelKey}>
                  <Text
                    style={{
                      color: theme.color.textMuted,
                      fontSize: theme.fontSize.xs,
                      fontFamily: theme.fontFamily.regular,
                    }}
                  >
                    {theme.i18n.t(stat.labelKey)}
                  </Text>

                  <Text
                    style={{
                      marginTop: 2,
                      color: stat.color ?? theme.color.textPrimary,
                      fontSize: theme.fontSize.sm,
                      fontWeight: theme.fontWeight.bold,
                      fontFamily: theme.fontFamily.number,
                    }}
                  >
                    {stat.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}