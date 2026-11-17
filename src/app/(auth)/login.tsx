import { router } from 'expo-router';
import { Button, Pressable, View, StyleSheet } from 'react-native';

import Text from '../../components/AppText';
import { useSession } from '../../lib/session';
import { useTheme } from '../../theme/theme-context';

export default function Login() {
  const login = useSession((state) => state.login);
  const { colors } = useTheme();

  const handleLogin = () => {
    // Development mock only — no real authentication.
    login(3);
    router.replace('/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in to SaveMode</Text>

      <Text style={styles.description}>
        This is a temporary development login screen.
      </Text>

      <Button title="Continue" onPress={handleLogin} />
      {__DEV__ && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open theme preview"
          onPress={() => router.push('/theme-preview')}
          style={[styles.previewButton, { borderColor: colors.primary }]}
        >
          <Text style={{ color: colors.primary }}>Open Theme Preview</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  previewButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
});
