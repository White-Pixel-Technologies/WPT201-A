import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { EmailOtpType } from '@supabase/supabase-js';
import { useSession } from '../../lib/session';
import { supabase } from '../../lib/supabase';
import { useNetworkStatus } from '../../lib/useNetworkStatus';
import { useTheme } from '../../theme/theme-context';
import OfflineBanner from '../../components/ui/OfflineBanner';
import { t } from '../../i18n';

type ResetStatus = 'checking' | 'ready' | 'invalid';

export default function ResetPassword() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    token_hash?: string | string[];
    token?: string | string[];
    type?: string | string[];
    error?: string | string[];
    error_description?: string | string[];
  }>();

  const { updatePassword } = useSession();
  const { isOnline } = useNetworkStatus();
  const { colors } = useTheme();

  const [status, setStatus] = useState<ResetStatus>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const hasMinLength = password.length >= 8;
  const hasMaxLength = password.length <= 64;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasAllowedCharacters = /^[\x20-\x7E]*$/.test(password);

  const isPasswordValid =
    hasMinLength &&
    hasMaxLength &&
    hasLetter &&
    hasNumber &&
    hasAllowedCharacters;

  useEffect(() => {
    let active = true;

    async function checkSessionOrToken() {
      // 1. Direct query param error
      if (params.error) {
        if (active) {
          setStatus('invalid');
          setMessage(t('info.link.expired'));
        }
        return;
      }

      // 2. Hash params on web
      if (typeof window !== 'undefined' && window.location?.hash) {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);

        if (hashParams.get('error')) {
          if (active) {
            setStatus('invalid');
            setMessage(t('info.link.expired'));
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
              setStatus('ready');
              return;
            }
          } catch {
            // continue
          }
        }
      }

      // 3. token_hash param
      const rawTokenHash = params.token_hash ?? params.token;
      const tokenHash = Array.isArray(rawTokenHash)
        ? rawTokenHash[0]
        : rawTokenHash;
      const rawType = params.type;
      const typeParam = Array.isArray(rawType) ? rawType[0] : rawType;

      if (tokenHash) {
        const otpType: EmailOtpType =
          typeParam === 'recovery' ? 'recovery' : 'recovery';

        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType,
        });

        if (!error && active) {
          setStatus('ready');
          return;
        }

        if (active) {
          setStatus('invalid');
          setMessage(t('info.link.expired'));
        }
        return;
      }

      // 4. Existing active session
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user && active) {
          setStatus('ready');
          return;
        }
      } catch {
        // continue
      }

      if (active) {
        setStatus('invalid');
        setMessage(t('info.link.expired'));
      }
    }

    void checkSessionOrToken();

    return () => {
      active = false;
    };
  }, [params.token_hash, params.token, params.type, params.error]);

  async function handleUpdatePassword() {
    setMessage('');

    if (!isOnline) {
      setMessage(t('info.offline.save'));
      return;
    }

    if (!password || !confirmPassword) {
      setMessage('Enter your new password and confirm it.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    if (!isPasswordValid) {
      setMessage(t('err.password.rule'));
      return;
    }

    setLoading(true);

    try {
      // AUTH-23: updatePassword updates user and explicitly signs out all other sessions
      const error = await updatePassword(password);

      if (error) {
        setMessage(t('err.generic'));
        return;
      }

      // User goes to Home, or onboarding if unfinished
      router.replace('/');
    } catch {
      setMessage(t('err.generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <OfflineBanner visible={!isOnline} />

      <Text style={[styles.title, { color: colors.text }]}>Set new password</Text>

      {message ? (
        <Text
          style={[
            styles.message,
            { backgroundColor: colors.error + '18', color: colors.error },
          ]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {message}
        </Text>
      ) : null}

      {status === 'checking' && (
        <ActivityIndicator size="large" color={colors.primary} />
      )}

      {status === 'ready' && (
        <>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="New password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            maxLength={64}
            accessibilityLabel="New password"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Confirm new password"
            placeholderTextColor={colors.textMuted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            maxLength={64}
            accessibilityLabel="Confirm new password"
          />

          <View style={[styles.checklist, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.checkTitle, { color: colors.text }]}>
              Password requirements
            </Text>
            <Text
              style={
                hasMinLength && hasMaxLength
                  ? { color: colors.success }
                  : { color: colors.textMuted }
              }
            >
              {hasMinLength && hasMaxLength ? '✓' : '○'} 8–64 characters
            </Text>
            <Text style={hasLetter ? { color: colors.success } : { color: colors.textMuted }}>
              {hasLetter ? '✓' : '○'} At least one letter
            </Text>
            <Text style={hasNumber ? { color: colors.success } : { color: colors.textMuted }}>
              {hasNumber ? '✓' : '○'} At least one number
            </Text>
            <Text
              style={
                hasAllowedCharacters
                  ? { color: colors.success }
                  : { color: colors.textMuted }
              }
            >
              {hasAllowedCharacters ? '✓' : '○'} English letters, numbers and symbols
            </Text>
          </View>

          <Pressable
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              (!isOnline || loading) && styles.disabled,
            ]}
            onPress={handleUpdatePassword}
            disabled={!isOnline || loading}
            accessibilityRole="button"
          >
            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
              {loading ? 'Updating password...' : 'Update password'}
            </Text>
          </Pressable>
        </>
      )}

      {status === 'invalid' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Request a new link"
          onPress={() => router.replace('/(auth)/forgot-password')}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            Request a new link
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  checklist: {
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  checkTitle: {
    fontWeight: '700',
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
