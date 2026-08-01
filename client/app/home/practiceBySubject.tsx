import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { SubjectId, SubjectIcon, subjectCatalog } from '../../common/constants/subject';


export default function AllSubjectsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const iconSize = theme.space.md;
  const chevronSize = theme.space.md;
  const backIconSize = theme.space.lg;
  const iconBoxSize = theme.space.xxl;
  const hitSlopValue = theme.space.xs;
  const backButtonHitSlop = { top: hitSlopValue, bottom: hitSlopValue, left: hitSlopValue, right: hitSlopValue };
  const allSubjectIds = Object.keys(subjectCatalog) as SubjectId[];

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.push('/home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: theme.space.sm,
          paddingHorizontal: theme.space.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.color.border,
          backgroundColor: theme.color.background,
        }}
      >
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={backButtonHitSlop}
          style={{
            width: theme.space.xl,
            height: theme.space.xl,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.space.sm,
          }}
        >
          <Ionicons name='chevron-back' size={backIconSize} color={theme.color.textPrimary} />
        </TouchableOpacity>

        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.xl,
            fontWeight: theme.fontWeight.bold,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {theme.i18n.t('All Subjects')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ gap: theme.space.sm, padding: theme.space.md }}>
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
