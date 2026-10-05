import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import type { Difficulty } from '../../common/types/types';


const TOTAL_STEPS = 5;
const DIFFICULTY_STEPS: Record<Difficulty, number> = {
  easy: 1,
  medium: 3,
  hard: 5,
};

export function ContestDifficultyCard({ difficulty }: { difficulty: Difficulty }) {
  const { theme } = useTheme();

  const filledSteps = DIFFICULTY_STEPS[difficulty];
  const difficultyColor: Record<Difficulty, string> = {
    easy: theme.color.success,
    medium: theme.color.warning,
    hard: theme.color.error,
  };
  const activeColor = difficultyColor[difficulty];

  return (
    <View
      accessible
      accessibilityLabel={`${theme.i18n.t('common.difficulty')}: ${theme.i18n.t(`common.${difficulty}`)}`}
      style={{
        gap: theme.space.sm,
        padding: theme.space.md,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.color.card,
      }}
    >
      <Text
        style={{
          fontSize: theme.fontSize.sm,
          color: theme.color.textSecondary,
          fontFamily: theme.fontFamily.regular,
        }}
      >
        {theme.i18n.t('common.difficulty')}
      </Text>

      <View style={{ gap: theme.space.xs, flexDirection: 'row' }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: theme.space.xs * 1.5,
              borderRadius: theme.borderRadius.full,
              backgroundColor: i < filledSteps
                ? activeColor
                : theme.isDark ? theme.color.surface : theme.color.border,
            }}
          />
        ))}
      </View>

      <Text
        style={{
          color: activeColor,
          fontSize: theme.fontSize.md,
          fontFamily: theme.fontFamily.bold,
        }}
      >
        {theme.i18n.t(`common.${difficulty}`)}
      </Text>
    </View>
  );
}
