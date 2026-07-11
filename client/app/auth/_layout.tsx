import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';

import { useAppContext } from '../../common/context/AppContext';


export default function AuthLayout() {
  const router = useRouter();
  const { authStatus } = useAppContext();

  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.replace('/home');
    } else if (authStatus === 'needsOnboarding') {
      router.replace('/onboarding');
    } else if (authStatus === 'needsEmailVerification') {
      router.replace('/auth/verifyEmail');
    } else if (authStatus === 'unauthenticated') {
      router.replace('/auth');
    }
  }, [authStatus, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
