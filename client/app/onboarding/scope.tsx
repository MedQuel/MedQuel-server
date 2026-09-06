import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View, Text, ScrollView, Pressable } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useBottomBar } from '../../common/context/useBottomBar';
import { MultiSelectChips } from '../../components/common/MultiSelectChips';
import { useOnboarding, SPECIALTY_OPTIONS } from '../../common/context/OnboardingContext';
import { MAX_FOCUS_SUBJECTS, MIN_FOCUS_SUBJECTS } from '../../common/context/OnboardingContext';

import { OnboardingFooter } from '../../components/onboarding/OnboardingFooter';
import { OnboardingStepper } from '../../components/onboarding/OnboardingStepper';


type OnboardingIconProps = Omit<React.ComponentProps<typeof Feather>, 'name'>;
const LayersIcon = (props: OnboardingIconProps) => (
  <Feather name='layers' {...props} />
);
const TargetIcon = (props: OnboardingIconProps) => (
  <Feather name='target' {...props} />
);

function ScopeCard({ icon: Icon, title, subtitle, selected, onPress }: {
  icon: React.ComponentType<OnboardingIconProps>;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        gap: theme.space.md,
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: theme.space.md,
        marginBottom: theme.space.sm,
        borderWidth: 1.5,
        borderRadius: theme.borderRadius.xl,
        borderColor: selected ? theme.color.accent : theme.color.border,
        backgroundColor: selected ? theme.color.accent + '15' : theme.color.card,
      }}
    >
      <View
        style={{
          padding: theme.space.sm,
          borderRadius: theme.borderRadius.md,
          backgroundColor: selected ? theme.color.accent : theme.color.surface,
        }}
      >
        <Icon size={theme.space.md * 1.2} color={selected ? theme.color.textInverse : theme.color.accent} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.md,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.regular,
            marginTop: theme.space.xs * 0.5,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}


export default function OnboardingScopeScreen() {
  const { draft, setContentScope, toggleFocusSubject } = useOnboarding();
  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const canContinue =
    draft.contentScope === 'all' ||
    (draft.contentScope === 'focused' && draft.focusSubjects.length >= MIN_FOCUS_SUBJECTS);

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
      <OnboardingStepper currentStep={4} />

      <Text
        style={{
          color: theme.color.textPrimary,
          fontSize: theme.fontSize.xxl,
          fontFamily: theme.fontFamily.bold,
        }}
      >
        {theme.i18n.t('onboarding.scope.title')}
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
        {theme.i18n.t('onboarding.scope.subtitle')}
      </Text>

      <ScopeCard
        icon={LayersIcon}
        title={theme.i18n.t('onboarding.scope.allTitle')}
        subtitle={theme.i18n.t('onboarding.scope.allSubtitle')}
        selected={draft.contentScope === 'all'}
        onPress={() => setContentScope('all')}
      />
      <ScopeCard
        icon={TargetIcon}
        title={theme.i18n.t('onboarding.scope.focusedTitle')}
        subtitle={theme.i18n.t('onboarding.scope.focusedSubtitle')}
        selected={draft.contentScope === 'focused'}
        onPress={() => setContentScope('focused')}
      />

      {draft.contentScope === 'focused' && (
        <View
          style={{
            gap: theme.space.sm,
            padding: theme.space.md,
            marginTop: theme.space.sm,
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
            }}
          >
            {theme.i18n.t('onboarding.scope.pickSubjects')}
          </Text>
          <Text
            style={{
              color: theme.color.textMuted,
              fontSize: theme.fontSize.xs,
              marginBottom: theme.space.sm,
            }}
          >
            {theme.i18n.t('onboarding.scope.pickSubjectsHint', { max: MAX_FOCUS_SUBJECTS })}
          </Text>

          <MultiSelectChips
            options={SPECIALTY_OPTIONS}
            selected={draft.focusSubjects}
            max={MAX_FOCUS_SUBJECTS}
            onToggle={toggleFocusSubject}
          />
        </View>
      )}

      <View style={{ flex: 1 }} />

      <OnboardingFooter
        continueLabel={theme.i18n.t('onboarding.continue')}
        currentStep={4}
        disabled={!canContinue}
        onBack={() => router.back()}
        onContinue={() => router.push('/onboarding/ready')}
      />
    </ScrollView>
  );
}
