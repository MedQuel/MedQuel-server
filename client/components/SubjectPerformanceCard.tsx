import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


type SubjectItem = {
  name: string;
  score: number;
};
type PerformanceBySubjectProps = {
  subjects: SubjectItem[];
};

function getScoreColor(score: number, theme: any): string {
  if (score >= 90) return theme.color.success + 'FF';
  if (score > 80 && score < 90) return theme.color.accent;
  if (score >= 70 && score < 80) return theme.color.warning + 'AA';
  if (score < 70 && score > 60) return theme.color.premium;
  return theme.color.error;
}


export function SubjectPerformanceCard({ subjects }: PerformanceBySubjectProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        paddingTop: theme.space.md * 0.75,
        paddingBottom: theme.space.md * 1.2,
        paddingHorizontal: theme.space.md * 0.9,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.lg + 4,
        backgroundColor: theme.color.card,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: theme.space.xs }}>
        <MaterialCommunityIcons
          name='pulse'
          size={theme.space.md * 1.5}
          color={theme.color.accent}
        />
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.sm + 2,
            fontFamily: theme.fontFamily.bold,
            paddingLeft: theme.space.sm,
          }}
        >
          {theme.i18n.t('profile.performanceBySubject')}
        </Text>
      </View>

      {subjects.length === 0 ? (
        <Text
          style={{
            textAlign: 'center',
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.xs + 2,
            fontWeight: theme.fontWeight.medium,
            fontFamily: theme.fontFamily.regular,
            paddingVertical: theme.space.sm,
          }}
        >
          {theme.i18n.t('profile.noSubjectData')}
        </Text>
      ) : (
        subjects.map((item, index) => {
          const scoreColor = getScoreColor(item.score, theme);
          return (
            <View
              key={`${index}-${item.name}`}
              style={{ paddingBottom: index === subjects.length-1 ? 0 : theme.space.xs * 1.5, }}
            >
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
                    fontSize: theme.fontSize.xs + 2,
                    fontFamily: theme.fontFamily.regular,
                  }}
                >
                  {item.name}
                </Text>

                <View
                  style={{
                    paddingVertical: theme.space.xs,
                    paddingHorizontal: theme.space.xs + 2,
                    borderRadius: theme.borderRadius.full,
                  }}
                >
                  <Text
                    style={{
                      color: scoreColor,
                      fontSize: theme.fontSize.xs + 2,
                      fontWeight: theme.fontWeight.bold,
                      fontFamily: theme.fontFamily.number,
                    }}
                  >
                    {item.score}%
                  </Text>
                </View>
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
        })
      )}
    </View>
  );
}
