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
    }
  }, [authStatus, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
