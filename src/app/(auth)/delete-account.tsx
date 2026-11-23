

import { Link } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function DeleteAccountScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Delete Your Account</Text>

        <Text style={styles.updated}>
          Last updated: 21 November 2026
        </Text>

        <Text style={styles.paragraph}>
          This page explains how to permanently delete your
          WPT 201 - A account and associated data.
          You do not need to log in to read this page.
        </Text>

        <Text style={styles.heading}>How to delete your account</Text>

        <Text style={styles.paragraph}>
          Follow these steps to request account deletion:
        </Text>

        <Text style={styles.step}>1. Log in to your account.</Text>
        <Text style={styles.step}>2. Open the Settings section.</Text>
        <Text style={styles.step}>3. Select Delete account.</Text>
        <Text style={styles.step}>
          4. Read the account deletion information carefully.
        </Text>
        <Text style={styles.step}>
          5. Type DELETE exactly as shown.
        </Text>
        <Text style={styles.step}>
          6. Select Delete my account to continue.
        </Text>

        <Text style={styles.paragraph}>
          <Link href="/(auth)/login" style={styles.link}>
            Log in to your account
          </Link>
        </Text>

        <Text style={styles.heading}>Data that will be deleted</Text>

        <Text style={styles.paragraph}>
          When your account is permanently deleted, the following
          information will also be deleted:
        </Text>

        <Text style={styles.listItem}>• Transactions</Text>
        <Text style={styles.listItem}>• Sources</Text>
        <Text style={styles.listItem}>• Tags</Text>
        <Text style={styles.listItem}>• Settings</Text>
        <Text style={styles.listItem}>• Stored files</Text>

        <Text style={styles.heading}>Important information</Text>

        <Text style={styles.paragraph}>
          Account deletion is permanent and cannot be undone.
          Make sure you understand the consequences before
          confirming your deletion request.
        </Text>

        <Text style={styles.paragraph}>
          For security, if your last login was more than
          10 minutes ago, you may be asked to log in again
          before deleting your account.
        </Text>

        <Text style={styles.footer}>WPT 201 - A</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#202020',
    marginBottom: 8,
  },
  updated: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#202020',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 25,
    color: '#444444',
    marginBottom: 14,
  },
  step: {
    fontSize: 16,
    lineHeight: 28,
    color: '#444444',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 28,
    color: '#444444',
  },
  link: {
    color: '#0F6E56',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  footer: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F6E56',
    marginTop: 32,
    textAlign: 'center',
  },
});

export default function DeleteAccount() {
  return <PlaceholderScreen title={NavigationText.deleteAccount} />;
}
