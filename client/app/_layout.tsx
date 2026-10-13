import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import Constants from 'expo-constants';
import * as NavigationBar from 'expo-navigation-bar';
import { View, Platform, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AuthGate } from '../common/navigation/AuthGate';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import { AppBottomBar } from '../components/common/AppBottomBar';
import { LayoutProvider } from '../common/context/LayoutContext';
import { AppProvider, useAppContext } from '../common/context/AppContext';
import { usePushNotifications } from '../common/notifications/usePushNotifications';


function SystemChrome() {
  const { theme } = useTheme();

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (typeof NavigationBar.setStyle === 'function') {
      NavigationBar.setStyle(theme.isDark ? 'light' : 'dark');
    }
  }, [theme.isDark]);

  return (
    <StatusBar
      animated
      translucent={Platform.OS === 'android'}
      barStyle={theme.isDark ? 'light-content' : 'dark-content'}
      backgroundColor={Platform.OS === 'android' ? 'transparent' : undefined}
    />
  );
}

function PushNotificationsMount() {
  const { authStatus, user } = useAppContext();
  usePushNotifications(authStatus === 'authenticated' ? user?.uid : null);
  return null;
}
function PushNotificationsRuntime() {
  if (Platform.OS === 'web' || Constants.appOwnership === 'expo') return null;
  return <PushNotificationsMount />;
}

function AppShell() {
  const { theme } = useTheme();

  return (
    <AppProvider>
      <AuthGate>
        <LayoutProvider>
          <PushNotificationsRuntime />
          <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.color.background }}
            edges={['top', 'left', 'right']}
          >
            <View style={{ flex: 1, backgroundColor: theme.color.background }}>
              <Slot />
              <AppBottomBar />
            </View>
          </SafeAreaView>
        </LayoutProvider>
      </AuthGate>
    </AppProvider>
  );
}


export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_700Bold: require('../assets/fonts/SpaceGrotesk-Bold.ttf'),
    SpaceGrotesk_400Regular: require('../assets/fonts/SpaceGrotesk-Regular.ttf'),
    PlusJakartaSans_700Bold: require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    PlusJakartaSans_200Light: require('../assets/fonts/PlusJakartaSans-Light.ttf'),
    PlusJakartaSans_400Regular: require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
  });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SystemChrome />
        <AppShell />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
