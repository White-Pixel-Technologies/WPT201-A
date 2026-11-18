
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function PrivacyPolicy() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'Privacy Policy' }} />

      <Text style={styles.title}>SaveMode Privacy Policy</Text>
      <Text style={styles.updated}>Last updated: November 2026</Text>

      <Text style={styles.heading}>1. Information We Collect</Text>
      <Text style={styles.body}>
        SaveMode collects information you provide when creating an account,
        including your name and email address. You may also enter financial
        information such as account names, balances and transactions.
      </Text>

      <Text style={styles.heading}>2. How We Use Your Information</Text>
      <Text style={styles.body}>
        We use your information to provide and maintain SaveMode, manage your
        account, display your savings and transactions, and improve the app.
      </Text>

      <Text style={styles.heading}>3. Data Storage and Security</Text>
      <Text style={styles.body}>
        Your account and application data are stored using our service
        providers. We use reasonable security measures to protect your
        information. No online service can guarantee absolute security.
      </Text>

      <Text style={styles.heading}>4. Sharing of Information</Text>
      <Text style={styles.body}>
        We do not sell your personal information. Information may be processed
        by service providers when necessary to operate SaveMode or when
        required by law.
      </Text>

      <Text style={styles.heading}>5. Your Choices</Text>
      <Text style={styles.body}>
        You can manage information in your account. You may request account
        deletion through the account deletion option in the app.
      </Text>

      <Text style={styles.heading}>6. Children&apos;s Privacy</Text>
      <Text style={styles.body}>
        SaveMode is not intended for children under 13. We do not knowingly
        collect personal information from children under 13.
      </Text>

      <Text style={styles.heading}>7. Changes to This Policy</Text>
      <Text style={styles.body}>
        We may update this Privacy Policy when our services or practices
        change. The latest version will be published on this page.
      </Text>

      <Text style={styles.heading}>8. Contact Us</Text>
      <Text style={styles.body}>
        For privacy questions or requests, contact the SaveMode support team
        through the support channel provided in the app.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 48,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  updated: {
    color: '#777777',
    marginBottom: 24,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginTop: 22,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: '#444444',
  },
});

