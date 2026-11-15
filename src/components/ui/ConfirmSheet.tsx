
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { t } from '../../i18n';

type ConfirmSheetProps = {
  visible: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
  title?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  loading?: boolean;
  confirmDisabled?: boolean;
};

export default function ConfirmSheet({
  visible,
  onKeepEditing,
  onDiscard,
  title,
  cancelLabel,
  confirmLabel,
  loading = false,
  confirmDisabled = false,
}: ConfirmSheetProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isDark = useColorScheme() === 'dark';

  const backgroundColor = isDark ? '#242424' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#222222';
  const disabled = loading || confirmDisabled;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (!loading) onKeepEditing();
      }}
    >
      <View style={[styles.overlay, isDesktop && styles.desktopOverlay]}>
        <View
          style={[
            styles.sheet,
            isDesktop && styles.desktopSheet,
            { backgroundColor },
          ]}
          accessibilityViewIsModal
          accessibilityRole="alert"
        >
          {!isDesktop && (
            <View
              style={[
                styles.handle,
                { backgroundColor: isDark ? '#777777' : '#C8C8C8' },
              ]}
              accessible={false}
            />
          )}

          <Text style={[styles.title, { color: textColor }]}>
            {title ?? t('confirm.discard.title')}
          </Text>

          <View style={styles.actions}>
            <Pressable
              onPress={onKeepEditing}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={
                cancelLabel ?? t('confirm.discard.keep')
              }
              style={[
                styles.cancelButton,
                loading && styles.disabledButton,
              ]}
            >
              <Text style={styles.cancelText}>
                {cancelLabel ?? t('confirm.discard.keep')}
              </Text>
            </Pressable>

            <Pressable
              onPress={onDiscard}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={
                confirmLabel ?? t('confirm.discard.discard')
              }
              style={[
                styles.confirmButton,
                disabled && styles.disabledButton,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmText}>
                  {confirmLabel ?? t('confirm.discard.discard')}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  desktopOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 24,
  },
  desktopSheet: {
    width: '90%',
    maxWidth: 520,
    borderRadius: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: -8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    padding: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelText: {
    color: '#2457C5',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#B42318',
    padding: 14,
    minHeight: 44,
    minWidth: 88,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.55,
  },
});
