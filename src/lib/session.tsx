import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { RESET_REDIRECT_URL, VERIFY_REDIRECT_URL } from '../constants/urls';

export const ONBOARDING_DONE = 3;
const ONBOARDING_KEY = 'savemode-onboarding-step';

const SESSION_STORAGE_KEY = 'wpt201a-session';
const LEGACY_SESSION_STORAGE_KEY = 'savemode-session';

// Keep wallet for compatibility with previously saved data.
export type SourceType = 'bank' | 'cash' | 'wallet' | 'credit_card';

export type OnboardingData = {
  name: string;
  currency: string;
  sourceName: string;
  sourceType: SourceType;
  initialBalance: number;
  creditLimit: number;
  outstanding: number;
};

export type Source = {
  id: string;
  name: string;
  type: SourceType;
  openingBalance: number;
  creditLimit: number;
  outstanding: number;
};

type NewSource = Omit<Source, 'id'>;

export type TransactionType = 'income' | 'expense' | 'transfer' | 'adjustment';

export type Transaction = {
  id: string;
  type: TransactionType;
  date: string;
  description?: string;
  amount: number;
  tag?: string;
  sourceId?: string;
  fromSourceId?: string;
  toSourceId?: string;
};

export type NewTransaction = Omit<Transaction, 'id'>;

