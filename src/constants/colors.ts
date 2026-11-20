import { brandColors, darkColors, lightColors } from '../theme/colors';

export const Colors = {
  ...brandColors,
  onPrimary: lightColors.onPrimary,
  light: {
    background: '#FFFFFF',
    text: lightColors.text,
    muted: lightColors.textMuted,
    border: lightColors.border,
    card: '#F9FAFB',
  },
  dark: {
    background: '#121212',
    text: darkColors.text,
    muted: darkColors.textMuted,
    border: darkColors.border,
    card: '#1E1E1E',
  },
} as const;
