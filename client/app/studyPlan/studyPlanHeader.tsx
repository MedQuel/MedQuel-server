import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


export function StudyHeader({ onBack, onEdit }: { onBack?: () => void, onEdit?: () => void }) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: theme.space.sm,
        paddingVertical: theme.space.md,
        paddingHorizontal: theme.space.md,
        backgroundColor: theme.color.background,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onBack?.()}
        style={{
          width: theme.space.xl,
          height: theme.space.xl,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.color.card,
        }}
      >
        <Feather
          name='chevron-left'
          size={theme.fontSize.lg}
          color={theme.color.textPrimary}
        />
      </TouchableOpacity>

      <View style={{ flex: 1, marginLeft: theme.space.md }}>
        <Text
          numberOfLines={1}
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.xl,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {theme.i18n.t('Study Plan')}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.regular,
            marginTop: theme.space.xs / 2,
          }}
        >
          {theme.i18n.t('Your personalized roadmap')}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onEdit}
        style={{
          width: theme.space.xl,
          height: theme.space.xl,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.color.card,
        }}
      >
        <Feather
          name='edit-2'
          size={theme.fontSize.md}
          color={theme.color.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}
