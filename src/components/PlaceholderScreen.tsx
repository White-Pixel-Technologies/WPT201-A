import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Text from './AppText';
import { useTheme } from '../theme/theme-context';

export default function PlaceholderScreen({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.text, { color: colors.text }]}>{title}</Text>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
});
