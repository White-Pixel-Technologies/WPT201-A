import { router } from 'expo-router';
import { Button, View, StyleSheet } from 'react-native';

import Text from '../../components/AppText';
import { useSession } from '../../lib/session';
import { useTheme } from '../../theme/theme-context';
import { typography } from '../../theme/typography';
import { t } from '../../i18n';

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
      marginBottom: 16,
    },
    description: {
      fontSize: typography.fontSize.md,
      color: colors.textSecondary,
      marginBottom: 24,
      textAlign: 'center',
    },
    buttonContainer: {
      width: '100%',
      maxWidth: 300,
    },
    spacing: {
      height: 16,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.welcomeTitle')}</Text>

      <Text style={styles.description}>{t('auth.welcomeDescription')}</Text>

      <View style={styles.buttonContainer}>
        <Button title={t('auth.login')} onPress={handleLogin} />

        <View style={styles.spacing} />

        <Button title={t('auth.getStarted')} onPress={handleGetStarted} />
      </View>
    </View>
  );
}
