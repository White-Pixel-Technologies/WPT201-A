import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import Text from '../../components/AppText';
import { useSession } from '../../lib/session';
import type { Source, SourceType } from '../../lib/session';
import { useTheme } from '../../theme/theme-context';
import type { ThemeColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { t } from '../../i18n';

const MAX_SOURCES = 50;

const DELETE_BLOCKED_MESSAGE = t('sources.deleteBlocked');

const formatMoney = (amount: number) =>
  `\u20B9${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const sourceLabels: Record<SourceType, string> = {
  bank: t('sources.typeBank'),
  cash: t('sources.typeCash'),
  wallet: t('sources.typeWallet'),
  credit_card: t('sources.typeCreditCard'),
};

const sourceIcons: Record<SourceType, string> = {
  bank: '\u{1F3E6}',
  cash: '\u{1F4B5}',
  wallet: '\u{1F45B}',
  credit_card: '\u{1F4B3}',
};

type FormState = {
  name: string;
  type: SourceType;
  openingBalance: string;
  creditLimit: string;
  outstanding: string;
};

const emptyForm: FormState = {
  name: '',
  type: 'bank',
  openingBalance: '0',
  creditLimit: '0',
  outstanding: '0',
};

export default function Sources() {
  const sources = useSession((state) => state.sources);
  const addSource = useSession((state) => state.addSource);
  const updateSource = useSession((state) => state.updateSource);
  const deleteSource = useSession((state) => state.deleteSource);

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteErrorSourceId, setDeleteErrorSourceId] = useState<string | null>(
    null,
  );

  const totals = useMemo(() => {
    const bankAndCash = sources
      .filter((item) => item.type !== 'credit_card')
      .reduce((sum, item) => sum + item.openingBalance, 0);

    const outstanding = sources
      .filter((item) => item.type === 'credit_card')
      .reduce((sum, item) => sum + item.outstanding, 0);

    return { bankAndCash, outstanding };
  }, [sources]);

  const showMessage = (message: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.alert(message);
      }
    } else {
      Alert.alert('SaveMode', message);
    }
  };

  const openAddModal = () => {
    setEditingSource(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEditModal = (source: Source) => {
    setEditingSource(source);

    setForm({
      name: source.name,
      type: source.type,
      openingBalance: String(source.openingBalance),
      creditLimit: String(source.creditLimit),
      outstanding: String(source.outstanding),
    });

    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingSource(null);
    setForm(emptyForm);
  };

  const updateField = (field: keyof FormState, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const saveSource = () => {
    const name = form.name.trim();

    if (!editingSource && sources.length >= MAX_SOURCES) {
      showMessage(t('sources.maxReached'));
      return;
    }

    if (!name) {
      showMessage(t('sources.enterName'));
      return;
    }

    const duplicate = sources.some(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.id !== editingSource?.id,
    );

    if (duplicate) {
      showMessage(t('sources.duplicateName'));
      return;
    }

    const openingBalance = Number(form.openingBalance);
    const creditLimit = Number(form.creditLimit);
    const outstanding = Number(form.outstanding);

    if (
      !Number.isFinite(openingBalance) ||
      !Number.isFinite(creditLimit) ||
      !Number.isFinite(outstanding) ||
      openingBalance < 0 ||
      creditLimit < 0 ||
      outstanding < 0
    ) {
      showMessage(t('sources.invalidAmounts'));
      return;
    }

    if (
      form.type === 'credit_card' &&
      (creditLimit <= 0 || outstanding > creditLimit)
    ) {
      showMessage(t('sources.invalidCredit'));
      return;
    }

    const sourceData = {
      name,
      type: editingSource ? editingSource.type : form.type,
      openingBalance: form.type === 'credit_card' ? 0 : openingBalance,
      creditLimit: form.type === 'credit_card' ? creditLimit : 0,
      outstanding: form.type === 'credit_card' ? outstanding : 0,
    };

    if (editingSource) {
      updateSource(editingSource.id, sourceData);
    } else {
      addSource(sourceData);
    }

    closeModal();
  };

  const performDelete = (source: Source) => {
    const deleted = deleteSource(source.id);

    if (!deleted) {
      setDeleteErrorSourceId(source.id);
      return;
    }

    setDeleteErrorSourceId(null);
  };

  const confirmDelete = (source: Source) => {
    setDeleteErrorSourceId(null);

    const message = t('sources.deleteConfirm') + ' "' + source.name + '"?';

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(message)) {
        performDelete(source);
      }

      return;
    }

    Alert.alert(t('sources.deleteTitle'), message, [
      {
        text: t('sources.cancel'),
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => performDelete(source),
      },
    ]);
  };

  const renderAmountField = (
    label: string,
    field: keyof FormState,
    value: string,
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(text) => updateField(field, text)}
        keyboardType="decimal-pad"
        placeholder={t('sources.amountPlaceholder')}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );

  const renderSource = (source: Source) => {
    const isCard = source.type === 'credit_card';
    const hasDeleteError = deleteErrorSourceId === source.id;

    return (
      <View key={source.id} style={styles.sourceCard}>
        <View style={styles.sourceTop}>
          <View style={styles.sourceIdentity}>
            <View style={styles.iconBox}>
              <Text style={styles.sourceIcon}>{sourceIcons[source.type]}</Text>
            </View>

            <View style={styles.sourceInfo}>
              <Text style={styles.sourceName}>{source.name}</Text>
              <Text style={styles.sourceType}>{sourceLabels[source.type]}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => openEditModal(source)}
              style={styles.actionButton}
            >
              <Text style={styles.editText}>{t('sources.edit')}</Text>
            </Pressable>

            <Pressable
              onPress={() => confirmDelete(source)}
              style={styles.actionButton}
            >
              <Text style={styles.deleteText}>{t('sources.delete')}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sourceDivider} />

        {isCard ? (
          <>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>{t('sources.creditLimit')}</Text>
              <Text style={styles.amountValue}>
                {formatMoney(source.creditLimit)}
              </Text>
            </View>

            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>{t('sources.outstanding')}</Text>
              <Text style={styles.amountValue}>
                {formatMoney(source.outstanding)}
              </Text>
            </View>

            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>
                {t('sources.availableCredit')}
              </Text>
              <Text style={styles.availableValue}>
                {formatMoney(source.creditLimit - source.outstanding)}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>
              {t('sources.openingBalance')}
            </Text>
            <Text style={styles.amountValue}>
              {formatMoney(source.openingBalance)}
            </Text>
          </View>
        )}

        {hasDeleteError && (
          <View style={styles.deleteErrorBox}>
            <Text style={styles.deleteErrorText}>{DELETE_BLOCKED_MESSAGE}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>{t('sources.title')}</Text>
            <Text style={styles.subtitle}>{t('sources.subtitle')}</Text>
          </View>

          <Pressable
            style={[
              styles.addButton,
              sources.length >= MAX_SOURCES && styles.disabledButton,
            ]}
            onPress={openAddModal}
            disabled={sources.length >= MAX_SOURCES}
          >
            <Text style={styles.addButtonText}>{t('sources.add')}</Text>
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            {t('sources.totalOpeningBalance')}
          </Text>

          <Text style={styles.summaryAmount}>
            {formatMoney(totals.bankAndCash)}
          </Text>

          <View style={styles.summaryDivider} />

          <Text style={styles.summaryLabel}>
            {t('sources.totalCardOutstanding')}
          </Text>

          <Text style={styles.outstandingAmount}>
            {formatMoney(totals.outstanding)}
          </Text>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>{t('sources.accounts')}</Text>

          <Text style={styles.countText}>
            {sources.length} / {MAX_SOURCES} sources
          </Text>
        </View>

        {sources.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>{sourceIcons.bank}</Text>

            <Text style={styles.emptyTitle}>{t('sources.empty')}</Text>

            <Text style={styles.emptyDescription}>
              {t('sources.emptyDescription')}
            </Text>

            <Pressable style={styles.emptyButton} onPress={openAddModal}>
              <Text style={styles.addButtonText}>{t('sources.addFirst')}</Text>
            </Pressable>
          </View>
        ) : (
          sources.map(renderSource)
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingSource
                    ? t('sources.editModal')
                    : t('sources.addModal')}
                </Text>

                <Pressable
                  onPress={closeModal}
                  style={styles.closeButton}
                  accessibilityRole="button"
                  accessibilityLabel={t('sources.closeModal')}
                >
                  <Text style={styles.closeText}>{'\u2715'}</Text>
                </Pressable>
              </View>

              <Text style={styles.label}>{t('sources.sourceName')}</Text>

              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(value) => updateField('name', value)}
                placeholder={t('sources.namePlaceholder')}
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, styles.typeLabel]}>
                {t('sources.sourceType')}
              </Text>

              <View style={styles.typeOptions}>
                {(['bank', 'cash', 'credit_card'] as SourceType[]).map(
                  (type) => (
                    <Pressable
                      key={type}
                      disabled={!!editingSource}
                      onPress={() => updateField('type', type)}
                      style={[
                        styles.typeOption,
                        form.type === type && styles.selectedType,
                        !!editingSource && { opacity: 0.65 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          form.type === type && styles.selectedTypeText,
                        ]}
                      >
                        {sourceIcons[type]} {sourceLabels[type]}
                      </Text>
                    </Pressable>
                  ),
                )}
              </View>

              {form.type === 'credit_card' ? (
                <>
                  {renderAmountField(
                    t('sources.creditLimit') + ' (â‚¹)',
                    'creditLimit',
                    form.creditLimit,
                  )}

                  {renderAmountField(
                    t('sources.outstanding') + ' (â‚¹)',
                    'outstanding',
                    form.outstanding,
                  )}
                </>
              ) : (
                renderAmountField(
                  t('sources.openingBalance') + ' (â‚¹)',
                  'openingBalance',
                  form.openingBalance,
                )
              )}

              <Pressable style={styles.saveButton} onPress={saveSource}>
                <Text style={styles.saveButtonText}>
                  {editingSource
                    ? t('sources.saveChanges')
                    : t('sources.addSource')}
                </Text>
              </Pressable>

              <Pressable style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelText}>{t('sources.cancel')}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    disabledButton: {
      opacity: 0.5,
    },
    addButtonText: {
      color: colors.onPrimary,
      fontWeight: typography.fontWeight.semiBold,
      fontSize: typography.fontSize.sm,
    },
    summaryCard: {
      backgroundColor: colors.primary,
      padding: 22,
      borderRadius: 15,
      marginBottom: 26,
    },
    summaryLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.onPrimary,
    },
    summaryAmount: {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.bold,
      color: colors.onPrimary,
      marginTop: 5,
    },
    summaryDivider: {
      height: 1,
      backgroundColor: colors.onPrimary,
      opacity: 0.3,
      marginVertical: 16,
    },
    outstandingAmount: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.onPrimary,
      marginTop: 5,
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 13,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
    },
    countText: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
    },
    sourceCard: {
      backgroundColor: colors.surface,
      borderRadius: 13,
      padding: 17,
      marginBottom: 13,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sourceTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 10,
    },
    sourceIdentity: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    iconBox: {
      width: 45,
      height: 45,
      borderRadius: 11,
      backgroundColor: colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sourceIcon: {
      fontSize: typography.fontSize.xxl,
    },
    sourceInfo: {
      flex: 1,
    },
    sourceName: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
    },
    sourceType: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      marginTop: 4,
    },
    actions: {
      flexDirection: 'row',
      gap: 5,
    },
    actionButton: {
      minWidth: 44,
      minHeight: 44,
      paddingHorizontal: 9,
      paddingVertical: 7,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editText: {
      color: colors.primary,
      fontWeight: typography.fontWeight.semiBold,
      fontSize: typography.fontSize.xs,
    },
    deleteText: {
      color: colors.error,
      fontWeight: typography.fontWeight.semiBold,
      fontSize: typography.fontSize.xs,
    },
    sourceDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 14,
    },
    amountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 9,
    },
    amountLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
    },
    amountValue: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semiBold,
      color: colors.text,
    },
    availableValue: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: colors.success,
    },
    deleteErrorBox: {
      marginTop: 14,
      padding: 11,
      borderRadius: 8,
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.error,
    },
    deleteErrorText: {
      color: colors.error,
      fontSize: typography.fontSize.xs,
      lineHeight: typography.lineHeight.xs,
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 15,
      padding: 30,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyIcon: {
      fontSize: typography.fontSize.display,
      marginBottom: 12,
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
    modalBackdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      padding: 18,
    },
    modalCard: {
      backgroundColor: colors.surface,
      borderRadius: 17,
      padding: 22,
      maxHeight: '90%',
      width: '100%',
      maxWidth: 500,
      alignSelf: 'center',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 22,
    },
    modalTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
    },
    closeButton: {
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeText: {
      fontSize: typography.fontSize.xl,
      color: colors.textSecondary,
    },
    label: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semiBold,
      color: colors.text,
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
      marginBottom: 17,
      backgroundColor: colors.inputBackground,
    },
    typeLabel: {
      marginTop: 3,
    },
    typeOptions: {
      gap: 8,
      marginBottom: 20,
    },
    typeOption: {
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
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
      fontSize: typography.fontSize.sm,
    },
    selectedTypeText: {
      color: colors.primary,
      fontWeight: typography.fontWeight.bold,
    },
    field: {
      marginBottom: 3,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      padding: 14,
      marginTop: 8,
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
  });
}
