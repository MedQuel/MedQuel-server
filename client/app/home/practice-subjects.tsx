import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { subjectCatalog, SubjectIcon, SubjectId } from '../../common/constants/subject';
import { Ionicons } from '@expo/vector-icons';
export default function AllSubjectsScreen() {
  const { theme } = useTheme();
  const allSubjectIds = Object.keys(subjectCatalog) as SubjectId[];
  const iconBoxSize = theme.space.xxl;      
  const iconSize = theme.space.md;           
  const chevronSize = theme.space.md;
  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: theme.space.md,
          gap: theme.space.sm,
        }}
      >
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.xl,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.bold,
            marginBottom: theme.space.sm,
          }}
        >
          {theme.i18n.t('All Subjects')}
        </Text>

        <View style={{ gap: theme.space.sm }}>
          {allSubjectIds.map((id) => {
            const def = subjectCatalog[id];
            const iconColor = theme.color[def?.variant ?? 'accent'];
            return (
              <TouchableOpacity
                key={id}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: theme.space.sm,
                  borderRadius: theme.borderRadius.lg,
                  borderWidth: 1,
                  borderColor: theme.color.border,
                  backgroundColor: theme.color.surface,
                }}
              >
                <View
                  style={{
                    width: iconBoxSize,
                    height: iconBoxSize,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: theme.space.sm,
                    borderRadius: theme.borderRadius.md,
                    borderWidth: 1,
                    borderColor: `${iconColor}35`,
                    backgroundColor: `${iconColor}12`,
                  }}
                >
                  <SubjectIcon id={id} color={iconColor} size={iconSize} />
                </View>

                <Text
                  style={{
                    flex: 1,
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.md,
                    fontFamily: theme.fontWeight.medium,
                  }}
                  numberOfLines={1}
                >
                  {theme.i18n.t(def?.title ?? id)}
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={chevronSize}
                  color={theme.color.textSecondary}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}