import { useRouter } from 'expo-router';
import { View, Text, ScrollView, Pressable } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import type { YearOfStudy } from '../../common/types/types';
import { useBottomBar } from '../../common/context/useBottomBar';
import { useOnboarding, ROLE_HAS_YEAR } from '../../common/context/OnboardingContext';

import { OnboardingRolePicker } from '../../components/OnboardingRolePicker';
import { FeatureHighlightsCard } from '../../components/FeaturesHighlightCard';
import { OnboardingFooter } from '../../components/onboarding/OnboardingFooter';
import { OnboardingStepper } from '../../components/onboarding/OnboardingStepper';


const YEAR_OPTIONS: YearOfStudy[] = [
  'Year 1',
  'Year 2',
  'Year 3',
  'Year 4',
  'Final Year',
  'Intern',
];

export default function OnboardingProfileScreen() {
  const { draft, setRole, setYearOfStudy } = useOnboarding();
  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const showYearPicker = draft.role ? ROLE_HAS_YEAR[draft.role] : false;
  const canContinue = !!draft.role && (!showYearPicker || !!draft.yearOfStudy);

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: theme.space.lg,
        paddingTop: theme.space.xl,
        backgroundColor: theme.color.background,
      }}
    >
      <OnboardingStepper currentStep={2} />

      <Text
        style={{
          color: theme.color.textPrimary,
          fontSize: theme.fontSize.xxl,
          fontFamily: theme.fontFamily.bold,
        }}
      >
        {theme.i18n.t('onboarding.profile.title')}
      </Text>
      <Text
        style={{
          color: theme.color.textSecondary,
          fontSize: theme.fontSize.sm * 1.1,
          fontFamily: theme.fontFamily.regular,
          marginTop: theme.space.xs,
          marginBottom: theme.space.lg,
        }}
      >
        {theme.i18n.t('onboarding.profile.subtitle')}
      </Text>

      <OnboardingRolePicker
        value={draft.role ?? 'MBBS Student'}
        onChange={setRole}
      />

      {showYearPicker && (
        <View
          style={{
            gap: theme.space.sm,
            padding: theme.space.md,
            marginTop: theme.space.sm * 0.75,
            marginBottom: theme.space.sm,
            borderWidth: 1.5,
            borderColor: theme.color.border,
            borderRadius: theme.borderRadius.xl,
            backgroundColor: theme.color.card,
          }}
        >
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.md,
              fontFamily: theme.fontFamily.bold,
              marginBottom: theme.space.sm,
            }}
          >
            {theme.i18n.t('onboarding.profile.selectYear')}
          </Text>

          <View style={{ flexWrap: 'wrap', gap: theme.space.sm, flexDirection: 'row' }}>
            {YEAR_OPTIONS.map((year) => {
              const selected = draft.yearOfStudy === year;
              return (
                <Pressable
                  key={year}
                  onPress={() => setYearOfStudy(year)}
                  style={{
                    paddingVertical: theme.space.sm * 0.65,
                    paddingHorizontal: theme.space.md * 0.9,
                    borderWidth: 1.5,
                    borderRadius: theme.borderRadius.md,
                    borderColor: selected ? theme.color.accent : theme.color.border,
                    backgroundColor: selected ? theme.color.accent : theme.color.surface,
                  }}
                >
                  <Text
                    style={{
                      color: selected
                        ? theme.isDark ? theme.color.textPrimary : theme.color.textInverse
                        : theme.color.textSecondary,
                      fontSize: theme.fontSize.sm,
                      fontFamily: theme.fontFamily.bold,
                    }}
                  >
                    {year}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <View style={{ marginTop: theme.space.sm * 0.75 }}>
        <FeatureHighlightsCard />
      </View>

      <View style={{ flex: 1 }} />

      <OnboardingFooter
        continueLabel={theme.i18n.t('onboarding.continue')}
        currentStep={2}
        disabled={!canContinue}
        onBack={() => router.back()}
        onContinue={() => router.push('/onboarding/goals')}
      />
    </ScrollView>
  );
}
