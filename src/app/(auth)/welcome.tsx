import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Welcome() {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>Welcome to WPT 201 - A</Text>

      <Text style={styles.description}>Manage your finances in one place.</Text>

      <Text style={styles.logo}>WPT 201 - A</Text>
      <Text style={styles.title}>Take control of your money.</Text>
      <Text style={styles.subtitle}>
        A simpler way to understand and manage your spending.
      </Text>


      <Link href="/(auth)/signup" asChild>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryText}>Create account</Text>
        </Pressable>
      </Link>

      <Link href="/(auth)/login" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Log in</Text>
        </Pressable>
      </Link>

      <Text style={styles.footer}>
        By continuing, you agree to our
      </Text>
      <View style={styles.links}>
        <Link href="/(public)/terms" style={styles.link}>Terms</Link>
        <Text style={styles.footer}>and</Text>
        <Link href="/(public)/privacy" style={styles.link}>Privacy Policy</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
    gap: 18,
    backgroundColor: '#FFFFFF',
  },
  logo: { fontSize: 24, fontWeight: '800', color: '#111111' },
  title: { fontSize: 34, fontWeight: '800', color: '#111111' },
  subtitle: { fontSize: 16, lineHeight: 24, color: '#666666' },
  primaryButton: {
    backgroundColor: '#111111',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#111111',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryText: { color: '#111111', fontSize: 16, fontWeight: '700' },
  footer: { color: '#777777', textAlign: 'center' },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  link: { color: '#2563EB', fontWeight: '600' },
});
