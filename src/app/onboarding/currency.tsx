import { useMemo } from 'react';
import { View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';

import { default as Text } from '../../components/AppText';
import { useSession } from '../../lib/session';
import { useTheme } from '../../theme/theme-context';
import type { ThemeColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { t } from '../../i18n';

const currencies = [
  { code: 'INR', label: t('onboarding.currencyINR'), symbol: '\u20B9' },
  { code: 'USD', label: t('onboarding.currencyUSD'), symbol: '$' },
  { code: 'EUR', label: t('onboarding.currencyEUR'), symbol: '\u20AC' },
  { code: 'GBP', label: t('onboarding.currencyGBP'), symbol: '\u00A3' },
  { code: 'JPY', label: t('onboarding.currencyJPY'), symbol: '\u00A5' },
  { code: 'AED', label: t('onboarding.currencyAED'), symbol: '\u062F.\u0625' },
];

export default function CurrencyScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const currency = useSession((state) => state.onboardingData.currency);

  const updateOnboardingData = useSession(
    (state) => state.updateOnboardingData,
  );

  const handleContinue = () => {
    router.push('/onboarding/source');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.step}>{t('onboarding.step2')}</Text>

      <Text style={styles.title}>{t('onboarding.currencyTitle')}</Text>

      <Text style={styles.description}>
        {t('onboarding.currencyDescription')}
      </Text>

      {currencies.map((item) => {
        const selected = currency === item.code;

        return (
          <Pressable
            key={item.code}
            onPress={() => updateOnboardingData({ currency: item.code })}
            style={[styles.option, selected && styles.selectedOption]}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <View style={styles.currencyInfo}>
              <Text style={styles.symbol}>{item.symbol}</Text>

              <View>
                <Text style={styles.code}>{item.code}</Text>
                <Text style={styles.label}>{item.label}</Text>
              </View>
            </View>

            <Text style={styles.check}>{selected ? '\u25C9' : '\u25CB'}</Text>
          </Pressable>
        );
      })}

      <Pressable style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>{t('onboarding.continue')}</Text>
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
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      lineHeight: typography.lineHeight.md,
      marginBottom: 28,
    },
    option: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      marginBottom: 12,
      backgroundColor: colors.surface,
    },
    selectedOption: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.surfaceSecondary,
    },
    currencyInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    symbol: {
      fontSize: typography.fontSize.xxl,
      color: colors.primary,
      width: 35,
    },
    code: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
    },
    label: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.xs,
      marginTop: 3,
    },
    check: {
      color: colors.primary,
      fontSize: typography.fontSize.xl,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: colors.onPrimary,
      fontWeight: typography.fontWeight.semiBold,
      fontSize: typography.fontSize.md,
    },
  });
}
