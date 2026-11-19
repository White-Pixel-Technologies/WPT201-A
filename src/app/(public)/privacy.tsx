import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function PrivacyPolicy() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'Privacy Policy' }} />

      <Text style={styles.title}>WPT 201 - A Privacy Policy</Text>
      <Text style={styles.updated}>Last updated: November 19, 2026</Text>

      <Text style={styles.body}>
        This Privacy Policy explains what information WPT 201 - A collects,
        how it is stored, and how you can manage or delete your information.
      </Text>

      <Text style={styles.heading}>1. Information We Collect</Text>
      <Text style={styles.body}>
        When you create an account, we collect your name, email address and
        password. Your password is stored in a protected form.
        {'\n\n'}
        You can also enter financial information such as sources, transactions,
        transfers and tags. We collect app settings such as currency, theme
        and reminder times. Some settings, such as app lock, stay only on
        your phone.
      </Text>

      <Text style={styles.heading}>2. Where Your Data Is Stored</Text>
      <Text style={styles.body}>
        Your account information and financial entries are stored securely
        using Supabase in the Mumbai region of India.
      </Text>

      <Text style={styles.heading}>3. Who Can See Your Information</Text>
      <Text style={styles.body}>
        Only you can see your financial entries. Your personal information
        and financial data are not shared with other users or used for
        advertising.
      </Text>

      <Text style={styles.heading}>4. Services We Use</Text>
      <Text style={styles.body}>
        We use the following services to operate the app:
        {'\n\n'}
        • Supabase: Handles account login and database storage.
        {'\n'}
        • Cloudflare Pages: Shows the website version of the app. It does
        not store your financial entries.
        {'\n'}
        • Migadu: Sends email verification and password reset emails using
        only your email address.
      </Text>

      <Text style={styles.heading}>5. Sign-in Method</Text>
      <Text style={styles.body}>
        You can sign in using your email address and password only.
        Google and Apple sign-in are not available in this version.
      </Text>

      <Text style={styles.heading}>6. How Long We Keep Your Data</Text>
      <Text style={styles.body}>
        We keep your account information and financial entries until you
        delete your account.
      </Text>

      <Text style={styles.heading}>7. What the App Does Not Do</Text>
      <Text style={styles.body}>
        The app never reads your SMS messages or notifications. It never
        moves money or makes payments. It does not show advertisements
        or use tracking tools.
      </Text>

      <Text style={styles.heading}>8. Permissions</Text>
      <Text style={styles.body}>
        The app asks for only the following permissions when needed:
        {'\n\n'}
        • Notifications: Requested only when you turn on a reminder.
        {'\n'}
        • Face ID or fingerprint: Used only when you turn on app lock.
        {'\n\n'}
        No SMS, contacts, location, camera, storage or phone permissions
        are requested.
        {'\n\n'}
        Internet access is used to connect to the service. The app checks
        whether it is online, restores reminders after a restart and may
        use vibration. These background activities do not require additional
        permissions. The website does not ask for permissions.
      </Text>

      <Text style={styles.heading}>9. How to Delete Your Account</Text>
      <Text style={styles.body}>
        You can permanently delete your account from the app:
        {'\n\n'}
        1. Open the app and go to Settings.
        {'\n'}
        2. Select Delete Account.
        {'\n'}
        3. Follow the instructions and confirm deletion.
        {'\n\n'}
        Account deletion is permanent. Your account and associated entries
        will be deleted. You can also visit the Delete Account page at
        /delete-account for instructions.
      </Text>

      <Text style={styles.heading}>10. Privacy Complaints and Contact</Text>
      <Text style={styles.body}>
        If you have any questions or privacy complaints, contact us at:
        {'\n\n'}
        contactus@whitepixeltechnologies.in
      </Text>

      <Text style={styles.notice}>
        This is a draft privacy policy. It is not final until approved by
        This privacy policy is a draft and is subject to review and
        approval by WPT before launch.
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
  notice: {
    fontSize: 14,
    lineHeight: 22,
    color: '#777777',
    marginTop: 28,
    fontStyle: 'italic',
  },
});
