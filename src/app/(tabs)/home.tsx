import { ScrollView, StyleSheet, Text } from 'react-native';
import { t } from '../../i18n';
import { useTheme } from '../../theme/theme-context';

// Sprint 1 (D4 card): Home shows only its title. The dashboard comes in Sprint 3.
export default function Home() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.heading, { color: colors.text }]}>{t('nav.home')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 26, fontFamily: 'Inter_700Bold' },
});
