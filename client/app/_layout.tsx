import React from 'react';
import { Slot } from 'expo-router';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <>
      <StatusBar style='auto' animated={true} />

      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <Slot />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}
