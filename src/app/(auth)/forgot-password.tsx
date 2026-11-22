
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { Link } from 'expo-router';
import { useSession } from '../../lib/session';
import { useNetworkStatus } from '../../lib/useNetworkStatus';
import OfflineBanner from '../../components/ui/OfflineBanner';
import { t } from '../../i18n';

export default function ForgotPassword() {
  const { resetPassword } = useSession();
  const { isOnline } = useNetworkStatus();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  async function handleReset() {
    setMessage('');

    if (!isOnline) {
      setMessage(t('info.offline.reset'));
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setMessage(t('err.email.invalid'));
      return;
    }

    setLoading(true);

    try {
      const error = await resetPassword(normalizedEmail);

      if (error) {
        setMessage('Unable to send the reset link. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setMessage('Unable to send the reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <OfflineBanner visible={!isOnline} />

      <Text style={styles.title}>Forgot password?</Text>

      {message ? (
        <Text
          style={styles.error}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {message}
        </Text>
      ) : null}

      {submitted ? (
        <>
          <Text style={styles.message}>
            {t('info.reset.sent')}
          </Text>
          <Link href="/(auth)/login" style={styles.link}>
            Back to log in
          </Link>
        </>
      ) : (
        <>
          <Text style={styles.message}>
           Enter your email address and we&apos;ll send you a password reset link.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            accessibilityLabel="Email address"
          />

          <Pressable
            style={[styles.button, (!isOnline || loading) && styles.disabled]}
            onPress={handleReset}
            disabled={!isOnline || loading}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Send reset link'}
            </Text>
          </Pressable>

          <Link href="/(auth)/login" style={styles.link}>
            Back to log in
          </Link>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 18,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111111',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555555',
  },
  error: {
    color: '#B42318',
    backgroundColor: '#FEF3F2',
    padding: 12,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#111111',
  },
  button: {
    backgroundColor: '#111111',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    color: '#2563EB',
    fontWeight: '600',
  },
});
