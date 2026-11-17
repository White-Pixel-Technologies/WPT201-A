import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, useColorScheme } from 'react-native';

export default function PlaceholderScreen({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  const dark = useColorScheme() === 'dark';
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: dark ? '#111111' : '#FFFFFF' }}
      contentContainerStyle={styles.content}>
      <Text style={[styles.text, { color: dark ? '#FFFFFF' : '#111111' }]}>{title}</Text>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  text: { fontSize: 24, fontWeight: '600', textAlign: 'center' },
});
