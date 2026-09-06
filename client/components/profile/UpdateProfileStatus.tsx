import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


type StatusTone = 'error' | 'success';
interface UpdateProfileStatusProps {
  message: string;
  tone: StatusTone;
  onDismiss?: () => void;
}

export function UpdateProfileStatus({ message, tone, onDismiss }: UpdateProfileStatusProps) {
  const { theme } = useTheme();
  const color = tone === 'error' ? theme.color.error : theme.color.success;

  return (
    <View
      accessibilityRole='alert'
      style={{
        gap: theme.space.sm,
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.space.sm,
        marginBottom: theme.space.md,
        borderWidth: 1,
        borderColor: color,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.color.card,
      }}
    >
      <Feather
        name={tone === 'error' ? 'alert-circle' : 'check-circle'}
        size={theme.space.md}
        color={color}
      />
      <Text
        style={{
          flex: 1,
          color,
          fontSize: theme.fontSize.sm,
          fontFamily: theme.fontFamily.bold,
        }}
      >
        {message}
      </Text>

      {onDismiss && (
        <Pressable
          onPress={onDismiss}
          hitSlop={8}
          accessibilityLabel='Dismiss message'
        >
          <Feather name='x' size={theme.space.md} color={color} />
        </Pressable>
      )}
    </View>
  );
}
