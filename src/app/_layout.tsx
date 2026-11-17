import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthGate } from '../hooks/useAuthGate';
import { resolveRedirect } from '../lib/resolveRedirect';
import { ThemeProvider } from '../theme/theme-context';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const pathname = usePathname();
  const router = useRouter();
  const gate = useAuthGate();
  const redirect = resolveRedirect(pathname, gate);

  useEffect(() => {
    if (!gate.loading && redirect) {
      router.replace(redirect as never);
    }
  }, [gate.loading, redirect, router]);

  if (!fontsLoaded || gate.loading || redirect) {
    return null;
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}