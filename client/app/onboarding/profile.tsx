import { useRouter } from 'expo-router';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Zap, Trophy, Flame, BarChart2 } from 'lucide-react-native';

import { useTheme } from '../../theme/ThemeContext';
import type { YearOfStudy } from '../../common/types/types';
import { useBottomBar } from '../../common/context/useBottomBar';
import { useOnboarding, ROLE_HAS_YEAR } from '../../common/context/OnboardingContext';

import { AuthCard } from '../../components/auth/AuthCard';
import { OnboardingRolePicker } from '../../components/OnboardingRolePicker';
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
const PERKS = [
  { icon: Zap, key: 'earnEp', color: 'info' },
  { icon: Trophy, key: 'winContests', color: 'warning' },
  { icon: Flame, key: 'buildStreaks', color: 'error' },
  { icon: BarChart2, key: 'climbRanks', color: 'success' },
] as const;

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
        justifyContent: 'center',
        padding: theme.space.lg,
        backgroundColor: theme.color.background,
      }}
    >
      <AuthCard>
        <OnboardingStepper currentStep={2} />

        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.xxl * 0.9,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {theme.i18n.t('onboarding.profile.title')}
        </Text>
        <Text
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm * 1.05,
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
          <View style={{ marginTop: theme.space.sm, marginBottom: theme.space.lg }}>
            <Text
              style={{
                color: theme.color.textPrimary,
                fontSize: theme.fontSize.sm,
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
                      paddingVertical: theme.space.sm * 0.75,
                      paddingHorizontal: theme.space.md,
                      borderWidth: 1.5,
                      borderRadius: theme.borderRadius.lg,
                      borderColor: selected ? theme.color.accent : theme.color.border,
                      backgroundColor: selected ? theme.color.accent : theme.color.card,
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? theme.color.textInverse : theme.color.textSecondary,
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

        <View
          style={{
            padding: theme.space.md,
            marginBottom: theme.space.md,
            borderRadius: theme.borderRadius.xl,
            backgroundColor: theme.color.surface,
          }}
        >
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.bold,
              marginBottom: theme.space.sm,
            }}
          >
            {theme.i18n.t('onboarding.profile.whatAwaits')}
          </Text>

          <View style={{ flexWrap: 'wrap', gap: theme.space.sm, flexDirection: 'row' }}>
            {PERKS.map(({ icon: Icon, key, color }) => (
              <View
                key={key}
                style={{
                  flexBasis: '47%',
                  alignItems: 'center',
                  paddingVertical: theme.space.sm,
                  borderRadius: theme.borderRadius.lg,
                  backgroundColor: theme.color.card,
                }}
              >
                <Icon size={theme.space.lg} color={theme.color[color as keyof typeof theme.color]} />
                <Text
                  style={{
                    color: theme.color.textSecondary,
                    fontSize: theme.fontSize.xs,
                    fontFamily: theme.fontFamily.regular,
                    marginTop: theme.space.xs,
                  }}
                >
                  {theme.i18n.t(`onboarding.profile.perks.${key}`)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <OnboardingFooter
          continueLabel={theme.i18n.t('onboarding.continue')}
          disabled={!canContinue}
          onBack={() => router.back()}
          onContinue={() => router.push('/onboarding/goals')}
        />
      </AuthCard>
    </ScrollView>
  );
}
