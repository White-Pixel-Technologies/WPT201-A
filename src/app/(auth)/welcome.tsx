import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import Text from '../../components/AppText';
import { useSession } from '../../lib/session';
import { controls, radius, spacing, typography } from '../../theme';
import { useTheme } from '../../theme/theme-context';

export default function Welcome() {
  const startOnboarding = useSession((state) => state.startOnboarding);
  const { colors } = useTheme();

  const handleGetStarted = () => {
    startOnboarding();
    router.push('/onboarding/name');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Welcome to SaveMode</Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Manage your finances in one place.
      </Text>

      <View style={styles.buttonContainer}>
        <Pressable
          accessibilityRole="button"
          onPress={handleLogin}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Log in</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={handleGetStarted}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Get started</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    lineHeight: typography.lineHeight.xxl,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: spacing.lg,
  },
  button: {
    minHeight: controls.minTap,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.medium,
  },
  buttonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
  },
});
