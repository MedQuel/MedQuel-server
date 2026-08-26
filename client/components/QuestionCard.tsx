import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';

export type QuestionCardProps = {
  subject?: string;
  difficulty?: string;
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
      case 'easy':
        return theme.color.success;
      case 'medium':
        return theme.color.warning;
      case 'hard':
        return theme.color.error;
      default:
        return theme.color.accent;
    }
  };

  const diffColor = getDifficultyColor(difficulty);

  return (
    <View
      style={{
        padding: theme.space.md,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: isBookmarked ? theme.color.accent : theme.color.border,
        backgroundColor: theme.color.card,
        gap: theme.space.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
          {subject ? (
            <View
              style={{
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.xs,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.color.surface,
              }}
            >
              <Text
                style={{
                  color: theme.color.textSecondary,
                  fontSize: theme.fontSize.sm,
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
                paddingHorizontal: theme.space.sm,
                paddingVertical: theme.space.xs,
                borderRadius: theme.borderRadius.full,
                borderWidth: 1,
                borderColor: diffColor + '55',
                backgroundColor: diffColor + '18',
              }}
            >
              <Text
                style={{
                  color: diffColor,
                  fontSize: theme.fontSize.xs,
                  fontFamily: theme.fontFamily.bold,
                  textTransform: 'capitalize',
                }}
              >
                {difficulty}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
          <TouchableOpacity
            onPress={onBookmark}
            activeOpacity={0.7}
            style={{
              padding: theme.space.xs,
              borderRadius: theme.borderRadius.md,
              backgroundColor: isBookmarked ? theme.color.accent + '18' : 'transparent',
            }}
          >
            <Feather
              name="bookmark"
              size={theme.fontSize.lg}
              color={isBookmarked ? theme.color.accent : theme.color.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onFlag}
            activeOpacity={0.7}
            style={{
              padding: theme.space.xs,
              borderRadius: theme.borderRadius.md,
              backgroundColor: isFlagged ? theme.color.error + '18' : 'transparent',
            }}
          >
            <Feather
              name="flag"
              size={theme.fontSize.lg}
              color={isFlagged ? theme.color.error : theme.color.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Text
        style={{
          color: theme.color.textPrimary,
          fontSize: theme.fontSize.md,
          fontFamily: theme.fontFamily.regular,
          lineHeight: theme.fontSize.md * theme.lineHeight.normal,
        }}
      >
        {question}
      </Text>
    </View>
  );
}