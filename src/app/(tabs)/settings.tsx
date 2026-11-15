import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';

import Text from '../../components/AppText';
import { useTheme, type ThemeMode } from '../../theme/theme-context';
import type { ThemeColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { t } from '../../i18n';

const themeOptions: {
  label: string;
  description: string;
  value: ThemeMode;
}[] = [
  {
    label: t('settings.system'),
    description: t('settings.systemDescription'),
    value: 'system',
  },
  {
    label: t('settings.light'),
    description: t('settings.lightDescription'),
    value: 'light',
  },
  {
    label: t('settings.dark'),
    description: t('settings.darkDescription'),
    value: 'dark',
  },
];

export default function Settings() {
  const { mode, resolvedMode, colors, setMode, isReady } = useTheme();

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{t('settings.title')}</Text>

      <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>

        <Text style={styles.description}>{t('settings.description')}</Text>

        {themeOptions.map((option) => {
          const selected = mode === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setMode(option.value)}
              style={[styles.option, selected && styles.selectedOption]}
            >
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{option.label}</Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>

              <View style={[styles.radio, selected && styles.selectedRadio]}>
                {selected && <View style={styles.radioSelected} />}
              </View>
            </Pressable>
          );
        })}

        <View style={styles.status}>
          <Text style={styles.statusText}>
            {isReady
              ? `${t('settings.selected')}: ${mode === 'system' ? t('settings.system') : mode === 'light' ? t('settings.light') : t('settings.dark')} | ${t('settings.activeAppearance')}: ${resolvedMode === 'light' ? t('settings.light') : t('settings.dark')}`
              : t('settings.loading')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      padding: 20,
    },
    heading: {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: 24,
    },
    section: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
      marginBottom: 6,
    },
    description: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    option: {
      minHeight: 68,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectedOption: {
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.primary,
    },
    optionText: {
      flex: 1,
      marginRight: 12,
    },
    optionTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semiBold,
      color: colors.text,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
    },
    radio: {
      width: 22,
      height: 22,
      borderWidth: 2,
      borderColor: colors.textMuted,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedRadio: {
      borderColor: colors.primary,
    },
    radioSelected: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
    status: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    statusText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      color: colors.text,
    },
  });
}
