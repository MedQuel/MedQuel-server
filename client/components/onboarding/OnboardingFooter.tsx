import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


interface OnboardingFooterProps {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel: string;
  disabled?: boolean;
  loading?: boolean;
}

export function OnboardingFooter({ onBack, onContinue, continueLabel, disabled, loading }: OnboardingFooterProps) {
  const { theme } = useTheme();

  return (
    <View style={{ gap: theme.space.md, flexDirection: 'row', marginTop: theme.space.xl }}>
      {onBack && (
        <Pressable
          onPress={onBack}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.md * 0.9,
            paddingHorizontal: theme.space.lg,
            borderWidth: 1.5,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.lg,
          }}
        >
          <ChevronLeft size={theme.space.md * 1.1} color={theme.color.textSecondary} />
          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.md,
              fontFamily: theme.fontFamily.bold,
              marginLeft: theme.space.xs,
            }}
          >
            {theme.i18n.t('onboarding.back')}
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={onContinue}
        disabled={disabled || loading}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={['#4378eb', '#2161eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.md * 0.9,
            borderRadius: theme.borderRadius.lg,
            opacity: disabled ? 0.6 : 1,
            boxShadow: `0 6px 20px ${theme.color.accent}55`,
          }}
        >
          {loading ? (
            <ActivityIndicator color='#FFFFFF' />
          ) : (
            <>
              <Text
                style={{
                  color: theme.isDark ? theme.color.textPrimary : theme.color.textInverse,
                  fontSize: theme.fontSize.md * 1.1,
                  fontFamily: theme.fontFamily.bold,
                  marginRight: theme.space.xs,
                }}
              >
                {continueLabel}
              </Text>
              <ChevronRight
                size={theme.space.md * 1.2}
                color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
              />
            </>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}
