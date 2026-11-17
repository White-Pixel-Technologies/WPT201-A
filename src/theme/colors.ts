export const brandColors = {
  primary: '#0F6E56',
  accent: '#854F0B',
} as const;

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  onPrimary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  inputBackground: string;
  overlay: string;
};

export const lightColors: ThemeColors = {
  background: '#F8F7F4',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1EFE8',
  text: '#2C2C2A',
  textSecondary: '#5F5E5A',
  textMuted: '#5F5E5A',
  border: '#D3D1C7',
  primary: '#0F6E56',
  onPrimary: '#FFFFFF',
  accent: '#854F0B',
  success: '#3B6D11',
  warning: '#854F0B',
  error: '#A32D2D',
  inputBackground: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.45)',
};

export const darkColors: ThemeColors = {
  background: '#1A1A18',
  surface: '#2C2C2A',
  surfaceSecondary: '#1A1A18',
  text: '#E8E6DF',
  textSecondary: '#A8A79F',
  textMuted: '#A8A79F',
  border: '#444441',
  primary: '#5DCAA5',
  onPrimary: '#1A1A18',
  accent: '#EF9F27',
  success: '#97C459',
  warning: '#EF9F27',
  error: '#F09595',
  inputBackground: '#2C2C2A',
  overlay: 'rgba(0,0,0,0.6)',
};
