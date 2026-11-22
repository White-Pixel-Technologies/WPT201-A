
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { t } from '../../i18n';
import { useAppTheme } from '../../lib/theme';

type OfflineBannerProps = {
  visible: boolean;
};

export default function OfflineBanner({ visible }: OfflineBannerProps) {
  const { isDark } = useAppTheme();

  if (!visible) return null;

  const color = isDark ? '#FFD166' : '#664500';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#3D3218' : '#FFF1CC',
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <MaterialCommunityIcons
        name="wifi-off"
        size={18}
        color={color}
        accessible={false}
      />

      <Text style={[styles.message, { color }]}>
        {t('info.offline')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderRadius: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
  },
});
