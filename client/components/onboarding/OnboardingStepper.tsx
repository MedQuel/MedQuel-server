import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeContext';


const STEPS = ['Welcome', 'Profile', 'Goals', 'Scope', 'Ready'] as const;

export function OnboardingStepper({ currentStep }: { currentStep: number }) {
  const { theme } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.space.xl }}>
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const isLast = i === STEPS.length-1;

        return (
          <View
            key={label}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: isLast ? undefined : 1
            }}
          >
            <View
              style={{
                width: theme.space.md * 1.25,
                height: theme.space.md * 1.25,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.borderRadius.full,
                backgroundColor: isDone || isActive ? theme.color.accent : theme.color.surface,
                boxShadow: isActive ? `0 0 5px 5px ${theme.color.accent}22` : undefined,
              }}
            >
              {isDone ? (
                <Feather
                  name='check'
                  size={theme.space.md * 0.85}
                  color={theme.isDark ? theme.color.textPrimary : theme.color.textInverse}
                />
              ) : (
                <Text
                  style={{
                    color: isActive
                      ? theme.isDark ? theme.color.textPrimary :  theme.color.textInverse
                      : theme.color.textMuted,
                    fontSize: theme.fontSize.xs * 1.05,
                    fontFamily: theme.fontFamily.number,
                  }}
                >
                  {stepNum}
                </Text>
              )}
            </View>

            <Text
              numberOfLines={1}
              style={{
                color: isActive ? theme.color.accent : theme.color.textMuted,
                fontSize: theme.fontSize.xs * 1.05,
                fontWeight: theme.fontWeight.bold,
                fontFamily: isActive ? theme.fontFamily.bold : theme.fontFamily.regular,
                marginLeft: theme.space.xs,
                marginRight: isLast ? 0 : theme.space.xs,
              }}
            >
              {label}
            </Text>

            {!isLast && (
              <View
                style={{
                  flex: 1,
                  height: theme.space.xs * 0.5,
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: isDone ? theme.color.accent : theme.color.border,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
