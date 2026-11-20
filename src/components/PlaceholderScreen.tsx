import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { spacing, typography } from '../theme';
import { useTheme } from '../theme/theme-context';
import Text from './AppText';

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
    gap: spacing.lg,
    padding: spacing.xl,
  },
  text: {
    fontSize: typography.fontSize.xxl,
    lineHeight: typography.lineHeight.xxl,
    fontFamily: typography.fontFamily.semiBold,
    textAlign: 'center',
  },
});