import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import OfflineBanner from '../components/ui/OfflineBanner';
import { nextOnboardingHref } from '../lib/routing';
import { ONBOARDING_DONE, SessionProvider, useSession } from '../lib/session';
import { useNetworkStatus } from '../lib/useNetworkStatus';
import { ThemeProvider } from '../theme/theme-context';

function AppContent() {

  const { ready, isLoggedIn, onboardingStep } = useSession();
  const { isOnline } = useNetworkStatus();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!ready) return;

    const currentGroup = segments[0] as string | undefined;
    const currentScreen = segments[1] as string | undefined;
    const isRecoveryScreen =
  currentGroup === '(auth)' &&
  ['forgot-password', 'check-email'].includes(currentScreen ?? '');

if (isRecoveryScreen) return;
    const isRoot = !currentGroup;
    const isPublic =
      isRoot || currentGroup === '(auth)' || currentGroup === '(public)';

    if (!isLoggedIn) {
      if (!isPublic) {
        router.replace('/(auth)/welcome');
      }
      return;
    }

    // User is logged in
    if (onboardingStep < ONBOARDING_DONE) {
      if (currentGroup !== 'onboarding' && currentGroup !== '(public)') {
        router.replace(nextOnboardingHref(onboardingStep));
      }
    } else {
      if (currentGroup === '(auth)' || currentGroup === 'onboarding') {
        router.replace('/home');
      }
    }
  }, [ready, isLoggedIn, onboardingStep, segments, router]);

  return (
    <View style={styles.container}>
      <OfflineBanner visible={!isOnline} />
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  useEffect(() => {
  if (Platform.OS === 'web') return;

  const { width, height } = Dimensions.get('screen');

  if (Math.min(width, height) < 600) {
    void ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    ).catch((error: unknown) => {
      console.warn('Unable to lock phone orientation to portrait:', error);
    });
  }
}, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SessionProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SessionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
