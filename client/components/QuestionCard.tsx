import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';


type QuestionCardProps = {
  subject: string;
  question: string;
  isBookmarked?: boolean;
  isFlagged?: boolean;
  onBookmark?: () => void;
  onFlag?: () => void;
};

export function QuestionCard({
  subject,
  question,
  isBookmarked = false,
  isFlagged = false,
  onBookmark,
  onFlag,
}: QuestionCardProps) {
  const { theme } = useTheme();

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

export default QuestionCard;