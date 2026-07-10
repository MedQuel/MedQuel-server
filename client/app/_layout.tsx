import { Slot } from 'expo-router';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ThemeProvider } from '../theme/ThemeContext';
import { AuthGate } from '../common/navigation/AuthGate';
import { AppProvider } from '../common/context/AppContext';
import { AppBottomBar } from '../components/common/AppBottomBar';
import { LayoutProvider } from '../common/context/LayoutContext';


export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular: require('../assets/fonts/SpaceGrotesk-Regular.ttf'),
    PlusJakartaSans_700Bold: require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    PlusJakartaSans_200Light: require('../assets/fonts/PlusJakartaSans-Light.ttf'),
    PlusJakartaSans_400Regular: require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
  });
  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style='auto' animated={true} />

      <SafeAreaProvider>
        <ThemeProvider>
          <AppProvider>
            <AuthGate>
              <LayoutProvider>
                <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                  <View style={{ flex: 1 }}>
                    <Slot />
                    <AppBottomBar />
                  </View>
                </SafeAreaView>
              </LayoutProvider>
            </AuthGate>
          </AppProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </>
  );
}
