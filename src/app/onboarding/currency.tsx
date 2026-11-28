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
import { useTheme } from '../../theme/theme-context';
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

export default function OnboardingCurrencyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isOnline } = useNetworkStatus();
  const { user, currencyCode, setCurrencyCode, setOnboardingStep } = useSession();

  const initialCode = currencyCode || detectDefaultCurrency();
  const [selectedCode, setSelectedCode] = useState<string>(initialCode);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
      setError(t('onboarding.currency.required'));
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
            borderColor: isSelected ? colors.primary : colors.border,
            backgroundColor: isSelected ? colors.primarySurface : colors.surface,
          },
        ]}
        onPress={() => setSelectedCode(item.code)}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`${item.name} (${item.code})`}
      >
        <View style={styles.currencyLeft}>
          <View style={[styles.symbolBadge, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.symbolText, { color: colors.primary }]}>{item.symbol}</Text>
          </View>
          <View style={styles.currencyInfo}>
            <Text style={[styles.currencyName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.currencyCode, { color: colors.textSecondary }]}>{item.code}</Text>
          </View>
        </View>

        <MaterialCommunityIcons
          name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
          size={22}
          color={isSelected ? colors.primary : colors.textSecondary}
        />
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
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
            accessibilityLabel={t('onboarding.back_to_step', { step: 1 })}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>{t('a11y.back')}</Text>
          </Pressable>

          <Text style={[styles.progressText, { color: colors.primary }]}>
            {t('onboarding.step', { current: 2, total: 3 })}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.currency.title')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('onboarding.currency.subtitle')}
        </Text>

        {/* Search Input */}
        <View
          style={[
            styles.searchContainer,
            { borderColor: colors.border, backgroundColor: colors.inputBackground },
          ]}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('onboarding.currency.search.placeholder')}
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
            accessibilityLabel={t('onboarding.currency.search.label')}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {!!error && (
          <View style={styles.errorContainer}>
            <InlineError message={error} variant="error" />
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
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.background, borderTopColor: colors.border },
          ]}
        >
          {!isOnline && (
            <Text style={[styles.offlineHint, { color: colors.warning }]}>
              {t('info.offline.save')}
            </Text>
          )}

          <Pressable
            onPress={handleContinue}
            disabled={!isOnline || isSaving}
            style={[
              styles.primaryButton,
              { backgroundColor: colors.primary },
              (!isOnline || isSaving) && styles.disabledButton,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.continue')}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.onPrimary} size="small" />
            ) : (
              <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
                {t('onboarding.continue')}
              </Text>
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
  },
  offlineHint: {
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
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
