import { ThemeProvider, useTheme, type ThemeMode } from '../theme/theme-context';

export { ThemeProvider };
export type { ThemeMode };

export function useAppTheme() {
  const { mode, setMode, resolvedMode, colors, tagColors } = useTheme();
  return {
    themeMode: mode,
    setThemeMode: setMode,
    isDark: resolvedMode === 'dark',
    colors,
    tagColors,
  };
}
