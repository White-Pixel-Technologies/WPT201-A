import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import PlaceholderScreen from '../components/PlaceholderScreen';
import { Colors } from '../constants/colors';

export default function NotFound() {
  const router = useRouter();
  return (
    <PlaceholderScreen title="Page not found">
      <Pressable style={styles.button} onPress={() => router.replace('/home')}>
        <Text style={styles.buttonText}>Go to Home</Text>
      </Pressable>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '600' },
});
