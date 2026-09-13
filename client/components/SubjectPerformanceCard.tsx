import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import { withAlpha } from '../common/utils/withAlpha';


type SubjectItem = {
  name: string;
  score: number;
};
type PerformanceBySubjectProps = {
  subjects: SubjectItem[];
};

function getScoreColor(score: number, theme: any): string {
  if (score >= 90) return theme.color.success;
  if (score > 80) return theme.color.accent;
  if (score >= 70) return theme.color.warning;
  if (score > 60) return theme.color.premium;
  return theme.color.error;
}


export function SubjectPerformanceCard({ subjects }: PerformanceBySubjectProps) {
  const { theme } = useTheme();

  const titleText = theme.i18n.t('profile.performanceBySubject');
  const emptyTitle = theme.i18n.t('profile.noSubjectData');

  return (
    <View
      style={{
        gap: theme.space.md,
        flexDirection: 'column',
        padding: theme.space.md,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
        <MaterialCommunityIcons
          name='pulse'
          size={20}
          color={theme.color.accent}
        />
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {titleText === 'performanceBySubject' ? 'Performance by Subject' : titleText}
        </Text>
      </View>

      {subjects.length === 0 ? (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.lg,
            paddingHorizontal: theme.space.md,
            gap: theme.space.xs,
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: theme.borderRadius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: withAlpha(theme.color.accent, 0.12),
              borderWidth: 1,
              borderColor: withAlpha(theme.color.accent, 0.25),
              marginBottom: theme.space.xs,
            }}
          >
            <MaterialCommunityIcons
              name="chart-timeline-variant"
              size={26}
              color={theme.color.accent}
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.bold,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {emptyTitle === 'noSubjectData' ? 'No subject data available' : emptyTitle}
          </Text>
        </View>
      ) : (
        <View style={{ gap: theme.space.md * 0.8 }}>
          {subjects.map((item, index) => {
            const scoreColor = getScoreColor(item.score, theme);
            return (
              <View key={`${index}-${item.name}`}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: theme.space.sm,
                  }}
                >
                  <Text
                    style={{
                      color: theme.color.textSecondary,
                      fontSize: theme.fontSize.xs + 1,
                      fontWeight: theme.fontWeight.bold,
                      fontFamily: theme.fontFamily.regular,
                    }}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={{
                      color: scoreColor,
                      fontSize: theme.fontSize.xs * 1.05,
                      fontWeight: theme.fontWeight.bold,
                      fontFamily: theme.fontFamily.number,
                    }}
                  >
                    {item.score}%
                  </Text>
                </View>

                <View
                  style={{
                    overflow: 'hidden',
                    height: theme.space.sm,
                    borderRadius: theme.borderRadius.full,
                    backgroundColor: theme.color.border,
                  }}
                >
                  <View
                    style={{
                      width: `${item.score}%`,
                      height: '100%',
                      borderRadius: theme.borderRadius.full,
                      backgroundColor: scoreColor,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}