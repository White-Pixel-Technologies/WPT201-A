import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SourceForm, { type SourceItem } from '../../components/sources/SourceForm';
import ConfirmSheet from '../../components/ui/ConfirmSheet';
import { Colors } from '../../constants/colors';
import { t } from '../../i18n';
import { formatAmount } from '../../lib/money';
import { useSession } from '../../lib/session';
import { supabase } from '../../lib/supabase';
import { useAppTheme } from '../../lib/theme';
import { useSafeSave } from '../../lib/useSafeSave';

export default function SourceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useAppTheme();
  const { currencyCode } = useSession();
  const { save, isSaving, isOnline } = useSafeSave();

  const [source, setSource] = useState<SourceItem | null>(null);
  const [allSources, setAllSources] = useState<SourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modals & Sheets
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showBlockedDeleteModal, setShowBlockedDeleteModal] = useState(false);

  const textColor = isDark ? '#FFFFFF' : '#1C1C1E';
  const subtextColor = isDark ? '#A1A1AA' : '#64748B';
  const cardColor = isDark ? '#1E1E1E' : '#FFFFFF';
  const backgroundColor = isDark ? '#121212' : '#F8FAFC';
  const borderColor = isDark ? '#27272A' : '#E2E8F0';

  const fetchSource = useCallback(async () => {
    if (!id) return;
    setErrorMsg('');

    try {
      // Use sources_with_stats RPC to get source details along with has_transactions
      const { data, error } = await supabase.rpc('sources_with_stats');

      if (error) {
        // Fallback to table query if RPC is not available
        const { data: directData, error: directErr } = await supabase
          .from('financial_sources')
          .select('id, type, name, opening_amount, current_amount, credit_limit, is_archived')
          .order('name');

        if (directErr) {
          setErrorMsg('Unable to load source details.');
          return;
        }

        const items = (directData ?? []) as SourceItem[];
        setAllSources(items);
        const match = items.find((s) => s.id === id);
        if (match) {
          setSource(match);
        } else {
          setErrorMsg('Source not found.');
        }
        return;
      }

      const items = (data ?? []) as SourceItem[];
      setAllSources(items);
      const match = items.find((s) => s.id === id);
      if (match) {
        setSource(match);
      } else {
        setErrorMsg('Source not found.');
      }
    } catch {
      setErrorMsg('Unable to load source details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      await fetchSource();
      if (isMounted) {
        setIsLoading(false);
      }
    };
    void init();
    return () => {
      isMounted = false;
    };
  }, [fetchSource]);

  const handleDeletePress = () => {
    if (!source) return;

    if (source.has_transactions) {
      // SRC-17: If the source has transactions, Delete is blocked and Archive instead is offered
      setShowBlockedDeleteModal(true);
    } else {
      // SRC-16: Delete confirm sheet
      setShowDeleteConfirm(true);
    }
  };

  const executeDelete = async () => {
    if (!source || !isOnline || isSaving) return;

    const success = await save(async () => {
      const { error } = await supabase
        .from('financial_sources')
        .delete()
        .eq('id', source.id);
      return error;
    });

    if (success) {
      setShowDeleteConfirm(false);
      router.replace('/(tabs)/sources');
    }
  };

  const handleArchiveToggle = async (shouldArchive: boolean) => {
    if (!source || !isOnline || isSaving) return;

    const success = await save(async () => {
      const { error } = await supabase
        .from('financial_sources')
        .update({ is_archived: shouldArchive })
        .eq('id', source.id);
      return error;
    });

    if (success) {
      setShowArchiveConfirm(false);
      setShowBlockedDeleteModal(false);
      await fetchSource();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (errorMsg || !source) {
    return (
      <View style={[styles.center, { backgroundColor }]}>
        <Text style={[styles.errorText, { color: textColor }]}>
          {errorMsg || 'Source not found.'}
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={[styles.smallButton, { backgroundColor: Colors.primary }]}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (isEditing) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <SourceForm
          initialSource={source}
          existingSources={allSources}
          onSuccess={async () => {
            setIsEditing(false);
            await fetchSource();
          }}
          onCancel={() => setIsEditing(false)}
        />
      </View>
    );
  }

  const isCard = source.type === 'card';
  const outstanding = source.current_amount;
  const limit = source.credit_limit ?? 0;
  const availableCredit = limit - outstanding;
  const isOverLimit = isCard && limit > 0 && outstanding > limit;
  const isCreditBalance = isCard && outstanding < 0;
  const isBelowZero = !isCard && source.current_amount < 0;

  const typeIcon =
    source.type === 'bank'
      ? 'bank'
      : source.type === 'card'
        ? 'credit-card-outline'
        : 'cash';

  const typeLabel =
    source.type === 'bank'
      ? 'Bank Account'
      : source.type === 'card'
        ? 'Credit Card'
        : 'Cash';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.content}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back to sources"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
          <Text style={[styles.backText, { color: textColor }]}>Sources</Text>
        </Pressable>

        {source.is_archived && (
          <View style={styles.archivedBadge}>
            <Text style={styles.archivedBadgeText}>Archived</Text>
          </View>
        )}
      </View>

      {/* Summary Card (SRC-10) */}
      <View style={[styles.summaryCard, { backgroundColor: cardColor, borderColor }]}>
        <View style={styles.sourceTitleRow}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: isDark ? '#27272A' : '#E8F5F1' },
            ]}
          >
            <MaterialCommunityIcons
              name={typeIcon as any}
              size={28}
              color={Colors.primary}
            />
          </View>
          <View style={styles.titleInfo}>
            <Text style={[styles.sourceName, { color: textColor }]}>
              {source.name}
            </Text>
            <Text style={[styles.sourceType, { color: subtextColor }]}>
              {typeLabel}
            </Text>
          </View>
        </View>

        {/* Bank or Cash: Current Balance */}
        {!isCard && (
          <View style={styles.amountSection}>
            <Text style={[styles.amountLabel, { color: subtextColor }]}>
              Current Balance
            </Text>
            <Text
              style={[
                styles.amountValue,
                { color: isBelowZero ? '#DC2626' : textColor },
              ]}
            >
              {formatAmount(source.current_amount, currencyCode)}
            </Text>

            {isBelowZero && (
              <View style={styles.warningTag}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={16}
                  color="#DC2626"
                />
                <Text style={styles.warningTagText}>Below zero</Text>
              </View>
            )}
          </View>
        )}

        {/* Credit Card: Outstanding, Limit, Available Credit */}
        {isCard && (
          <View style={styles.cardDetailsSection}>
            <View style={styles.cardAmountRow}>
              <View>
                <Text style={[styles.amountLabel, { color: subtextColor }]}>
                  Outstanding
                </Text>
                <Text
                  style={[
                    styles.amountValue,
                    { color: isCreditBalance ? '#16A34A' : textColor },
                  ]}
                >
                  {formatAmount(outstanding, currencyCode)}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.amountLabel, { color: subtextColor }]}>
                  Available Credit
                </Text>
                <Text style={[styles.amountValue, { color: Colors.primary }]}>
                  {formatAmount(availableCredit, currencyCode)}
                </Text>
              </View>
            </View>

            <View style={styles.limitRow}>
              <Text style={[styles.limitText, { color: subtextColor }]}>
                Credit Limit: {formatAmount(limit, currencyCode)}
              </Text>
            </View>

            {/* Warnings from SRC-09 */}
            {isOverLimit && (
              <View style={styles.warningTag}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={16}
                  color="#DC2626"
                />
                <Text style={styles.warningTagText}>
                  Over limit by {formatAmount(outstanding - limit, currencyCode)}
                </Text>
              </View>
            )}

            {isCreditBalance && (
              <View style={[styles.warningTag, styles.creditBalanceTag]}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={16}
                  color="#16A34A"
                />
                <Text style={styles.creditBalanceTagText}>
                  Credit balance {formatAmount(Math.abs(outstanding), currencyCode)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Action Buttons (SRC-12) */}
      <View style={styles.actionsContainer}>
        {!source.is_archived && (
          <>
            <Pressable
              onPress={() => setIsEditing(true)}
              style={[styles.actionBtn, { borderColor }]}
              accessibilityRole="button"
              accessibilityLabel="Edit source"
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={18}
                color={textColor}
              />
              <Text style={[styles.actionBtnText, { color: textColor }]}>
                Edit
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                // Navigate to add transaction (S13) with source preselected
                router.push({
                  pathname: '/(tabs)/transactions',
                  params: { sourceId: source.id },
                });
              }}
              style={[styles.actionBtn, { backgroundColor: Colors.primary, borderColor: Colors.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Add transaction"
            >
              <MaterialCommunityIcons
                name="plus"
                size={18}
                color="#FFFFFF"
              />
              <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>
                Add transaction
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDeletePress}
              style={[styles.actionBtn, styles.deleteBtn]}
              accessibilityRole="button"
              accessibilityLabel="Delete source"
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={18}
                color="#DC2626"
              />
              <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>
                Delete
              </Text>
            </Pressable>
          </>
        )}

        {source.is_archived && (
          <Pressable
            onPress={() => handleArchiveToggle(false)}
            style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Restore source"
          >
            <MaterialCommunityIcons name="restore" size={18} color="#FFFFFF" />
            <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>
              Restore Source
            </Text>
          </Pressable>
        )}
      </View>

      {/* Transactions Section - Empty State for now (SRC-11) */}
      <View style={styles.transactionsHeader}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Transactions
        </Text>
      </View>

      <View style={[styles.emptyBox, { backgroundColor: cardColor, borderColor }]}>
        <MaterialCommunityIcons
          name="receipt-text-outline"
          size={40}
          color={subtextColor}
        />
        <Text style={[styles.emptyText, { color: subtextColor }]}>
          No transactions for this source yet.
        </Text>
      </View>

      {/* Delete Confirmation Sheet (SRC-16) */}
      <ConfirmSheet
        visible={showDeleteConfirm}
        title={`Delete '${source.name}'? This can't be undone.`}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onKeepEditing={() => setShowDeleteConfirm(false)}
        onDiscard={executeDelete}
      />

      {/* Blocked Delete Sheet with Archive alternative (SRC-17, ARC-01) */}
      <ConfirmSheet
        visible={showBlockedDeleteModal}
        title={t('info.source.has.txns')}
        cancelLabel="Cancel"
        confirmLabel="Archive instead"
        onKeepEditing={() => setShowBlockedDeleteModal(false)}
        onDiscard={() => setShowArchiveConfirm(true)}
      />

      {/* Archive Confirm Sheet (ARC-01) */}
      <ConfirmSheet
        visible={showArchiveConfirm}
        title={`Archive '${source.name}'? It will be hidden but its history stays.`}
        cancelLabel="Cancel"
        confirmLabel="Archive"
        onKeepEditing={() => setShowArchiveConfirm(false)}
        onDiscard={() => handleArchiveToggle(true)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  archivedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  archivedBadgeText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    gap: 16,
  },
  sourceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleInfo: {
    gap: 2,
  },
  sourceName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  sourceType: {
    fontSize: 14,
  },
  amountSection: {
    gap: 6,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#3F3F4633',
  },
  amountLabel: {
    fontSize: 13,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  cardDetailsSection: {
    gap: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#3F3F4633',
  },
  cardAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  limitText: {
    fontSize: 14,
  },
  warningTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDECEC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  warningTagText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  creditBalanceTag: {
    backgroundColor: '#E7F5EC',
  },
  creditBalanceTagText: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flex: 1,
    minWidth: 100,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteBtn: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  transactionsHeader: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyBox: {
    padding: 32,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  smallButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
