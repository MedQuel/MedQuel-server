import { useEffect } from 'react';
import { usePathname, useRouter } from 'expo-router';

import { useAppContext } from '../context/AppContext';


export function AuthGate({ children }: { children: React.ReactNode }) {
  const { authStatus } = useAppContext();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (authStatus === 'checking') return;

    const inAuthZone = pathname.startsWith('/auth');
    const inOnboardingZone = pathname.startsWith('/onboarding');
    const atSplash = pathname === '/';

    if (authStatus === 'unauthenticated' && !inAuthZone && !atSplash) {
      router.replace('/auth');
    } else if (authStatus === 'needsEmailVerification' && pathname !== '/auth/verifyEmail') {
      router.replace('/auth/verifyEmail');
    } else if (authStatus === 'needsOnboarding' && !inOnboardingZone) {
      router.replace('/onboarding');
    } else if (authStatus === 'authenticated' && (inAuthZone || inOnboardingZone || atSplash)) {
      router.replace('/home');
    }
  }, [authStatus, pathname, router]);

  return <>{children}</>;
}
