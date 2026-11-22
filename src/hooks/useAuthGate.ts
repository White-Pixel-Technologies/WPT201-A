import { ONBOARDING_DONE, useSession } from '../lib/session';
import { nextOnboardingHref } from '../lib/routing';

export type AuthGate = {
  loading: boolean;
  loggedIn: boolean;
  onboardingComplete: boolean;
  nextOnboardingStep: string;
};

export function useAuthGate(): AuthGate {
  const { ready, isLoggedIn, onboardingStep } = useSession();

  return {
    loading: !ready,
    loggedIn: isLoggedIn,
    onboardingComplete: onboardingStep >= ONBOARDING_DONE,
    nextOnboardingStep: String(nextOnboardingHref(onboardingStep)),
  };
}
