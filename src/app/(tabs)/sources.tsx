
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { supabase } from '../../lib/supabase';
import { useSafeSave } from '../../lib/useSafeSave';
import { useAppTheme } from '../../lib/theme';
import { t } from '../../i18n';
import OfflineBanner from '../../components/ui/OfflineBanner';

type SourceType = 'bank' | 'cash' | 'card';

type Source = {
  id: string;
  type: SourceType;
  name: string;
  opening_amount: number;
  credit_limit: number | null;
  is_archived: boolean;
};

const MAX_SOURCES = 50;

export default function Sources() {
  const { isDark } = useAppTheme();
  const { save, isSaving, isOnline, errorMessage } = useSafeSave();

  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);

  const [type, setType] = useState<SourceType>('bank');
  const [name, setName] = useState('');
  const [openingAmount, setOpeningAmount] = useState('');
  const [creditLimit, setCreditLimit] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [isCheckingLimit, setIsCheckingLimit] = useState(false);

  const textColor = isDark ? '#FFFFFF' : '#222222';
  const cardColor = isDark ? '#242424' : '#F2F2F2';
  const backgroundColor = isDark ? '#121212' : '#FFFFFF';

  const activeSources = sources.filter((source) => !source.is_archived);
  const archivedSources = sources.filter((source) => source.is_archived);

  // Initial loading: async request avoids synchronous state updates in useEffect.
  useEffect(() => {
    let isMounted = true;

    const fetchSources = async () => {
      try {
        const { data, error } = await supabase
          .from('financial_sources')
          .select(
            'id, type, name, opening_amount, credit_limit, is_archived'
          )
          .order('name');

        if (!isMounted) return;

        if (error) {
          setListError('Unable to load sources. Please try again.');
        } else {
          setSources((data ?? []) as Source[]);
        }
      } catch {
        if (isMounted) {
          setListError('Unable to load sources. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchSources();

    return () => {
      isMounted = false;
    };
  }, []);

  // Used by refresh and after create, edit, archive, or restore.
  const loadSources = async () => {
    setListError('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('financial_sources')
        .select(
          'id, type, name, opening_amount, credit_limit, is_archived'
        )
        .order('name');

      if (error) {
        setListError('Unable to load sources. Please try again.');
        return;
      }

      setSources((data ?? []) as Source[]);
    } catch {
      setListError('Unable to load sources. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSource(null);
    setType('bank');
    setName('');
    setOpeningAmount('');
    setCreditLimit('');
    setFormError('');
  };

  const openCreateForm = () => {
    setSuccessMessage('');
    setFormError('');
    setEditingSource(null);
    setType('bank');
    setName('');
    setOpeningAmount('');
    setCreditLimit('');
    setShowForm(true);
  };

  const openEditForm = (source: Source) => {
    setSuccessMessage('');
    setFormError('');
    setEditingSource(source);
    setType(source.type);
    setName(source.name);
    setOpeningAmount(String(source.opening_amount));
    setCreditLimit(
      source.credit_limit === null ? '' : String(source.credit_limit)
    );
    setShowForm(true);
  };

  const handleSave = async () => {
    setSuccessMessage('');
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter a source name.');
      return;
    }

    if (
      !openingAmount.trim() ||
      !Number.isFinite(Number(openingAmount))
    ) {
      setFormError('Please enter a valid opening amount.');
      return;
    }

    const amount = Number(openingAmount);

    if (type === 'cash' && amount < 0) {
      setFormError('Cash opening amount cannot be negative.');
      return;
    }

    if (
      type === 'card' &&
      (
        !creditLimit.trim() ||
        !Number.isFinite(Number(creditLimit)) ||
        Number(creditLimit) < 0
      )
    ) {
      setFormError('Please enter a valid credit limit.');
      return;
    }

    if (!isOnline || isSaving || isCheckingLimit) return;

    // Count all sources, including archived ones.
    if (!editingSource) {
      setIsCheckingLimit(true);

      try {
        const { count, error } = await supabase
          .from('financial_sources')
          .select('id', { count: 'exact', head: true });

        if (error) {
          setFormError(
            'Unable to check your source limit. Please try again.'
          );
          return;
        }

        if ((count ?? 0) >= MAX_SOURCES) {
          setFormError(
            'You can create a maximum of 50 sources, including archived sources.'
          );
          return;
        }
      } catch {
        setFormError(
          'Unable to check your source limit. Please try again.'
        );
        return;
      } finally {
        setIsCheckingLimit(false);
      }
    }

    const sourceDetails = {
      name: name.trim(),
      opening_amount: amount,
      credit_limit: type === 'card' ? Number(creditLimit) : null,
    };

    const success = await save(async () => {
      if (editingSource) {
        const { error } = await supabase
          .from('financial_sources')
          .update(sourceDetails)
          .eq('id', editingSource.id);

        return error;
      }

      const { error } = await supabase
        .from('financial_sources')
        .insert({
          type,
          ...sourceDetails,
          is_archived: false,
        });

      return error;
    });

    if (success) {
      const wasEditing = editingSource !== null;
      resetForm();
      setSuccessMessage(
        wasEditing ? 'Source updated successfully.' : t('toast.saved')
      );
      await loadSources();
    }
  };

  const handleArchive = (source: Source, shouldArchive: boolean) => {
    const action = shouldArchive ? 'archive' : 'restore';

    Alert.alert(
      shouldArchive ? 'Archive Source' : 'Restore Source',
      `Are you sure you want to ${action} "${source.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: shouldArchive ? 'Archive' : 'Restore',
          onPress: () => {
            void performArchiveUpdate(source, shouldArchive);
          },
        },
      ]
    );
  };

  const performArchiveUpdate = async (
    source: Source,
    shouldArchive: boolean
  ) => {
    if (!isOnline || isSaving) return;

    setSuccessMessage('');

    const success = await save(async () => {
      const { error } = await supabase
        .from('financial_sources')
        .update({ is_archived: shouldArchive })
        .eq('id', source.id);

      return error;
    });

    if (success) {
      setSuccessMessage(
        shouldArchive
          ? 'Source archived successfully.'
          : 'Source restored successfully.'
      );
      await loadSources();
    }
  };

  const renderSource = (source: Source) => (
    <View
      key={source.id}
      style={[styles.sourceCard, { backgroundColor: cardColor }]}
    >
      <View style={styles.sourceInfo}>
        <Text style={[styles.sourceName, { color: textColor }]}>
          {source.name}
        </Text>

        <Text style={[styles.sourceDetail, { color: textColor }]}>
          Type: {source.type.toUpperCase()}
        </Text>

        <Text style={[styles.sourceDetail, { color: textColor }]}>
          Opening amount: {source.opening_amount}
        </Text>

        {source.type === 'card' && (
          <Text style={[styles.sourceDetail, { color: textColor }]}>
            Credit limit: {source.credit_limit ?? 0}
          </Text>
        )}

        {source.is_archived && (
          <Text style={styles.archivedLabel}>Archived</Text>
        )}
      </View>

      <View style={styles.actionRow}>
        {!source.is_archived && (
          <>
            <Pressable
              onPress={() => openEditForm(source)}
              style={styles.smallButton}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${source.name}`}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </Pressable>

            <Pressable
              onPress={() => handleArchive(source, true)}
              style={[styles.smallButton, styles.archiveButton]}
              disabled={!isOnline || isSaving}
              accessibilityRole="button"
              accessibilityLabel={`Archive ${source.name}`}
            >
              <Text style={styles.buttonText}>Archive</Text>
            </Pressable>
          </>
        )}

        {source.is_archived && (
          <Pressable
            onPress={() => handleArchive(source, false)}
            style={styles.smallButton}
            disabled={!isOnline || isSaving}
            accessibilityRole="button"
            accessibilityLabel={`Restore ${source.name}`}
          >
            <Text style={styles.buttonText}>Restore</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  const saving = isSaving || isCheckingLimit;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.content}
    >
      <OfflineBanner visible={!isOnline} />

      <Text style={[styles.heading, { color: textColor }]}>
        Sources
      </Text>

      {!!successMessage && (
        <Text style={styles.success} accessibilityRole="alert">
          {successMessage}
        </Text>
      )}

      {!!errorMessage && (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      )}

      {!showForm && (
        <Pressable
          style={styles.button}
          onPress={openCreateForm}
          accessibilityRole="button"
          accessibilityLabel="Add source"
        >
          <Text style={styles.buttonText}>
            {t('action.add.source')}
          </Text>
        </Pressable>
      )}

      {showForm && (
        <View style={[styles.form, { backgroundColor: cardColor }]}>
          <Text style={[styles.formHeading, { color: textColor }]}>
            {editingSource ? 'Edit Source' : 'Add Source'}
          </Text>

          <Text style={[styles.label, { color: textColor }]}>
            Source type
          </Text>

          {editingSource ? (
            <Text style={[styles.lockedType, { color: textColor }]}>
              {type.toUpperCase()} (Source type cannot be changed)
            </Text>
          ) : (
            <View style={styles.typeRow}>
              {(['bank', 'cash', 'card'] as SourceType[]).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => {
                    setType(item);
                    setFormError('');
                  }}
                  style={[
                    styles.typeButton,
                    type === item && styles.selectedType,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: type === item }}
                  accessibilityLabel={`${item} source`}
                >
                  <Text style={styles.buttonText}>
                    {item.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={[styles.label, { color: textColor }]}>
            Source name
          </Text>

          <TextInput
            value={name}
            onChangeText={(value) => {
              setName(value);
              setFormError('');
            }}
            placeholder="Enter source name"
            placeholderTextColor="#888888"
            style={[styles.input, { color: textColor }]}
            accessibilityLabel="Source name"
          />

          <Text style={[styles.label, { color: textColor }]}>
            Opening amount
          </Text>

          <TextInput
            value={openingAmount}
            onChangeText={(value) => {
              setOpeningAmount(value);
              setFormError('');
            }}
            placeholder="Enter opening amount"
            placeholderTextColor="#888888"
            keyboardType="decimal-pad"
            style={[styles.input, { color: textColor }]}
            accessibilityLabel="Opening amount"
          />

          {type === 'card' && (
            <>
              <Text style={[styles.label, { color: textColor }]}>
                Credit limit
              </Text>

              <TextInput
                value={creditLimit}
                onChangeText={(value) => {
                  setCreditLimit(value);
                  setFormError('');
                }}
                placeholder="Enter credit limit"
                placeholderTextColor="#888888"
                keyboardType="decimal-pad"
                style={[styles.input, { color: textColor }]}
                accessibilityLabel="Credit limit"
              />
            </>
          )}

          {!!formError && (
            <Text style={styles.error} accessibilityRole="alert">
              {formError}
            </Text>
          )}

          {!isOnline && (
            <Text style={styles.error}>
              {t('info.offline.save')}
            </Text>
          )}

          <Pressable
            onPress={handleSave}
            disabled={!isOnline || saving}
            style={[
              styles.button,
              (!isOnline || saving) && styles.disabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Save source"
            accessibilityState={{
              disabled: !isOnline || saving,
              busy: saving,
            }}
          >
            <Text style={styles.buttonText}>
              {saving
                ? 'Saving...'
                : editingSource
                  ? 'Update Source'
                  : 'Save Source'}
            </Text>
          </Pressable>

          <Pressable
            onPress={resetForm}
            style={styles.cancelButton}
            accessibilityRole="button"
            accessibilityLabel="Cancel source form"
          >
            <Text style={{ color: textColor }}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {!showForm && (
        <>
          <Text style={[styles.sectionHeading, { color: textColor }]}>
            Active Sources ({activeSources.length})
          </Text>

          {isLoading ? (
            <ActivityIndicator size="large" />
          ) : listError ? (
            <Text style={styles.error} accessibilityRole="alert">
              {listError}
            </Text>
          ) : activeSources.length === 0 ? (
            <Text style={[styles.description, { color: textColor }]}>
              {t('empty.state.sources')}
            </Text>
          ) : (
            activeSources.map(renderSource)
          )}

          <Text style={[styles.sectionHeading, { color: textColor }]}>
            Archived Sources ({archivedSources.length})
          </Text>

          {!isLoading && archivedSources.length === 0 ? (
            <Text style={[styles.description, { color: textColor }]}>
              No archived sources.
            </Text>
          ) : (
            archivedSources.map(renderSource)
          )}

          <Pressable
            onPress={() => void loadSources()}
            style={styles.refreshButton}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Refresh sources"
          >
            <Text style={[styles.refreshText, { color: textColor }]}>
              Refresh Sources
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  heading: { fontSize: 26, fontWeight: 'bold' },
  formHeading: { fontSize: 20, fontWeight: 'bold' },
  sectionHeading: { fontSize: 19, fontWeight: 'bold', marginTop: 10 },
  description: { fontSize: 15, textAlign: 'center', padding: 12 },
  form: { padding: 18, borderRadius: 14, gap: 12 },
  label: { fontSize: 15, fontWeight: '600' },
  lockedType: { fontSize: 15, padding: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#888888',
    borderRadius: 9,
    padding: 13,
    fontSize: 16,
  },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeButton: {
    flex: 1,
    backgroundColor: '#888888',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedType: { backgroundColor: '#2457C5' },
  button: {
    backgroundColor: '#2457C5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontWeight: '600' },
  smallButton: {
    backgroundColor: '#2457C5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 75,
  },
  archiveButton: { backgroundColor: '#B45309' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  sourceCard: { padding: 15, borderRadius: 12, gap: 8 },
  sourceInfo: { gap: 5 },
  sourceName: { fontSize: 17, fontWeight: 'bold' },
  sourceDetail: { fontSize: 14 },
  archivedLabel: { color: '#B45309', fontWeight: '600' },
  cancelButton: { padding: 12, alignItems: 'center' },
  disabled: { opacity: 0.45 },
  error: { color: '#DC2626', fontSize: 14 },
  success: { color: '#16A34A', fontSize: 14 },
  refreshButton: {
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#888888',
    borderRadius: 8,
  },
  refreshText: { fontWeight: '600' },
});

