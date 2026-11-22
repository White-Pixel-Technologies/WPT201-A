import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
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
import { Colors } from '../../constants/colors';
import { t } from '../../i18n';
import { getDatabaseErrorKey } from '../../lib/databaseErrors';
import { cleanPastedAmount } from '../../lib/money';
import { useSession } from '../../lib/session';
import { supabase } from '../../lib/supabase';
import { useAppTheme } from '../../lib/theme';
import { useNetworkStatus } from '../../lib/useNetworkStatus';
import { generateUUID } from '../../lib/uuid';

type SourceType = 'cash' | 'bank' | 'card';

export default function OnboardingSourceScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const { isOnline } = useNetworkStatus();
  const { currencyCode, setOnboardingStep, markOnboardingComplete } =
    useSession();

  // Keep a stable UUID for idempotent retries (G-FRM-05)
  const sourceIdRef = useRef<string>(generateUUID());

  const [type, setType] = useState<SourceType>('cash');
  const [name, setName] = useState('Cash');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [isOverdrawn, setIsOverdrawn] = useState(false);
  const [creditLimit, setCreditLimit] = useState('');
  const [currentOutstanding, setCurrentOutstanding] = useState('0');

  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const textColor = isDark ? '#FFFFFF' : '#1C1C1E';
  const subtextColor = isDark ? '#A1A1AA' : '#64748B';
  const cardColor = isDark ? '#1E1E1E' : '#FFFFFF';
  const inputBorder = isDark ? '#3F3F46' : '#CBD5E1';
  const inputBg = isDark ? '#27272A' : '#F8FAFC';
  const backgroundColor = isDark ? '#121212' : '#F8FAFC';

  const helperExample =
    type === 'bank'
      ? 'e.g. SBI Savings, HDFC Salary'
      : type === 'card'
        ? 'e.g. ICICI Amazon Pay card'
        : 'e.g. Wallet cash';

  const handleTypeChange = (newType: SourceType) => {
    setType(newType);
    setError('');
    if (
      newType === 'cash' &&
      (!name || name === 'Bank Account' || name === 'Credit Card')
    ) {
      setName('Cash');
    } else if (
      newType === 'bank' &&
      (!name || name === 'Cash' || name === 'Credit Card')
    ) {
      setName('Bank Account');
    } else if (
      newType === 'card' &&
      (!name || name === 'Cash' || name === 'Bank Account')
    ) {
      setName('Credit Card');
    }
  };

  const handleAmountChange = (val: string, setter: (v: string) => void) => {
    setError('');
    // Check if pasted with symbols
    if (/[₹$,a-zA-Z]/.test(val)) {
      const cleaned = cleanPastedAmount(val, currencyCode);
      if (cleaned !== null) {
        setter(cleaned);
        return;
      }
    }
    // Block multiple decimal points and limit to 2 decimals
    if (/^\d*\.?\d{0,2}$/.test(val) || val === '') {
      setter(val);
    }
  };

  const handleBack = () => {
    setOnboardingStep(1);
    router.back();
  };

  const handleComplete = async () => {
    setError('');
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter a source name.');
      return;
    }

    if (trimmedName.length > 30) {
      setError('Source name cannot exceed 30 characters.');
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
      const { data, error: rpcError } = await supabase.rpc(
        'create_first_source',
        {
          p_id: sourceIdRef.current,
          p_type: type,
          p_name: trimmedName,
          p_opening: openingNum,
          p_credit_limit: limitNum,
        },
      );

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
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <OfflineBanner visible={!isOnline} />

        <View style={styles.cardContainer}>
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            {/* Header with Back button */}
            <View style={styles.navHeader}>
              <Pressable
                onPress={handleBack}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Back to Step 2"
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color={textColor}
                />
                <Text style={[styles.backText, { color: textColor }]}>
                  Back
                </Text>
              </Pressable>

              <Text style={[styles.progressText, { color: Colors.primary }]}>
                Step 3 of 3
              </Text>
            </View>

            <Text style={[styles.title, { color: textColor }]}>
              Add your first source
            </Text>

            <Text style={[styles.subtitle, { color: subtextColor }]}>
              Add where your money is: a bank account, cash in hand, or a credit
              card. You can add more later.
            </Text>

            {/* Source Type Selector */}
            <Text style={[styles.label, { color: textColor }]}>
              Source type
            </Text>
            <View style={styles.typeSelector}>
              {(
                [
                  { key: 'cash', label: 'Cash', icon: 'cash' },
                  { key: 'bank', label: 'Bank account', icon: 'bank' },
                  {
                    key: 'card',
                    label: 'Credit card',
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
                        backgroundColor: isSelected ? Colors.primary : inputBg,
                        borderColor: isSelected ? Colors.primary : inputBorder,
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={item.label}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={18}
                      color={isSelected ? '#FFFFFF' : textColor}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        { color: isSelected ? '#FFFFFF' : textColor },
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
                <Text style={[styles.label, { color: textColor }]}>
                  Source name
                </Text>
                {name.length >= 24 && (
                  <Text style={[styles.counter, { color: subtextColor }]}>
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
                placeholder="e.g. Cash in hand"
                placeholderTextColor={subtextColor}
                style={[
                  styles.input,
                  {
                    color: textColor,
                    borderColor: inputBorder,
                    backgroundColor: inputBg,
                  },
                ]}
                accessibilityLabel="Source name"
              />
              <Text style={[styles.helperText, { color: subtextColor }]}>
                {helperExample}
              </Text>
            </View>

            {/* Cash & Bank: Opening Balance */}
            {type !== 'card' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>
                  Opening balance
                </Text>
                <TextInput
                  value={openingBalance}
                  onChangeText={(val) =>
                    handleAmountChange(val, setOpeningBalance)
                  }
                  placeholder="0.00"
                  placeholderTextColor={subtextColor}
                  keyboardType="decimal-pad"
                  style={[
                    styles.input,
                    {
                      color: textColor,
                      borderColor: inputBorder,
                      backgroundColor: inputBg,
                    },
                  ]}
                  accessibilityLabel="Opening balance"
                />

                {type === 'bank' && (
                  <View style={styles.switchRow}>
                    <Text style={[styles.switchLabel, { color: textColor }]}>
                      This account is overdrawn
                    </Text>
                    <Switch
                      value={isOverdrawn}
                      onValueChange={setIsOverdrawn}
                      trackColor={{ false: inputBorder, true: Colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                )}

                {(isOverdrawn || Number(openingBalance) < 0) &&
                  type === 'bank' && (
                    <View style={styles.warningBox}>
                      <InlineError
                        message={t('warn.bank.starts.negative')}
                        variant="warning"
                        isDark={isDark}
                      />
                    </View>
                  )}
              </View>
            )}

            {/* Credit Card Fields */}
            {type === 'card' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: textColor }]}>
                    Credit limit
                  </Text>
                  <TextInput
                    value={creditLimit}
                    onChangeText={(val) =>
                      handleAmountChange(val, setCreditLimit)
                    }
                    placeholder="e.g. 50000"
                    placeholderTextColor={subtextColor}
                    keyboardType="decimal-pad"
                    style={[
                      styles.input,
                      {
                        color: textColor,
                        borderColor: inputBorder,
                        backgroundColor: inputBg,
                      },
                    ]}
                    accessibilityLabel="Credit limit"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: textColor }]}>
                    Current outstanding
                  </Text>
                  <TextInput
                    value={currentOutstanding}
                    onChangeText={(val) =>
                      handleAmountChange(val, setCurrentOutstanding)
                    }
                    placeholder="0.00"
                    placeholderTextColor={subtextColor}
                    keyboardType="decimal-pad"
                    style={[
                      styles.input,
                      {
                        color: textColor,
                        borderColor: inputBorder,
                        backgroundColor: inputBg,
                      },
                    ]}
                    accessibilityLabel="Current outstanding"
                  />
                  {Number(creditLimit) > 0 &&
                    Number(currentOutstanding) > Number(creditLimit) && (
                      <View style={styles.warningBox}>
                        <InlineError
                          message={t('warn.over.limit')}
                          variant="warning"
                          isDark={isDark}
                        />
                      </View>
                    )}
                </View>
              </>
            )}

            {!!error && (
              <View style={styles.errorContainer}>
                <InlineError message={error} variant="error" isDark={isDark} />
              </View>
            )}

            {!isOnline && (
              <Text style={styles.offlineHint}>{t('info.offline.save')}</Text>
            )}

            <Pressable
              onPress={handleComplete}
              disabled={!isOnline || isSaving}
              style={[
                styles.primaryButton,
                { backgroundColor: Colors.primary },
                (!isOnline || isSaving) && styles.disabledButton,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Finish setup"
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Finish setup</Text>
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
    shadowColor: '#000000',
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
    color: '#D97706',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
