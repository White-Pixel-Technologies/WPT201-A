import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import Text from '../../components/AppText';
import { useSession } from '../../lib/session';
import { controls, radius, spacing, typography } from '../../theme';
import { useTheme } from '../../theme/theme-context';

export default function Login() {
  const login = useSession((state) => state.login);
  const { colors } = useTheme();

  const handleLogin = () => {
    // Development mock only — no real authentication.
    login(3);
    router.replace('/home');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Log in to SaveMode</Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        This is a temporary development login screen.
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={handleLogin}
        style={[styles.button, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Continue</Text>
      </Pressable>
      {__DEV__ && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open theme preview"
          onPress={() => router.push('/theme-preview')}
          style={[
            styles.previewButton,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Text style={{ color: colors.primary }}>Open Theme Preview</Text>
        </Pressable>
      )}
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
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    width: '100%',
    maxWidth: 300,
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
  previewButton: {
    minHeight: controls.minTap,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.medium,
  },
});
