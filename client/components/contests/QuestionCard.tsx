import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


type QuestionCardProps = {
  subject?: string;
  difficulty: string;
  question: string;
  isBookmarked?: boolean;
  isFlagged?: boolean;
  onBookmark?: () => void;
  onFlag?: () => void;
};

export function QuestionCard({
  subject,
  difficulty,
  question,
  isBookmarked = false,
  isFlagged = false,
  onBookmark,
  onFlag,
}: QuestionCardProps) {
  const { theme } = useTheme();

  const getDifficultyColor = (diff?: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return theme.color.success;
      case 'medium': return theme.color.warning;
      case 'hard': return theme.color.error;
      default: return theme.color.accent;
    }
  };
  const diffColor = getDifficultyColor(difficulty);

  return (
    <View
      style={{
        gap: theme.space.md,
        padding: theme.space.md,
        borderWidth: 1,
        borderRadius: theme.borderRadius.xl,
        borderColor: isFlagged
          ? theme.color.error + '88'
          : isBookmarked ? theme.color.accent : theme.color.border,
        backgroundColor: theme.color.card,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
          {subject ? (
            <View
              style={{
                paddingVertical: theme.space.xs,
                paddingHorizontal: theme.space.sm,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.color.surface,
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.color.textSecondary,
                  fontFamily: theme.fontFamily.regular,
                }}
              >
                {subject}
              </Text>
            </View>
          ) : null}

          {difficulty ? (
            <View
              style={{
                paddingVertical: theme.space.xs,
                paddingHorizontal: theme.space.sm,
                borderWidth: 1,
                borderColor: diffColor + '55',
                borderRadius: theme.borderRadius.md,
                backgroundColor: diffColor + '18',
              }}
            >
              <Text
                style={{
                  color: diffColor,
                  textTransform: 'capitalize',
                  fontSize: theme.fontSize.xs,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {theme.i18n.t(`common.${difficulty.toLowerCase()}`  )}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={onBookmark}
            activeOpacity={0.7}
            hitSlop={6}
            accessibilityRole='button'
            accessibilityState={{ selected: isBookmarked }}
            accessibilityLabel={theme.i18n.t('contests.quizScreen.bookmark')}
            style={{
              padding: theme.space.xs,
              borderRadius: theme.borderRadius.md,
              backgroundColor: isBookmarked ? theme.color.accent + '18' : 'transparent',
            }}
          >
            <Feather
              name='bookmark'
              size={theme.fontSize.lg}
              color={isBookmarked ? theme.color.accent : theme.color.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onFlag}
            activeOpacity={0.7}
            hitSlop={6}
            accessibilityRole='button'
            accessibilityState={{ selected: isFlagged }}
            accessibilityLabel={theme.i18n.t('contests.quizScreen.flag')}
            style={{
              padding: theme.space.xs,
              borderRadius: theme.borderRadius.md,
              backgroundColor: isFlagged ? theme.color.error + '18' : 'transparent',
            }}
          >
            <Feather
              name='flag'
              size={theme.fontSize.lg}
              color={isFlagged ? theme.color.error : theme.color.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Text
        selectable
        style={{
          fontSize: theme.fontSize.md,
          color: theme.color.textPrimary,
          fontFamily: theme.fontFamily.regular,
          lineHeight: theme.fontSize.md * 1.25,
        }}
      >
        {question}
      </Text>
    </View>
  );
}
