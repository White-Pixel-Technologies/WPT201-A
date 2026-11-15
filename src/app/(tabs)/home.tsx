import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import Text from '../../components/AppText';
import PlaceholderScreen from '../../components/PlaceholderScreen';
import { useSession } from '../../lib/session';
import { useTheme } from '../../theme/theme-context';
import { typography } from '../../theme/typography';
import { t } from '../../i18n';

export default function Home() {
  const logout = useSession((state) => state.logout);
  const { colors } = useTheme();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <PlaceholderScreen title={t('home.title')}>
      <Pressable
        style={[styles.button, { backgroundColor: colors.error }]}
        onPress={handleLogout}
      >
        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
          {t('home.logout')}
        </Text>
      </Pressable>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
});
