import { useRouter } from 'expo-router';
import type { ComponentType } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Feather, Ionicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { useOnboarding } from '../../common/context/OnboardingContext';
import { OnboardingFooter } from '../../components/onboarding/OnboardingFooter';
import { OnboardingStepper } from '../../components/onboarding/OnboardingStepper';


type OnboardingIconProps = { size?: number; color?: string };
const CheckCircleIcon = (props: OnboardingIconProps) => (
  <FontAwesome5 name='user-graduate' {...props} />
);
const GraduationIcon = (props: OnboardingIconProps) => (
  <Ionicons name='briefcase-outline' {...props} />
);
const TargetIcon = (props: OnboardingIconProps) => (
  <Feather name='target' {...props} />
);
const BuildingIcon = (props: OnboardingIconProps) => (
  <FontAwesome name='institution' {...props} />
);
const CalendarIcon = (props: OnboardingIconProps) => (
  <Feather name='calendar' {...props} />
);
const StethoscopeIcon = (props: OnboardingIconProps) => (
  <FontAwesome name='stethoscope' {...props} />
);
const LayersIcon = (props: OnboardingIconProps) => (
  <Feather name='layers' {...props} />
);

function SummaryRow({ icon: Icon, label, value }: {
  icon: ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
}) {
  const { theme } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.space.sm * 1.25 }}>
      <View
        style={{
          height: theme.space.md * 2.75,
          width: theme.space.md * 2.75,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.space.sm * 1.25,
          marginRight: theme.space.sm * 1.25,
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
            fontSize: theme.fontSize.sm,
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
      <OnboardingStepper currentStep={5} />

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
          icon={CheckCircleIcon}
          label={theme.i18n.t('onboarding.ready.name')}
          value={draft.displayName}
        />
        <SummaryRow
          icon={GraduationIcon}
          label={theme.i18n.t('onboarding.ready.role')}
          value={draft.role ?? '—'}
        />
        {draft.yearOfStudy && (
          <SummaryRow
            icon={CalendarIcon}
            label={theme.i18n.t('onboarding.ready.year')}
            value={draft.yearOfStudy}
          />
        )}
        {draft.specialties.length > 0 && (
          <SummaryRow
            icon={StethoscopeIcon}
            label={theme.i18n.t('onboarding.ready.specialty')}
            value={draft.specialties.join(', ')}
          />
        )}
        <SummaryRow
          icon={TargetIcon}
          label={theme.i18n.t('onboarding.ready.goal')}
          value={draft.targetExam ?? '—'}
        />
        {!!draft.institution && (
          <SummaryRow
            icon={BuildingIcon}
            label={theme.i18n.t('onboarding.ready.institution')}
            value={draft.institution}
          />
        )}
        <SummaryRow
          icon={LayersIcon}
          label={theme.i18n.t('onboarding.ready.scope')}
          value={draft.contentScope === 'focused'
            ? theme.i18n.t('onboarding.ready.scopeFocused', { subjects: draft.focusSubjects.join(', ') })
            : theme.i18n.t('onboarding.ready.scopeAll')
          }
        />
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
        currentStep={5}
        loading={submitting}
        onBack={() => router.back()}
        onContinue={handleFinish}
      />
    </ScrollView>
  );
}