type SessionState = {

type SessionValue = {
  ready: boolean;
  isLoggedIn: boolean;
  user: User | null;
  userName: string;
  currencyCode: string;
  onboardingStep: number;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  finishOnboardingStep: () => void;
  setOnboardingStep: (step: number) => void;
  setUserName: (name: string) => void;
  setCurrencyCode: (code: string) => void;
  refreshUserSettings: () => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
};


const createSource = (data: NewSource): Source => ({
  ...data,
  id: `source-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
});

const createTransaction = (data: NewTransaction): Transaction => ({
  ...data,
  id: `transaction-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
});

const appStorage = {
  getItem: async (name: string) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return null;
      const value = window.localStorage.getItem(name);
      if (value !== null || name !== SESSION_STORAGE_KEY) return value;

      const legacyValue = window.localStorage.getItem(
        LEGACY_SESSION_STORAGE_KEY,
      );
      if (legacyValue !== null) {
        window.localStorage.setItem(name, legacyValue);
        window.localStorage.removeItem(LEGACY_SESSION_STORAGE_KEY);
      }
      return legacyValue;

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [currencyCode, setCurrencyCode] = useState<string>('INR');
  const [onboardingStep, setOnboardingStepState] = useState(0);
  const [ready, setReady] = useState(false);

  const syncUserSettings = useCallback(async (userId: string, savedStep: string | null) => {
    try {
      try {
        await supabase.rpc('ensure_user_setup');
      } catch {
        // Continue if RPC is unavailable.
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('name, currency_code, onboarding_completed')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        return;
      }

      if (data.name) {
        setUserName(data.name);
      }

      if (data.currency_code) {
        setCurrencyCode(data.currency_code);
      }

      if (data.onboarding_completed) {
        setOnboardingStepState(ONBOARDING_DONE);
        await AsyncStorage.setItem(ONBOARDING_KEY, String(ONBOARDING_DONE));
      } else {
        if (!data.name || data.name.trim().length === 0) {
          setOnboardingStepState(0);
          await AsyncStorage.setItem(ONBOARDING_KEY, '0');
        } else {
          const parsed = Number(savedStep);
          const stepToSet = parsed === 2 ? 2 : 1;
          setOnboardingStepState(stepToSet);
          await AsyncStorage.setItem(ONBOARDING_KEY, String(stepToSet));
        }
      }
    } catch {
      // Keep app functioning with local state.

    }
  }, []);


    const value = await AsyncStorage.getItem(name);
    if (value !== null || name !== SESSION_STORAGE_KEY) return value;

    const legacyValue = await AsyncStorage.getItem(LEGACY_SESSION_STORAGE_KEY);
    if (legacyValue !== null) {
      await AsyncStorage.setItem(name, legacyValue);
      await AsyncStorage.removeItem(LEGACY_SESSION_STORAGE_KEY);
    }
    return legacyValue;
  },

  useEffect(() => {
    let mounted = true;


    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);

        if (newSession?.user) {
          const metaName = (
            newSession.user.user_metadata?.full_name ||
            newSession.user.user_metadata?.name ||
            ''
          ) as string;

          if (metaName) {
            setUserName((prev) => prev || metaName);
          }

          void AsyncStorage.getItem(ONBOARDING_KEY).then((saved) => {
            if (mounted) {
              void syncUserSettings(newSession.user.id, saved);
            }
          });
        }
      },
    );

    async function initialize() {
      try {
        const [sessionResult, savedStep] = await Promise.all([
          supabase.auth.getSession(),
          AsyncStorage.getItem(ONBOARDING_KEY),
        ]);

        if (!mounted) return;

        const currentSession = sessionResult.error
          ? null
          : sessionResult.data.session;

        setSession(currentSession);

        if (currentSession?.user) {
          const metaName = (
            currentSession.user.user_metadata?.full_name ||
            currentSession.user.user_metadata?.name ||
            ''
          ) as string;

          if (metaName) {
            setUserName(metaName);
          }

          await syncUserSettings(currentSession.user.id, savedStep);
        } else {
          const parsedStep = Number(savedStep);

          setOnboardingStepState(
            Number.isInteger(parsedStep) &&
              parsedStep >= 0 &&
              parsedStep <= ONBOARDING_DONE
              ? parsedStep
              : 0,
          );
        }
      } catch {
        if (mounted) {
          setSession(null);
          setOnboardingStepState(0);
        }
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    }


      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [...state.transactions, createTransaction(transaction)],
        })),
    }),
    {
      name: SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => appStorage),

      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        onboardingStep: state.onboardingStep,
        onboardingData: state.onboardingData,
        sources: state.sources,
        transactions: state.transactions,
      }),

      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const migratedSources: Source[] = Array.isArray(state.sources)
          ? state.sources
          : state.onboardingData?.sourceName?.trim()
            ? [
                createSource({
                  name: state.onboardingData.sourceName.trim(),
                  type: state.onboardingData.sourceType,
                  openingBalance: state.onboardingData.initialBalance ?? 0,
                  creditLimit: state.onboardingData.creditLimit ?? 0,
                  outstanding: state.onboardingData.outstanding ?? 0,
                }),
              ]
            : [];

        useSession.setState({
          sources: migratedSources,
          transactions: Array.isArray(state.transactions)
            ? state.transactions
            : [],
          ready: true,
        });
      },
    },
  ),
);

    void initialize();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [syncUserSettings]);

  const refreshUserSettings = useCallback(async () => {
    if (!session?.user?.id) return;

    const saved = await AsyncStorage.getItem(ONBOARDING_KEY);
    await syncUserSettings(session.user.id, saved);
  }, [session, syncUserSettings]);

  const setOnboardingStep = useCallback((step: number) => {
    const clamped = Math.max(0, Math.min(step, ONBOARDING_DONE));

    setOnboardingStepState(clamped);
    void AsyncStorage.setItem(ONBOARDING_KEY, String(clamped)).catch(() => {});
  }, []);

  const finishOnboardingStep = useCallback(() => {
    setOnboardingStepState((currentStep) => {
      const next = Math.min(currentStep + 1, ONBOARDING_DONE);
      void AsyncStorage.setItem(ONBOARDING_KEY, String(next)).catch(() => {});
      return next;
    });
  }, []);

  const markOnboardingComplete = useCallback(async () => {
    setOnboardingStepState(ONBOARDING_DONE);

    await AsyncStorage.setItem(
      ONBOARDING_KEY,
      String(ONBOARDING_DONE),
    ).catch(() => {});

    if (session?.user?.id) {
      try {
        await supabase
          .from('user_settings')
          .update({ onboarding_completed: true })
          .eq('user_id', session.user.id);
      } catch {
        // Handled.
      }
    }
  }, [session]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName?: string,
  ): Promise<string | null> => {
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: fullName ? { full_name: fullName } : undefined,
          emailRedirectTo: VERIFY_REDIRECT_URL,
        },
      });

      return error?.message ?? null;
    } catch {
      return 'Unable to create your account. Please try again.';
    }
  }, []);

  const login = useCallback(async (
    email: string,
    password: string,
  ): Promise<string | null> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      return error?.message ?? null;
    } catch {
      return 'Unable to log in. Please try again.';
    }
  }, []);

  const logout = useCallback(async (): Promise<string | null> => {
    try {
      const { error } = await supabase.auth.signOut({
        scope: 'local',
      });

      await AsyncStorage.removeItem(ONBOARDING_KEY).catch(() => {});
      setSession(null);
      setUserName('');
      setOnboardingStepState(0);

      return error?.message ?? null;
    } catch {
      return 'Unable to log out. Please try again.';
    }
  }, []);

  const resetPassword = useCallback(async (
    email: string,
  ): Promise<string | null> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: RESET_REDIRECT_URL,
        },
      );

      return error?.message ?? null;
    } catch {
      return 'Unable to send the reset link. Please try again.';
    }
  }, []);

  const updatePassword = useCallback(async (
    password: string,
  ): Promise<string | null> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      return error?.message ?? null;
    } catch {
      return 'Unable to update your password. Please try again.';
    }
  }, []);

  const value = useMemo(() => ({
    ready,
    isLoggedIn: !!session,
    user: session?.user ?? null,
    userName,
    currencyCode,
    onboardingStep,
    signUp,
    login,
    logout,
    resetPassword,
    updatePassword,
    finishOnboardingStep,
    setOnboardingStep,
    setUserName,
    setCurrencyCode,
    refreshUserSettings,
    markOnboardingComplete,
  }), [
    ready,
    session,
    userName,
    currencyCode,
    onboardingStep,
    signUp,
    login,
    logout,
    resetPassword,
    updatePassword,
    finishOnboardingStep,
    setOnboardingStep,
    refreshUserSettings,
    markOnboardingComplete,
  ]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);

  if (!value) {
    throw new Error('useSession must be used inside SessionProvider');
  }

  return value;
}

