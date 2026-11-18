import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useNetworkStatus } from '../../lib/useNetworkStatus';
import OfflineBanner from '../../components/ui/OfflineBanner';
import { VERIFY_REDIRECT_URL } from '../../constants/urls';

export default function CheckEmail() {
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const email = Array.isArray(params.email)
    ? params.email[0]
    : params.email;

  const { isOnline } = useNetworkStatus();
  const sendingRef = useRef(false);

  const [seconds, setSeconds] = useState(60);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setTimeout(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds]);

  async function resendEmail() {
    if (sendingRef.current || !email || seconds > 0) return;

    setMessage('');

    if (!isOnline) {
      setMessage('Connect to the internet to resend the email.');
      return;
    }

    sendingRef.current = true;
    setLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: VERIFY_REDIRECT_URL,
        },
      });

      if (error) {
        setMessage('Unable to resend the email. Please try again later.');
      } else {
        setMessage(
          'If the address needs verifying, a new link is on its way.',
        );
      }
    } catch {
      setMessage('Unable to resend the email. Please try again later.');
    } finally {
      sendingRef.current = false;
      setLoading(false);
      setSeconds(60);
    }
  }

  return (
    <View style={styles.container}>
      <OfflineBanner visible={!isOnline} />

      <Text style={styles.icon}>✉</Text>
      <Text style={styles.title}>Check your email</Text>

      <Text style={styles.message}>
        Check your inbox. If {email || 'your email'} needs verifying, a link
        is on its way. Already verified? Log in.
      </Text>

      {!!email && <Text style={styles.email}>{email}</Text>}

      {message ? (
        <Text
          style={styles.feedback}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {message}
        </Text>
      ) : null}

      <Pressable
        style={[
          styles.button,
          (seconds > 0 || loading || !isOnline || !email) && styles.disabled,
        ]}
        onPress={resendEmail}
        disabled={seconds > 0 || loading || !isOnline || !email}
        accessibilityRole="button"
        accessibilityState={{
          disabled: seconds > 0 || loading || !isOnline || !email,
          busy: loading,
        }}
      >
        <Text style={styles.buttonText}>
          {loading
            ? 'Sending...'
            : seconds > 0
              ? `Resend email (${seconds}s)`
              : 'Resend email'}
        </Text>
      </Pressable>

      <Link href="/(auth)/signup" style={styles.link}>
        Use a different email
      </Link>

      <Link href="/(auth)/login" style={styles.link}>
        Go to log in
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
    gap: 20,
    backgroundColor: '#FFFFFF',
  },
  icon: { fontSize: 48 },
  title: { fontSize: 30, fontWeight: '700', color: '#111111' },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  email: { fontWeight: '700', color: '#111111' },
  feedback: {
    color: '#2457C5',
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#111111',
    padding: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  disabled: { opacity: 0.45 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  link: { color: '#2563EB', fontWeight: '600' },
});
