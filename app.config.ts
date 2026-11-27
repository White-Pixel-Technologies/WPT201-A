import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'WPT 201 - A',
  slug: 'wpt-201-a',
  version: '1.0.0',
  scheme: 'wpt201a',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/images/icon.png',

  ios: {
    bundleIdentifier: 'in.whitepixeltechnologies.wpt201a',
    icon: './assets/expo.icon',
    supportsTablet: false,
  },

  android: {
    package: 'in.whitepixeltechnologies.wpt201a',
    allowBackup: false,
    blockedPermissions: [
      'android.permission.SCHEDULE_EXACT_ALARM',
      'android.permission.USE_EXACT_ALARM',
      'android.permission.READ_SMS',
      'android.permission.RECEIVE_SMS',
      'android.permission.READ_CONTACTS',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_PHONE_STATE',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.ACCESS_WIFI_STATE',
    ],
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },

  web: {
    output: 'single',
    favicon: './assets/images/favicon.png',
  },

  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    'expo-font',
    'expo-image',
    'expo-status-bar',
    'expo-web-browser',
    './plugins/backup-off',
    ['expo-build-properties', { android: { minSdkVersion: 28 } }],
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
