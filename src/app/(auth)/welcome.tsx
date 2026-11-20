import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import Text from '../../components/AppText';
import { controls, radius, spacing, typography } from '../../theme';
import { useTheme } from '../../theme/theme-context';

export default function Welcome() {
  const { colors } = useTheme();
  return (
  <View style={[styles.container, { backgroundColor: colors.background }]}>
    <Text style={[styles.logo, { color: colors.primary }]}>WPT 201 - A</Text>

    <Text style={[styles.title, { color: colors.text }]}>
      Take control of your money.
    </Text>

    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
      A simpler way to understand and manage your spending.
    </Text>

    <Link href="/(auth)/signup" asChild>
      <Pressable
        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.primaryText, { color: colors.onPrimary }]}>
          Create account
        </Text>
      </Pressable>
    </Link>

    <Link href="/(auth)/login" asChild>
      <Pressable
        style={[
          styles.secondaryButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.secondaryText, { color: colors.text }]}>
          Log in
        </Text>
      </Pressable>
    </Link>

    <Text style={[styles.footer, { color: colors.textSecondary }]}>
      By continuing, you agree to our
    </Text>

    <View style={styles.links}>
      <Link href="/terms" style={[styles.link, { color: colors.primary }]}>
        Terms
      </Link>
      <Text style={[styles.footer, { color: colors.textSecondary }]}>and</Text>
      <Link
        href="/privacy"
        style={[styles.link, { color: colors.primary }]}
      >
        Privacy Policy
      </Link>
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  logo: {
    fontSize: typography.fontSize.xxl,
    lineHeight: typography.lineHeight.xxl,
    fontFamily: typography.fontFamily.bold,
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
  primaryButton: {
    minHeight: controls.minTap,
    padding: spacing.lg,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    fontFamily: typography.fontFamily.semiBold,
  },
  secondaryButton: {
    minHeight: controls.minTap,
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    fontFamily: typography.fontFamily.semiBold,
  },
  footer: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    textAlign: 'center',
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  link: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
  },
});
