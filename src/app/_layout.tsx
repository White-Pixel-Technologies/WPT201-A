import { useEffect } from 'react';
import {
  Stack,
  useGlobalSearchParams,
  usePathname,
  useRouter,
  useSegments,
  type Href,
} from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { SessionProvider, useSession, ONBOARDING_DONE } from '../lib/session';
import { currentUrl, nextOnboardingHref, rememberReturnPath, takeReturnPath } from '../lib/routing';
import { ThemeProvider } from '../theme/theme-context';
import { useNetworkStatus } from '../lib/useNetworkStatus';
import OfflineBanner from '../components/ui/OfflineBanner';

function AppContent() {
  const { ready, isLoggedIn, onboardingStep } = useSession();
  const { isOnline } = useNetworkStatus();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    if (!ready) return;

    const currentGroup = segments[0] as string | undefined;
    const isRoot = !currentGroup;
    // D4: '+not-found' must also be public so logged-out users see the 404
    // screen instead of being redirected to Welcome.
    const isPublic =
      isRoot ||
      currentGroup === '(auth)' ||
      currentGroup === '(public)' ||
      currentGroup === '+not-found';

    if (!isLoggedIn) {
      if (!isPublic) {
        // PRD 4.3: remember the page, send the person to Log in
        const back = currentUrl(pathname, params);
        rememberReturnPath(back);
        router.replace(('/login?next=' + encodeURIComponent(back)) as Href);
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
        // PRD 4.3: go back to the page the person first asked for
        router.replace(takeReturnPath());
      }
    }
  }, [ready, isLoggedIn, onboardingStep, segments, router, pathname, params]);

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
  const [loaded, error] = useFonts({
    Inter_400Regular: require('../../assets/fonts/Inter_400Regular.ttf'),
    Inter_500Medium: require('../../assets/fonts/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('../../assets/fonts/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('../../assets/fonts/Inter_700Bold.ttf'),
    // Icon fonts must load from assets/fonts: Cloudflare never uploads node_modules
    feather: require('../../assets/fonts/Feather.ttf'),
    'material-community': require('../../assets/fonts/MaterialCommunityIcons.ttf'),
  });

  if (!loaded && !error) {
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
