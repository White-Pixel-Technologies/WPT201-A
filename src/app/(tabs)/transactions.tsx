import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import EmptyState from '../../components/ui/EmptyState';
import Toast from '../../components/ui/Toast';
import { useAppTheme } from '../../lib/theme';

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
      Alert.alert('WPT 201 - A', message);
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
    if (!id) return 'Unknown source';

    return sources.find((source) => source.id === id)?.name ?? 'Unknown source';
  };

  const saveTransaction = () => {
    const numericAmount = Number(amount);

    if (!date.trim()) {
      showMessage('Please enter a transaction date.');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
      showMessage('Enter the date in YYYY-MM-DD format.');
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      showMessage('Please enter a valid amount greater than zero.');
      return;
    }

    if (!tag.trim()) {
      showMessage('Please enter a transaction tag.');
      return;
    }

    if (sources.length === 0) {
      showMessage('Please add a source before creating a transaction.');
      return;
    }

    if (selectedType === 'transfer') {
      if (!fromSourceId || !toSourceId) {
        showMessage('Please select both transfer sources.');
        return;
      }

      if (fromSourceId === toSourceId) {
        showMessage('Choose two different sources for a transfer.');
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
        showMessage('Please select a source.');
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

    showMessage('Transaction saved successfully.');
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

  const params = useLocalSearchParams<{ add?: string }>();
  const [showToast, setShowToast] = useState(Boolean(params.add));
  const { isDark } = useAppTheme();


  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
      ]}
    >
      <EmptyState
        icon="swap-horizontal"
        title="No transactions yet"
        description="Transactions you record or import will appear here."
        actionLabel="Add transaction"
        onAction={() => setShowToast(true)}
      />
      <Toast
        visible={showToast}
        message="Transaction entry will be available in the next release."
        onDismiss={() => setShowToast(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
