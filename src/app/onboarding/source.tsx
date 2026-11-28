import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import InlineError from '../../components/ui/InlineError';
import OfflineBanner from '../../components/ui/OfflineBanner';
import { t } from '../../i18n';
import { getDatabaseErrorKey } from '../../lib/databaseErrors';
import { cleanPastedAmount, sanitizeAmountInput } from '../../lib/money';
import { useSession } from '../../lib/session';
import { supabase } from '../../lib/supabase';
import { useNetworkStatus } from '../../lib/useNetworkStatus';
import { generateUUID } from '../../lib/uuid';
import { useTheme } from '../../theme/theme-context';

type SourceType = 'cash' | 'bank' | 'card';

export default function OnboardingSourceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isOnline } = useNetworkStatus();
  const { currencyCode, setOnboardingStep, markOnboardingComplete } = useSession();

  // Keep a stable UUID for idempotent retries (G-FRM-05)
  const sourceIdRef = useRef<string>(generateUUID());

  const [type, setType] = useState<SourceType>('cash');
  const [name, setName] = useState(() => t('onboarding.source.type.cash'));
  const [openingBalance, setOpeningBalance] = useState('0');
  const [isOverdrawn, setIsOverdrawn] = useState(false);
  const [creditLimit, setCreditLimit] = useState('');
  const [currentOutstanding, setCurrentOutstanding] = useState('0');

  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const helperExample =
    type === 'bank'
      ? t('onboarding.source.name.example.bank')
      : type === 'card'
        ? t('onboarding.source.name.example.card')
        : t('onboarding.source.name.example.cash');

  const handleTypeChange = (newType: SourceType) => {
    setType(newType);
    setError('');
    const cashDefault = t('onboarding.source.type.cash');
    const bankDefault = t('onboarding.source.type.bank');
    const cardDefault = t('onboarding.source.type.card');
    if (newType === 'cash' && (!name || name === bankDefault || name === cardDefault)) {
      setName(cashDefault);
    } else if (newType === 'bank' && (!name || name === cashDefault || name === cardDefault)) {
      setName(bankDefault);
    } else if (newType === 'card' && (!name || name === cashDefault || name === bankDefault)) {
      setName(cardDefault);
    }
  };

  const handleAmountChange = (
    val: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setError('');
    // Check if pasted with symbols
    if (/[₹$,a-zA-Z]/.test(val)) {
      const cleaned = cleanPastedAmount(val, currencyCode);
      if (cleaned !== null) {
        setter(cleaned);
        return;
      }
    }
    // G-MON-03/04: keypad rule from money.ts
    setter((previous) => sanitizeAmountInput(val, previous));
  };

  const handleBack = () => {
    setOnboardingStep(1);
    router.back();
  };

  const handleComplete = async () => {
    setError('');
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError(t('onboarding.source.name.required'));
      return;
    }

    if (trimmedName.length > 30) {
      setError(t('onboarding.source.name.max_length'));
      return;
    }

    let openingNum = 0;
    let limitNum: number | null = null;

    if (type === 'cash') {
      if (!openingBalance.trim() || isNaN(Number(openingBalance))) {
        setError(t('err.amount.invalid'));
        return;
      }
      openingNum = Number(openingBalance);
      if (openingNum < 0) {
        setError(t('err.cash.negative'));
        return;
      }
    } else if (type === 'bank') {
      if (!openingBalance.trim() || isNaN(Number(openingBalance))) {
        setError(t('err.amount.invalid'));
        return;
      }
      openingNum = Number(openingBalance);
      if (isOverdrawn && openingNum > 0) {
        openingNum = -Math.abs(openingNum);
      }
    } else if (type === 'card') {
      if (!creditLimit.trim() || isNaN(Number(creditLimit))) {
        setError(t('err.amount.invalid'));
        return;
      }
      limitNum = Number(creditLimit);
      if (limitNum <= 0) {
        setError(t('err.limit.zero'));
        return;
      }

      if (!currentOutstanding.trim() || isNaN(Number(currentOutstanding))) {
        setError(t('err.amount.invalid'));
        return;
      }
      openingNum = Number(currentOutstanding);
      if (openingNum < 0) {
        setError(t('err.amount.invalid'));
        return;
      }
    }

    if (!isOnline) {
      setError(t('info.offline.save'));
      return;
    }

    setIsSaving(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('create_first_source', {
        p_id: sourceIdRef.current,
        p_type: type,
        p_name: trimmedName,
        p_opening: openingNum,
        p_credit_limit: limitNum,
      });

      if (rpcError) {
        const errorKey = getDatabaseErrorKey(rpcError);
        setError(t(errorKey));
        setIsSaving(false);
        return;
      }

      if (data === 'created' || data === 'already_complete') {
        await markOnboardingComplete();
        router.replace('/home');
      } else {
        await markOnboardingComplete();
        router.replace('/home');
      }
    } catch (err) {
      const errorKey = getDatabaseErrorKey(err);
      setError(t(errorKey));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <OfflineBanner visible={!isOnline} />

        <View style={styles.cardContainer}>
          <View
            style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}
          >
            {/* Header with Back button */}
            <View style={styles.navHeader}>
              <Pressable
                onPress={handleBack}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel={t('onboarding.back_to_step', { step: 2 })}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                <Text style={[styles.backText, { color: colors.text }]}>{t('a11y.back')}</Text>
              </Pressable>

              <Text style={[styles.progressText, { color: colors.primary }]}>
                {t('onboarding.step', { current: 3, total: 3 })}
              </Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              {t('onboarding.source.title')}
            </Text>

            <Text style={[styles.helper, { color: colors.textSecondary }]}>
              {t('info.source.firsthelp')}
            </Text>

            {/* Source Type Selector */}
            <Text style={[styles.label, { color: colors.text }]}>
              {t('onboarding.source.type.label')}
            </Text>
            <View style={styles.typeSelector}>
              {(
                [
                  { key: 'cash', label: t('onboarding.source.type.cash'), icon: 'cash' },
                  { key: 'bank', label: t('onboarding.source.type.bank'), icon: 'bank' },
                  {
                    key: 'card',
                    label: t('onboarding.source.type.card'),
                    icon: 'credit-card-outline',
                  },
                ] as const
              ).map((item) => {
                const isSelected = type === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => handleTypeChange(item.key)}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.inputBackground,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={item.label}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={18}
                      color={isSelected ? colors.onPrimary : colors.text}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        { color: isSelected ? colors.onPrimary : colors.text },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Source Name Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {t('onboarding.source.name.label')}
                </Text>
                {name.length >= 24 && (
                  <Text style={[styles.counter, { color: colors.textSecondary }]}>
                    {name.length}/30
                  </Text>
                )}
              </View>
              <TextInput
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (error) setError('');
                }}
                maxLength={30}
                placeholder={t('onboarding.source.name.placeholder')}
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.inputBackground,
                  },
                ]}
                accessibilityLabel={t('onboarding.source.name.label')}
              />
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                {helperExample}
              </Text>
            </View>

            {/* Cash & Bank: Opening Balance */}
            {type !== 'card' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {t('onboarding.source.opening_balance')}
                </Text>
                <TextInput
                  value={openingBalance}
                  onChangeText={(val) => handleAmountChange(val, setOpeningBalance)}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.inputBackground,
                    },
                  ]}
                  accessibilityLabel={t('onboarding.source.opening_balance')}
                />

                {type === 'bank' && (
                  <View style={styles.switchRow}>
                    <Text style={[styles.switchLabel, { color: colors.text }]}>
                      {t('label.source.overdrawn')}
                    </Text>
                    <Switch
                      value={isOverdrawn}
                      onValueChange={setIsOverdrawn}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.onPrimary}
                    />
                  </View>
                )}

                {(isOverdrawn || Number(openingBalance) < 0) && type === 'bank' && (
                  <View style={styles.warningBox}>
                    <InlineError message={t('warn.bank.starts.negative')} variant="warning" />
                  </View>
                )}
              </View>
            )}

            {/* Credit Card Fields */}
            {type === 'card' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t('onboarding.source.credit_limit')}
                  </Text>
                  <TextInput
                    value={creditLimit}
                    onChangeText={(val) => handleAmountChange(val, setCreditLimit)}
                    placeholder={t('onboarding.source.credit_limit.placeholder')}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="decimal-pad"
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.inputBackground,
                      },
                    ]}
                    accessibilityLabel={t('onboarding.source.credit_limit')}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t('onboarding.source.current_outstanding')}
                  </Text>
                  <TextInput
                    value={currentOutstanding}
                    onChangeText={(val) => handleAmountChange(val, setCurrentOutstanding)}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="decimal-pad"
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.inputBackground,
                      },
                    ]}
                    accessibilityLabel={t('onboarding.source.current_outstanding')}
                  />
                  {Number(creditLimit) > 0 && Number(currentOutstanding) > Number(creditLimit) && (
                    <View style={styles.warningBox}>
                      <InlineError message={t('warn.over.limit')} variant="warning" />
                    </View>
                  )}
                </View>
              </>
            )}

            {!!error && (
              <View style={styles.errorContainer}>
                <InlineError message={error} variant="error" />
              </View>
            )}

            {!isOnline && (
              <Text style={[styles.offlineHint, { color: colors.warning }]}>
                {t('info.offline.save')}
              </Text>
            )}

            <Pressable
              onPress={handleComplete}
              disabled={!isOnline || isSaving}
              style={[
                styles.primaryButton,
                { backgroundColor: colors.primary },
                (!isOnline || isSaving) && styles.disabledButton,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.source.finish')}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.onPrimary} size="small" />
              ) : (
                <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
                  {t('onboarding.source.finish')}
                </Text>
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
    padding: 26,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  helper: { fontSize: 14, marginBottom: 12 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counter: {
    fontSize: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  typeButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  warningBox: {
    marginTop: 10,
  },
  errorContainer: {
    marginBottom: 12,
  },
  offlineHint: {
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
  },
  primaryButton: {
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
