import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import OfflineBanner from '../../components/ui/OfflineBanner';
import { VERIFY_REDIRECT_URL } from '../../constants/urls';
import { supabase } from '../../lib/supabase';
import { useNetworkStatus } from '../../lib/useNetworkStatus';

export default function Signup() {
  const router = useRouter();
  const { isOnline } = useNetworkStatus();
  const submitting = useRef(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const hasLength = password.length >= 8 && password.length <= 64;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const validCharacters = /^[\x21-\x7E]+$/.test(password);

  const validPassword =
    hasLength && hasLetter && hasNumber && validCharacters;

  async function handleSignup() {
    if (submitting.current) return;

    setMessage('');

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!isOnline) {
      setMessage('Connect to the internet to sign up.');
      return;
    }

    if (!cleanName || !cleanEmail || !password) {
      setMessage('Please complete all fields.');
      return;
    }

    if (cleanName.length > 40) {
      setMessage('Name must be 40 characters or fewer.');
      return;
    }

    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      setMessage('Enter a valid email address.');
      return;
    }

    if (!validCharacters) {
      setMessage('Use only English letters, numbers and keyboard symbols.');
      return;
    }

    if (!validPassword) {
      setMessage('Use 8–64 characters, at least one letter and one number.');
      return;
    }

    submitting.current = true;
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: cleanName },
          emailRedirectTo: VERIFY_REDIRECT_URL,
        },
      });

      if (error) {
        setMessage('Unable to create your account. Please try again.');
        return;
      }

      router.replace({
        pathname: '/check-email',
        params: { email: cleanEmail },
      });
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <OfflineBanner visible={!isOnline} />

      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>
        Start managing your money with SaveMode.
      </Text>

      {message ? (
        <Text
          style={styles.error}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {message}
        </Text>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoComplete="name"
        maxLength={40}
        accessibilityLabel="Full name"
      />

      <TextInput
        style={styles.input}
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        keyboardType="email-address"
        maxLength={254}
        accessibilityLabel="Email address"
      />

      <View style={styles.passwordRow}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          maxLength={64}
          accessibilityLabel="Password"
        />

        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          accessibilityRole="button"
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
        >
          <Text style={styles.showText}>
            {showPassword ? 'Hide' : 'Show'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.checklist}>
        <Text style={styles.checkTitle}>Password requirements</Text>
        <Text style={hasLength ? styles.valid : styles.invalid}>
          {hasLength ? '✓' : '○'} 8–64 characters
        </Text>
        <Text style={hasLetter ? styles.valid : styles.invalid}>
          {hasLetter ? '✓' : '○'} At least one letter
        </Text>
        <Text style={hasNumber ? styles.valid : styles.invalid}>
          {hasNumber ? '✓' : '○'} At least one number
        </Text>
        <Text style={validCharacters ? styles.valid : styles.invalid}>
          {validCharacters ? '✓' : '○'} English letters and keyboard symbols only
        </Text>
      </View>

      <Pressable
        style={[styles.button, (loading || !isOnline) && styles.disabled]}
        onPress={handleSignup}
        disabled={loading || !isOnline}
        accessibilityRole="button"
        accessibilityState={{ disabled: loading || !isOnline, busy: loading }}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating account...' : 'Sign up'}
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        Already have an account?{' '}
        <Link href="/(auth)/login" style={styles.link}>
          Log in
        </Link>
      </Text>

      <View style={styles.legal}>
        <Link href="/terms" style={styles.link}>Terms</Link>
        <Text style={styles.footer}> · </Text>
        <Link href="/privacy" style={styles.link}>Privacy Policy</Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#111111',
  },
  showText: { color: '#2563EB', fontWeight: '600' },
  checklist: {
    gap: 8,
    padding: 12,
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
  },
  checkTitle: { fontWeight: '700', color: '#222222' },
  valid: { color: '#16834A' },
  invalid: { color: '#777777' },
  button: {
    backgroundColor: '#111111',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  footer: { textAlign: 'center', color: '#555555' },
  link: { color: '#2563EB', fontWeight: '600' },
  legal: { flexDirection: 'row', justifyContent: 'center' },
});
