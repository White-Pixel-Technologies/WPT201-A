
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { t } from '../../i18n';

type InlineErrorProps = {
  message?: string;
  onRetry?: () => void;
  isDark?: boolean;
  variant?: 'error' | 'warning' | 'info' | 'success';
};

const variantStyles = {
  error: {
    lightBg: '#FDECEC',
    darkBg: '#442222',
    lightText: '#9B1C1C',
    darkText: '#FFB4AB',
    icon: 'alert-circle-outline' as const,
  },
  warning: {
    lightBg: '#FFF4D6',
    darkBg: '#443719',
    lightText: '#664500',
    darkText: '#FFD166',
    icon: 'alert-outline' as const,
  },
  info: {
    lightBg: '#EAF2FF',
    darkBg: '#1E304A',
    lightText: '#174EA6',
    darkText: '#A8C7FA',
    icon: 'information-outline' as const,
  },
  success: {
    lightBg: '#E7F5EC',
    darkBg: '#193B28',
    lightText: '#176B37',
    darkText: '#8DDBA8',
    icon: 'check-circle-outline' as const,
  },
};

export default function InlineError({
  message,
  onRetry,
  isDark: themeIsDark,
  variant = 'error',
}: InlineErrorProps) {
  const systemIsDark = useColorScheme() === 'dark';
  const isDark = themeIsDark ?? systemIsDark;
  const colors = variantStyles[variant];

  const color = isDark ? colors.darkText : colors.lightText;
  const background = isDark ? colors.darkBg : colors.lightBg;

  return (
    <View
      style={[styles.container, { backgroundColor: background }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.content}>
        <MaterialCommunityIcons
          name={colors.icon}
          size={20}
          color={color}
          accessible={false}
        />
        <Text style={[styles.message, { color }]}>
          {message ?? t('err.generic')}
        </Text>
      </View>

      {onRetry && (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={t('action.retry')}
          style={styles.button}
        >
          <Text style={[styles.buttonText, { color }]}>
            {t('action.retry')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  message: {
    fontSize: 14,
    flex: 1,
  },
  button: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonText: {
    fontWeight: '600',
  },
});
