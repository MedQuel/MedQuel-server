import { Ionicons } from '@expo/vector-icons';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { subjectCatalog, SubjectIcon, SubjectId } from '../../common/constants/subject';


export default function AllSubjectsScreen() {
  const { theme } = useTheme();

  const iconSize = theme.space.md;
  const chevronSize = theme.space.md;
  const iconBoxSize = theme.space.xxl;
  const allSubjectIds = Object.keys(subjectCatalog) as SubjectId[];

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScrollView contentContainerStyle={{ gap: theme.space.sm, padding: theme.space.md }}>
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
                  borderWidth: 1,
                  borderColor: theme.color.border,
                  borderRadius: theme.borderRadius.lg,
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
                    borderWidth: 1,
                    borderColor: `${iconColor}35`,
                    borderRadius: theme.borderRadius.md,
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
                  name='chevron-forward'
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
