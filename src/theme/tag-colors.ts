export const lightTagColors = {
  red: '#C62828',
  coral: '#D2552F',
  orange: '#B85A0A',
  gold: '#9A6700',
  lime: '#5C7F0B',
  green: '#2E7D32',
  teal: '#0B7A6C',
  cyan: '#0C7A99',
  blue: '#1F6FD1',
  indigo: '#4F46C8',
  purple: '#8A3FC0',
  pink: '#C2185B',
  magenta: '#A01DB0',
  brown: '#8B5A2B',
  olive: '#707014',
  grey: '#5F5E5A',
} as const;

export const darkTagColors = {
  red: '#F26B6B',
  coral: '#F28B6B',
  orange: '#F2994A',
  gold: '#E3B23C',
  lime: '#A8D148',
  green: '#5FC46A',
  teal: '#3FC1AE',
  cyan: '#4CC4E6',
  blue: '#6FA8F2',
  indigo: '#9A94F5',
  purple: '#C08CEB',
  pink: '#F27AAB',
  magenta: '#E27FEA',
  brown: '#C99A6A',
  olive: '#B8B858',
  grey: '#B4B2A9',
} as const;

export type TagColorName = keyof typeof lightTagColors;
