import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import ConfirmSheet from '../../components/ui/ConfirmSheet';
import InlineError from '../../components/ui/InlineError';
import { t } from '../../i18n';
import { useSession } from '../../lib/session';
import { useTheme } from '../../theme/theme-context';

// Sprint 1 (D-21): Settings has ONE row only, "Log out".
export default function Settings() {
  const router = useRouter();
  const { logout } = useSession();
  const { colors } = useTheme();

  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError('');
    try {
      const error = await logout();
      if (error) {
        setLogoutError(t('err.logout.failed'));
        return;
      }
      setShowLogout(false);
      router.replace('/welcome');
    } catch {
      setLogoutError(t('err.logout.failed'));
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.container}
      >
        <Text style={[styles.heading, { color: colors.text }]}>{t('nav.settings')}</Text>

        {logoutError ? <InlineError message={logoutError} /> : null}

        <Pressable
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => {
            setLogoutError('');
            setShowLogout(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('settings.logout')}
        >
          <Text style={[styles.rowText, { color: colors.error }]}>{t('settings.logout')}</Text>
        </Pressable>

        <Text style={[styles.credit, { color: colors.textMuted }]}>{t('label.credit')}</Text>
      </ScrollView>

      <ConfirmSheet
        visible={showLogout}
        title={t('confirm.logout.title', { app: t('app.name') })}
        cancelLabel={t('confirm.logout.cancel')}
        confirmLabel={t('confirm.logout.confirm')}
        loading={loggingOut}
        onKeepEditing={() => {
          if (!loggingOut) setShowLogout(false);
        }}
        onDiscard={handleLogout}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12, flexGrow: 1 },
  heading: { fontSize: 26, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  row: { minHeight: 52, borderWidth: 1, borderRadius: 12, padding: 16, justifyContent: 'center' },
  rowText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  credit: { marginTop: 'auto', textAlign: 'center', fontSize: 12, fontFamily: 'Inter_400Regular' },
});
