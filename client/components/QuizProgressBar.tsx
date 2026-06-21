import { View, Text } from 'react-native';

import { useTheme } from '../theme/ThemeContext';


type QuizProgressBarProps = {
  current: number;
  total: number;
};

export function QuizProgressBar({ current, total }: QuizProgressBarProps) {
  const { theme } = useTheme();

  return (
    <View style={{ gap: theme.space.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.sm,
            fontWeight: theme.fontWeight.bold as any,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {`${theme.i18n.t('components.QuizProgressBar.question')} ${current}`}
        </Text>

        <Text
          style={{
            color: theme.color.textMuted,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.number,
          }}
        >
          {`${current} / ${total}`}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: theme.borderRadius.full,
              backgroundColor: i < current
                ? i === current - 1
                  ? theme.color.accent
                  : theme.color.success
                : theme.isDark
                  ? theme.color.surface
                  : theme.color.border,
            }}
          />
        ))}
      </View>
    </View>
  );
}

export default QuizProgressBar;