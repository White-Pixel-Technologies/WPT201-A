import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import OfflineBanner from '../../components/ui/OfflineBanner';
import { t } from '../../i18n';
import { useSession } from '../../lib/session';
import { useNetworkStatus } from '../../lib/useNetworkStatus';

export default function Login() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionExpired?: string }>();
  const { login } = useSession();
  const { isOnline } = useNetworkStatus();

  const submitting = useRef(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleLogin() {
    if (submitting.current) return;

    setMessage('');

    if (!isOnline) {
      setMessage(t('info.offline.login'));
      return;
    }

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setMessage(t('err.login.required'));
      return;
    }

    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      setMessage('Enter a valid email address.');
      return;
    }

    submitting.current = true;
    setLoading(true);

    try {
      const error = await login(cleanEmail, password);

      if (error) {
        setMessage(error);
        return;
      }

      router.replace('/');
    } catch {
      setMessage(t('err.login.failed'));
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <OfflineBanner visible={!isOnline} />

      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in to your WPT 201 - A account.</Text>

      {message || params.sessionExpired === '1' ? (
        <Text
          style={styles.error}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {message || t('err.session.expired')}
        </Text>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        maxLength={254}
        accessibilityLabel="Email address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="current-password"
        accessibilityLabel="Password"
      />

      <Link href="/forgot-password" style={styles.link}>
        Forgot password?
      </Link>

      <Pressable
        style={[styles.button, (!isOnline || loading) && styles.disabled]}
        onPress={handleLogin}
        disabled={!isOnline || loading}
        accessibilityRole="button"
        accessibilityState={{
          disabled: !isOnline || loading,
          busy: loading,
        }}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Log in'}
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        Don&apos;t have an account?{' '}
        <Link href="/(auth)/signup" style={styles.link}>
          Create account
        </Link>
      </Text>
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
  title: { fontSize: 30, fontWeight: '700', color: '#111111' },
  subtitle: { fontSize: 15, color: '#666666' },
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
  link: { color: '#2563EB', fontWeight: '600' },
  button: {
    backgroundColor: '#111111',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  footer: { textAlign: 'center', color: '#555555' },
});
