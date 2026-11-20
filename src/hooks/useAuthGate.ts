import { ONBOARDING_DONE, useSession } from '../lib/session';

export type AuthGate = {
  loading: boolean;
  loggedIn: boolean;
  onboardingComplete: boolean;
  nextOnboardingStep: string;
};

export function useAuthGate(): AuthGate {
  const loading = useSession((state) => !state.ready);
  const loggedIn = useSession((state) => state.isLoggedIn);
  const onboardingStep = useSession((state) => state.onboardingStep);
  const onboardingSteps = ['name', 'currency', 'source'] as const;

  return {
    loading,
    loggedIn,
    onboardingComplete: onboardingStep >= ONBOARDING_DONE,
    nextOnboardingStep:
      onboardingSteps[onboardingStep] ?? onboardingSteps[0],
  };
}
