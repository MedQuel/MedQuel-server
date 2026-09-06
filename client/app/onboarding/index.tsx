import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Text, View, Platform } from 'react-native';
import { ScrollView, KeyboardAvoidingView } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { AuthInput } from '../../components/auth/AuthInput';
import { useBottomBar } from '../../common/context/useBottomBar';
import { useOnboarding } from '../../common/context/OnboardingContext';
import { FeatureHighlightsCard } from '../../components/FeaturesHighlightCard';
import { OnboardingFooter } from '../../components/onboarding/OnboardingFooter';
import { OnboardingStepper } from '../../components/onboarding/OnboardingStepper';


type OnboardingIconProps = Omit<React.ComponentProps<typeof Feather>, 'name'>;
const UserIcon = (props: OnboardingIconProps) => (
  <Feather name='user' {...props} />
);

export default function OnboardingWelcomeScreen() {
  const { draft, setDisplayName } = useOnboarding();
  const { theme } = useTheme();
  const router = useRouter();
  useBottomBar(false);

  const canContinue = draft.displayName.trim().length >= 5;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.color.background }}
      behavior={Platform.OS === 'android' ? 'height' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: theme.space.xl,
          paddingVertical: theme.space.lg,
          paddingHorizontal: theme.space.md,
        }}
      >
        <OnboardingStepper currentStep={1} />

        <Text
          style={{
            color: theme.color.textPrimary,
            fontSize: theme.fontSize.xxl,
            fontFamily: theme.fontFamily.bold,
          }}
        >
          {theme.i18n.t('onboarding.welcome.title')}
        </Text>
        <Text
          style={{
            color: theme.color.textSecondary,
            fontSize: theme.fontSize.sm * 1.1,
            fontFamily: theme.fontFamily.regular,
            marginTop: theme.space.xs,
            marginBottom: theme.space.xl,
          }}
        >
          {theme.i18n.t('onboarding.welcome.subtitle')}
        </Text>

        <AuthInput
          label={theme.i18n.t('onboarding.welcome.nameLabel')}
          icon={UserIcon as any}
          value={draft.displayName}
          onChangeText={setDisplayName}
          placeholder='Dr. John Doe'
          autoCapitalize='words'
          error={draft.displayName.length > 0 && !canContinue}
        />

        <View style={{ flex: 1 }} />
        
        <FeatureHighlightsCard />

        <OnboardingFooter
          continueLabel={theme.i18n.t('onboarding.continue')}
          currentStep={1}
          disabled={!canContinue}
          onContinue={() => router.push('/onboarding/profile')}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
