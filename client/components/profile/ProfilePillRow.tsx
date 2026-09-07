import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';


interface ProfilePillRowProps {
  items: string[];
  variant?: 'accent' | 'muted';
}

export function ProfilePillRow({ items, variant = 'muted' }: ProfilePillRowProps) {
  const { theme } = useTheme();
  if (items.length === 0) return null;

  const isAccent = variant === 'accent';

  return (
    <View
      style={{
        flexWrap: 'wrap',
        gap: theme.space.xs,
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      {items.map((item) => (
        <View
          key={item}
          style={{
            paddingVertical: theme.space.xs,
            paddingHorizontal: theme.space.sm,
            borderWidth: 1,
            borderRadius: theme.borderRadius.full,
            borderColor: isAccent ? theme.color.accent + '55' : theme.color.border,
            backgroundColor: isAccent ? theme.color.accent + '15' : theme.color.card,
          }}
        >
          <Text
            style={{
              color: isAccent ? theme.color.accent : theme.color.textSecondary,
              fontSize: theme.fontSize.xs,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}
