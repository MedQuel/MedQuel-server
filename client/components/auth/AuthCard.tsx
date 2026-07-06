import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';


export function AuthCard({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        borderWidth: 1.5,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.xl,
        padding: theme.space.lg,
        backgroundColor: theme.color.card,
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.4)',
      }}
    >
      {children}
    </View>
  );
}
