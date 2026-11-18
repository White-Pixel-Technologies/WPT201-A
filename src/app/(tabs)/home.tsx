import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSession } from '../../lib/session';
import { supabase } from '../../lib/supabase';
import { formatAmount } from '../../lib/formatMoney';
import { useAppTheme } from '../../lib/theme';
import { useNetworkStatus } from '../../lib/useNetworkStatus';
import OfflineBanner from '../../components/ui/OfflineBanner';
import { t } from '../../i18n';

export default function Home() {
  const { currencyCode, userName } = useSession();
  const { isDark } = useAppTheme();
  const { isOnline } = useNetworkStatus();

  const [totalBalance, setTotalBalance] = useState<number>(0);

  useEffect(() => {
    let active = true;

    async function loadTotals() {
      try {
        const { data, error } = await supabase.rpc('source_totals');
        if (!error && data && data.length > 0 && active) {
          setTotalBalance(Number(data[0].bank_cash_total ?? 0));
        }
      } catch {
        // Fall back gracefully
      }
    }

    loadTotals();

    return () => {
      active = false;
    };
  }, []);

  const textColor = isDark ? '#FFFFFF' : '#111111';
  const subtitleColor = isDark ? '#AAAAAA' : '#666666';
  const cardColor = isDark ? '#1E1E1E' : '#F4F4F5';

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <OfflineBanner visible={!isOnline} />

      <Text style={[styles.heading, { color: textColor }]}>{t('app.name')}</Text>
      <Text style={[styles.subtitle, { color: subtitleColor }]}>
        {userName ? `Welcome back, ${userName}` : 'Your money, made simple.'}
      </Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>
          {formatAmount(totalBalance, currencyCode)}
        </Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.statCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.statLabel, { color: subtitleColor }]}>Income</Text>
          <Text style={styles.income}>
            {formatAmount(0, currencyCode)}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.statLabel, { color: subtitleColor }]}>Expenses</Text>
          <Text style={styles.expense}>
            {formatAmount(0, currencyCode)}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: textColor }]}>
        Recent Transactions
      </Text>
      <Text style={[styles.emptyText, { color: subtitleColor }]}>
        No transactions yet.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 64, gap: 16 },
  heading: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 15, marginTop: -8 },
  balanceCard: {
    backgroundColor: '#0F6E56',
    padding: 24,
    borderRadius: 16,
    gap: 8,
  },
  balanceLabel: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 },
  balanceAmount: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    gap: 6,
  },
  statLabel: { fontSize: 13 },
  income: { color: '#16A34A', fontSize: 18, fontWeight: '700' },
  expense: { color: '#DC2626', fontSize: 18, fontWeight: '700' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 12 },
  emptyText: { fontSize: 14, marginTop: 4 },
});
