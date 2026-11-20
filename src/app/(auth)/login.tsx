import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput
} from 'react-native';
import Text from '../../components/AppText';
import OfflineBanner from '../../components/ui/OfflineBanner';
import { t } from '../../i18n';
import { useSession } from '../../lib/session';
import { useNetworkStatus } from '../../lib/useNetworkStatus';
import { controls, radius, spacing, typography } from '../../theme';
import { useTheme } from '../../theme/theme-context';

export default function Login() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionExpired?: string }>();
  const { login } = useSession();
  const { isOnline } = useNetworkStatus();
  const { colors } = useTheme();

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
   <ScrollView
  contentContainerStyle={[
    styles.container,
    { backgroundColor: colors.background },
  ]}
>
      <OfflineBanner visible={!isOnline} />

      <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
  Log in to your WPT 201 - A account.
</Text>
      {message || params.sessionExpired === '1' ? (
        <Text
          style={[
  styles.error,
  { color: colors.error, backgroundColor: colors.surfaceSecondary },
]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {message || t('err.session.expired')}
        </Text>
      ) : null}

      <TextInput
        style={[
  styles.input,
  {
    backgroundColor: colors.inputBackground,
    borderColor: colors.border,
    color: colors.text,
  },
]}
        placeholder="Email address"
        placeholderTextColor={colors.textMuted}
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
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="current-password"
        accessibilityLabel="Password"
      />

      <Link href="/forgot-password" style={[styles.link, { color: colors.primary }]}>
        Forgot password?
      </Link>

      <Pressable
        style={[
  styles.button,
  { backgroundColor: colors.primary },
  (!isOnline || loading) && styles.disabled,
]}
        onPress={handleLogin}
        disabled={!isOnline || loading}
        accessibilityRole="button"
        accessibilityState={{
          disabled: !isOnline || loading,
          busy: loading,
        }}
      >
        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
          {loading ? 'Logging in...' : 'Log in'}
        </Text>
      </Pressable>

      <Text style={[styles.footer, { color: colors.textSecondary }]}>
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
    padding: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.display,
    lineHeight: typography.lineHeight.display,
    fontFamily: typography.fontFamily.bold,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
  },
  error: {
    padding: spacing.lg,
    borderRadius: radius.small,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.medium,
    padding: spacing.lg,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
  },
  link: {
    fontFamily: typography.fontFamily.semiBold,
  },
  button: {
    minHeight: controls.minTap,
    padding: spacing.lg,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.md,
  },
  footer: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
});
