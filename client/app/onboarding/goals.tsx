import { useRouter } from 'expo-router';
import { Building2 } from 'lucide-react-native';
import { View, Text, ScrollView, Pressable } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import type { TargetExam } from '../../common/types/types';
import { useBottomBar } from '../../common/context/useBottomBar';
import { useOnboarding } from '../../common/context/OnboardingContext';

import { AuthInput } from '../../components/auth/AuthInput';
import { OnboardingFooter } from '../../components/onboarding/OnboardingFooter';
import { OnboardingStepper } from '../../components/onboarding/OnboardingStepper';


const TARGET_EXAMS: TargetExam[] = [
  'USMLE',
  'NEET-PG',
  'INI-CET',
  'PLAB',
  'MRCP',
  'FMGE',
  'Clinical Mastery',
];

export default function OnboardingGoalsScreen() {
  const { draft, setTargetExam, setInstitution } = useOnboarding();
  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const canContinue = !!draft.targetExam;

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: theme.space.lg,
        paddingTop: theme.space.xl,
        backgroundColor: theme.color.background,
      }}
    >
      <OnboardingStepper currentStep={3} />

      <Text
        style={{
          color: theme.color.textPrimary,
          fontSize: theme.fontSize.xxl,
          fontFamily: theme.fontFamily.bold,
        }}
      >
        {theme.i18n.t('onboarding.goals.title')}
      </Text>
      <Text
        numberOfLines={2}
        style={{
          color: theme.color.textSecondary,
          fontSize: theme.fontSize.sm * 1.1,
          fontFamily: theme.fontFamily.regular,
          marginTop: theme.space.xs,
          marginBottom: theme.space.lg,
        }}
      >
        {theme.i18n.t('onboarding.goals.subtitle')}
      </Text>

      <View
        style={{
          flexWrap: 'wrap',
          gap: theme.space.sm,
          flexDirection: 'row',
          marginBottom: theme.space.lg,
        }}
      >
        {TARGET_EXAMS.map((exam) => {
          const selected = draft.targetExam === exam;
          return (
            <Pressable
              key={exam}
              onPress={() => setTargetExam(exam)}
              style={{
                paddingVertical: theme.space.sm,
                paddingHorizontal: theme.space.md,
                borderWidth: 1.5,
                borderRadius: theme.borderRadius.md,
                borderColor: selected ? theme.color.accent : theme.color.border,
                backgroundColor: selected ? theme.color.accent : theme.color.card,
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
                {exam}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <AuthInput
        label={theme.i18n.t('onboarding.goals.institutionLabel')}
        icon={Building2}
        value={draft.institution}
        onChangeText={setInstitution}
        placeholder={theme.i18n.t('onboarding.goals.institutionPlaceholder')}
        autoCapitalize='words'
      />

      <View style={{ flex: 1 }} />

      <OnboardingFooter
        continueLabel={theme.i18n.t('onboarding.continue')}
        currentStep={3}
        disabled={!canContinue}
        onBack={() => router.back()}
        onContinue={() => router.push('/onboarding/ready')}
      />
    </ScrollView>
  );
}
