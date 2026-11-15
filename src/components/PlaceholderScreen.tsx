import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import Text from './AppText';
import { useTheme } from '../theme/theme-context';
import type { ThemeColors } from '../theme/colors';
import { typography } from '../theme/typography';

type PlaceholderScreenProps = {
  title: string;
  children?: ReactNode;
};

export default function PlaceholderScreen({
  title,
  children,
}: PlaceholderScreenProps) {
  const { colors } = useTheme();

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
      {children}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: colors.background,
    },
    text: {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.semiBold,
      color: colors.text,
    },
  });
}
