import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSession } from '../../lib/session';
import { useAppTheme } from '../../lib/theme';
import { useNetworkStatus } from '../../lib/useNetworkStatus';
import { supabase } from '../../lib/supabase';
import { t } from '../../i18n';
import OfflineBanner from '../../components/ui/OfflineBanner';
import InlineError from '../../components/ui/InlineError';
import {
  SUPPORTED_CURRENCIES,
  detectDefaultCurrency,
  type Currency,
} from '../../constants/currencies';
import { Colors } from '../../constants/colors';

export default function OnboardingCurrencyScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const { isOnline } = useNetworkStatus();
  const { user, currencyCode, setCurrencyCode, setOnboardingStep } = useSession();

  const initialCode = currencyCode || detectDefaultCurrency();
  const [selectedCode, setSelectedCode] = useState<string>(initialCode);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const textColor = isDark ? '#FFFFFF' : '#1C1C1E';
  const subtextColor = isDark ? '#A1A1AA' : '#64748B';
  const cardColor = isDark ? '#1E1E1E' : '#FFFFFF';
  const inputBorder = isDark ? '#3F3F46' : '#CBD5E1';
  const inputBg = isDark ? '#27272A' : '#F8FAFC';
  const itemBorder = isDark ? '#27272A' : '#F1F5F9';
  const selectedBg = isDark ? '#14382F' : '#E8F5F1';
  const backgroundColor = isDark ? '#121212' : '#F8FAFC';

  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SUPPORTED_CURRENCIES;
    return SUPPORTED_CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const handleContinue = async () => {
    setError('');
    if (!selectedCode) {
      setError('Please select a currency.');
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
          .update({ currency_code: selectedCode })
          .eq('user_id', user.id);

        if (updateError) {
          setError(t('err.network.save'));
          setIsSaving(false);
          return;
        }
      }

      setCurrencyCode(selectedCode);
      setOnboardingStep(2);
      router.push('/onboarding/source' as any);
    } catch {
      setError(t('err.generic'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    setOnboardingStep(0);
    router.back();
  };

  const renderItem = ({ item }: { item: Currency }) => {
    const isSelected = item.code === selectedCode;
    return (
      <Pressable
        style={[
          styles.currencyRow,
          {
            borderColor: isSelected ? Colors.primary : itemBorder,
            backgroundColor: isSelected ? selectedBg : cardColor,
          },
        ]}
        onPress={() => setSelectedCode(item.code)}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`${item.name} (${item.code})`}
      >
        <View style={styles.currencyLeft}>
          <View style={[styles.symbolBadge, { backgroundColor: isDark ? '#27272A' : '#F1F5F9' }]}>
            <Text style={[styles.symbolText, { color: Colors.primary }]}>{item.symbol}</Text>
          </View>
          <View style={styles.currencyInfo}>
            <Text style={[styles.currencyName, { color: textColor }]}>{item.name}</Text>
            <Text style={[styles.currencyCode, { color: subtextColor }]}>{item.code}</Text>
          </View>
        </View>

        <MaterialCommunityIcons
          name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
          size={22}
          color={isSelected ? Colors.primary : subtextColor}
        />
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <OfflineBanner visible={!isOnline} />

      <View style={styles.content}>
        {/* Header with Back button */}
        <View style={styles.navHeader}>
          <Pressable
            onPress={handleBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back to Step 1"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
            <Text style={[styles.backText, { color: textColor }]}>Back</Text>
          </Pressable>

          <Text style={[styles.progressText, { color: Colors.primary }]}>Step 2 of 3</Text>
        </View>

        <Text style={[styles.title, { color: textColor }]}>Choose your currency</Text>
        <Text style={[styles.subtitle, { color: subtextColor }]}>
          Amounts will be displayed in this currency across the app.
        </Text>

        {/* Search Input */}
        <View
          style={[styles.searchContainer, { borderColor: inputBorder, backgroundColor: inputBg }]}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={subtextColor}
            style={styles.searchIcon}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search currency by name or code"
            placeholderTextColor={subtextColor}
            style={[styles.searchInput, { color: textColor }]}
            accessibilityLabel="Search currency"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={subtextColor} />
            </Pressable>
          )}
        </View>

        {!!error && (
          <View style={styles.errorContainer}>
            <InlineError message={error} variant="error" isDark={isDark} />
          </View>
        )}

        {/* Currency List */}
        <FlatList
          data={filteredCurrencies}
          keyExtractor={(item) => item.code}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        {/* Bottom continue action */}
        <View style={[styles.footer, { backgroundColor }]}>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
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
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 6,
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  errorContainer: {
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 16,
    gap: 8,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  symbolBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  currencyInfo: {
    gap: 2,
  },
  currencyName: {
    fontSize: 15,
    fontWeight: '600',
  },
  currencyCode: {
    fontSize: 13,
  },
  footer: {
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#3F3F4633',
  },
  offlineHint: {
    color: '#D97706',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  primaryButton: {
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
