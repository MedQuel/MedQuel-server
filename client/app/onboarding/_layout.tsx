import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';

import { useAppContext } from '../../common/context/AppContext';
import { OnboardingProvider } from '../../common/context/OnboardingContext';


export default function OnboardingLayout() {
  const router = useRouter();
  const { authStatus } = useAppContext();

  useEffect(() => {
    if (authStatus === 'authenticated') router.replace('/home');
    else if (authStatus === 'unauthenticated') router.replace('/auth');
    else if (authStatus === 'needsEmailVerification') router.replace('/auth/verifyEmail');
  }, [authStatus, router]);

  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingProvider>
  );
}
