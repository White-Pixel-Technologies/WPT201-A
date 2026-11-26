import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../../lib/session';
import { useAppTheme } from '../../lib/theme';
import { useNetworkStatus } from '../../lib/useNetworkStatus';
import { supabase } from '../../lib/supabase';
import { t } from '../../i18n';
import OfflineBanner from '../../components/ui/OfflineBanner';
import InlineError from '../../components/ui/InlineError';
import { Colors } from '../../constants/colors';

const MAX_NAME_LENGTH = 40;

export default function OnboardingNameScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const { isOnline } = useNetworkStatus();
  const { user, userName, setUserName, setOnboardingStep } = useSession();

  const [name, setName] = useState(userName || '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const textColor = isDark ? '#FFFFFF' : '#1C1C1E';
  const subtextColor = isDark ? '#A1A1AA' : '#64748B';
  const cardColor = isDark ? '#1E1E1E' : '#FFFFFF';
  const inputBorder = isDark ? '#3F3F46' : '#CBD5E1';
  const inputBg = isDark ? '#27272A' : '#F8FAFC';
  const backgroundColor = isDark ? '#121212' : '#F8FAFC';

  const handleContinue = async () => {
    setError('');
    const trimmed = name.trim();

    if (!trimmed) {
      setError(t('err.name.required'));
      return;
    }

    if (trimmed.length > MAX_NAME_LENGTH) {
      setError(`Name cannot exceed ${MAX_NAME_LENGTH} characters.`);
      return;
    }

    if (!isOnline) {
      setError(t('info.offline.save'));
      return;
    }

    setIsSaving(true);
    try {
      if (user?.id) {
        const { error: updateError } = await supabase
          .from('user_settings')
          .update({ name: trimmed })
          .eq('user_id', user.id);

        if (updateError) {
          setError(t('err.network.save'));
          setIsSaving(false);
          return;
        }
      }

      setUserName(trimmed);
      setOnboardingStep(1);
      router.push('/onboarding/currency' as any);
    } catch {
      setError(t('err.generic'));
    } finally {
      setIsSaving(false);
    }
  };

  const showCounter = name.length >= Math.floor(MAX_NAME_LENGTH * 0.8);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <OfflineBanner visible={!isOnline} />

        <View style={styles.cardContainer}>
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <Text style={[styles.progressText, { color: Colors.primary }]}>Step 1 of 3</Text>

            <Text style={[styles.title, { color: textColor }]}>What&apos;s your name?</Text>

            <Text style={[styles.subtitle, { color: subtextColor }]}>
              Welcome to WPT 201 - A. Let&apos;s personalize your experience.
            </Text>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: textColor }]}>Your name</Text>
                {showCounter && (
                  <Text style={[styles.counter, { color: subtextColor }]}>
                    {name.length}/{MAX_NAME_LENGTH}
                  </Text>
                )}
              </View>

              <TextInput
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (error) setError('');
                }}
                maxLength={MAX_NAME_LENGTH}
                placeholder="Enter your name"
                placeholderTextColor={subtextColor}
                autoFocus
                autoCapitalize="words"
                editable={!isSaving}
                style={[
                  styles.input,
                  {
                    color: textColor,
                    borderColor: error ? '#DC2626' : inputBorder,
                    backgroundColor: inputBg,
                  },
                ]}
                accessibilityLabel="Your name"
              />

              {!!error && (
                <View style={styles.errorContainer}>
                  <InlineError message={error} variant="error" isDark={isDark} />
                </View>
              )}
            </View>

            {!isOnline && <Text style={styles.offlineHint}>{t('info.offline.save')}</Text>}

            <Pressable
              onPress={handleContinue}
              disabled={!isOnline || isSaving}
              style={[
                styles.primaryButton,
                { backgroundColor: Colors.primary },
                (!isOnline || isSaving) && styles.disabledButton,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Continue"
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Continue</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  counter: {
    fontSize: 13,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  errorContainer: {
    marginTop: 8,
  },
  offlineHint: {
    color: '#D97706',
    fontSize: 13,
    marginBottom: 12,
  },
  primaryButton: {
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
