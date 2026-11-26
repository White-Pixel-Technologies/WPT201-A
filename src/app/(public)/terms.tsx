import { Link, Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function TermsOfUse() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'Terms of Use' }} />

      <Text style={styles.title}>WPT 201 - A Terms of Use</Text>

      <Text style={styles.updated}>Last updated: 22 November 2026</Text>

      <Text style={styles.heading}>1. Agreement to Terms</Text>
      <Text style={styles.body}>

        By creating an account or using WPT201-A , you agree to these Terms of Use and our Privacy

        By creating an account or using WPT 201 - A, you agree to these Terms of Use and our Privacy

        Policy. If you do not agree, please do not use the app.
      </Text>

      <Text style={styles.heading}>2. Description of Service</Text>
      <Text style={styles.body}>

        WPT201-A is a manual-entry expense tracker that helps you record and review your expenses.
        You are responsible for entering your own financial information.

        WPT 201 - A is a personal finance management tool designed to help you track bank accounts,
        cash balances, credit card balances, and expenses. The service is provided for your
        personal, non-commercial management.

      </Text>

      <Text style={styles.heading}>3. User Account &amp; Security</Text>
      <Text style={styles.body}>
        You are responsible for maintaining the confidentiality of your login credentials and for
        all activities that occur under your account. You agree to notify us immediately of any
        unauthorized use of your account.
      </Text>

      <Text style={styles.heading}>4. Financial Information Disclaimer</Text>
      <Text style={styles.body}>
s
        WPT201-A is an informational and tracking utility. We do not provide financial, investment,
        legal, accounting, or tax advice. You are responsible for ensuring that all information you
        manually enter into WPT201-A is accurate and complete.

        WPT 201 - A is an informational and tracking utility. We do not provide financial,
        investment, legal, accounting, or tax advice. You are solely responsible for verifying the
        accuracy of balances and transactions entered into WPT 201 - A.

      </Text>

      <Text style={styles.heading}>5. Acceptable Use</Text>
      <Text style={styles.body}>
        You agree not to misuse WPT201-A , reverse engineer the application, attempt unauthorized
        You agree not to misuse WPT 201 - A, reverse engineer the application, attempt unauthorized

        access to our systems, or use the service for any unlawful activity.
      </Text>

      <Text style={styles.heading}>6. Account Termination and Deletion</Text>
      <Text style={styles.body}>
        You may stop using WPT201-A at any time. For information about account deletion, please
        contact us at contactus@whitepixeltechnologies.in. We reserve the right to suspend or
        terminate accounts that violate these Terms.
        You may delete your account and all associated personal financial data at any time by
        opening Settings
        {' → '}Delete account in WPT 201 - A.
        {'\n\n'}
        For more information, visit our{' '}
        <Link href="/delete-account" style={styles.link}>
          Delete Account page
        </Link>
        .{'\n\n'}
        We reserve the right to suspend or terminate accounts that violate these Terms.
      </Text>

      <Text style={styles.heading}>7. Limitation of Liability</Text>
      <Text style={styles.body}>
        WPT201-A is provided on an &quot;as is&quot; and &quot;as available&quot; basis without
        warranties of any kind. To the maximum extent permitted by applicable law, WPT201-A and its
        operators shall not be liable for any indirect, incidental, or consequential damages
        WPT 201 - A is provided on an &quot;as is&quot; and &quot;as available&quot; basis without
        warranties of any kind. To the maximum extent permitted by applicable law, WPT 201 - A and
        its operators shall not be liable for any indirect, incidental, or consequential damages
        resulting from your use of the app.
      </Text>

      <Text style={styles.heading}>8. Changes to Terms</Text>
      <Text style={styles.body}>
        We may modify these Terms at any time. We will provide notice of material changes by
        updating the &quot;Last updated&quot; date on this page.
      </Text>

      <Text style={styles.heading}>9. Contact Us</Text>
      <Text style={styles.body}>
        If you have any questions about these Terms of Use, please contact us at:
        {'\n\n'}
        contactus@whitepixeltechnologies.in
      </Text>

      <Text style={styles.draftHeading}>Draft Notice</Text>
      <Text style={styles.draft}>
        These Terms of Use are a draft and are not final until approved by White Pixel Technologies
        (WPT). A lawyer must review these Terms before the service is launched.
      </Text>

      <Text style={styles.footer}>WPT 201 - A</Text>
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
  link: {
    color: '#0F6E56',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  draftHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#854F0B',
    marginTop: 24,
    marginBottom: 8,
  },
  draft: {
    fontSize: 14,
    lineHeight: 23,
    color: '#444444',
    backgroundColor: '#FFF8E7',
    padding: 12,
    borderRadius: 8,
  },
  footer: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F6E56',
    marginTop: 32,
    textAlign: 'center',
  },
});
