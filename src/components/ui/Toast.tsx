
import { useEffect, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
} from 'react-native';
import { t } from '../../i18n';

type ToastProps = {
  visible: boolean;
  message?: string;
  onUndo?: () => void;
  onDismiss?: () => void;
};

export default function Toast({
  visible,
  message,
  onUndo,
  onDismiss,
}: ToastProps) {
  const dark = useColorScheme() === 'dark';
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      return;
    }

    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    const duration = onUndo ? 5000 : 3000;

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          onDismiss?.();
        }
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, opacity, onDismiss, onUndo]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          backgroundColor: dark ? '#333333' : '#222222',
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.message}>
        {message ?? t('toast.saved')}
      </Text>

      {onUndo && (
        <Pressable
          onPress={onUndo}
          accessibilityRole="button"
          accessibilityLabel={t('toast.undo')}
          style={styles.undoButton}
        >
          <Text style={styles.undoText}>
            {t('toast.undo')}
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    elevation: 5,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  undoButton: {
    padding: 6,
    minHeight: 44,
    justifyContent: 'center',
  },
  undoText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
