import { useMemo, useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';

import { default as Text } from '../../components/AppText';
import { useSession, type SourceType } from '../../lib/session';
import { useTheme } from '../../theme/theme-context';
import type { ThemeColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { t } from '../../i18n';

const sourceTypes: { label: string; value: SourceType }[] = [
  { label: t('onboarding.bankAccount'), value: 'bank' },
  { label: t('onboarding.cash'), value: 'cash' },
  { label: t('onboarding.creditCard'), value: 'credit_card' },
];

export default function SourceScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const savedData = useSession((state) => state.onboardingData);

  const updateOnboardingData = useSession(
    (state) => state.updateOnboardingData,
  );

  const completeOnboarding = useSession((state) => state.completeOnboarding);

  const [sourceName, setSourceName] = useState(savedData.sourceName);

  const [sourceType, setSourceType] = useState<SourceType>(
    savedData.sourceType === 'cash' || savedData.sourceType === 'credit_card'
      ? savedData.sourceType
      : 'bank',
  );

  const [balance, setBalance] = useState(String(savedData.initialBalance ?? 0));

  const [creditLimit, setCreditLimit] = useState(
    String(savedData.creditLimit ?? 0),
  );

  const [outstanding, setOutstanding] = useState(
    String(savedData.outstanding ?? 0),
  );

  const [error, setError] = useState('');

  const isCreditCard = sourceType === 'credit_card';

  const numericLimit = Number(creditLimit);
  const numericOutstanding = Number(outstanding);

  const availableCredit = numericLimit - numericOutstanding;

  const handleFinish = () => {
    const trimmedName = sourceName.trim();
    const numericBalance = Number(balance);

    if (!trimmedName) {
      setError(t('onboarding.sourceRequired'));
      return;
    }

    if (isCreditCard) {
      if (
        !creditLimit.trim() ||
        !Number.isFinite(numericLimit) ||
        numericLimit <= 0
      ) {
        setError(t('onboarding.creditLimitInvalid'));
        return;
      }

      if (
        !outstanding.trim() ||
        !Number.isFinite(numericOutstanding) ||
        numericOutstanding < 0
      ) {
        setError(t('onboarding.outstandingInvalid'));
        return;
      }

      if (numericOutstanding > numericLimit) {
        setError(t('onboarding.outstandingTooHigh'));
        return;
      }
    } else {
      if (
        !balance.trim() ||
        !Number.isFinite(numericBalance) ||
        numericBalance < 0
      ) {
        setError(t('onboarding.balanceInvalid'));
        return;
      }
    }

    updateOnboardingData({
      sourceName: trimmedName,
      sourceType,
      initialBalance: isCreditCard ? 0 : numericBalance,
      creditLimit: isCreditCard ? numericLimit : 0,
      outstanding: isCreditCard ? numericOutstanding : 0,
    });

    completeOnboarding();
    router.replace('/home');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.step}>{t('onboarding.step3')}</Text>

      <Text style={styles.title}>{t('onboarding.sourceTitle')}</Text>

      <Text style={styles.description}>
        Add a bank account, cash account or credit card to start tracking your
        finances.
      </Text>

      <Text style={styles.label}>{t('onboarding.sourceName')}</Text>

      <TextInput
        style={styles.input}
        placeholder={t('onboarding.sourceNamePlaceholder')}
        placeholderTextColor={colors.textMuted}
        value={sourceName}
        onChangeText={(value) => {
          setSourceName(value);
          setError('');
        }}
        maxLength={50}
      />

      <Text style={styles.label}>{t('onboarding.sourceType')}</Text>

      {sourceTypes.map((item) => {
        const selected = sourceType === item.value;

        return (
          <Pressable
            key={item.value}
            style={[styles.option, selected && styles.selectedOption]}
            onPress={() => {
              setSourceType(item.value);
              setError('');
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <Text style={styles.optionText}>{item.label}</Text>

            <Text style={styles.check}>{selected ? '[x]' : '[ ]'}</Text>
          </Pressable>
        );
      })}

      {isCreditCard ? (
        <>
          <Text style={styles.label}>
            {t('onboarding.creditLimit')} ({savedData.currency})
          </Text>

          <TextInput
            style={styles.input}
            placeholder={t('onboarding.creditLimitPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={creditLimit}
            onChangeText={(value) => {
              setCreditLimit(value);
              setError('');
            }}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>
            {t('onboarding.outstanding')} ({savedData.currency})
          </Text>

          <TextInput
            style={styles.input}
            placeholder={t('onboarding.outstandingPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={outstanding}
            onChangeText={(value) => {
              setOutstanding(value);
              setError('');
            }}
            keyboardType="decimal-pad"
          />

          <View style={styles.creditBox}>
            <Text style={styles.creditLabel}>
              {t('onboarding.availableCredit')}
            </Text>

            <Text style={styles.creditValue}>
              {savedData.currency}{' '}
              {Number.isFinite(availableCredit) && availableCredit >= 0
                ? availableCredit.toLocaleString('en-IN')
                : '\u2014'}
            </Text>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.label}>
            {t('onboarding.initialBalance')} ({savedData.currency})
          </Text>

          <TextInput
            style={styles.input}
            placeholder={t('onboarding.zeroPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={balance}
            onChangeText={(value) => {
              setBalance(value);
              setError('');
            }}
            keyboardType="decimal-pad"
          />
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleFinish}>
        <Text style={styles.buttonText}>{t('onboarding.finish')}</Text>
      </Pressable>
    </ScrollView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 24,
      paddingTop: 60,
      paddingBottom: 40,
      maxWidth: 500,
      width: '100%',
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
      marginBottom: 28,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semiBold,
      color: colors.text,
      marginBottom: 8,
      marginTop: 18,
    },
    input: {
      height: 52,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      backgroundColor: colors.inputBackground,
      color: colors.text,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
    },
    option: {
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    selectedOption: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.surfaceSecondary,
    },
    optionText: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
    },
    check: {
      color: colors.primary,
      fontSize: typography.fontSize.lg,
    },
    creditBox: {
      marginTop: 20,
      padding: 16,
      borderRadius: 10,
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    creditLabel: {
      color: colors.text,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semiBold,
    },
    creditValue: {
      color: colors.primary,
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      marginTop: 8,
    },
    error: {
      color: colors.error,
      marginTop: 12,
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
