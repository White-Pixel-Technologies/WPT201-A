
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { t } from '../../i18n';

type LoadingStateProps = {
  onRetry?: () => void;
  spinnerSize?: 'small' | 'large';
};

export default function LoadingState({
  onRetry,
  spinnerSize = 'large',
}: LoadingStateProps) {
  const isDark = useColorScheme() === 'dark';
  const [isSlow, setIsSlow] = useState(false);

  const textColor = isDark ? '#FFFFFF' : '#222222';
  const skeletonColor = isDark ? '#444444' : '#E5E5E5';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSlow(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={t('loading.label')}
    >
      <ActivityIndicator
        size={spinnerSize}
        color={textColor}
      />

      <View
        style={[
          styles.skeleton,
          { backgroundColor: skeletonColor },
        ]}
      />
      <View
        style={[
          styles.skeleton,
          { backgroundColor: skeletonColor, opacity: 0.7 },
        ]}
      />

      {isSlow && (
        <View style={styles.slowContainer}>
          <Text
            style={[styles.message, { color: textColor }]}
            accessibilityLiveRegion="polite"
          >
            {t('loading.slow')}
          </Text>

          {onRetry && (
            <Pressable
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel={t('action.retry')}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>
                {t('action.retry')}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    alignItems: 'center',
  },
  skeleton: {
    height: 72,
    width: '100%',
    borderRadius: 12,
  },
  slowContainer: {
    alignItems: 'center',
    gap: 12,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  retryText: {
    color: '#2457C5',
    fontSize: 14,
    fontWeight: '600',
  },
});
