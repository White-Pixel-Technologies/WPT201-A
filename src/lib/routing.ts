import type { Href } from 'expo-router';

export const ONBOARDING_STEPS = ['name', 'currency', 'source'] as const;

const AUTH_PATHS = ['/welcome', '/login', '/signup', '/forgot-password'];

/** Next unfinished onboarding screen for a logged-in user. */
export function nextOnboardingHref(step: number): Href {
  const name = ONBOARDING_STEPS[Math.min(step, ONBOARDING_STEPS.length - 1)];
  return ('/onboarding/' + name) as Href;
}

/** Only allows paths inside our app, e.g. "/transactions?month=2026-10". */
export function safeRedirectPath(value: unknown): Href {
  if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
    const path = value.split('?')[0];
    if (!AUTH_PATHS.includes(path)) return value as Href;
  }
  return '/home' as Href;
}

/** Rebuilds "/transactions?month=2026-10" from the pathname and query params. */
export function currentUrl(
  pathname: string,
  params: Record<string, string | string[] | undefined>,
): string {
  const query = new URLSearchParams();
  const segments = pathname.split('/');
  for (const [key, value] of Object.entries(params)) {
    // skip route params such as :id that are already inside the path
    if (typeof value === 'string' && !segments.includes(value)) query.set(key, value);
  }
  const text = query.toString();
  return text ? pathname + '?' + text : pathname;
}
