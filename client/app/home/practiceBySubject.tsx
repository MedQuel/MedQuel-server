import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { SubjectId, SubjectIcon, subjectCatalog } from '../../common/constants/subject';


export default function AllSubjectsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const allSubjectIds = Object.keys(subjectCatalog) as SubjectId[];

  return (
    <View style={{ flex: 1, paddingHorizontal: theme.space.md, backgroundColor: theme.color.background }}>
      <View
        style={{
          gap: theme.space.sm,
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: theme.space.lg,
          paddingBottom: theme.space.sm,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push('/home')}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.space.xs * 1.75,
            borderWidth: 1,
            backgroundColor: theme.color.card,
            borderRadius: theme.borderRadius.lg,
            borderColor: theme.color.border,
          }}
        >
          <Feather
            name='chevron-left'
            size={theme.fontSize.xl}
            color={theme.color.textPrimary}
          />
        </TouchableOpacity>

        <View style={{ flexDirection: 'column', gap: theme.space.xs * 0.5 }}>
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.lg * 1.1,
              fontFamily: theme.fontFamily.bold,
            }}
          >
            {theme.i18n.t('home.practiceBySubject.title')}
          </Text>
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.sm * 1.05,
              fontFamily: theme.fontFamily.light,
            }}
          >
            {theme.i18n.t('home.practiceBySubject.subtitle')}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          marginTop: theme.space.sm,
          paddingBottom: theme.space.xl,
        }}
      >
        <View style={{ gap: theme.space.sm * 1.1 }}>
          {allSubjectIds.map((id) => {
            const def = subjectCatalog[id];
            const iconColor = theme.color[def?.variant ?? 'accent'];
            return (
              <TouchableOpacity
                key={id}
                activeOpacity={0.8}
                style={{
                  gap: theme.space.sm * 1.25,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: theme.space.sm,
                  borderWidth: 1,
                  borderColor: theme.color.border,
                  borderRadius: theme.borderRadius.lg,
                  backgroundColor: theme.color.card,
                }}
              >
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: theme.space.md * 0.75,
                    borderWidth: 1,
                    borderColor: `${iconColor}35`,
                    borderRadius: theme.borderRadius.md,
                    backgroundColor: `${iconColor}12`,
                  }}
                >
                  <SubjectIcon
                    id={id}
                    color={iconColor}
                    size={theme.space.lg * 0.9}
                  />
                </View>

                <Text
                  style={{
                    flex: 1,
                    color: theme.color.textPrimary,
                    fontSize: theme.fontSize.md,
                    fontFamily: theme.fontFamily.regular,
                  }}
                  numberOfLines={1}
                >
                  {theme.i18n.t(def?.title ?? id)}
                </Text>
                <Ionicons
                  name='chevron-forward'
                  size={theme.space.md}
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
