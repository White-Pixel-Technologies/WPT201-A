import { router } from 'expo-router';
import { Button, View, StyleSheet } from 'react-native';

import Text from '../../components/AppText';
import { useSession } from '../../lib/session';
import { useTheme } from '../../theme/theme-context';
import { typography } from '../../theme/typography';
import { t } from '../../i18n';

export default function Login() {
  const login = useSession((state) => state.login);
  const { colors } = useTheme();

  const handleLogin = () => {
    // Development mock only - no real authentication.
    login(3);
    router.replace('/home');
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
      textAlign: 'center',
      marginBottom: 24,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.loginTitle')}</Text>

      <Text style={styles.description}>{t('auth.loginDescription')}</Text>

      <Button title={t('auth.continue')} onPress={handleLogin} />
    </View>
  );
}
