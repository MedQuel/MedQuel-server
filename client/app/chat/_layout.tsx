import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Discussion Rooms list - custom header inside index.tsx */}
      <Stack.Screen name="index" />

      {/* Individual chat view - custom header inside [roomId].tsx */}
      <Stack.Screen name="[roomId]" />

      {/* Notifications screen (already exists in your project) */}
      <Stack.Screen name="notifications" />
    </Stack>
  );
}