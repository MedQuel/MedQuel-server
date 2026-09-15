import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';


export default function StudyPlanHeader({ onBack, onEdit }: { onBack?: () => void; onEdit?: () => void; }) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        gap: theme.space.sm,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: theme.space.sm,
        paddingBottom: theme.space.sm,
        paddingHorizontal: theme.space.md,
      }}
    >
      <TouchableOpacity
        onPress={() => onBack?.()}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.space.xs * 1.75,
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.color.card,
        }}
      >
        <Feather
          name='chevron-left'
          size={theme.fontSize.xl}
          color={theme.color.textPrimary}
        />
      </TouchableOpacity>

      <View style={{ flex: 1, flexDirection: 'column', gap: theme.space.xs * 0.5 }}>
        <Text
          numberOfLines={1}
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.lg * 1.1,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {theme.i18n.t('studyPlan.header.title')}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm * 1.05,
            fontFamily: theme.fontFamily.light,
          }}
        >
          {theme.i18n.t('studyPlan.header.subtitle')}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onEdit}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.space.xs * 1.75,
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.color.card,
        }}
      >
        <Feather
          name='edit-2'
          size={theme.fontSize.xl}
          color={theme.color.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}
