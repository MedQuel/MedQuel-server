import { View, Text } from 'react-native';
import { Check } from 'lucide-react-native';

import { useTheme } from '../../theme/ThemeContext';


const STEPS = ['Welcome', 'Profile', 'Goals', 'Ready'] as const;

export function OnboardingStepper({ currentStep }: { currentStep: number }) {
  const { theme } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.space.xl }}>
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <View
            key={label}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: i < STEPS.length-1 ? 1 : undefined,
            }}
          >
            <View
              style={{
                width: theme.space.lg,
                height: theme.space.lg,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.borderRadius.full,
                backgroundColor: isDone || isActive ? theme.color.accent : theme.color.surface,
              }}
            >
              {isDone ? (
                <Check size={theme.space.sm} color={theme.color.textInverse} />
              ) : (
                <Text
                  style={{
                    color: isActive ? theme.color.textInverse : theme.color.textMuted,
                    fontSize: theme.fontSize.xs,
                    fontFamily: theme.fontFamily.bold,
                  }}
                >
                  {stepNum}
                </Text>
              )}
            </View>

            <Text
              style={{
                color: isActive ? theme.color.textPrimary : theme.color.textMuted,
                fontSize: theme.fontSize.xs,
                fontFamily: isActive ? theme.fontFamily.bold : theme.fontFamily.regular,
                marginLeft: theme.space.xs,
              }}
            >
              {label}
            </Text>

            {i < STEPS.length-1 && (
              <View
                style={{
                  flex: 1,
                  height: 1,
                  marginHorizontal: theme.space.xs,
                  backgroundColor: theme.color.border,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
