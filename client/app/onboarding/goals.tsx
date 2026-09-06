import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { View, Text, ScrollView, Pressable } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { useOnboarding, targetExamsFor } from '../../common/context/OnboardingContext';

import { AuthInput } from '../../components/auth/AuthInput';
import { OnboardingFooter } from '../../components/onboarding/OnboardingFooter';
import { OnboardingStepper } from '../../components/onboarding/OnboardingStepper';


const EXAM_DESCRIPTION_KEYS: Record<string, string> = {
  USMLE: 'usmle',
  'NEET-PG': 'neetPg',
  'INI-CET': 'iniCet',
  PLAB: 'plab',
  MRCP: 'mrcp',
  FMGE: 'fmge',
  DM: 'dm',
  MCH: 'mch',
  'Fellowship Exams': 'fellowshipExams',
  'Clinical Mastery': 'clinicalMastery',
};

type OnboardingIconProps = Omit<React.ComponentProps<typeof FontAwesome>, 'name'>;
const BuildingIcon = (props: OnboardingIconProps) => (
  <FontAwesome name='institution' {...props} />
);


export default function OnboardingGoalsScreen() {
  const { draft, setTargetExam, setInstitution } = useOnboarding();
  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const targetExams = targetExamsFor(draft.role);
  const canContinue = !!draft.targetExam;

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: theme.space.xl,
        paddingVertical: theme.space.lg,
        paddingHorizontal: theme.space.md,
        backgroundColor: theme.color.background,
      }}
    >
      <OnboardingStepper currentStep={3} />

      <Text
        style={{
          color: theme.color.textPrimary,
          fontSize: theme.fontSize.xxl,
          fontFamily: theme.fontFamily.bold
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
          marginBottom: theme.space.lg
        }}
      >
        {targetExams.map((exam) => {
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
                    ? (theme.isDark ? theme.color.textPrimary : theme.color.textInverse)
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

      {draft.targetExam && (
        <View
          style={{
            padding: theme.space.md,
            marginBottom: theme.space.lg,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.color.surface,
          }}
        >
          <Text
            style={{
              color: theme.color.textPrimary,
              fontSize: theme.fontSize.md,
              fontFamily: theme.fontFamily.bold,
              marginBottom: theme.space.xs,
            }}
          >
            {theme.i18n.t('onboarding.goals.examOverviewTitle', { exam: draft.targetExam })}
          </Text>
          <Text
            style={{
              color: theme.color.textSecondary,
              fontSize: theme.fontSize.sm,
              lineHeight: theme.fontSize.sm * 1.5,
              fontFamily: theme.fontFamily.regular,
            }}
          >
            {theme.i18n.t(`onboarding.goals.examDescriptions.${EXAM_DESCRIPTION_KEYS[draft.targetExam]}`)}
          </Text>
        </View>
      )}

      <AuthInput
        label={theme.i18n.t('onboarding.goals.institutionLabel')}
        icon={BuildingIcon as any}
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
        onContinue={() => router.push('/onboarding/scope')}
      />
    </ScrollView>
  );
}
