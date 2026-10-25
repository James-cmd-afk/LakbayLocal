import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { AuthProvider } from '../hooks/useAuth';

export default function RootLayout() {
  const [fontsLoaded] = useFonts(Ionicons.font);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <StatusBar style="dark" />
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
