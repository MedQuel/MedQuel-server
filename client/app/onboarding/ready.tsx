import { useRouter } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { CheckCircle2, GraduationCap, Target, Building2, CalendarClock } from 'lucide-react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { useOnboarding } from '../../common/context/OnboardingContext';
import { OnboardingFooter } from '../../components/onboarding/OnboardingFooter';
import { OnboardingStepper } from '../../components/onboarding/OnboardingStepper';


function SummaryRow({ icon: Icon, label, value }: { icon: LucideIcon, label: string, value: string }) {
  const { theme } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.space.sm * 1.25}}>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.space.sm * 1.25,
          padding: theme.space.sm * 1.25,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.color.surface,
        }}
      >
        <Icon size={theme.space.md * 1.3} color={theme.color.accent} />
      </View>

      <View style={{ flex: 1, gap: theme.space.xs * 0.75 }}>
        <Text
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.regular,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.sm * 1.1,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}


export default function OnboardingReadyScreen() {
  const { draft, submitting, submitError, submit } = useOnboarding();
  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const handleFinish = async () => {
    const ok = await submit();
    if (ok) router.replace('/home');
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: theme.space.lg,
        paddingTop: theme.space.xl,
        backgroundColor: theme.color.background,
      }}
    >
      <OnboardingStepper currentStep={4} />

      <Text
        style={{
          color: theme.color.textPrimary,
          fontSize: theme.fontSize.xxl,
          fontFamily: theme.fontFamily.bold,
        }}
      >
        {theme.i18n.t('onboarding.ready.title')}
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
        {theme.i18n.t('onboarding.ready.subtitle')}
      </Text>

      <View
        style={{
          padding: theme.space.md,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.color.card,
        }}
      >
        <SummaryRow
          icon={CheckCircle2}
          label={theme.i18n.t('onboarding.ready.name')}
          value={draft.displayName}
        />
        <SummaryRow
          icon={GraduationCap}
          label={theme.i18n.t('onboarding.ready.role')}
          value={draft.role ?? '—'}
        />
        {draft.yearOfStudy && (
          <SummaryRow
            icon={CalendarClock}
            label={theme.i18n.t('onboarding.ready.year')}
            value={draft.yearOfStudy}
          />
        )}
        <SummaryRow
          icon={Target}
          label={theme.i18n.t('onboarding.ready.goal')}
          value={draft.targetExam ?? '—'}
        />
        {!!draft.institution && (
          <SummaryRow
            icon={Building2}
            label={theme.i18n.t('onboarding.ready.institution')}
            value={draft.institution}
          />
        )}
      </View>

      {submitError && (
        <Text
          style={{
            color: theme.color.error,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.regular,
            marginBottom: theme.space.md,
          }}
        >
          {submitError}
        </Text>
      )}

      <View style={{ flex: 1 }} />

      <OnboardingFooter
        continueLabel={theme.i18n.t('onboarding.ready.submit')}
        currentStep={4}
        loading={submitting}
        onBack={() => router.back()}
        onContinue={handleFinish}
      />
    </ScrollView>
  );
}
