import { Slot, usePathname } from 'expo-router';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ThemeProvider } from '../theme/ThemeContext';
import { AppBottomBar } from '../components/common/AppBottomBar';
import { LayoutProvider } from '../common/context/LayoutContext';


const ROUTES_WITHOUT_BOTTOM_BAR = ['/contests/preQuizScreen', '/contests/QuizScreen', '/contests/PostQuizScreen'];

export default function App() {
  const pathname = usePathname();
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular: require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    PlusJakartaSans_200Light: require('../assets/fonts/PlusJakartaSans-Light.ttf'),
    PlusJakartaSans_700Bold: require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    SpaceGrotesk_400Regular: require('../assets/fonts/SpaceGrotesk-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  const hideBottomBar = ROUTES_WITHOUT_BOTTOM_BAR.some(route => pathname.startsWith(route));

  return (
    <>
      <StatusBar style='auto' animated={true} />

      <SafeAreaProvider>
        <ThemeProvider>
          <LayoutProvider>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
              <View style={{ flex: 1 }}>
                <Slot />
                {!hideBottomBar && <AppBottomBar />}
              </View>
            </SafeAreaView>
          </LayoutProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </>
  );
}
