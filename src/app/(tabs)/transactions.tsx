import { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import Text from '../../components/AppText';
import { useSession } from '../../lib/session';
import type { Source, Transaction, TransactionType } from '../../lib/session';
import { useTheme } from '../../theme/theme-context';
import type { ThemeColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { t } from '../../i18n';

const transactionTypes: {
  label: string;
  value: TransactionType;
}[] = [
  { label: t('transactions.typeIncome'), value: 'income' },
  { label: t('transactions.typeExpense'), value: 'expense' },
  { label: t('transactions.typeTransfer'), value: 'transfer' },
  { label: t('transactions.typeAdjustment'), value: 'adjustment' },
];

const today = () => new Date().toISOString().slice(0, 10);

const formatMoney = (amount: number) =>
  `\u20B9${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const typeLabel: Record<TransactionType, string> = {
  income: t('transactions.typeIncome'),
  expense: t('transactions.typeExpense'),
  transfer: t('transactions.typeTransfer'),
  adjustment: t('transactions.typeAdjustment'),
};

export default function Transactions() {
  const sources = useSession((state) => state.sources);
  const transactions = useSession((state) => state.transactions);
  const addTransaction = useSession((state) => state.addTransaction);

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [selectedType, setSelectedType] = useState<TransactionType>('expense');

  const [date, setDate] = useState(today());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [tag, setTag] = useState('');

  const [sourceId, setSourceId] = useState('');
  const [fromSourceId, setFromSourceId] = useState('');
  const [toSourceId, setToSourceId] = useState('');

  const [formVisible, setFormVisible] = useState(false);

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)),
    [transactions],
  );

  const showMessage = (message: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.alert(message);
      }
    } else {
      Alert.alert('SaveMode', message);
    }
  };

  const resetForm = () => {
    setDate(today());
    setDescription('');
    setAmount('');
    setTag('');
    setSourceId('');
    setFromSourceId('');
    setToSourceId('');
    setSelectedType('expense');
    setFormVisible(false);
  };

  const handleTypeChange = (type: TransactionType) => {
    setSelectedType(type);
    setSourceId('');
    setFromSourceId('');
    setToSourceId('');
  };

  const getSourceName = (id?: string) => {
    if (!id) return t('transactions.unknownSource');

    return (
      sources.find((source) => source.id === id)?.name ??
      t('transactions.unknownSource')
    );
  };

  const saveTransaction = () => {
    const numericAmount = Number(amount);

    if (!date.trim()) {
      showMessage(t('transactions.dateRequired'));
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
      showMessage(t('transactions.dateInvalid'));
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      showMessage(t('transactions.amountInvalid'));
      return;
    }

    if (!tag.trim()) {
      showMessage(t('transactions.tagRequired'));
      return;
    }

    if (sources.length === 0) {
      showMessage(t('transactions.sourceRequired'));
      return;
    }

    if (selectedType === 'transfer') {
      if (!fromSourceId || !toSourceId) {
        showMessage(t('transactions.transferSourcesRequired'));
        return;
      }

      if (fromSourceId === toSourceId) {
        showMessage(t('transactions.transferSourcesDifferent'));
        return;
      }

      addTransaction({
        type: 'transfer',
        date,
        description: description.trim(),
        amount: numericAmount,
        tag: tag.trim(),
        fromSourceId,
        toSourceId,
      });
    } else {
      if (!sourceId) {
        showMessage(t('transactions.selectSourceRequired'));
        return;
      }

      addTransaction({
        type: selectedType,
        date,
        description: description.trim(),
        amount: numericAmount,
        tag: tag.trim(),
        sourceId,
      });
    }

    showMessage(t('transactions.saved'));
    resetForm();
  };

  const renderSourceOption = (
    source: Source,
    selected: boolean,
    onPress: () => void,
  ) => (
    <Pressable
      key={source.id}
      onPress={onPress}
      style={[styles.sourceOption, selected && styles.selectedSource]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <Text
        style={[styles.sourceOptionText, selected && styles.selectedSourceText]}
      >
        {source.name}
      </Text>

      <Text style={styles.sourceOptionType}>
        {source.type.replace('_', ' ')}
      </Text>
    </Pressable>
  );

  const renderTransaction = (transaction: Transaction) => {
    let sourceDescription = '';

    if (transaction.type === 'transfer') {
      sourceDescription =
        `${getSourceName(transaction.fromSourceId)} \u2192 ` +
        getSourceName(transaction.toSourceId);
    } else {
      sourceDescription = getSourceName(transaction.sourceId);
    }

    return (
      <View key={transaction.id} style={styles.transactionCard}>
        <View style={styles.transactionTop}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>
              {transaction.description?.trim() || typeLabel[transaction.type]}
            </Text>

            <Text style={styles.transactionMeta}>
              {transaction.date} {'\u00B7'} {transaction.tag}
            </Text>

            <Text style={styles.transactionSource}>{sourceDescription}</Text>
          </View>

          <View style={styles.transactionAmountContainer}>
            <Text
              style={[
                styles.transactionAmount,
                transaction.type === 'income' && styles.incomeAmount,
                transaction.type === 'expense' && styles.expenseAmount,
              ]}
            >
              {transaction.type === 'income' ? '+' : ''}
              {formatMoney(transaction.amount)}
            </Text>

            <Text style={styles.transactionType}>
              {typeLabel[transaction.type]}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>{t('transactions.title')}</Text>
            <Text style={styles.subtitle}>{t('transactions.subtitle')}</Text>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={() => setFormVisible(!formVisible)}
          >
            <Text style={styles.addButtonText}>
              {formVisible
                ? t('transactions.close')
                : '+ ' + t('transactions.add')}
            </Text>
          </Pressable>
        </View>

        {formVisible && (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>{t('transactions.new')}</Text>

            <Text style={styles.label}>{t('transactions.type')}</Text>

            <View style={styles.typeOptions}>
              {transactionTypes.map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => handleTypeChange(item.value)}
                  style={[
                    styles.typeOption,
                    selectedType === item.value && styles.selectedType,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      selectedType === item.value && styles.selectedTypeText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>{t('transactions.date')}</Text>

            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder={t('transactions.datePlaceholder')}
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>{t('transactions.amount')} (₹)</Text>

            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder={t('transactions.amountInputPlaceholder')}
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>{t('transactions.description')}</Text>

            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder={t('transactions.descriptionInputPlaceholder')}
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>{t('transactions.tag')}</Text>

            <TextInput
              style={styles.input}
              value={tag}
              onChangeText={setTag}
              placeholder={t('transactions.tagInputPlaceholder')}
              placeholderTextColor={colors.textMuted}
            />

            {selectedType === 'transfer' ? (
              <>
                <Text style={styles.label}>{t('transactions.fromSource')}</Text>

                {sources.map((source) =>
                  renderSourceOption(source, fromSourceId === source.id, () =>
                    setFromSourceId(source.id),
                  ),
                )}

                <Text style={styles.label}>{t('transactions.toSource')}</Text>

                {sources.map((source) =>
                  renderSourceOption(source, toSourceId === source.id, () =>
                    setToSourceId(source.id),
                  ),
                )}
              </>
            ) : (
              <>
                <Text style={styles.label}>
                  {t('transactions.selectSource')}
                </Text>

                {sources.map((source) =>
                  renderSourceOption(source, sourceId === source.id, () =>
                    setSourceId(source.id),
                  ),
                )}
              </>
            )}

            <Pressable style={styles.saveButton} onPress={saveTransaction}>
              <Text style={styles.saveButtonText}>
                {t('transactions.save')}
              </Text>
            </Pressable>

            <Pressable style={styles.cancelButton} onPress={resetForm}>
              <Text style={styles.cancelText}>{t('transactions.cancel')}</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>{t('transactions.recent')}</Text>

          <Text style={styles.countText}>
            {transactions.length} {t('transactions.total')}
          </Text>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t('transactions.empty')}</Text>

            <Text style={styles.emptyDescription}>
              {t('transactions.emptyDescription')}
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={() => setFormVisible(true)}
            >
              <Text style={styles.addButtonText}>
                + {t('transactions.add')}
              </Text>
            </Pressable>
          </View>
        ) : (
          sortedTransactions.map(renderTransaction)
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
      maxWidth: 850,
      width: '100%',
      alignSelf: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 22,
    },
    heading: {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
    },
    subtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginTop: 5,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 18,
      paddingVertical: 11,
      minHeight: 44,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonText: {
      color: colors.onPrimary,
      fontWeight: typography.fontWeight.semiBold,
      fontSize: typography.fontSize.sm,
    },
    formCard: {
      backgroundColor: colors.surface,
      borderRadius: 15,
      padding: 18,
      marginBottom: 25,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
      marginBottom: 15,
    },
    label: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semiBold,
      color: colors.text,
      marginTop: 12,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 9,
      paddingHorizontal: 13,
      paddingVertical: 12,
      minHeight: 44,
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text,
      backgroundColor: colors.inputBackground,
    },
    typeOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    typeOption: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      minHeight: 44,
      justifyContent: 'center',
      borderRadius: 9,
    },
    selectedType: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceSecondary,
    },
    typeOptionText: {
      color: colors.text,
      fontSize: typography.fontSize.xs,
    },
    selectedTypeText: {
      color: colors.primary,
      fontWeight: typography.fontWeight.bold,
    },
    sourceOption: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 9,
      padding: 12,
      minHeight: 44,
      justifyContent: 'center',
      marginBottom: 8,
      backgroundColor: colors.surface,
    },
    selectedSource: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceSecondary,
    },
    sourceOptionText: {
      color: colors.text,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semiBold,
    },
    selectedSourceText: {
      color: colors.primary,
    },
    sourceOptionType: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.xs,
      marginTop: 4,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      padding: 14,
      marginTop: 22,
    },
    saveButtonText: {
      color: colors.onPrimary,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.sm,
    },
    cancelButton: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      padding: 13,
      marginTop: 5,
    },
    cancelText: {
      color: colors.textSecondary,
      fontWeight: typography.fontWeight.semiBold,
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 13,
    },
    countText: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
    },
    transactionCard: {
      backgroundColor: colors.surface,
      borderRadius: 13,
      padding: 17,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    transactionTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
    },
    transactionInfo: {
      flex: 1,
    },
    transactionTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
    },
    transactionMeta: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      marginTop: 5,
    },
    transactionSource: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      marginTop: 5,
    },
    transactionAmountContainer: {
      alignItems: 'flex-end',
    },
    transactionAmount: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
    },
    incomeAmount: {
      color: colors.success,
    },
    expenseAmount: {
      color: colors.error,
    },
    transactionType: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      marginTop: 5,
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 15,
      padding: 30,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
    },
    emptyDescription: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: typography.lineHeight.sm,
      marginTop: 8,
      marginBottom: 18,
    },
    emptyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 18,
      paddingVertical: 12,
      minHeight: 44,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
