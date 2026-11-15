
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { t } from '../../i18n';
import { useAppTheme } from '../../lib/theme';

type EmptyStateProps = {
  onAddSource: () => void;
};

export default function EmptyState({ onAddSource }: EmptyStateProps) {
  const { isDark } = useAppTheme();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="bank-outline"
        size={44}
        color={isDark ? '#FFFFFF' : '#555555'}
        accessible={false}
      />

      <Text
        style={[
          styles.message,
          { color: isDark ? '#FFFFFF' : '#333333' },
        ]}
      >
        {t('empty.state.sources')}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('action.add.source')}
        onPress={onAddSource}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {t('action.add.source')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2457C5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
