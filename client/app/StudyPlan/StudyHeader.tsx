import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export function StudyHeader({
  onBack,
  onEdit,
}: {
  onBack?: () => void;
  onEdit?: () => void;
}) {
  const { theme } = useTheme();
  const handleBackPress = () => {
    onBack?.();
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.color.background,
        paddingHorizontal: theme.space.md,
        paddingVertical: theme.space.md,
        paddingBottom: theme.space.sm,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleBackPress}
        style={{
          width: theme.space.xl,
          height: theme.space.xl,
          borderRadius: theme.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.color.border,
          backgroundColor: theme.color.card,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Feather
          name="chevron-left"
          size={theme.fontSize.lg}
          color={theme.color.textPrimary}
        />
      </TouchableOpacity>

      <View style={{ flex: 1, marginLeft: theme.space.md }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: theme.fontFamily.bold,
            // size kam kar diya (pehle xxxl tha)
            fontSize: theme.fontSize.xl,
            color: theme.color.textPrimary,
          }}
        >
          {theme.i18n.t('Study Plan')}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            marginTop: theme.space.xs / 2,
            fontFamily: theme.fontFamily.regular,
            fontSize: theme.fontSize.sm,
            color: theme.color.textSecondary,
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
          borderRadius: theme.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.color.border,
          backgroundColor: theme.color.card,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Feather
          name="edit-2"
          size={theme.fontSize.md}
          color={theme.color.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}