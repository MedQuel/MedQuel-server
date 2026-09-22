import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { api } from '../../common/api/api';
import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../common/context/AppContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { SubjectQuizWizard } from '../../components/home/SubjectQuizWizard';
import type { AnalyticsData, SubjectPerformanceEntry } from '../../common/types/types';
import { SubjectId, SubjectIcon, subjectCatalog } from '../../common/constants/subject';


function normalizeSpecialty(value: unknown): string {
  if (typeof value === 'string') {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  if (value && typeof value === 'object') {
    const specialty = value as Record<string, unknown>;
    const label = specialty.id ?? specialty.name ?? specialty.title ?? specialty.value;
    return typeof label === 'string' ? normalizeSpecialty(label) : '';
  }
  return '';
}


export default function AllSubjectsScreen() {
  const { user: currentUser } = useAppContext();
  const [expandedSubject, setExpandedSubject] = useState<SubjectId | null>(null);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformanceEntry[]>([]);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  useBottomBar(false);

  useEffect(() => {
    let isActive = true;
    api.analytics
      .getAnalytics()
      .then((analytics: AnalyticsData) => {
        if (isActive) setSubjectPerformance(analytics.subjectPerformance ?? []);
      })
      .catch(() => {
        if (isActive) setSubjectPerformance([]);
      });

    return () => { isActive = false };
  }, []);

  const { preferredSubjectIds, otherSubjectIds } = useMemo(() => {
    const subjectIds = Object.keys(subjectCatalog) as SubjectId[];
    const specialties = ((currentUser as { specialties?: unknown[] } | null)?.specialties ?? [])
      .map(normalizeSpecialty)
      .filter(Boolean);

    const matchesSpecialty = (id: SubjectId) => {
      if (specialties.length === 0) return false;
      const definition = subjectCatalog[id];
      const values = [id, definition.title, theme.i18n.t(definition.title)].map(normalizeSpecialty);

      return specialties.some((specialty) => values.some(
        (value) => value === specialty || value.includes(specialty) || specialty.includes(value)
      ));
    };

    const sortByTitle = (a: SubjectId, b: SubjectId) => theme.i18n
      .t(subjectCatalog[a].title)
      .localeCompare(theme.i18n.t(subjectCatalog[b].title));

    return {
      preferredSubjectIds: subjectIds.filter(matchesSpecialty).sort(sortByTitle),
      otherSubjectIds: subjectIds.filter((id) => !matchesSpecialty(id)).sort(sortByTitle),
    };
  }, [currentUser, theme.i18n]);

  const renderSubjectCard = (subjectId: SubjectId) => {
    const definition = subjectCatalog[subjectId];
    const isExpanded = expandedSubject === subjectId;
    const iconColor = theme.color[definition.variant];
    const performance = subjectPerformance.find((entry) =>
      normalizeSpecialty(entry.subject) === normalizeSpecialty(definition.title)
    );

    return (
      <View
        key={subjectId}
        style={{
          overflow: 'hidden',
          borderWidth: 1,
          borderRadius: theme.borderRadius.lg,
          borderColor: isExpanded ? theme.color.accent : theme.color.border,
          backgroundColor: theme.color.card + 'BB',
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole='button'
          accessibilityState={{ expanded: isExpanded }}
          onPress={() => setExpandedSubject(isExpanded ? null : subjectId)}
          style={{
            gap: theme.space.sm * 1.25,
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.space.sm * 1.25,
          }}
        >
          <View
            style={{
              width: theme.space.xxl * 0.9,
              height: theme.space.xxl * 0.9,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: `${iconColor}35`,
              borderRadius: theme.borderRadius.md,
              backgroundColor: `${iconColor}12`,
            }}
          >
            <SubjectIcon id={subjectId} color={iconColor} size={theme.space.lg * 0.9} />
          </View>

          <View style={{ flex: 1, gap: theme.space.xs * 0.5 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: theme.fontSize.md * 1.05,
                color: theme.color.textPrimary,
                fontFamily: theme.fontFamily.regular,
              }}
            >
              {theme.i18n.t(definition.title)}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: theme.fontSize.sm,
                color: performance ? theme.color.textSecondary : theme.color.textMuted,
                fontFamily: theme.fontFamily.number,
              }}
            >
              {performance
                ? `${Math.round(performance.accuracy)}% accuracy · ${performance.totalAttempted} questions`
                : theme.i18n.t('home.practiceBySubject.no_progress', { defaultValue: 'No practice history yet' })}
            </Text>
          </View>

          <Ionicons
            name={isExpanded ? 'chevron-down' : 'chevron-forward'}
            size={theme.space.md}
            color={isExpanded ? theme.color.accent : theme.color.textSecondary}
          />
        </TouchableOpacity>

        {isExpanded && <SubjectQuizWizard subjectId={subjectId} />}
      </View>
    );
  };

  const renderSubjectGroup = (subjectIds: SubjectId[]) => (
    <View style={{ gap: theme.space.sm * 1.25 }}>
      {subjectIds.map(renderSubjectCard)}
    </View>
  );


  return (
    <View style={{ flex: 1, paddingHorizontal: theme.space.md, backgroundColor: theme.color.background }}>
      <ScreenHeader
        title={theme.i18n.t('home.practiceBySubject.title')}
        subtitle={theme.i18n.t('home.practiceBySubject.subtitle')}
        onBack={() => router.push('/profile')}
        containerStyle={{ marginHorizontal: -theme.space.md }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          marginTop: theme.space.sm,
          paddingBottom: insets.bottom * 1.5,
        }}
      >
        <View style={{ gap: theme.space.sm * 1.1 }}>
          {preferredSubjectIds.length > 0 && (
            <View style={{ gap: theme.space.sm * 1.1 }}>
              <Text
                style={{
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: theme.color.accent,
                  fontSize: theme.fontSize.xs,
                  fontFamily: theme.fontFamily.bold,
                  paddingTop: theme.space.xs,
                  paddingHorizontal: theme.space.xs,
                }}
              >
                {theme.i18n.t('home.practiceBySubject.my_specialties')}
              </Text>

              {renderSubjectGroup(preferredSubjectIds)}
            </View>
          )}

          {preferredSubjectIds.length > 0 && otherSubjectIds.length > 0 && (
            <View
              style={{
                gap: theme.space.sm,
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: theme.space.sm,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: theme.color.border }} />
              <Text
                style={{
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  fontSize: theme.fontSize.xs,
                  color: theme.color.textMuted,
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                {theme.i18n.t('home.practiceBySubject.all_subjects')}
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: theme.color.border }} />
            </View>
          )}

          {otherSubjectIds.length > 0 && renderSubjectGroup(otherSubjectIds)}
        </View>
      </ScrollView>
    </View>
  );
}
