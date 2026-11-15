import { useMemo, useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';

import { default as Text } from '../../components/AppText';
import { useSession } from '../../lib/session';
import { useTheme } from '../../theme/theme-context';
import type { ThemeColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { t } from '../../i18n';

export default function NameScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const savedName = useSession((state) => state.onboardingData.name);

  const updateOnboardingData = useSession(
    (state) => state.updateOnboardingData,
  );

  const [name, setName] = useState(savedName);
  const [error, setError] = useState('');

  const handleContinue = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError(t('onboarding.nameRequired'));
      return;
    }

    if (trimmedName.length < 2) {
      setError(t('onboarding.nameTooShort'));
      return;
    }

    updateOnboardingData({ name: trimmedName });
    router.push('/onboarding/currency');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.step}>{t('onboarding.step1')}</Text>

        <Text style={styles.title}>{t('onboarding.nameTitle')}</Text>

        <Text style={styles.description}>
          {t('onboarding.nameDescription')}
        </Text>

        <Text style={styles.label}>{t('onboarding.nameLabel')}</Text>

        <TextInput
          style={styles.input}
          placeholder={t('onboarding.namePlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={(value) => {
            setName(value);
            setError('');
          }}
          autoCapitalize="words"
          maxLength={50}
          accessibilityLabel={t('onboarding.nameLabel')}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>{t('onboarding.continue')}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      padding: 24,
    },
    content: {
      width: '100%',
      maxWidth: 440,
      alignSelf: 'center',
    },
    step: {
      color: colors.primary,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      marginBottom: 16,
    },
    title: {
      fontSize: typography.fontSize.display,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
      marginBottom: 12,
    },
    description: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.md,
      marginBottom: 32,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semiBold,
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      height: 52,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text,
      backgroundColor: colors.inputBackground,
    },
    error: {
      color: colors.error,
      marginTop: 8,
      fontSize: typography.fontSize.xs,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 28,
    },
    buttonText: {
      color: colors.onPrimary,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semiBold,
    },
  });
}
