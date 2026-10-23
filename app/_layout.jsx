import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../hooks/useAuth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="destinations/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="itinerary/create" options={{ headerShown: false }} />
        <Stack.Screen name="itinerary/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="budget-builder" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
