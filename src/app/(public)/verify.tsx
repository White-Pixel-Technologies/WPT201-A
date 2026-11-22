import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { EmailOtpType } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

type VerifyStatus = 'loading' | 'verified' | 'failed';

export default function VerifyEmail() {
  const params = useLocalSearchParams<{
    token_hash?: string | string[];
    token?: string | string[];
    type?: string | string[];
    error?: string | string[];
    error_description?: string | string[];
  }>();

  const router = useRouter();
  const verificationPromise = useRef<Promise<boolean> | null>(null);

  const rawTokenHash = params.token_hash ?? params.token;
  const tokenHash = Array.isArray(rawTokenHash)
    ? rawTokenHash[0]
    : rawTokenHash;

  const rawType = params.type;
  const typeParam = Array.isArray(rawType) ? rawType[0] : rawType;

  const [status, setStatus] = useState<VerifyStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let active = true;

    async function verifyEmail() {
      // 1. Check if an error was passed directly via query params
      const errorParam = Array.isArray(params.error)
        ? params.error[0]
        : params.error;
      const errorDesc = Array.isArray(params.error_description)
        ? params.error_description[0]
        : params.error_description;

      if (errorParam) {
        if (active) {
          setStatus('failed');
          setErrorMessage(
            errorDesc
              ? decodeURIComponent(errorDesc)
              : 'Verification link is invalid or expired.',
          );
        }
        return;
      }

      // 2. Check for tokens or errors in URL hash on Web
      if (typeof window !== 'undefined' && window.location?.hash) {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);

        const hashError = hashParams.get('error');
        const hashErrorDesc = hashParams.get('error_description');
        if (hashError) {
          if (active) {
            setStatus('failed');
            setErrorMessage(
              hashErrorDesc
                ? decodeURIComponent(hashErrorDesc)
                : 'Verification link is invalid or expired.',
            );
          }
          return;
        }

        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken && refreshToken) {
          try {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!sessionError && active) {
              setStatus('verified');
              return;
            }
          } catch {
            // continue to token_hash check
          }
        }
      }

      // 3. If token_hash / token is present, call verifyOtp
      if (tokenHash) {
        const otpType: EmailOtpType =
          typeParam === 'email' ? 'email' : 'signup';

        verificationPromise.current ??= (async () => {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType,
          });

          if (!error) return true;

          // If signup failed and type was not explicit, try 'email' fallback
          if (!typeParam && otpType === 'signup') {
            const retry = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'email',
            });
            return !retry.error;
          }

          return false;
        })();

        const verified = await verificationPromise.current;

        if (active) {
          setStatus(verified ? 'verified' : 'failed');
          if (!verified) {
            setErrorMessage(
              'This verification link has expired or already been used.',
            );
          }
        }
        return;
      }

      // 4. Check if the user already has an active session
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user && active) {
          setStatus('verified');
          return;
        }
      } catch {
        // Fall through to failed
      }

      // 5. No token or active session found
      if (active) {
        setStatus('failed');
        setErrorMessage(
          'No verification token found. Please check the link from your email.',
        );
      }
    }

    void verifyEmail();

    return () => {
      active = false;
    };
  }, [tokenHash, typeParam, params.error, params.error_description]);

  useEffect(() => {
    if (status !== 'verified') return;

    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 1500);

    return () => clearTimeout(timer);
  }, [status, router]);

  return (
    <View style={styles.container}>
      {status === 'loading' && <ActivityIndicator size="large" color="#0F6E56" />}

      <Text
        style={styles.title}
        accessibilityRole="header"
        accessibilityLiveRegion="polite"
      >
        {status === 'loading'
          ? 'Verifying your email...'
          : status === 'verified'
            ? 'Your email has been successfully verified!'
            : 'Email verification failed'}
      </Text>

      {status === 'failed' && (
        <>
          <Text style={styles.subtitle}>
            {errorMessage || 'This verification link has expired or is invalid.'}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go to log in"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Go to log in</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 360,
  },
  button: {
    backgroundColor: '#0F6E56',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
