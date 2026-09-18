import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StyleProp, ViewStyle } from 'react-native';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


type ScreenHeaderAction = {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  color?: string;
  accessibilityLabel?: string;
};
type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightActions?: ScreenHeaderAction[];
  rightElement?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightActions = [],
  rightElement,
  containerStyle,
}: ScreenHeaderProps) {
  const router = useRouter();
  const { theme } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const actionButtonStyle = {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: theme.space.sm,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.color.card,
  };

  return (
    <View
      style={[
        {
          gap: theme.space.sm * 1.5,
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: theme.space.sm * 0.8,
          paddingBottom: theme.space.sm,
          paddingHorizontal: theme.space.md,
        },
        containerStyle,
      ]}
    >
      {showBack && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBack}
          accessibilityRole='button'
          accessibilityLabel='Go back'
          style={actionButtonStyle}
        >
          <Feather
            name='chevron-left'
            size={theme.fontSize.xl}
            color={theme.color.textPrimary}
          />
        </TouchableOpacity>
      )}

      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
        <Text
          numberOfLines={1}
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg * 1.1,
            fontFamily: theme.fontFamily.bold,
            lineHeight: theme.fontSize.lg * 1.1 * 1.2,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm * 1.05,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightElement ? (
        rightElement
      ) : rightActions.length > 0 ? (
        <View style={{ gap: theme.space.xs, flexDirection: 'row', alignItems: 'center' }}>
          {rightActions.map((action, index) => (
            <TouchableOpacity
              key={`${action.icon}-${index}`}
              activeOpacity={0.8}
              onPress={action.onPress}
              accessibilityRole='button'
              accessibilityLabel={action.accessibilityLabel}
              style={actionButtonStyle}
            >
              <Feather
                name={action.icon}
                size={theme.fontSize.xl}
                color={action.color ?? theme.color.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}
