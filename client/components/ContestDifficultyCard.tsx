import { View, Text } from 'react-native';

import { useTheme } from '../theme/ThemeContext';


type Difficulty =  'easy' | 'intermediate' | 'hard' ;

type ContestDifficultyCardProps = {
  difficulty: Difficulty;
};

const DIFFICULTY_STEPS: Record<Difficulty, number> = {

  easy: 1,
  intermediate: 3,
  hard: 5,
};

const TOTAL_STEPS = 5;

export function ContestDifficultyCard({ difficulty }: ContestDifficultyCardProps) {
  const { theme } = useTheme();

  const filledSteps = DIFFICULTY_STEPS[difficulty];

  const difficultyColor: Record<Difficulty, string> = {
    easy: theme.color.success,
    intermediate: theme.color.warning,
    hard: theme.color.error,
  };

  const activeColor = difficultyColor[difficulty];

  return (
    <View
      style={{
        padding: theme.space.md,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.color.border,
        backgroundColor: theme.color.card,
        gap: theme.space.sm,
      }}
    >
      <Text
        style={{
          color: theme.color.textSecondary,
          fontSize: theme.fontSize.sm,
          fontFamily: theme.fontFamily.regular,
        }}
      >
        {theme.i18n.t('components.ContestDifficultyCard.label')}
      </Text>

      <View style={{ flexDirection: 'row', gap: theme.space.xs }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: theme.borderRadius.full,
              backgroundColor: i < filledSteps
                ? activeColor
                : theme.isDark
                  ? theme.color.surface
                  : theme.color.border,
            }}
          />
        ))}
      </View>

      <Text
        style={{
          color: activeColor,
          fontSize: theme.fontSize.md,
          fontWeight: theme.fontWeight.bold as any,
          fontFamily: theme.fontFamily.regular,
        }}
      >
        {theme.i18n.t(`components.ContestDifficultyCard.${difficulty}`)}
      </Text>
    </View>
  );
}

export default ContestDifficultyCard;