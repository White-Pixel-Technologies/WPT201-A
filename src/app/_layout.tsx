import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { SessionProvider, useSession, ONBOARDING_DONE } from '../lib/session';
import { nextOnboardingHref } from '../lib/routing';
import { ThemeProvider } from '../lib/theme';
import { useNetworkStatus } from '../lib/useNetworkStatus';
import OfflineBanner from '../components/ui/OfflineBanner';

function AppContent() {
  const { ready, isLoggedIn, onboardingStep } = useSession();
  const { isOnline } = useNetworkStatus();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!ready) return;

    const currentGroup = segments[0] as string | undefined;
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
