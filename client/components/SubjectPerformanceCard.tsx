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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
        <MaterialCommunityIcons
          name='pulse'
          size={theme.space.md * 1.5}
          color={theme.color.accent}
        />
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
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
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.regular,
            paddingVertical: theme.space.sm,
          }}
        >
          {theme.i18n.t('profile.noSubjectData')}
        </Text>
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
                      boxShadow: `0 0 12px ${scoreColor}45`,
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