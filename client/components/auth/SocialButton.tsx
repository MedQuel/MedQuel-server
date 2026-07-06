import Svg, { Path } from 'react-native-svg';
import { Pressable, Text, ActivityIndicator } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


interface SocialButtonProps {
  label: string;
  loading?: boolean;
  onPress: () => void;
}

function GoogleMark({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox='0 0 48 48' fill='none'>
      <Path
        fill='#EA4335'
        d='M24 9.5c3.54 0 6.73 1.22 9.24 3.6l6.9-6.9C35.94 2.3 30.38 0 24 0 14.64 0 6.56 5.38 2.62 13.22l8.04 6.24C12.58 13.58 17.82 9.5 24 9.5z'
      />
      <Path
        fill='#4285F4'
        d='M46.5 24.55c0-1.57-.14-3.08-.4-4.55H24v9.1h12.68c-.55 2.95-2.22 5.45-4.73 7.14l7.64 5.92C44.06 38.02 46.5 31.88 46.5 24.55z'
      />
      <Path
        fill='#FBBC05'
        d='M10.66 28.54A14.49 14.49 0 019.5 24c0-1.58.28-3.11.78-4.54L2.24 13.22A23.96 23.96 0 000 24c0 3.86.92 7.51 2.56 10.78l8.1-6.24z'
      />
      <Path
        fill='#34A853'
        d='M24 48c6.48 0 11.92-2.14 15.9-5.84l-7.64-5.92c-2.12 1.42-4.84 2.26-8.26 2.26-6.18 0-11.42-4.08-13.34-9.96l-8.1 6.24C6.56 42.62 14.64 48 24 48z'
      />
    </Svg>
  );
}

export function SocialButton({ label, onPress, loading }: SocialButtonProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: theme.color.border,
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.space.sm * 1.5,
        backgroundColor: theme.color.surface,
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator color={theme.color.textPrimary} />
      ) : (
        <>
          <GoogleMark size={theme.space.lg * 0.85} />
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.md,
              fontFamily: theme.fontFamily.bold,
              marginLeft: theme.space.sm * 1.25,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
