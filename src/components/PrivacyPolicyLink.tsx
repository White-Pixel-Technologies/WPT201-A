
import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/colors';

export default function PrivacyPolicyLink() {
  return (
    <Text style={styles.text}>
      By continuing you agree to our{' '}
      <Link href="/terms" style={styles.link}>
        Terms
      </Link>
      {' and '}
      <Link href="/privacy" style={styles.link}>
        Privacy Policy
      </Link>
      .
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    marginTop: 18,
    marginBottom: 18,
    alignSelf: 'center',
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  link: {
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
});
