import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import EmptyState from '../../components/ui/EmptyState';
import Toast from '../../components/ui/Toast';
import { useAppTheme } from '../../lib/theme';

export default function Transactions() {
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
