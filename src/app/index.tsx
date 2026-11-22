import { Redirect } from 'expo-router';
import { nextOnboardingHref } from '../lib/routing';
import { ONBOARDING_DONE, useSession } from '../lib/session';

export default function Index() {

  return null;

  const { ready, isLoggedIn, onboardingStep } = useSession();

  if (!ready) return null;
  if (!isLoggedIn) return <Redirect href="/(auth)/welcome" />;
  if (onboardingStep < ONBOARDING_DONE) return <Redirect href={nextOnboardingHref(onboardingStep)} />;

  return <Redirect href="/home" />;

}
