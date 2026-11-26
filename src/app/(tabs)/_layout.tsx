import { Feather } from '@expo/vector-icons';
import { Tabs, usePathname, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { NavigationText } from '../../constants/navigation';

type IconName = ComponentProps<typeof Feather>['name'];

interface DesktopNavItem {
  label: string;
  path: string;
  basePath: string;
  icon: IconName;
}

const desktopNavItems: DesktopNavItem[] = [
  { label: NavigationText.home, path: '/home', basePath: '/home', icon: 'home' },
  {
    label: NavigationText.transactions,
    path: '/transactions',
    basePath: '/transactions',
    icon: 'list',
  },
  {
    label: NavigationText.addTransaction,
    path: '/transactions?add=true',
    basePath: '/transactions?add=true',
    icon: 'plus-circle',
  },
  { label: NavigationText.sources, path: '/sources', basePath: '/sources', icon: 'credit-card' },
  { label: NavigationText.settings, path: '/settings', basePath: '/settings', icon: 'settings' },
];

interface CustomTabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation: {
    navigate: (name: string) => void;
  };
}

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const dark = useColorScheme() === 'dark';
  const desktop = width >= 1024;

  const theme = dark ? Colors.dark : Colors.light;
  const background = theme.background;
  const foreground = theme.text;
  const mutedColor = theme.muted;
  const border = theme.border;

  const renderMobileTabBar = (props: CustomTabBarProps) => {
    const { state, navigation } = props;
    const routes = state.routes;

    const isHomeFocused = state.index === 0;
    const isTransactionsFocused = state.index === 1;
    const isSourcesFocused = state.index === 2;
    const isSettingsFocused = state.index === 3;

    return (
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: background,
            borderTopColor: border,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ]}
      >
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isHomeFocused }}
          accessibilityLabel={NavigationText.home}
          onPress={() => navigation.navigate(routes[0].name)}
          style={styles.navLink}
        >
          <Feather name="home" size={20} color={isHomeFocused ? Colors.primary : mutedColor} />
          <Text style={[styles.navLabel, { color: isHomeFocused ? Colors.primary : mutedColor }]}>
            {NavigationText.home}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isTransactionsFocused }}
          accessibilityLabel={NavigationText.transactions}
          onPress={() => navigation.navigate(routes[1].name)}
          style={styles.navLink}
        >
          <Feather
            name="list"
            size={20}
            color={isTransactionsFocused ? Colors.primary : mutedColor}
          />
          <Text
            style={[
              styles.navLabel,
              { color: isTransactionsFocused ? Colors.primary : mutedColor },
            ]}
          >
            {NavigationText.transactions}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={NavigationText.addTransaction}
          onPress={() => router.push('/transactions?add=true' as never)}
          style={[styles.plusButton, { backgroundColor: Colors.primary, borderColor: background }]}
        >
          <Feather name="plus" size={26} color="#FFFFFF" />
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isSourcesFocused }}
          accessibilityLabel={NavigationText.sources}
          onPress={() => navigation.navigate(routes[2].name)}
          style={styles.navLink}
        >
          <Feather
            name="credit-card"
            size={20}
            color={isSourcesFocused ? Colors.primary : mutedColor}
          />
          <Text
            style={[styles.navLabel, { color: isSourcesFocused ? Colors.primary : mutedColor }]}
          >
            {NavigationText.sources}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isSettingsFocused }}
          accessibilityLabel={NavigationText.settings}
          onPress={() => navigation.navigate(routes[3].name)}
          style={styles.navLink}
        >
          <Feather
            name="settings"
            size={20}
            color={isSettingsFocused ? Colors.primary : mutedColor}
          />
          <Text
            style={[styles.navLabel, { color: isSettingsFocused ? Colors.primary : mutedColor }]}
          >
            {NavigationText.settings}
          </Text>
        </Pressable>
      </View>
    );
  };

  if (desktop) {
    return (
      <View style={[styles.screen, { backgroundColor: background }]}>
        <View style={[styles.sidebar, { borderRightColor: border, backgroundColor: background }]}>
          <Text style={[styles.brand, { color: foreground }]}>{NavigationText.appName}</Text>

          {desktopNavItems.map((item) => {
            const isActive =
              item.basePath === '/transactions?add=true'
                ? pathname === '/transactions' && item.path.includes('add=true')
                : pathname.startsWith(item.basePath);
            const activeColor = isActive ? Colors.primary : mutedColor;

            return (
              <Pressable
                key={item.path}
                accessibilityRole="link"
                accessibilityLabel={item.label}
                onPress={() => router.push(item.path as never)}
                style={[
                  styles.desktopNavLink,
                  isActive && { backgroundColor: dark ? '#1E2D27' : '#E8F5E9' },
                ]}
              >
                <Feather name={item.icon} size={20} color={activeColor} />
                <Text
                  style={[
                    styles.desktopNavLabel,
                    { color: activeColor, fontWeight: isActive ? '700' : '500' },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.main}>
          <View style={[styles.header, { borderBottomColor: border, backgroundColor: background }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={NavigationText.addTransaction}
              onPress={() => router.push('/transactions?add=true' as never)}
              style={[styles.addButton, { backgroundColor: Colors.primary }]}
            >
              <Feather name="plus" size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>{NavigationText.addTransaction}</Text>
            </Pressable>
          </View>

          <View style={styles.tabsContainer}>
            <Tabs
              screenOptions={{
                headerShown: false,
                tabBarStyle: { display: 'none' },
              }}
            >
              <Tabs.Screen name="home" options={{ title: NavigationText.home }} />
              <Tabs.Screen name="transactions" options={{ title: NavigationText.transactions }} />
              <Tabs.Screen name="sources" options={{ title: NavigationText.sources }} />
              <Tabs.Screen name="settings" options={{ title: NavigationText.settings }} />
            </Tabs>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: background }]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: background,
            borderTopColor: border,
            minHeight: 68,
          },
        }}
        tabBar={(props) => renderMobileTabBar(props as unknown as CustomTabBarProps)}
      >
        <Tabs.Screen name="home" options={{ title: NavigationText.home }} />
        <Tabs.Screen name="transactions" options={{ title: NavigationText.transactions }} />
        <Tabs.Screen name="sources" options={{ title: NavigationText.sources }} />
        <Tabs.Screen name="settings" options={{ title: NavigationText.settings }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 240,
    borderRightWidth: StyleSheet.hairlineWidth,
    padding: 24,
    gap: 8,
  },
  brand: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  desktopNavLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    minHeight: 44,
  },
  desktopNavLabel: {
    fontSize: 15,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    height: 68,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
  addButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  tabsContainer: {
    flex: 1,
  },
  bottomBar: {
    minHeight: 68,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  navLink: {
    minWidth: 56,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  plusButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    borderWidth: 4,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
