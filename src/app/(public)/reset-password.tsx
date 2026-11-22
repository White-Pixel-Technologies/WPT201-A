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
import { supabase } from '../../lib/supabase';
import { useSession } from '../../lib/session';
import { useNetworkStatus } from '../../lib/useNetworkStatus';
import OfflineBanner from '../../components/ui/OfflineBanner';

export default function ResetPassword() {
  const params = useLocalSearchParams<{
    token_hash?: string | string[];
    token?: string | string[];
    type?: string | string[];
    error?: string | string[];
    error_description?: string | string[];
  }>();

  const rawTokenHash = params.token_hash ?? params.token;
  const tokenHash = Array.isArray(rawTokenHash)
    ? rawTokenHash[0]
    : rawTokenHash;

  const rawType = params.type;
  const type = Array.isArray(rawType) ? rawType[0] : rawType;

  const { updatePassword } = useSession();
  const { isOnline } = useNetworkStatus();
  const router = useRouter();

  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const hasMinLength = password.length >= 8;
  const hasMaxLength = password.length <= 64;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasAllowedCharacters = /^[\x20-\x7E]*$/.test(password);

  useEffect(() => {
    let active = true;

    async function verifyLink() {
      if (!isOnline) {
        if (active) {
          setLoading(false);
          setVerified(false);
          setMessage('Connect to the internet to verify this link.');
        }
        return;
      }

      // Check query errors
      const errorParam = Array.isArray(params.error)
        ? params.error[0]
        : params.error;
      const errorDesc = Array.isArray(params.error_description)
        ? params.error_description[0]
        : params.error_description;
      if (errorParam) {
        if (active) {
          setVerified(false);
          setLoading(false);
          setMessage(
            errorDesc
              ? decodeURIComponent(errorDesc)
              : 'This reset link is invalid or expired. Request a new one.',
          );
        }
        return;
      }

      // Check URL hash on web
      if (typeof window !== 'undefined' && window.location?.hash) {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);

        const hashError = hashParams.get('error');
        const hashErrorDesc = hashParams.get('error_description');
        if (hashError) {
          if (active) {
            setVerified(false);
            setLoading(false);
            setMessage(
              hashErrorDesc
                ? decodeURIComponent(hashErrorDesc)
                : 'This reset link is invalid or expired. Request a new one.',
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
              setVerified(true);
              setLoading(false);
              return;
            }
          } catch {
            // continue
          }
        }
      }

      // Check token_hash / token
      if (tokenHash) {
        const otpType = type === 'recovery' || !type ? 'recovery' : 'recovery';
        setLoading(true);
        setMessage('');

        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType,
          });

          if (active) {
            setVerified(!error);
            setLoading(false);

            if (error) {
              setMessage(
                'This reset link is invalid or expired. Request a new one.',
              );
            }
          }
          return;
        } catch {
          if (active) {
            setVerified(false);
            setLoading(false);
            setMessage('Unable to verify this link. Please try again.');
          }
          return;
        }
      }

      // Check existing active session
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user && active) {
          setVerified(true);
          setLoading(false);
          return;
        }
      } catch {
        // Fall through
      }

      if (active) {
        setVerified(false);
        setLoading(false);
        setMessage(
          'This reset link is invalid or expired. Request a new one.',
        );
      }
    }

    void verifyLink();

    return () => {
      active = false;
    };
  }, [tokenHash, type, isOnline, params.error, params.error_description]);

  async function handleUpdate() {
    setMessage('');

    if (!isOnline) {
      setMessage('Connect to the internet to update your password.');
      return;
    }

    if (!password || !confirmPassword) {
      setMessage('Enter your new password and confirm it.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords don't match.");
      return;
    }

    if (!hasAllowedCharacters) {
      setMessage('Use only English letters, numbers and keyboard symbols.');
      return;
    }

    if (!hasMinLength || !hasMaxLength || !hasLetter || !hasNumber) {
      setMessage('Use 8–64 characters, at least one letter and one number.');
      return;
    }

    setLoading(true);

    try {
      const error = await updatePassword(password);

      if (error) {
        setMessage('Unable to update your password. Please try again.');
        return;
      }

      router.replace('/(auth)/login');
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <OfflineBanner visible={!isOnline} />

      <Text style={styles.title}>Set new password</Text>

      {message ? (
        <Text
          style={styles.message}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {message}
        </Text>
      ) : null}

      {loading && !verified ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F6E56" />
          <Text style={styles.loadingText}>Verifying your reset link...</Text>
        </View>
      ) : verified ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="New password"
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
            style={styles.input}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            maxLength={64}
            accessibilityLabel="Confirm new password"
          />

          <View style={styles.checklist}>
            <Text style={styles.checkTitle}>Password requirements</Text>
            <Text
              style={
                hasMinLength && hasMaxLength ? styles.valid : styles.invalid
              }
            >
              {hasMinLength && hasMaxLength ? '✓' : '○'} 8–64 characters
            </Text>
            <Text style={hasLetter ? styles.valid : styles.invalid}>
              {hasLetter ? '✓' : '○'} At least one letter
            </Text>
            <Text style={hasNumber ? styles.valid : styles.invalid}>
              {hasNumber ? '✓' : '○'} At least one number
            </Text>
            <Text
              style={hasAllowedCharacters ? styles.valid : styles.invalid}
            >
              {hasAllowedCharacters ? '✓' : '○'} English letters and keyboard
              symbols only
            </Text>
          </View>

          <Pressable
            style={[styles.button, (loading || !isOnline) && styles.disabled]}
            onPress={handleUpdate}
            disabled={loading || !isOnline}
            accessibilityRole="button"
            accessibilityState={{
              disabled: loading || !isOnline,
              busy: loading,
            }}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Updating password...' : 'Update password'}
            </Text>
          </Pressable>
        </>
      ) : (
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace('/(auth)/forgot-password')}
          accessibilityRole="button"
          accessibilityLabel="Request a new link"
        >
          <Text style={styles.backButtonText}>Request a new link</Text>
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
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111111',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#666666',
  },
  message: {
    color: '#B42318',
    backgroundColor: '#FEF3F2',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#111111',
  },
  checklist: {
    gap: 8,
    padding: 12,
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
  },
  checkTitle: {
    fontWeight: '700',
    color: '#222222',
  },
  valid: {
    color: '#16834A',
  },
  invalid: {
    color: '#777777',
  },
  button: {
    backgroundColor: '#0F6E56',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: '#0F6E56',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
